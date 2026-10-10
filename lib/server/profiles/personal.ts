import "server-only";
import { db, serial, json } from "../db/client";
import { HttpError } from "../security/http";
import {
  personalCommand,
  applyPersonal,
  isPersonalRecord,
} from "@/lib/career/personal";
import { normalizeSnapshot } from "../migration/snapshots";
import type { CareerProfile } from "@/lib/career/model";
import type { z } from "zod";
import { saveAutomaticCloudCv } from "./cv";
export const PERSONAL_DOMAIN = "student-personal";
export async function personalFor(userId: string) {
  const row = await db().cloudProgress.findUnique({
    where: { userId_domain: { userId, domain: PERSONAL_DOMAIN } },
  });
  return {
    revision: row?.revision ?? 0,
    data: row && isPersonalRecord(row.data) ? row.data : null,
  };
}
export async function savePersonal(
  userId: string,
  email: string,
  input: z.infer<typeof personalCommand>,
) {
  return serial(async (tx) => {
    const where = { userId_domain: { userId, domain: PERSONAL_DOMAIN } };
    const current = await tx.cloudProgress.findUnique({ where });
    if ((current?.revision ?? 0) !== input.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    const record = {
      details: input.details,
      email,
      savedAt: new Date().toISOString(),
    };
    const next = await tx.cloudProgress.upsert({
      where,
      create: {
        userId,
        domain: PERSONAL_DOMAIN,
        data: json(record),
        revision: 1,
        provenance: "SERVER",
      },
      update: {
        data: json(record),
        revision: { increment: 1 },
        provenance: "SERVER",
      },
    });
    const domain = "local-backup/debit-credit-career-profile-v1";
    const old = await tx.cloudProgress.findUnique({
      where: { userId_domain: { userId, domain } },
    });
    const profile = applyPersonal(
      normalizeSnapshot(
        "debit-credit-career-profile-v1",
        old?.data ?? {},
        userId,
      ) as CareerProfile,
      record,
    );
    await tx.cloudProgress.upsert({
      where: { userId_domain: { userId, domain } },
      create: {
        userId,
        domain,
        data: json(profile),
        revision: 1,
        provenance: "SERVER",
      },
      update: { data: json(profile), revision: { increment: 1 } },
    });
    await saveAutomaticCloudCv(tx, userId);
    return { revision: next.revision, data: record };
  });
}
