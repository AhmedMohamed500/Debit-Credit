import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { assessStep, createExcelProgress, editableCells, earnedExcelXp, finalWorkbook, rankArena, readExcelProgress, type ExcelProgress, type ExcelStep, type Workbook } from "@/lib/excel-foundations/engine";
import { db, json, serial } from "../db/client";
import { HttpError } from "../security/http";

const domain = "excel-foundations";
const outcomeKey = "excel-foundations-v1";
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  return JSON.stringify(value);
}
const cellKeys = new Set<string>(editableCells);
const answerKeys = new Set(["cell", "concept", "loan", "equation", "equipment", "balance"]);
const textFields = z.record(z.string().max(12), z.string().max(80)).refine((record) => Object.keys(record).length <= 20);
export const excelCommand = z.object({
  commandId: z.string().uuid(),
  revision: z.number().int().nonnegative(),
  type: z.enum(["save", "submit", "privacy"]),
  step: z.number().int().min(1).max(5).optional(),
  cells: textFields.optional(),
  answers: textFields.optional(),
  publicOptIn: z.boolean().optional(),
  nickname: z.string().trim().max(40).optional(),
}).strict().superRefine((input, context) => {
  if (input.type !== "privacy" && !input.step) context.addIssue({ code: "custom", message: "STEP_REQUIRED" });
  if (input.type === "privacy" && input.publicOptIn === undefined) context.addIssue({ code: "custom", message: "PRIVACY_REQUIRED" });
  for (const key of Object.keys(input.cells ?? {})) if (!cellKeys.has(key)) context.addIssue({ code: "custom", message: `CELL_NOT_ALLOWED:${key}` });
  for (const key of Object.keys(input.answers ?? {})) if (!answerKeys.has(key)) context.addIssue({ code: "custom", message: `ANSWER_NOT_ALLOWED:${key}` });
});
export type ExcelCommand = z.infer<typeof excelCommand>;
const variantFor = (userId: string) => createHash("sha256").update(`excel-foundations-v1:${userId}`).digest()[0] % 3;

export async function excelState(userId: string) {
  const row = await db().cloudProgress.findUnique({ where: { userId_domain: { userId, domain } } });
  return { data: row ? readExcelProgress(row.data, variantFor(userId)) : createExcelProgress(variantFor(userId)), revision: row?.revision ?? 0 };
}

export async function mutateExcel(userId: string, input: ExcelCommand) {
  return serial(async (tx) => {
    const prior = await tx.missionAttempt.findUnique({ where: { userId_commandId: { userId, commandId: input.commandId } } });
    const row = await tx.cloudProgress.findUnique({ where: { userId_domain: { userId, domain } } });
    const state = row ? readExcelProgress(row.data, variantFor(userId)) : createExcelProgress(variantFor(userId));
    if (prior) {
      if (prior.missionId !== domain || canonical(prior.answers) !== canonical(input)) throw new HttpError(409, "COMMAND_PAYLOAD_CHANGED");
      return { data: state, revision: row?.revision ?? 0, correct: prior.correct, replayed: true };
    }
    if ((row?.revision ?? 0) !== input.revision) throw new HttpError(409, "REVISION_CONFLICT");
    const next: ExcelProgress = { ...state };
    let correct = true;
    let assessment: ReturnType<typeof assessStep> | null = null;
    if (input.type === "privacy") {
      next.publicOptIn = input.publicOptIn === true;
      next.nickname = (input.nickname ?? state.nickname).replace(/[<>\r\n]/g, "").trim().slice(0, 40);
      if (next.publicOptIn && !next.nickname) throw new HttpError(400, "NICKNAME_REQUIRED");
    } else {
      const step = input.step as ExcelStep;
      const expected = Math.min(5, state.completedSteps.length + 1);
      if (step !== expected || state.completedSteps.includes(5)) throw new HttpError(409, "STEP_NOT_CURRENT");
      const cells = { ...state.draft, ...input.cells } as Workbook;
      const answers = { ...state.answers, ...input.answers };
      next.draft = cells;
      next.answers = answers;
      if (input.type === "submit") {
        assessment = assessStep(step, cells, answers, state.variant);
        next.attempts += 1;
        correct = assessment.passed;
        if (correct) {
          next.completedSteps = [...state.completedSteps, step];
          next.answers = {};
          if (step === 4) next.draft = finalWorkbook(state.variant);
          if (step === 5) {
            next.completedAt = new Date().toISOString();
            next.finalScore = assessment.score;
          }
        }
      }
    }
    await tx.missionAttempt.create({ data: {
      userId, commandId: input.commandId, missionId: domain,
      taskId: input.type === "privacy" ? "privacy" : `${input.type}:${input.step}`,
      answers: json(input), correct,
    } });
    const saved = await tx.cloudProgress.upsert({
      where: { userId_domain: { userId, domain } },
      create: { userId, domain, data: json(next), revision: 1, provenance: "SERVER" },
      update: { data: json(next), revision: { increment: 1 }, provenance: "SERVER" },
    });
    if (input.type === "submit" && input.step === 5 && correct) {
      await tx.acceptedOutcome.upsert({
        where: { userId_outcomeKey: { userId, outcomeKey } }, update: {},
        create: { userId, outcomeKey, domain, data: json({ trainingOnly: true, completedStages: 1, score: next.finalScore, xp: earnedExcelXp(next), accountingScore: assessment?.accountingScore, excelScore: assessment?.excelScore }) },
      });
    }
    return { data: next, revision: saved.revision, correct, assessment, replayed: false };
  });
}

export async function excelLeaderboard(userId: string, scope: "overall" | "stage" | "weekly") {
  const rows = await db().cloudProgress.findMany({ where: { domain }, select: { userId: true, data: true } });
  const completed = rows.map((row) => ({ userId: row.userId, state: readExcelProgress(row.data, variantFor(row.userId)) }))
    .filter((row) => row.state.completedSteps.includes(5) && row.state.publicOptIn && row.state.nickname);
  if (!completed.length) return { scope, participants: 0, entries: [], ownRank: null, privacy: "opt-in" };
  const outcomes = await db().acceptedOutcome.findMany({ where: { outcomeKey, userId: { in: completed.map((row) => row.userId) } }, select: { userId: true, createdAt: true } });
  const accepted = new Map(outcomes.map((row) => [row.userId, row.createdAt]));
  const now = new Date();
  const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - ((now.getUTCDay() + 6) % 7)));
  const eligible = completed.filter((row) => accepted.has(row.userId) && (scope !== "weekly" || accepted.get(row.userId)! >= startOfWeek));
  const ranked = rankArena(eligible.map(({ userId: id, state }) => ({
    userId: id, nickname: state.nickname, completedAt: state.completedAt!,
    score: state.finalScore ?? 0, xp: earnedExcelXp(state), completedStages: 1,
  })));
  return {
    scope, participants: ranked.length,
    entries: ranked.slice(0, 50).map((entry) => ({ nickname: entry.nickname, completedAt: entry.completedAt, score: entry.score, xp: entry.xp, completedStages: entry.completedStages, rank: entry.rank })),
    ownRank: ranked.find((entry) => entry.userId === userId)?.rank ?? null,
    privacy: "opt-in",
  };
}
