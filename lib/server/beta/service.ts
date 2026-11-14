import "server-only";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import {
  advanceBetaMetrics,
  betaEventSchema,
  betaFeedbackSchema,
} from "@/lib/beta/release";
import { db, json, serial } from "@/lib/server/db/client";

export const BETA_METRICS_DOMAIN = "beta-release-metrics-v1";
export const BETA_FEEDBACK_DOMAIN = "beta-release-feedback-v1";

export async function recordBetaEvent(
  userId: string,
  input: z.infer<typeof betaEventSchema>,
) {
  return serial(async (tx) => {
    const where = {
      userId_domain: { userId, domain: BETA_METRICS_DOMAIN },
    };
    const current = await tx.cloudProgress.findUnique({ where });
    const next = advanceBetaMetrics(current?.data, input.event);
    await tx.cloudProgress.upsert({
      where,
      create: {
        userId,
        domain: BETA_METRICS_DOMAIN,
        data: json(next),
        revision: 1,
      },
      update: {
        data: json(next),
        revision: { increment: 1 },
        provenance: "SERVER",
      },
    });
    return { recorded: true };
  });
}

export async function saveBetaFeedback(
  userId: string,
  input: z.infer<typeof betaFeedbackSchema>,
) {
  const where = {
    userId_domain: { userId, domain: BETA_FEEDBACK_DOMAIN },
  };
  const saved = await db().cloudProgress.upsert({
    where,
    create: {
      userId,
      domain: BETA_FEEDBACK_DOMAIN,
      data: json({
        schemaVersion: 1,
        feedbackId: randomUUID(),
        ...input,
        submittedAt: new Date().toISOString(),
      }),
      revision: 1,
    },
    update: {
      data: json({
        schemaVersion: 1,
        feedbackId: randomUUID(),
        ...input,
        submittedAt: new Date().toISOString(),
      }),
      revision: { increment: 1 },
      provenance: "SERVER",
    },
  });
  return { saved: true, revision: saved.revision };
}
