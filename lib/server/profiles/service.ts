import "server-only";
import { db, serial, json } from "../db/client";
import { HttpError } from "../security/http";
import { profileSchema, careerEntrySchema } from "./schemas";
import { createCareerLeagueState } from "@/lib/career-league/engine";
import type { z } from "zod";
export const ownProfile = (userId: string) =>
  db().playerProfile.findUniqueOrThrow({ where: { userId } });
export async function saveProfile(
  userId: string,
  input: z.infer<typeof profileSchema>,
) {
  return serial(async (tx) => {
    const current = await tx.playerProfile.findUniqueOrThrow({
      where: { userId },
    });
    if (current.updatedAt.toISOString() !== input.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    const { revision: _, ...data } = input;
    void _;
    const taken = await tx.playerProfile.findFirst({
      where: { handle: data.handle, userId: { not: userId } },
    });
    if (taken) throw new HttpError(409, "HANDLE_TAKEN");
    return tx.playerProfile.update({ where: { userId }, data });
  });
}
export async function saveCareerEntry(
  userId: string,
  input: z.infer<typeof careerEntrySchema>,
) {
  return serial(async (tx) => {
    const row = await tx.cloudProgress.findUnique({
      where: { userId_domain: { userId, domain: "career-entry" } },
    });
    if ((row?.revision ?? 0) !== input.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    const { revision: _, ...choice } = input;
    void _;
    const data = json({
      ...createCareerLeagueState(),
      ...choice,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    });
    const next = await tx.cloudProgress.upsert({
      where: { userId_domain: { userId, domain: "career-entry" } },
      create: { userId, domain: "career-entry", data, revision: 1 },
      update: { data, revision: { increment: 1 }, provenance: "SERVER" },
    });
    await tx.playerProfile.update({
      where: { userId },
      data: { persona: choice.persona, targetRoleId: choice.targetRoleId },
    });
    await tx.careerGoal.create({
      data: { userId, goal: choice.goal, targetRoleId: choice.targetRoleId },
    });
    return next;
  });
}
