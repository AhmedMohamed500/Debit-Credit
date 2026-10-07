import { describe, it, expect } from "vitest";
import { safeNext } from "@/lib/auth/safe-next";
import {
  checksum,
  mergeFoundations,
  importedEvidence,
} from "@/lib/server/migration/rules";
import {
  createBootcampState,
  submitFoundationTask,
} from "@/lib/bootcamp/engine";
import { bootcampMissions } from "@/lib/bootcamp/catalog";
import { profileSchema } from "@/lib/server/profiles/schemas";
import { normalizeSnapshot } from "@/lib/server/migration/snapshots";
describe("backend safety rules", () => {
  it("normalizes partial legacy profiles without trusting their candidate ID", () => {
    expect(
      normalizeSnapshot(
        "debit-credit-career-profile-v1",
        {
          fullName: "Ahmed",
          localCandidateId: "other-user",
          education: "broken",
        },
        "account-a",
      ),
    ).toMatchObject({
      fullName: "Ahmed",
      localCandidateId: "account-a",
      education: [],
      experience: [],
      version: 1,
    });
  });
  it("retains non-profile legacy history arrays as private backups", () => {
    const history = [{ version: 1 }];
    expect(
      normalizeSnapshot("debit-credit-cv-history-v1", history, "account-a"),
    ).toEqual(history);
  });
  it.each([
    "https://evil.invalid",
    "//evil.invalid",
    "/ar/../../evil",
    "/ar/\\evil",
    "/ar/%5cevil",
    "/ar/login",
    "/ar/game%0aevil",
  ])("rejects unsafe redirect %s", (value) =>
    expect(safeNext(value, "en")).toBe("/en/onboarding"),
  );
  it("preserves safe internal destination", () =>
    expect(safeNext("/ar/onboarding?persona=student", "ar")).toBe(
      "/ar/onboarding?persona=student",
    ));
  it("canonical checksum ignores object key order", () =>
    expect(checksum({ b: 2, a: [1] })).toBe(checksum({ a: [1], b: 2 })));
  it("foundation merge is idempotent and keeps valid steps", () => {
    const task = bootcampMissions[0].tasks[0],
      state = submitFoundationTask(
        createBootcampState(),
        "business-world",
        task.id,
        task.answer,
      ).state;
    expect(mergeFoundations(state, state)).toEqual(
      mergeFoundations(mergeFoundations(state, state), state),
    );
    expect(
      mergeFoundations(null, {
        version: 2,
        completedMissionIds: ["mizan-boss"],
      }).bossCompleted,
    ).toBe(false);
  });
  it("legacy evidence never becomes Verified", () => {
    const result = importedEvidence(
      [
        {
          evidenceId: "e",
          skillId: "journal-entries",
          activityId: "case/a",
          completedAt: "2026-01-01",
          assessmentIntegrity: "verified_server",
          score: 100,
        },
      ],
      "user-a",
    );
    expect(result[0].assessmentIntegrity).toBe("practice");
    expect(result[0].provenance).toBe("LEGACY_LOCAL_IMPORT");
    expect(result[0].localCandidateId).toBe("user-a");
  });
  it("normal profile schema rejects role and ownership forgery", () =>
    expect(
      profileSchema.safeParse({
        displayName: "Ahmed",
        role: "ADMIN",
        userId: "another",
      }).success,
    ).toBe(false));
});
