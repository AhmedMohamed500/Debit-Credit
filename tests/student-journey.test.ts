import { describe, expect, it } from "vitest";
import { studentJourney } from "@/lib/student/journey";
import { stepIds } from "@/lib/student/unit";
import { initialState } from "@/lib/campaign/director";
import {
  firstDayDocuments,
  submitFirstDayDocument,
} from "@/lib/campaign/first-day";
import {
  firstShiftMissionProgress,
  markFirstShiftLedgerReviewed,
} from "@/lib/campaign/first-shift-hub";

const start = {
  locale: "en" as const,
  pathname: "/en",
  personalComplete: true,
  excelCompletedSteps: 5,
  accepted: [] as string[],
  shiftCompleted: 0,
};
describe("Connected student journey", () => {
  it("requires personal details before training", () => {
    expect(
      studentJourney({ ...start, personalComplete: false }).nextRoute,
    ).toBe("/en/student-profile");
  });
  it.each(["ar", "en"] as const)("uses real %s routes in order", (locale) => {
    const journey = studentJourney({ ...start, locale });
    expect(journey.setup.route).toBe(`/${locale}/student-profile`);
    expect(journey.learningStages.map((step) => step.route)).toEqual([
      `/${locale}/bootcamp/excel-foundations`,
      `/${locale}/game/student`,
      `/${locale}/game/first-shift`,
    ]);
    expect(journey.outcomes.map((outcome) => outcome.id)).toEqual([
      "skills",
      "practical-work",
      "career-profile",
      "cv",
      "achievements",
    ]);
    expect(journey.nextRoute).toBe(`/${locale}/game/student`);
  });
  it("requires the five server-backed Excel stages before the practical desk", () => {
    const journey = studentJourney({ ...start, excelCompletedSteps: 4 });
    expect(journey.next?.id).toBe("excel");
    expect(journey.nextRoute).toBe("/en/bootcamp/excel-foundations");
  });
  it("resumes saved training without unknown or duplicate completion", () => {
    const journey = studentJourney({
      ...start,
      accepted: [...stepIds.slice(0, 10), stepIds[0], "fake"],
    });
    expect(journey.count).toBe(10);
    expect(journey.next?.id).toBe("training");
    expect(journey.foundationsDone).toBe(false);
  });
  it("passes completed foundations to First Shift, not an unrelated diagnostic", () => {
    expect(studentJourney({ ...start, accepted: [...stepIds] }).nextRoute).toBe(
      "/en/game/first-shift",
    );
  });
  it("requires the actual posted books and ledger review before results", () => {
    let state = initialState();
    for (const document of firstDayDocuments)
      state = submitFirstDayDocument(
        state,
        document.id,
        JSON.stringify(document.expected),
        1000,
      ).state;
    const options = {
      ...start,
      accepted: [...stepIds],
      shiftCompleted: firstShiftMissionProgress(state).completedCount,
    };
    expect(options.shiftCompleted).toBe(4);
    expect(studentJourney(options).next?.id).toBe("shift");
    state = markFirstShiftLedgerReviewed(state);
    expect(
      studentJourney({
        ...options,
        shiftCompleted: firstShiftMissionProgress(state).completedCount,
      }).next?.id,
    ).toBe("results");
  });
  it("separates completed learning from available career outcomes", () => {
    const options = { ...start, accepted: [...stepIds], shiftCompleted: 5 };
    const complete = studentJourney(options);
    expect(complete.next?.id).toBe("results");
    expect(complete.learningProgress).toEqual({
      completed: 3,
      total: 3,
      percent: 100,
    });
    expect(complete.learningComplete).toBe(true);
    expect(complete.outcomes.every((outcome) => outcome.available)).toBe(true);
    const skills = studentJourney({
      ...options,
      pathname: "/en/career-profile/skills",
      advancedRoute: "/career-league/placement",
    });
    expect(skills.current?.id).toBe("skills");
    expect(skills.next).toBeNull();
    expect(skills.nextRoute).toBe("/en/career-league/placement");
    expect(
      studentJourney({
        ...options,
        pathname: "/en/career-profile/cv",
        advancedRoute: "/career-league/placement",
      }).nextRoute,
    ).toBe("/en/career-league/placement");
  });
  it("does not count setup or career outputs as learning progress", () => {
    expect(
      studentJourney({
        ...start,
        personalComplete: false,
        excelCompletedSteps: 0,
      }).learningProgress,
    ).toEqual({ completed: 0, total: 3, percent: 0 });
    expect(
      studentJourney({ ...start, accepted: [...stepIds] }).learningProgress,
    ).toEqual({ completed: 2, total: 3, percent: 67 });
  });
  it("keeps incomplete learning as the next step even when reviewing CV early", () => {
    expect(
      studentJourney({
        ...start,
        pathname: "/en/career-profile/cv",
        shiftCompleted: 5,
      }).next?.id,
    ).toBe("training");
  });
  it("identifies current tasks and the legacy student route without self-linking", () => {
    expect(
      studentJourney({ ...start, pathname: "/en/game/student" }).inCurrentTask,
    ).toBe(true);
    expect(
      studentJourney({ ...start, pathname: "/en/student" }).current?.id,
    ).toBe("training");
  });
});
