import { createBootcampState, migrateBootcampState } from "./engine";
import type { BootcampState } from "./model";
import { bootcampMissions } from "./catalog";
import { loadPlayerState, savePlayerState } from "@/lib/game/progress";
import { applyGameActivity } from "@/lib/game/engine";

export const BOOTCAMP_KEY = "debit-credit-bootcamp-v1";
const UPDATED = "debit-credit-foundations-updated";
export class BrowserBootcampRepository {
  private raw: string | null | undefined = undefined;
  private cached: BootcampState = createBootcampState();
  get(): BootcampState {
    if (typeof window === "undefined") return createBootcampState();
    try {
      return migrateBootcampState(
        JSON.parse(localStorage.getItem(BOOTCAMP_KEY) ?? "null"),
      );
    } catch {
      return createBootcampState();
    }
  }
  snapshot = (): BootcampState => {
    if (typeof window === "undefined") return this.cached;
    try {
      const raw = localStorage.getItem(BOOTCAMP_KEY);
      if (raw !== this.raw) {
        this.raw = raw;
        this.cached = migrateBootcampState(JSON.parse(raw ?? "null"));
      }
    } catch {}
    return this.cached;
  };
  subscribe = (callback: () => void) => {
    window.addEventListener(UPDATED, callback);
    window.addEventListener("storage", callback);
    return () => {
      window.removeEventListener(UPDATED, callback);
      window.removeEventListener("storage", callback);
    };
  };
  save(state: BootcampState) {
    const next = migrateBootcampState(state);
    try {
      if (typeof window !== "undefined") {
        this.raw = JSON.stringify(next);
        localStorage.setItem(BOOTCAMP_KEY, this.raw);
      }
      this.cached = next;
    } catch {
      this.cached = { ...next, storageWarning: true };
      try {
        this.raw = localStorage.getItem(BOOTCAMP_KEY);
      } catch {}
    }
    if (typeof window !== "undefined") window.dispatchEvent(new Event(UPDATED));
    return this.cached;
  }
}
export function syncFoundationRewards(state: BootcampState) {
  if (typeof window === "undefined") return;
  try {
    let player = loadPlayerState(),
      changed = false;
    for (const mission of bootcampMissions) {
      const id = `foundations-v2/${mission.id}`,
        key = `practice:${id}`;
      if (
        !state.completedMissionIds.includes(mission.id) ||
        player.activities[key]
      )
        continue;
      const before = player;
      const next = applyGameActivity(before, {
        kind: "practice",
        id,
        score: 100,
        skills: [],
        attempts: (state.attempts[mission.id] ?? 0) + 1,
      });
      player = {
        ...next,
        xp: before.xp + mission.xp,
        coins: before.coins,
        badges:
          mission.id === "mizan-boss"
            ? [...new Set([...before.badges, "foundation-company-starter"])]
            : before.badges,
        certificates: before.certificates,
        activities: {
          ...next.activities,
          [key]: {
            ...next.activities[key],
            xpAwarded: mission.xp,
            coinsAwarded: 0,
          },
        },
      };
      changed = true;
    }
    if (changed) savePlayerState(player);
  } catch {
    /* A blocked game store must not prevent the local mission from being playable. */
  }
}
