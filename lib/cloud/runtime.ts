"use client";
import type {
  BootcampMissionId,
  FoundationResponse,
  BootcampState,
} from "@/lib/bootcamp/model";
import type { CareerLeagueState } from "@/lib/career-league/model";
import { readDrafts, writeDrafts, type PendingDraft } from "./outbox";
export type CloudIdentity = {
  personalComplete?: boolean;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    role: "USER" | "ADMIN";
  };
  profile: {
    userId: string;
    displayName: string;
    handle: string;
    avatar: "blue" | "green" | "gold" | "purple";
    locale: "ar" | "en";
    persona: CareerLeagueState["persona"];
    targetRoleId: string;
    updatedAt: string;
  };
  capabilities: { google: boolean; email: boolean };
};
export type CloudProgress = {
  schemaVersion: number;
  foundations: { data: BootcampState; revision: number };
  domains: {
    domain: string;
    data: unknown;
    revision: number;
    provenance: string;
  }[];
  evidence: { data: unknown }[];
};
export class CloudFailure extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export async function requestJSON<T>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const response = await fetch("/api/v1/" + path, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      ...(data === undefined ? {} : { "Content-Type": "application/json" }),
      ...(userId ? { "X-Account-Context": userId } : {}),
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new CloudFailure(
      response.status,
      result.error?.code ?? "SERVICE_UNAVAILABLE",
    );
  return result as T;
}
let userId: string | null = null;
const revisions = new Map<string, number>();
let syncStatus = "ready";
export const cloudUser = () => userId;
export const currentSyncStatus = () => syncStatus;
export function notifySync(status: string) {
  if (status === "saved" && pending.size) status = "saving";
  syncStatus = status;
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("app-sync-status", { detail: status }),
    );
}
export function configureCloud(id: string | null, progress?: CloudProgress) {
  if (id !== userId) {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    pending.clear();
    generation++;
  }
  userId = id;
  revisions.clear();
  if (progress) {
    revisions.set("foundations", progress.foundations.revision);
    for (const row of progress.domains) revisions.set(row.domain, row.revision);
  }
  if (id) {
    for (const [key, draft] of Object.entries(readDrafts(id)))
      if (backupKeys.has(key)) pending.set(key, draft);
    if (pending.size) notifySync("unsynced");
  }
}
export async function submitCloudFoundation(
  missionId: BootcampMissionId,
  taskId: string,
  response: FoundationResponse,
) {
  const owner = userId,
    epoch = generation;
  notifySync("saving");
  try {
    const result = await requestJSON<{
      data: BootcampState;
      revision: number;
      correct: boolean;
    }>("me/progress", "POST", {
      commandId: crypto.randomUUID(),
      missionId,
      taskId,
      response,
      revision: revisions.get("foundations") ?? 0,
    });
    if (owner !== userId || epoch !== generation)
      throw new CloudFailure(409, "ACCOUNT_CHANGED");
    revisions.set("foundations", result.revision);
    notifySync("saved");
    return result;
  } catch (error) {
    if (owner !== userId || epoch !== generation) throw error;
    notifySync(
      error instanceof CloudFailure && error.status === 409
        ? "conflict"
        : "unsynced",
    );
    throw error;
  }
}
export async function saveCloudCareer(state: CareerLeagueState) {
  if (!userId || !state.persona || !state.goal || !state.targetRoleId) return;
  const owner = userId,
    epoch = generation;
  notifySync("saving");
  try {
    const row = await requestJSON<{ revision: number }>(
      "me/career-entry",
      "PUT",
      {
        persona: state.persona,
        goal: state.goal,
        targetRoleId: state.targetRoleId,
        workEnvironment: state.workEnvironment,
        revision: revisions.get("career-entry") ?? 0,
      },
    );
    if (owner !== userId || epoch !== generation)
      throw new CloudFailure(409, "ACCOUNT_CHANGED");
    revisions.set("career-entry", row.revision);
    notifySync("saved");
  } catch (error) {
    if (owner !== userId || epoch !== generation) throw error;
    notifySync(
      error instanceof CloudFailure && error.status === 409
        ? "conflict"
        : "unsynced",
    );
    throw error;
  }
}
const backupKeys = new Set([
  "debit-credit-world-v2",
  "debit-credit-bank-reconciliation-v1",
  "debit-credit-placement-v1",
  "debit-credit-career-profile-v1",
  "debit-credit-cv-preferences-v1",
]);
const pending = new Map<string, PendingDraft>(),
  timers = new Map<string, ReturnType<typeof setTimeout>>();
let generation = 0;
const flights = new Map<string, Promise<void>>();
function persistDrafts() {
  if (!userId) return;
  try {
    writeDrafts(userId, Object.fromEntries(pending));
  } catch {
    notifySync("unsynced");
  }
}
export function queueCloudBackup(key: string, data: unknown) {
  if (!userId || !backupKeys.has(key)) return;
  pending.set(key, {
    data: JSON.parse(JSON.stringify(data)),
    revision:
      pending.get(key)?.revision ?? revisions.get("local-backup/" + key) ?? 0,
  });
  persistDrafts();
  notifySync("saving");
  const timer = timers.get(key);
  if (timer) clearTimeout(timer);
  timers.set(
    key,
    setTimeout(() => {
      void flushBackup(key);
    }, 1200),
  );
}
async function flushBackup(key: string) {
  const flightKey = `${userId}:${generation}:${key}`;
  if (flights.has(flightKey)) return flights.get(flightKey);
  const flight = sendBackup(key);
  flights.set(flightKey, flight);
  try {
    await flight;
  } finally {
    flights.delete(flightKey);
  }
}
async function sendBackup(key: string) {
  const owner = userId;
  const epoch = generation;
  if (!owner || !pending.has(key)) return;
  const draft = pending.get(key)!;
  try {
    const row = await requestJSON<{ revision: number }>("me/progress", "PUT", {
      domain: key,
      data: draft.data,
      revision: draft.revision,
    });
    if (owner !== userId || epoch !== generation) return;
    revisions.set("local-backup/" + key, row.revision);
    if (pending.get(key) === draft) pending.delete(key);
    else if (pending.has(key)) {
      pending.set(key, {
        data: pending.get(key)!.data,
        revision: row.revision,
      });
      timers.set(
        key,
        setTimeout(() => void flushBackup(key), 1200),
      );
    }
    persistDrafts();
    notifySync(pending.size ? "saving" : "saved");
  } catch (error) {
    if (owner !== userId || epoch !== generation) return;
    notifySync(
      error instanceof CloudFailure && error.status === 409
        ? "conflict"
        : "unsynced",
    );
  }
}
export function retryBackups() {
  for (const key of pending.keys()) void flushBackup(key);
}
export function pendingBackups() {
  return pending.size;
}
