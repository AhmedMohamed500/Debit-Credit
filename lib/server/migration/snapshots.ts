import { createDefaultProfile } from "@/lib/career/repository";
import { roleCatalog } from "@/lib/career/catalog";
import type { RoleId } from "@/lib/career/model";
// Normalize untrusted legacy profile shapes before old UI repositories consume them.
export function normalizeSnapshot(key: string, value: unknown, owner: string) {
  if (key !== "debit-credit-career-profile-v1") return value;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("INVALID_SNAPSHOT");
  const row = value as Record<string, unknown>;
  const role =
    typeof row.targetRoleId === "string" &&
    Object.hasOwn(roleCatalog, row.targetRoleId)
      ? (row.targetRoleId as RoleId)
      : "junior-accountant";
  const base = createDefaultProfile(
    typeof row.fullName === "string" ? row.fullName.slice(0, 120) : "",
    role,
  );
  const result = {
    ...base,
    ...Object.fromEntries(
      Object.entries(row).filter(([k]) => Object.hasOwn(base, k)),
    ),
  };
  for (const [k, v] of Object.entries(base)) {
    if (Array.isArray(v) && !Array.isArray(result[k as keyof typeof result]))
      Object.assign(result, { [k]: v });
    if (
      typeof v === "string" &&
      typeof result[k as keyof typeof result] !== "string"
    )
      Object.assign(result, { [k]: v });
    if (
      typeof v === "boolean" &&
      typeof result[k as keyof typeof result] !== "boolean"
    )
      Object.assign(result, { [k]: v });
  }
  result.privacy = {
    ...base.privacy,
    ...(row.privacy &&
    typeof row.privacy === "object" &&
    !Array.isArray(row.privacy)
      ? row.privacy
      : {}),
  };
  result.version = 1;
  result.targetRoleId = role;
  result.localCandidateId = owner;
  return result;
}
