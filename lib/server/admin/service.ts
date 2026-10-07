import "server-only";
import { db } from "../db/client";
import { z } from "zod";
export const usersQuery = z
  .object({
    search: z.string().trim().max(100).default(""),
    cursor: z.string().uuid().optional(),
    take: z.coerce.number().int().min(1).max(50).default(20),
    provider: z.enum(["google", "credential"]).optional(),
    persona: z
      .enum([
        "student",
        "graduate",
        "working-accountant",
        "experienced-accountant",
      ])
      .optional(),
    active: z.enum(["now", "24h", "inactive"]).optional(),
  })
  .strict();
export async function overview() {
  const now = Date.now(),
    today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const [
    total,
    newToday,
    newWeek,
    active24h,
    activeNow,
    google,
    email,
    waiting,
    playing,
    completed,
  ] = await Promise.all([
    db().user.count(),
    db().user.count({ where: { createdAt: { gte: today } } }),
    db().user.count({
      where: { createdAt: { gte: new Date(now - 7 * 86400000) } },
    }),
    db().userActivity.count({
      where: { lastActiveAt: { gte: new Date(now - 86400000) } },
    }),
    db().userActivity.count({
      where: { lastActiveAt: { gte: new Date(now - 120000) } },
    }),
    db().user.count({
      where: { accounts: { some: { providerId: "google" } } },
    }),
    db().user.count({
      where: { accounts: { some: { providerId: "credential" } } },
    }),
    db().competitionQueue.count({
      where: { status: "WAITING", createdAt: { gte: new Date(now - 900000) } },
    }),
    db().competitionMatch.count({ where: { status: "PLAYING" } }),
    db().competitionMatch.count({ where: { status: "COMPLETED" } }),
  ]);
  return {
    total,
    newToday,
    newWeek,
    active24h,
    activeNow,
    google,
    email,
    waiting,
    playing,
    completed,
    asOf: new Date().toISOString(),
    timeZone: "UTC",
    activeWindowSeconds: 120,
  };
}
export async function users(input: z.infer<typeof usersQuery>) {
  const where = {
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { email: { contains: input.search, mode: "insensitive" as const } },
            {
              profile: {
                displayName: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),
    ...(input.provider
      ? { accounts: { some: { providerId: input.provider } } }
      : {}),
    ...(input.persona ? { profile: { persona: input.persona } } : {}),
    ...(input.active
      ? {
          activity: {
            lastActiveAt:
              input.active === "inactive"
                ? { lt: new Date(Date.now() - 86400000) }
                : {
                    gte: new Date(
                      Date.now() - (input.active === "now" ? 120000 : 86400000),
                    ),
                  },
          },
        }
      : {}),
  };
  const rows = await db().user.findMany({
    where,
    take: input.take + 1,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      profile: true,
      activity: true,
      competition: { select: { activeMatchId: true } },
      accounts: { select: { providerId: true } },
      queue: {where:{status:"WAITING",createdAt:{gte:new Date(Date.now()-900000)}},take:1,select:{id:true}},
    },
  });
  return {
    rows: rows.slice(0, input.take),
    nextCursor: rows.length > input.take ? rows[input.take - 1].id : null,
  };
}
export async function competitionOverview() {
  return {
    matches: await db().competitionMatch.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        league: true,
        status: true,
        createdAt: true,
        completedAt: true,
        winnerUserId: true,
        players: {
          select: {
            userId: true,
            submittedAt: true,
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
    }),
    waiting: await db().competitionQueue.findMany({
      where: {
        status: "WAITING",
        createdAt: { gte: new Date(Date.now() - 900000) },
      },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: {
        id: true,
        league: true,
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
  };
}
