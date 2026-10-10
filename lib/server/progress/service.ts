import "server-only";
import { db } from "../db/client";
import { foundationState } from "./foundations";
export async function progressFor(userId: string) {
  const [foundations, domains, evidence, career, preference] =
    await Promise.all([
      foundationState(userId),
      db().cloudProgress.findMany({
        where: {
          userId,
          domain: {
            notIn: ["foundations", "profile-photo", "private-portfolio"],
            not: { startsWith: "private-certificate/" },
          },
        },
      }),
      db().skillEvidenceCloud.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
      db().careerProfileCloud.findUnique({ where: { userId } }),
      db().userPreference.findUnique({ where: { userId } }),
    ]);
  return {
    schemaVersion: 1,
    foundations,
    domains,
    evidence,
    career,
    preference,
  };
}
export async function heartbeat(userId: string) {
  const now = new Date();
  await db().userActivity.updateMany({
    where: { userId, lastActiveAt: { lt: new Date(now.getTime() - 45000) } },
    data: { lastActiveAt: now },
  });
  return {
    lastActiveAt: (
      await db().userActivity.findUniqueOrThrow({ where: { userId } })
    ).lastActiveAt,
  };
}
