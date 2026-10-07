"use client";
import {
  PROFILE_SCOPED_KEYS,
  MULTI_PROFILE_KEY,
} from "@/lib/local-competition/repository";
import {
  BrowserBootcampRepository,
  BOOTCAMP_KEY,
  syncFoundationRewards,
} from "@/lib/bootcamp/repository";
import { BrowserCareerLeagueRepository } from "@/lib/career-league/repository";
import {
  BrowserCareerProfileRepository,
  BrowserSkillEvidenceRepository,
  LOCAL_CANDIDATE_KEY,
  SKILL_EVIDENCE_KEY,
  createDefaultProfile,
  CAREER_PROFILE_KEY,
} from "@/lib/career/repository";
import type { CloudIdentity, CloudProgress } from "./runtime";
import { readDrafts } from "./outbox";
const OWNER = "app-cache-owner",
  GUEST = "app-guest-preserved",
  DEVICE = "app-import-device";
const keys = [
  ...PROFILE_SCOPED_KEYS,
  MULTI_PROFILE_KEY,
  LOCAL_CANDIDATE_KEY,
  "debit-credit-player-v1",
  "debit-credit-player-sync-v1",
];
export type LegacySnapshot = Record<string, unknown>;
const parse = (value: string | null) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};
export class CloudCacheRepository {
  owner() {
    return localStorage.getItem(OWNER);
  }
  capture() {
    const data: Record<string, string> = {};
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw !== null) data[key] = raw;
    }
    return data;
  }
  meaningful() {
    const foundations = new BrowserBootcampRepository().get(),
      career = new BrowserCareerLeagueRepository().get(),
      profile = new BrowserCareerProfileRepository().get(),
      evidence = new BrowserSkillEvidenceRepository().getAll();
    return (
      foundations.completedMissionIds.length > 0 ||
      Object.values(foundations.interactionProgress).some((x) => x?.length) ||
      foundations.legacy.completedMissionIds.length > 0 ||
      !!career.persona ||
      !!profile?.fullName ||
      evidence.length > 0 ||
      Object.values(
        parse(localStorage.getItem("debit-credit-world-v2")) ?? {},
      ).some((x) => Array.isArray(x) && x.length > 0)
    );
  }
  legacy(): LegacySnapshot {
    const data: LegacySnapshot = {};
    for (const key of PROFILE_SCOPED_KEYS) {
      const value = parse(localStorage.getItem(key));
      if (value !== null) data[key] = value;
    }
    const player = parse(localStorage.getItem("debit-credit-player-v1"));
    if (player) data["debit-credit-player-v1"] = player;
    return data;
  }
  preserveGuest() {
    if (this.owner()) return;
    const data = JSON.stringify(this.capture());
    localStorage.setItem(GUEST, data);
    if (localStorage.getItem(GUEST) !== data)
      throw new Error("CACHE_BACKUP_FAILED");
  }
  device() {
    const old = localStorage.getItem(DEVICE);
    if (old) return old;
    const id = crypto.randomUUID();
    localStorage.setItem(DEVICE, id);
    return id;
  }
  restoreGuest() {
    if (!this.owner()) return;
    const data = parse(localStorage.getItem(GUEST)) as Record<
      string,
      string
    > | null;
    for (const key of keys) {
      if (data && typeof data[key] === "string")
        localStorage.setItem(key, data[key]);
      else localStorage.removeItem(key);
    }
    localStorage.removeItem(OWNER);
  }
  hydrate(identity: CloudIdentity, progress: CloudProgress) {
    const drafts =
      this.owner() === identity.user.id
        ? new BrowserBootcampRepository().get().drafts
        : {};
    this.preserveGuest();
    // Guest data has a durable backup before replacing the active working copy.
    for (const key of keys) localStorage.removeItem(key);
    for (const row of progress.domains) {
      const key = row.domain.replace(/^local-backup\//, "");
      if (
        row.domain.startsWith("local-backup/") &&
        PROFILE_SCOPED_KEYS.includes(key)
      )
        localStorage.setItem(key, JSON.stringify(row.data));
    }
    const career = progress.domains.find((x) => x.domain === "career-entry");
    for (const [key, draft] of Object.entries(readDrafts(identity.user.id))) {
      if (PROFILE_SCOPED_KEYS.includes(key))
        localStorage.setItem(key, JSON.stringify(draft.data));
    }
    const bank = progress.domains.find(
      (x) => x.domain === "bank-reconciliation",
    );
    if (!bank) {
      const localBank = parse(
        localStorage.getItem("debit-credit-bank-reconciliation-v1"),
      );
      if (localBank && typeof localBank === "object")
        localStorage.setItem(
          "debit-credit-bank-reconciliation-v1",
          JSON.stringify({
            ...localBank,
            completedAt: null,
            attempts: 0,
            firstAttemptQualified: false,
          }),
        );
    }
    if (bank)
      localStorage.setItem(
        "debit-credit-bank-reconciliation-v1",
        JSON.stringify(bank.data),
      );
    if (career)
      localStorage.setItem(
        "debit-credit-career-league-v1",
        JSON.stringify(career.data),
      );
    localStorage.setItem(
      BOOTCAMP_KEY,
      JSON.stringify({
        ...progress.foundations.data,
        drafts: { ...drafts, ...progress.foundations.data.drafts },
      }),
    );
    localStorage.setItem(LOCAL_CANDIDATE_KEY, identity.user.id);
    if (progress.evidence.length)
      localStorage.setItem(
        SKILL_EVIDENCE_KEY,
        JSON.stringify(progress.evidence.map((x) => x.data)),
      );
    if (!localStorage.getItem(CAREER_PROFILE_KEY)) {
      const p = createDefaultProfile(identity.profile.displayName);
      p.localCandidateId = identity.user.id;
      localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify(p));
    }
    localStorage.setItem(OWNER, identity.user.id);
    localStorage.setItem(
      "debit-credit-player-sync-v1",
      new Date().toISOString(),
    );
    syncFoundationRewards(progress.foundations.data);
  }
}
