export type PendingDraft = { data: unknown; revision: number };
const prefix = "app-sync-outbox-v1/";
export function readDrafts(owner: string): Record<string, PendingDraft> {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(localStorage.getItem(prefix + owner) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(([key, v]) => {
        if (!key.startsWith("debit-credit-")) return false;
        const row = v as PendingDraft;
        return (
          !!row &&
          Number.isSafeInteger(row.revision) &&
          row.revision >= 0 &&
          Object.hasOwn(row, "data")
        );
      }),
    ) as Record<string, PendingDraft>;
  } catch {
    return {};
  }
}
export function writeDrafts(
  owner: string,
  drafts: Record<string, PendingDraft>,
) {
  if (typeof window === "undefined") return;
  // Account-scoped draft recovery only. Never store authentication credentials.
  if (Object.keys(drafts).length)
    localStorage.setItem(prefix + owner, JSON.stringify(drafts));
  else localStorage.removeItem(prefix + owner);
}
