import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "../db/client";
export async function bootstrapUser(user: { id: string; name: string }) {
  await db().playerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      displayName: user.name.slice(0, 60) || "Player",
      handle: `player-${randomUUID().replaceAll("-", "").slice(0, 18)}`,
    },
  });
  await db().userActivity.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
}
export const isOwnerEmail = (email: string, verified: boolean) =>
  verified &&
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
export async function resolveUser(id: string) {
  const user = await db().user.findUnique({ where: { id } });
  if (!user) return null;
  if (isOwnerEmail(user.email, user.emailVerified) && user.role !== "ADMIN") {
    return db().$transaction(async (tx) => {
      const next = await tx.user.update({
        where: { id },
        data: { role: "ADMIN" },
      });
      await tx.auditLog.create({
        data: { userId: id, action: "INITIAL_ADMIN_PROMOTION" },
      });
      return next;
    });
  }
  return user;
}
// Service-only deletion: no public account-delete route in Phase 1.
export async function deleteUser(id: string) {
  await db().$transaction(async (tx) => {
    const matches = await tx.competitionMatchPlayer.findMany({
      where: { userId: id },
      select: { matchId: true },
    });
    const ids = matches.map((x) => x.matchId);
    await tx.competitionMatch.updateMany({
      where: { id: { in: ids }, status: "PLAYING" },
      data: { status: "CANCELLED", winnerUserId: null },
    });
    await tx.competitionMatch.updateMany({
      where: { winnerUserId: id },
      data: { winnerUserId: null },
    });
    await tx.competitionPlayer.updateMany({
      where: { activeMatchId: { in: ids } },
      data: { activeMatchId: null },
    });
    await tx.user.delete({ where: { id } });
    await tx.auditLog.create({ data: { action: "ACCOUNT_DELETED" } });
  });
}
