import "server-only";
import { createHash } from "node:crypto";
import { db, json, type Transaction } from "../db/client";
import { normalizeSnapshot } from "../migration/snapshots";
import { buildCv } from "@/lib/career/cv";
import { compactCv } from "@/lib/career/compact-cv";
import { scoreCvReadiness } from "@/lib/career/ats";
import {
  calculatePassport,
  firstShiftSkillEvidence,
} from "@/lib/career/evidence";
import { safeLoad } from "@/lib/campaign/director";
import { migrateSkillEvidence } from "@/lib/career/repository";
import type { CareerProfile, CvPreferences } from "@/lib/career/model";
import { roleCatalog } from "@/lib/career/catalog";
import type { Portfolio } from "@/lib/career/portfolio";
import { applyPersonal, isPersonalRecord } from "@/lib/career/personal";
import { showcaseSettings } from "@/lib/career/showcase";
import { refreshDiscovery } from "../talent/service";

// Private derived snapshot, never used as a competition outcome or hiring proof.
export async function deriveAccountCv(
  tx: Pick<Transaction, "cloudProgress" | "skillEvidenceCloud">,
  userId: string,
  requestedRole?: string | null,
) {
  const row = await tx.cloudProgress.findUnique({
    where: {
      userId_domain: {
        userId,
        domain: "local-backup/debit-credit-career-profile-v1",
      },
    },
  });
  if (!row) return null;
  const [preferences, personal, portfolio, showcase, game] = await Promise.all(
    [
      "local-backup/debit-credit-cv-preferences-v1",
      "student-personal",
      "private-portfolio",
      "private-showcase",
      "local-backup/debit-credit-world-v2",
    ].map((domain) =>
      tx.cloudProgress.findUnique({
        where: { userId_domain: { userId, domain } },
      }),
    ),
  );
  const evidenceRows = await tx.skillEvidenceCloud.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  let profile = normalizeSnapshot(
    "debit-credit-career-profile-v1",
    row.data,
    userId,
  ) as CareerProfile;
  if (isPersonalRecord(personal?.data))
    profile = applyPersonal(profile, personal.data);
  const settings = showcaseSettings.safeParse(
    (showcase?.data as { settings?: unknown } | undefined)?.settings,
  );
  if (settings.success && !isPersonalRecord(personal?.data))
    profile = {
      ...profile,
      linkedIn: settings.data.socials.linkedin,
      portfolio: settings.data.socials.website,
    };
  const preferred =
    requestedRole ??
    (preferences?.data as Partial<CvPreferences> | undefined)?.targetRoleId ??
    profile.targetRoleId;
  const role = Object.hasOwn(roleCatalog, preferred)
    ? (preferred as keyof typeof roleCatalog)
    : "junior-accountant";
  const recorded = migrateSkillEvidence(
    evidenceRows.map((item) => item.data),
  ).filter((item) => item.localCandidateId === userId);
  // Preserve the established First Shift case-trace projection from the owner's
  // saved game. This is simulation evidence, never a verified assessment,
  // competition score or new SkillEvidenceCloud record.
  const projected = game
    ? firstShiftSkillEvidence(safeLoad(JSON.stringify(game.data)), userId)
    : [];
  const evidence = [
    ...new Map(
      [...projected, ...recorded].map((item) => [item.evidenceId, item]),
    ).values(),
  ];
  const passport = calculatePassport(evidence);
  const cv = buildCv(profile, passport, evidence, role);
  const compact = compactCv(
    profile,
    cv,
    portfolio
      ? {
          revision: portfolio.revision,
          ...(portfolio.data as Omit<Portfolio, "revision">),
        }
      : undefined,
  );
  return {
    templateVersion: 2,
    profile,
    cv,
    passport,
    evidence,
    compact,
    plainText: compact.plainText,
    readiness: scoreCvReadiness(profile, cv, compact),
  };
}
export async function saveAutomaticCloudCv(tx: Transaction, userId: string) {
  const data = await deriveAccountCv(tx, userId);
  await refreshDiscovery(tx, userId);
  if (!data) return;
  // Version the visible document, not mutable timestamps or private source
  // metadata. Re-saving the same facts must not create an identical CV version.
  const fingerprint = createHash("sha256")
    .update(JSON.stringify({ role: data.cv.targetRoleId, text: data.plainText }))
    .digest("hex");
  const latest = await tx.cvVersionCloud.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (
    (latest?.data as { fingerprint?: string } | undefined)?.fingerprint ===
    fingerprint
  )
    return;
  await tx.cvVersionCloud.create({
    data: { userId, data: json({ ...data, fingerprint }) },
  });
}
export async function automaticCvFor(userId: string, role?: string | null) {
  // Backfill old courses in the projection, not with writes/migrations on GET.
  return db().$transaction(
    async (tx) => {
      const data = await deriveAccountCv(tx, userId, role);
      return data ? { data } : null;
    },
    { isolationLevel: "RepeatableRead" },
  );
}
