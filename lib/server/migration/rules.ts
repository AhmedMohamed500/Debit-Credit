import { createHash } from "node:crypto";
import { migrateBootcampState } from "@/lib/bootcamp/engine";
import { bootcampMissions } from "@/lib/bootcamp/catalog";
import { migrateSkillEvidence } from "@/lib/career/repository";
export const legacyKeys = [
  "debit-credit-bootcamp-v1",
  "debit-credit-career-league-v1",
  "debit-credit-career-profile-v1",
  "debit-credit-skill-evidence-v1",
  "debit-credit-cv-preferences-v1",
  "debit-credit-world-v2",
  "debit-credit-bank-reconciliation-v1",
  "debit-credit-placement-v1",
  "debit-credit-platform-v1",
  "debit-credit-player-v1",
  "debit-credit-career-content-v1",
  "debit-credit-company-progression-v1",
  "debit-credit-cv-history-v1",
] as const;
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonical(v))
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
export const checksum = (value: unknown) =>
  createHash("sha256").update(canonical(value)).digest("hex");
export function mergeFoundations(cloud: unknown, legacy: unknown) {
  const a = migrateBootcampState(cloud),
    b = migrateBootcampState(legacy),
    interactionProgress = { ...a.interactionProgress },
    attempts = { ...a.attempts };
  for (const m of bootcampMissions) {
    interactionProgress[m.id] = [
      ...new Set([
        ...(a.interactionProgress[m.id] ?? []),
        ...(b.interactionProgress[m.id] ?? []),
      ]),
    ];
    attempts[m.id] = Math.max(a.attempts[m.id] ?? 0, b.attempts[m.id] ?? 0);
  }
  return migrateBootcampState({
    ...a,
    interactionProgress,
    attempts,
    completedMissionIds: [
      ...new Set([...a.completedMissionIds, ...b.completedMissionIds]),
    ],
    legacy: {
      ...a.legacy,
      completedMissionIds: [
        ...new Set([
          ...a.legacy.completedMissionIds,
          ...b.legacy.completedMissionIds,
        ]),
      ],
    },
    completedAt: a.completedAt ?? b.completedAt,
  });
}
export function importedEvidence(value: unknown, userId: string) {
  const valid = Array.isArray(value)
    ? value.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          typeof item.activityId === "string" &&
          typeof item.completedAt === "string",
      )
    : [];
  return migrateSkillEvidence(valid)
    .slice(0, 300)
    .filter(
      (e) =>
        typeof e.activityId === "string" && typeof e.completedAt === "string",
    )
    .map((e) => ({
      ...e,
      localCandidateId: userId,
      assessmentIntegrity:
        e.assessmentIntegrity === "demonstrated"
          ? ("demonstrated" as const)
          : ("practice" as const),
      provenance: "LEGACY_LOCAL_IMPORT" as const,
      score: Number.isFinite(e.score) ? Math.max(0, Math.min(100, e.score)) : 0,
    }));
}
