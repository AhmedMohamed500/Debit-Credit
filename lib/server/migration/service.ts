import "server-only";
import { z } from "zod";
import { serial, json } from "../db/client";
import {
  checksum,
  legacyKeys,
  mergeFoundations,
  importedEvidence,
} from "./rules";
import { HttpError } from "../security/http";
import { boundedJSON } from "../security/json";
import { normalizeSnapshot } from "./snapshots";
import { applyPersonal, isPersonalRecord } from "@/lib/career/personal";
import type { CareerProfile } from "@/lib/career/model";
import { saveAutomaticCloudCv } from "../profiles/cv";
export const importSchema = z
  .object({
    version: z.literal(1),
    deviceId: z.string().uuid(),
    mode: z.enum(["merge", "cloud"]),
    domains: z.partialRecord(z.enum(legacyKeys), boundedJSON),
  })
  .strict();
export async function importLegacy(
  userId: string,
  input: z.infer<typeof importSchema>,
) {
  const profileSnapshot = input.domains["debit-credit-career-profile-v1"];
  if (
    profileSnapshot !== undefined &&
    (!profileSnapshot ||
      typeof profileSnapshot !== "object" ||
      Array.isArray(profileSnapshot))
  )
    throw new HttpError(400, "INVALID_SNAPSHOT");
  const fingerprint = checksum(input.domains);
  return serial(async (tx) => {
    const old = await tx.legacyImport.findUnique({
      where: {
        userId_importVersion_checksum: {
          userId,
          importVersion: 1,
          checksum: fingerprint,
        },
      },
    });
    if (old)
      return {
        id: old.id,
        checksum: fingerprint,
        replayed: true,
        summary: old.summary,
      };
    let count = 0;
    if (input.mode === "merge") {
      const foundations = input.domains["debit-credit-bootcamp-v1"];
      if (foundations) {
        const row = await tx.cloudProgress.findUnique({
          where: { userId_domain: { userId, domain: "foundations" } },
        });
        const merged = mergeFoundations(row?.data, foundations);
        await tx.cloudProgress.upsert({
          where: { userId_domain: { userId, domain: "foundations" } },
          create: {
            userId,
            domain: "foundations",
            data: json(merged),
            provenance: "LEGACY_LOCAL_IMPORT",
            revision: 1,
          },
          update: {
            data: json(merged),
            revision: { increment: 1 },
            provenance: "MIXED_LEGACY",
          },
        });
        count++;
      }
      for (const [key, value] of Object.entries(input.domains)) {
        if (
          [
            "debit-credit-bootcamp-v1",
            "debit-credit-skill-evidence-v1",
          ].includes(key)
        )
          continue;
        const domain = "local-backup/" + key;
        await tx.cloudProgress.upsert({
          where: { userId_domain: { userId, domain } },
          update: {},
          create: {
            userId,
            domain,
            data: json(normalizeSnapshot(key, value, userId)),
            provenance: "LEGACY_LOCAL_IMPORT",
            revision: 1,
          },
        });
        count++;
      }
      for (const e of importedEvidence(
        input.domains["debit-credit-skill-evidence-v1"],
        userId,
      )) {
        await tx.skillEvidenceCloud.upsert({
          where: { userId_evidenceKey: { userId, evidenceKey: e.evidenceId } },
          update: {},
          create: {
            userId,
            evidenceKey: e.evidenceId,
            skillId: e.skillId,
            strength:
              e.assessmentIntegrity === "demonstrated"
                ? "demonstrated"
                : "practiced",
            source: "LEGACY_LOCAL_IMPORT",
            data: json(e),
          },
        });
      }
    }
    const summary = {
      domains: count,
      evidenceSource: "LEGACY_LOCAL_IMPORT",
      officialCompetitionImported: false,
    };
    const row = await tx.legacyImport.create({
      data: {
        userId,
        deviceId: input.deviceId,
        importVersion: 1,
        checksum: fingerprint,
        summary: json(summary),
      },
    });
    await tx.auditLog.create({
      data: { userId, action: "LEGACY_IMPORT", resourceId: row.id },
    });
    return { id: row.id, checksum: fingerprint, replayed: false, summary };
  });
}
export const backupKeys = [
  "debit-credit-world-v2",
  "debit-credit-bank-reconciliation-v1",
  "debit-credit-placement-v1",
  "debit-credit-career-profile-v1",
  "debit-credit-cv-preferences-v1",
] as const;
export const backupSchema = z
  .object({
    domain: z.enum(backupKeys),
    data: boundedJSON,
    revision: z.number().int().nonnegative(),
  })
  .strict();
export async function saveBackup(
  userId: string,
  input: z.infer<typeof backupSchema>,
) {
  if (
    !input.data ||
    typeof input.data !== "object" ||
    Array.isArray(input.data)
  )
    throw new HttpError(400, "INVALID_SNAPSHOT");
  return serial(async (tx) => {
    const domain = "local-backup/" + input.domain,
      row = await tx.cloudProgress.findUnique({
        where: { userId_domain: { userId, domain } },
      });
    if ((row?.revision ?? 0) !== input.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    let snapshot = normalizeSnapshot(input.domain, input.data, userId);
    if (input.domain === "debit-credit-career-profile-v1") {
      const personal = await tx.cloudProgress.findUnique({ where: { userId_domain: { userId, domain: "student-personal" } } });
      if (personal && isPersonalRecord(personal.data)) snapshot = applyPersonal(snapshot as CareerProfile, personal.data);
    }
    // Client backups never produce accepted postings, professional proof or points.
    const next = await tx.cloudProgress.upsert({
      where: { userId_domain: { userId, domain } },
      create: {
        userId,
        domain,
        data: json(snapshot),
        revision: 1,
        provenance: "LOCAL_BACKUP",
      },
      update: {
        data: json(snapshot),
        revision: { increment: 1 },
        provenance: "LOCAL_BACKUP",
      },
    });
    if (["debit-credit-career-profile-v1", "debit-credit-cv-preferences-v1"].includes(input.domain)) await saveAutomaticCloudCv(tx, userId);
    return next;
  });
}
