import { describe, expect, it } from "vitest";
import { studentJourney } from "@/lib/student/journey";
import { stepIds } from "@/lib/student/unit";
import { initialState } from "@/lib/campaign/director";
import { firstDayDocuments, submitFirstDayDocument } from "@/lib/campaign/first-day";
import { firstShiftMissionProgress, markFirstShiftLedgerReviewed } from "@/lib/campaign/first-shift-hub";

const start = {
  locale: "en" as const,
  pathname: "/en/journey",
  personalComplete: true,
  excelCompletedSteps: 5,
  accepted: [] as string[],
  shiftCompleted: 0,
};

describe("Unified eight-level accounting journey", () => {
  it("requires personal details before assessed training", () => {
    expect(studentJourney({ ...start, personalComplete: false }).nextRoute).toBe("/en/student-profile");
  });

  it.each(["ar", "en"] as const)("maps eight real %s levels without Excel in the core route", (locale) => {
    const journey = studentJourney({ ...start, locale });
    expect(journey.learningStages).toHaveLength(8);
    expect(journey.learningStages.map((level) => level.id)).toEqual([
      "foundations", "documents", "journal", "ledger", "trial-balance", "statements", "review", "company-simulation",
    ]);
    expect(journey.learningStages.slice(0, 7).every((level) => level.route === `/${locale}/game/student`)).toBe(true);
    expect(journey.learningStages[7].route).toBe(`/${locale}/game/first-shift`);
    expect(journey.nextRoute).toBe(`/${locale}/game/student`);
  });

  it("keeps Excel progress compatible but removes it as an unlock requirement", () => {
    expect(studentJourney({ ...start, excelCompletedSteps: 0 }).next?.id).toBe("foundations");
    expect(studentJourney({ ...start, excelCompletedSteps: 5 }).next?.id).toBe("foundations");
  });

  it("maps every accepted Student Unit mission exactly once", () => {
    const journey = studentJourney(start);
    const mapped = journey.learningStages.flatMap((level) => level.missionIds).filter((id) => !id.startsWith("first-shift/"));
    expect(mapped).toEqual(stepIds);
    expect(new Set(mapped).size).toBe(mapped.length);
  });

  it("marks unavailable financial-statement content as development without fake completion", () => {
    const level = studentJourney({ ...start, accepted: [...stepIds], shiftCompleted: 5 }).learningStages[5];
    expect(level.status).toBe("development");
    expect(level.done).toBe(false);
    expect(level.total).toBe(0);
  });

  it("resumes accepted account work at the exact mapped level", () => {
    const journey = studentJourney({ ...start, accepted: [...stepIds.slice(0, 10), stepIds[0], "fake"] });
    expect(journey.count).toBe(10);
    expect(journey.next?.id).toBe("review");
    expect(journey.foundationsDone).toBe(false);
  });

  it("uses all five real First Shift milestones before results", () => {
    let state = initialState();
    for (const document of firstDayDocuments)
      state = submitFirstDayDocument(state, document.id, JSON.stringify(document.expected), 1000).state;
    const four = firstShiftMissionProgress(state).completedCount;
    expect(four).toBe(4);
    expect(studentJourney({ ...start, accepted: [...stepIds], shiftCompleted: four }).next?.id).toBe("company-simulation");
    state = markFirstShiftLedgerReviewed(state);
    expect(studentJourney({ ...start, accepted: [...stepIds], shiftCompleted: firstShiftMissionProgress(state).completedCount }).next?.id).toBe("results");
  });

  it("calculates progress only from accepted real missions", () => {
    expect(studentJourney({ ...start, excelCompletedSteps: 0 }).learningProgress).toEqual({ completed: 0, total: 8, percent: 0 });
    const unitComplete = studentJourney({ ...start, accepted: [...stepIds] });
    expect(unitComplete.missionProgress).toEqual({ earned: 11, total: 16 });
    expect(unitComplete.learningProgress).toEqual({ completed: 6, total: 8, percent: 69 });
    expect(studentJourney({ ...start, accepted: [...stepIds], shiftCompleted: 5 }).learningProgress).toEqual({ completed: 7, total: 8, percent: 100 });
  });

  it("preserves career outcomes as results rather than duplicate courses", () => {
    const complete = studentJourney({ ...start, accepted: [...stepIds], shiftCompleted: 5 });
    expect(complete.learningComplete).toBe(true);
    expect(complete.outcomes.map((outcome) => outcome.id)).toEqual(["skills", "practical-work", "career-profile", "cv", "achievements"]);
    expect(complete.outcomes.every((outcome) => outcome.available)).toBe(true);
  });

  it("keeps an unfinished assessed level as next while reviewing the CV", () => {
    expect(studentJourney({ ...start, pathname: "/en/career-profile/cv", shiftCompleted: 5 }).next?.id).toBe("foundations");
  });
});
