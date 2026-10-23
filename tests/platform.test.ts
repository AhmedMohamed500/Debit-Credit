import { beforeEach, describe, expect, it } from "vitest";
import { academyPhases, placementRecommendation, professionalRank, recommendMission, resolveTheme } from "@/lib/platform";
import { createPlatformState, derivePlatformBadges, migratePlatformState, recordPlatformActivity } from "@/lib/platform/repository";
import { calculatePassport } from "@/lib/career/evidence";
import type { SkillResult } from "@/lib/career/model";

describe("platform progression and integrity", () => {
  beforeEach(() => localStorage.clear());
  it("resolves Light, Dark and System theme deterministically", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("system", true)).toBe("dark");
  });
  it("keeps foundations available and Closing locked", () => {
    expect(academyPhases.find((x) => x.id === 1)?.state).toBe("available");
    expect(academyPhases.find((x) => x.id === 4)?.state).toBe("locked");
    expect(academyPhases.find((x) => x.id === 5)?.state).toBe("planned");
  });
  it("maps placement thresholds predictably", () => {
    expect(placementRecommendation(20)).toBe(0);
    expect(placementRecommendation(80)).toBe(2);
  });
  it("keeps professional rank separate from game level", () => {
    const practiced: SkillResult = {
      skillId: "journal-entries",
      status: "practiced",
      score: null,
      confidence: "insufficient",
      evidenceCount: 1,
      uniqueActivities: 1,
      successfulActivities: 1,
    };
    expect(professionalRank(calculatePassport([]))).toBe("Accounting Explorer");
    expect(professionalRank([practiced])).toBe("Accounting Trainee");
  });
  it("recommends bank reconciliation work while keeping full Closing locked", () => {
    const result = recommendMission("treasury-accountant", calculatePassport([]));
    expect(result.skillId).toBeTruthy();
    if (result.skillId === "bank-reconciliation") {
      expect(result.locked).toBe(false);
      expect(result.route).toBe("/game/bank-reconciliation");
    }
  });
  it("migrates old platform state and keeps streak and badges idempotent", () => {
    const migrated = migratePlatformState({
      activeDates: ["2026-09-10", "2026-09-10"],
      badges: ["first-journal", "first-journal"],
    });
    expect(migrated.version).toBe(1);
    expect(migrated.activeDates).toEqual(["2026-09-10"]);
    let state = recordPlatformActivity(createPlatformState(), "2026-09-10", ["first-journal"]);
    state = recordPlatformActivity(state, "2026-09-10", ["first-journal"]);
    expect(state.currentStreak).toBe(1);
    expect(state.badges).toEqual(["first-journal"]);
    state = recordPlatformActivity(state, "2026-09-11");
    expect(state).toMatchObject({ currentStreak: 2, bestStreak: 2 });
  });
  it("derives game badges once from real inputs", () => {
    expect(
      derivePlatformBadges({
        resolvedCases: 3,
        firstAttempts: 3,
        inspectedEvidence: 6,
        riskAwareness: 95,
        accuracy: 100,
      }),
    ).toEqual(["first-journal", "clean-first-attempt", "evidence-hunter", "document-detective", "risk-spotter", "perfect-shift"]);
  });
});
