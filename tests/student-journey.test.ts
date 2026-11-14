import { describe, expect, it } from "vitest";
import { bootcampMissionIds } from "@/lib/bootcamp/catalog";
import { studentJourney } from "@/lib/student/journey";
import { nextStudentStep, stepIds } from "@/lib/student/unit";
import { initialState } from "@/lib/campaign/director";
import {
  firstDayDocuments,
  submitFirstDayDocument,
} from "@/lib/campaign/first-day";
import {
  completedFirstShiftMissionIds,
  markFirstShiftLedgerReviewed,
} from "@/lib/campaign/first-shift-hub";

const start = {
  locale: "en" as const,
  pathname: "/en/journey",
  personalComplete: true,
  excelCompletedSteps: 5,
  foundationCompleted: [] as string[],
  accepted: [] as string[],
  shiftMissionIds: [] as string[],
};

describe("Unified eight-level accounting journey V1.1", () => {
  it("requires personal details before assessed training", () => {
    expect(
      studentJourney({ ...start, personalComplete: false }).nextRoute,
    ).toBe("/en/student-profile");
  });

  it.each(["ar", "en"] as const)(
    "maps eight real %s levels to their exact training surfaces",
    (locale) => {
      const journey = studentJourney({ ...start, locale });
      expect(journey.learningStages).toHaveLength(8);
      expect(journey.learningStages.map((level) => level.id)).toEqual([
        "foundations",
        "documents",
        "journal",
        "ledger",
        "trial-balance",
        "statements",
        "review",
        "company-simulation",
      ]);
      expect(journey.learningStages[0].route).toBe(
        `/${locale}/bootcamp?mission=business-world`,
      );
      expect(journey.learningStages[1].route).toBe(
        `/${locale}/game/student?focus=document-control`,
      );
      expect(journey.learningStages[2].route).toBe(
        `/${locale}/game/student?focus=journal-service`,
      );
      expect(journey.learningStages[5].route).toBe(`/${locale}/journey`);
      expect(journey.learningStages[7].route).toBe(
        `/${locale}/game/first-shift`,
      );
      expect(journey.nextRoute).toBe(
        `/${locale}/bootcamp?mission=business-world`,
      );
    },
  );

  it("keeps Excel compatible but outside core unlock requirements", () => {
    expect(studentJourney({ ...start, excelCompletedSteps: 0 }).next?.id).toBe(
      "foundations",
    );
    expect(studentJourney({ ...start, excelCompletedSteps: 5 }).next?.id).toBe(
      "foundations",
    );
  });

  it("uses the complete server-graded foundations sequence and mastery boss", () => {
    const beforeBoss = studentJourney({
      ...start,
      foundationCompleted: bootcampMissionIds.slice(0, -1),
    });
    expect(beforeBoss.learningStages[0]).toMatchObject({
      done: false,
      earned: 12,
      total: 13,
      nextMissionId: "mizan-boss",
      route: "/en/bootcamp?mission=mizan-boss",
    });
    const complete = studentJourney({
      ...start,
      foundationCompleted: [...bootcampMissionIds],
    });
    expect(complete.learningStages[0].done).toBe(true);
    expect(complete.next?.id).toBe("documents");
  });

  it("maps every Student Unit mission exactly once outside foundations", () => {
    const journey = studentJourney(start);
    const mapped = journey.learningStages
      .slice(1, 7)
      .flatMap((level) => level.missionIds);
    expect(mapped).toEqual(stepIds);
    expect(new Set(mapped).size).toBe(mapped.length);
  });

  it("marks actual accepted IDs, including a non-contiguous saved scenario", () => {
    const journey = studentJourney({
      ...start,
      foundationCompleted: [...bootcampMissionIds],
      accepted: ["journal-equipment", "trial-balance", "fake"],
    });
    expect(journey.count).toBe(2);
    expect(journey.learningStages[1].completedMissionIds).toEqual([
      "journal-equipment",
    ]);
    expect(journey.learningStages[4].completedMissionIds).toEqual([
      "trial-balance",
    ]);
    expect(journey.learningStages[1].earned).toBe(1);
    expect(journey.learningStages[1].route).toBe(
      "/en/game/student?focus=document-control",
    );
    expect(nextStudentStep(["journal-equipment", "trial-balance"])).toBe(
      "document-control",
    );
  });

  it("keeps Financial Statements in development without fake completion", () => {
    const level = studentJourney({
      ...start,
      foundationCompleted: [...bootcampMissionIds],
      accepted: [...stepIds],
      shiftMissionIds: allShiftIds,
    }).learningStages[5];
    expect(level).toMatchObject({
      status: "development",
      done: false,
      total: 0,
      authority: "development",
    });
  });

  it("maps all five First Shift checkpoints independently", () => {
    let state = initialState();
    state = submitFirstDayDocument(
      state,
      firstDayDocuments[1].id,
      JSON.stringify(firstDayDocuments[1].expected),
      1000,
    ).state;
    expect(completedFirstShiftMissionIds(state)).toEqual([
      "first-shift/customer-receipt",
    ]);
    for (const document of [firstDayDocuments[0], firstDayDocuments[2]])
      state = submitFirstDayDocument(
        state,
        document.id,
        JSON.stringify(document.expected),
        1000,
      ).state;
    expect(completedFirstShiftMissionIds(state)).toEqual([
      "first-shift/supplier-invoice",
      "first-shift/customer-receipt",
      "first-shift/office-expense",
      "first-shift/journal",
    ]);
    state = markFirstShiftLedgerReviewed(state);
    expect(completedFirstShiftMissionIds(state)).toHaveLength(5);
  });

  it("never reports full-program completion while Level 6 is unavailable", () => {
    const completeAvailable = studentJourney({
      ...start,
      foundationCompleted: [...bootcampMissionIds],
      accepted: [...stepIds],
      shiftMissionIds: allShiftIds,
    });
    expect(completeAvailable.authoritativeMissionProgress).toEqual({
      earned: 24,
      total: 24,
    });
    expect(completeAvailable.localPracticeProgress).toEqual({
      earned: 5,
      total: 5,
    });
    expect(completeAvailable.availableTrainingProgress).toEqual({
      completed: 7,
      total: 7,
      percent: 100,
    });
    expect(completeAvailable.fullProgramProgress).toEqual({
      completed: 7,
      total: 8,
      percent: 88,
    });
    expect(completeAvailable.availableTrainingComplete).toBe(true);
    expect(completeAvailable.fullProgramComplete).toBe(false);
    expect(completeAvailable.learningComplete).toBe(false);
    expect(
      completeAvailable.completedBadges.map((level) => level.id),
    ).not.toContain("company-simulation");
  });

  it("preserves career outcomes as results rather than duplicate courses", () => {
    const journey = studentJourney({
      ...start,
      foundationCompleted: [...bootcampMissionIds],
      accepted: [...stepIds],
    });
    expect(journey.outcomes.map((outcome) => outcome.id)).toEqual([
      "skills",
      "practical-work",
      "career-profile",
      "cv",
      "achievements",
    ]);
    expect(journey.outcomes.every((outcome) => outcome.available)).toBe(true);
  });

  it("keeps an unfinished assessed level next while reviewing the CV", () => {
    expect(
      studentJourney({ ...start, pathname: "/en/career-profile/cv" }).next?.id,
    ).toBe("foundations");
  });
});

const allShiftIds = [
  "first-shift/supplier-invoice",
  "first-shift/customer-receipt",
  "first-shift/office-expense",
  "first-shift/journal",
  "first-shift/ledger",
];
