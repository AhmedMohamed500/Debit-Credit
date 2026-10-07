import "server-only";
import { z } from "zod";
import { db, serial, json } from "../db/client";
import { HttpError } from "../security/http";
import {
  approvedChallenge,
  scoreChallenge,
  type LeagueId,
} from "@/lib/local-competition/v2";
import type { LocalPlayerProfile } from "@/lib/local-competition/model";
import { foundationState } from "../progress/foundations";
const day = () => new Date().toISOString().slice(0, 10);
async function player(userId: string) {
  const [p, f] = await Promise.all([
    db().playerProfile.findUniqueOrThrow({ where: { userId } }),
    foundationState(userId),
  ]);
  const level =
    f.data.bossCompleted &&
    (await db().acceptedOutcome.count({
      where: { userId, domain: "foundations" },
    })) >= 13
      ? 2
      : 1;
  return {
    id: userId,
    displayName: p.displayName,
    persona: "graduate",
    level,
    track: "foundation",
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    data: {},
  } as LocalPlayerProfile;
}
const publicChallenge = (
  c: NonNullable<ReturnType<typeof approvedChallenge>>,
) => ({
  id: c.seed.challengeId,
  version: c.seed.challengeVersion,
  scoringVersion: 1,
  league: c.league,
  title: c.title,
  context: c.context,
  documents: c.documents,
  issuedFor: c.seed.issuedFor,
  accountOptions: [
    "equipment",
    "suppliers",
    "bank",
    "customers",
    "officeExpense",
    "cash",
    "bank-charges",
  ],
});
export async function lobby(userId: string) {
  const c = approvedChallenge(day(), await player(userId))!;
  const [queue, active, waiting, played, recent] = await Promise.all([
    db().competitionQueue.findFirst({
      where: {
        userId,
        status: "WAITING",
        createdAt: { gte: new Date(Date.now() - 900000) },
      },
    }),
    db().competitionPlayer.findUnique({ where: { userId } }),
    db().competitionQueue.findMany({
      where: {
        status: "WAITING",
        league: c.league,
        createdAt: { gte: new Date(Date.now() - 900000) },
      },
      take: 20,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            profile: {
              select: { displayName: true, handle: true, avatar: true },
            },
          },
        },
      },
    }),
    db().competitionAttempt.findFirst({
      where: {
        userId,
        challengeId: c.seed.challengeId,
        challengeVersion: c.seed.challengeVersion,
        scoringVersion: 1,
      },
      select: { id: true },
    }),
    db().competitionMatch.findMany({
      where: { players: { some: { userId } } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, status: true, league: true, createdAt: true },
    }),
  ]);
  return {
    challenge: publicChallenge(c),
    queueId: queue?.id ?? null,
    activeMatchId: active?.activeMatchId ?? null,
    waiting: waiting.map((x) => ({
      id: x.id,
      createdAt: x.createdAt,
      profile: x.user.profile,
    })),
    practiceOnly: !!played,
    recent,
    pollSeconds: 20,
  };
}
export async function matchmake(userId: string) {
  const c = approvedChallenge(day(), await player(userId))!;
  return serial(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${c.seed.challengeId},0))`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${"user:" + userId},0))`;
    await tx.competitionQueue.updateMany({
      where: {
        status: "WAITING",
        createdAt: { lt: new Date(Date.now() - 900000) },
      },
      data: { status: "CANCELLED" },
    });
    await tx.competitionPlayer.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    const active = await tx.competitionPlayer.findUniqueOrThrow({
      where: { userId },
    });
    if (active.activeMatchId)
      return { matchId: active.activeMatchId, status: "PLAYING" };
    if (
      await tx.competitionAttempt.findFirst({
        where: {
          userId,
          challengeId: c.seed.challengeId,
          challengeVersion: c.seed.challengeVersion,
          scoringVersion: 1,
        },
      })
    )
      return { matchId: null, status: "PRACTICE_ONLY" };
    const existing = await tx.competitionQueue.findFirst({
      where: { userId, status: "WAITING" },
    });
    if (existing)
      return { matchId: null, status: "WAITING", queueId: existing.id };
    const opponent = await tx.competitionQueue.findFirst({
      where: {
        status: "WAITING",
        userId: { not: userId },
        league: c.league,
        challengeId: c.seed.challengeId,
        challengeVersion: c.seed.challengeVersion,
        scoringVersion: 1,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!opponent) {
      const q = await tx.competitionQueue.create({
        data: {
          userId,
          league: c.league,
          challengeId: c.seed.challengeId,
          challengeVersion: c.seed.challengeVersion,
        },
      });
      return { matchId: null, status: "WAITING", queueId: q.id };
    }
    const match = await tx.competitionMatch.create({
      data: {
        league: c.league,
        challengeId: c.seed.challengeId,
        challengeVersion: c.seed.challengeVersion,
        issuedFor: day(),
        players: { create: [{ userId }, { userId: opponent.userId }] },
      },
    });
    await tx.competitionQueue.update({
      where: { id: opponent.id },
      data: { status: "MATCHED" },
    });
    await tx.competitionPlayer.updateMany({
      where: { userId: { in: [userId, opponent.userId] } },
      data: { activeMatchId: match.id },
    });
    await tx.auditLog.create({
      data: { userId, action: "MATCH_CREATED", resourceId: match.id },
    });
    return { matchId: match.id, status: "PLAYING" };
  });
}
export async function matchFor(userId: string, id: string) {
  const m = await db().competitionMatch.findUnique({
    where: { id },
    include: {
      players: {
        include: {
          user: {
            select: {
              profile: {
                select: { displayName: true, handle: true, avatar: true },
              },
            },
          },
        },
      },
    },
  });
  if (!m || !m.players.some((p) => p.userId === userId))
    throw new HttpError(404, "MATCH_NOT_FOUND");
  const fixture = {
    ...(await player(userId)),
    level: m.league === "foundation" ? 1 : 2,
  };
  const c = approvedChallenge(m.issuedFor, fixture)!;
  return {
    id: m.id,
    status: m.status,
    league: m.league,
    challenge: publicChallenge(c),
    winnerUserId: m.status === "COMPLETED" ? m.winnerUserId : null,
    players: m.players.map((p) => ({
      userId: p.userId,
      profile: p.user.profile,
      submitted: !!p.submittedAt,
      score: m.status === "COMPLETED" ? p.score : null,
    })),
    inspected: m.players.find((p) => p.userId === userId)!.inspected,
  };
}
export const matchAction = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("inspect"),
      documentId: z.string().min(1).max(100),
    })
    .strict(),
  z
    .object({
      kind: z.literal("submit"),
      action: z.enum(["post", "hold", "investigate"]),
      debit: z.string().min(1).max(60),
      credit: z.string().min(1).max(60),
      amount: z.number().finite().min(0).max(1e9),
    })
    .strict(),
]);
export async function submitMatch(
  userId: string,
  id: string,
  input: z.infer<typeof matchAction>,
) {
  const own = await player(userId);
  await serial(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${id},0))`;
    const m = await tx.competitionMatch.findUnique({
        where: { id },
        include: { players: true },
      }),
      member = m?.players.find((p) => p.userId === userId);
    if (!m || !member) throw new HttpError(404, "MATCH_NOT_FOUND");
    if (member.submittedAt) return;
    if (m.status !== "PLAYING") throw new HttpError(409, "MATCH_NOT_PLAYING");
    const fixture = { ...own, level: m.league === "foundation" ? 1 : 2 },
      c = approvedChallenge(m.issuedFor, fixture)!;
    if (input.kind === "inspect") {
      if (!c.documents.some((d) => d.id === input.documentId))
        throw new HttpError(400, "UNKNOWN_DOCUMENT");
      await tx.competitionMatchPlayer.update({
        where: { id: member.id },
        data: {
          inspected: [...new Set([...member.inspected, input.documentId])],
        },
      });
      return;
    }
    const result = scoreChallenge(
      c,
      { ...input, inspected: member.inspected, attempts: 1 },
      fixture,
      true,
      new Date().toISOString(),
    );
    const unique = {
      userId,
      challengeId: m.challengeId,
      challengeVersion: m.challengeVersion,
      scoringVersion: m.scoringVersion,
    };
    if (
      await tx.competitionAttempt.findUnique({
        where: { userId_challengeId_challengeVersion_scoringVersion: unique },
      })
    )
      throw new HttpError(409, "OFFICIAL_ATTEMPT_ALREADY_RECORDED");
    await tx.competitionAttempt.create({
      data: {
        ...unique,
        league: m.league,
        matchId: m.id,
        answers: json(input),
        score: result.score,
        dimensions: json(result.dimensions),
      },
    });
    await tx.competitionMatchPlayer.update({
      where: { id: member.id },
      data: { score: result.score, submittedAt: new Date() },
    });
    const other = m.players.find((p) => p.userId !== userId)!;
    if (other.submittedAt) {
      const winner =
        other.score === result.score
          ? null
          : (other.score ?? 0) > result.score
            ? other.userId
            : userId;
      await tx.competitionMatch.update({
        where: { id },
        data: {
          status: "COMPLETED",
          winnerUserId: winner,
          completedAt: new Date(),
        },
      });
      await tx.competitionPlayer.updateMany({
        where: { activeMatchId: id },
        data: { activeMatchId: null },
      });
      await tx.auditLog.create({
        data: { userId, action: "MATCH_COMPLETED", resourceId: id },
      });
    }
  });
  return matchFor(userId, id);
}
export async function leaderboard(league: LeagueId = "foundation") {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  const results = await db().competitionAttempt.groupBy({
    by: ["userId"],
    where: {
      league,
      createdAt: { gte: start },
      match: { status: "COMPLETED" },
    },
    _sum: { score: true },
    _count: { id: true },
    orderBy: { _sum: { score: "desc" } },
    take: 50,
  });
  const profiles = await db().playerProfile.findMany({
    where: { userId: { in: results.map((x) => x.userId) } },
    select: { userId: true, displayName: true, handle: true, avatar: true },
  });
  return {
    league,
    weekStartsAt: start,
    officialServerScored: true,
    verifiedProfessionalEvidence: false,
    rows: results.map((x) => ({
      profile: profiles.find((p) => p.userId === x.userId),
      points: x._sum.score ?? 0,
      challenges: x._count.id,
    })),
  };
}
