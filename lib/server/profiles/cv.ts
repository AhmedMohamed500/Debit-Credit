import "server-only";
import { createHash } from "node:crypto";
import { db, json, type Transaction } from "../db/client";
import { normalizeSnapshot } from "../migration/snapshots";
import { buildCv } from "@/lib/career/cv";
import { cvToPlainText } from "@/lib/career/ats";
import { calculatePassport } from "@/lib/career/evidence";
import { migrateSkillEvidence } from "@/lib/career/repository";
import type { CareerProfile, CvPreferences } from "@/lib/career/model";
import { roleCatalog } from "@/lib/career/catalog";

// Private derived snapshot, never used as a competition outcome or hiring proof.
export async function saveAutomaticCloudCv(tx: Transaction, userId: string) {
  const [row, preferences, evidenceRows, latest] = await Promise.all([
    tx.cloudProgress.findUnique({ where: { userId_domain: { userId, domain: "local-backup/debit-credit-career-profile-v1" } } }),
    tx.cloudProgress.findUnique({ where: { userId_domain: { userId, domain: "local-backup/debit-credit-cv-preferences-v1" } } }),
    tx.skillEvidenceCloud.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    tx.cvVersionCloud.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!row) return;
  const profile = normalizeSnapshot("debit-credit-career-profile-v1", row.data, userId) as CareerProfile;
  const preferred = (preferences?.data as Partial<CvPreferences> | undefined)?.targetRoleId ?? profile.targetRoleId;
  const role = Object.hasOwn(roleCatalog, preferred) ? preferred : "junior-accountant";
  const evidence = migrateSkillEvidence(evidenceRows.map(item => item.data)).filter(item => item.localCandidateId === userId);
  const cv = buildCv(profile, calculatePassport(evidence), evidence, role), plainText = cvToPlainText(profile, cv);
  const fingerprint = createHash("sha256").update(JSON.stringify({ cv, plainText })).digest("hex");
  if ((latest?.data as { fingerprint?: string } | undefined)?.fingerprint === fingerprint) return;
  await tx.cvVersionCloud.create({ data: { userId, data: json({ templateVersion: 1, fingerprint, profile, cv, plainText }) } });
}
export function automaticCvFor(userId: string) {
  return db().cvVersionCloud.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
}
