import "server-only";
import { z } from "zod";
import { bootcampMissionIds } from "@/lib/bootcamp/catalog";
import {
  createBootcampState,
  migrateBootcampState,
  submitFoundationTask,
  completeBootcampMission,
  bootcampMissionReady,
  isBootcampMissionUnlocked,
} from "@/lib/bootcamp/engine";
import { db, serial, json } from "../db/client";
import { HttpError } from "../security/http";
export const foundationCommand = z
  .object({
    commandId: z.string().uuid(),
    missionId: z.enum(bootcampMissionIds),
    taskId: z.string().min(1).max(100),
    revision: z.number().int().nonnegative(),
    response: z.union([
      z.array(z.string().max(100)).max(20),
      z
        .array(
          z
            .object({
              account: z.string().max(60),
              debit: z.number().finite().min(0).max(1e9),
              credit: z.number().finite().min(0).max(1e9),
            })
            .strict(),
        )
        .max(20),
    ]),
  })
  .strict();
export async function foundationState(userId: string) {
  const row = await db().cloudProgress.findUnique({
    where: { userId_domain: { userId, domain: "foundations" } },
  });
  return {
    data: row ? migrateBootcampState(row.data) : createBootcampState(),
    revision: row?.revision ?? 0,
  };
}
export async function submitFoundation(
  userId: string,
  input: z.infer<typeof foundationCommand>,
) {
  return serial(async (tx) => {
    const previous = await tx.missionAttempt.findUnique({
      where: { userId_commandId: { userId, commandId: input.commandId } },
    });
    const row = await tx.cloudProgress.findUnique({
      where: { userId_domain: { userId, domain: "foundations" } },
    });
    const state = row ? migrateBootcampState(row.data) : createBootcampState();
    if (
      previous &&
      (previous.missionId !== input.missionId ||
        previous.taskId !== input.taskId ||
        JSON.stringify(previous.answers) !== JSON.stringify(input.response))
    )
      throw new HttpError(409, "COMMAND_PAYLOAD_CHANGED");
    if (previous)
      return {
        data: state,
        revision: row?.revision ?? 0,
        correct: previous.correct,
        replayed: true,
      };
    if ((row?.revision ?? 0) !== input.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    const completing = input.taskId === "@complete";
    const result = completing
      ? {
          state,
          correct:
            isBootcampMissionUnlocked(state, input.missionId) &&
            bootcampMissionReady(state, input.missionId) &&
            !state.completedMissionIds.includes(input.missionId),
        }
      : submitFoundationTask(
          state,
          input.missionId,
          input.taskId,
          input.response,
        );
    if (completing ? !result.correct : result.state === state)
      throw new HttpError(409, "TASK_NOT_CURRENT");
    const next = completing
      ? completeBootcampMission(state, input.missionId)
      : result.state;
    await tx.missionAttempt.create({
      data: {
        userId,
        commandId: input.commandId,
        missionId: input.missionId,
        taskId: input.taskId,
        answers: json(input.response),
        correct: result.correct,
      },
    });
    const saved = await tx.cloudProgress.upsert({
      where: { userId_domain: { userId, domain: "foundations" } },
      create: { userId, domain: "foundations", data: json(next), revision: 1 },
      update: {
        data: json(next),
        revision: { increment: 1 },
        provenance: "SERVER",
      },
    });
    if (
      !state.completedMissionIds.includes(input.missionId) &&
      next.completedMissionIds.includes(input.missionId)
    ) {
      await tx.acceptedOutcome.upsert({
        where: {
          userId_outcomeKey: {
            userId,
            outcomeKey: `foundations-v2/${input.missionId}`,
          },
        },
        update: {},
        create: {
          userId,
          outcomeKey: `foundations-v2/${input.missionId}`,
          domain: "foundations",
          data: json({ practiceOnly: true, missionId: input.missionId }),
        },
      });
    }
    return {
      data: next,
      revision: saved.revision,
      correct: result.correct,
      replayed: false,
    };
  });
}
