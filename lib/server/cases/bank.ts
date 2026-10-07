import "server-only";
import { z } from "zod";
import { serial, json } from "../db/client";
import {
  newBankWorkpaper,
  matchBankItems,
  classifyBankItem,
  setBankJournal,
  submitBankWorkpaper,
  bankReconciliation,
  bankScenario,
} from "@/lib/bank-reconciliation/engine";
import { bankReconciliationEvidence } from "@/lib/bank-reconciliation/evidence";
import { HttpError } from "../security/http";
const accounts = z.enum(["bank", "bank-charges", "accounts-receivable"]);
export const bankSubmission = z
  .object({
    commandId: z.string().uuid(),
    matches: z
      .record(z.string().max(50), z.string().max(50))
      .refine((x) => Object.keys(x).length <= 20),
    classifications: z
      .record(
        z.string().max(50),
        z.enum(["timing", "book-adjustment", "investigate"]),
      )
      .refine((x) => Object.keys(x).length <= 20),
    journals: z
      .array(
        z
          .object({
            itemId: z.string().max(50),
            debit: accounts,
            credit: accounts,
            amount: z.number().finite().positive().max(1e9),
          })
          .strict(),
      )
      .max(10),
  })
  .strict();
export async function submitBank(
  userId: string,
  input: z.infer<typeof bankSubmission>,
) {
  return serial(async (tx) => {
    const outcome = await tx.acceptedOutcome.findUnique({
      where: {
        userId_outcomeKey: { userId, outcomeKey: "bank-reconciliation/v1" },
      },
    });
    if (outcome) return { work: outcome.data, replayed: true };
    const old = await tx.caseAttempt.findUnique({
      where: { userId_commandId: { userId, commandId: input.commandId } },
      include: { events: true },
    });
    if (old) {
      const saved = old.events[0]?.action;
      if (
        saved &&
        typeof saved === "object" &&
        !Array.isArray(saved) &&
        "work" in saved
      )
        return { work: saved.work, replayed: true };
      throw new HttpError(409, "COMMAND_ALREADY_RECORDED");
    }
    let work = newBankWorkpaper();
    for (const [a, b] of Object.entries(input.matches))
      work = matchBankItems(work, a, b);
    for (const [id, kind] of Object.entries(input.classifications))
      work = classifyBankItem(work, id, kind);
    for (const journal of input.journals) work = setBankJournal(work, journal);
    work.attempts = await tx.caseAttempt.count({
      where: { userId, caseId: bankScenario.id },
    });
    work = submitBankWorkpaper(work);
    await tx.caseAttempt.create({
      data: {
        userId,
        caseId: bankScenario.id,
        caseVersion: bankScenario.version,
        commandId: input.commandId,
        status: work.completedAt ? "ACCEPTED" : "NEEDS_PRACTICE",
        events: {
          create: { eventKey: input.commandId, action: json({ input, work }) },
        },
      },
    });
    if (work.completedAt && bankReconciliation(work).reconciled) {
      await tx.acceptedOutcome.create({
        data: {
          userId,
          outcomeKey: "bank-reconciliation/v1",
          domain: "bank-reconciliation",
          data: json(work),
        },
      });
      for (const e of bankReconciliationEvidence(work, userId))
        await tx.skillEvidenceCloud.upsert({
          where: { userId_evidenceKey: { userId, evidenceKey: e.evidenceId } },
          update: {
            data: json({ ...e, provenance: "SERVER_SIMULATION" }),
            source: "SERVER_SIMULATION",
            strength: "practiced",
          },
          create: {
            userId,
            evidenceKey: e.evidenceId,
            skillId: e.skillId,
            strength: "practiced",
            source: "SERVER_SIMULATION",
            data: json({ ...e, provenance: "SERVER_SIMULATION" }),
          },
        });
    }
    await tx.cloudProgress.upsert({
      where: {
        userId_domain: {
          userId,
          domain: "bank-reconciliation",
        },
      },
      create: {
        userId,
        domain: "bank-reconciliation",
        data: json(work),
        provenance: "SERVER",
        revision: 1,
      },
      update: {
        data: json(work),
        provenance: "SERVER",
        revision: { increment: 1 },
      },
    });
    return { work, replayed: false };
  });
}
