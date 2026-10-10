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
    expect(journey.steps.map((step) => step.route)).toEqual([
      `/${locale}/student-profile`,
      `/${locale}/game/student`,
      `/${locale}/game/first-shift`,
      `/${locale}/career-profile/skills`,
      `/${locale}/career-profile/cv`,
    ]);
    expect(journey.nextRoute).toBe(`/${locale}/game/student`);
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
    ).toBe("skills");
  });
  it("shows skills then CV as work results, not fake certified completions", () => {
    const options = { ...start, accepted: [...stepIds], shiftCompleted: 5 };
    expect(studentJourney(options).next?.id).toBe("skills");
    const skills = studentJourney({
      ...options,
      pathname: "/en/career-profile/skills",
    });
    expect(skills.nextRoute).toBe("/en/career-profile/cv");
    expect(skills.steps.slice(3).every((step) => !step.done)).toBe(true);
    expect(
      studentJourney({
        ...options,
        pathname: "/en/career-profile/cv",
        advancedRoute: "/career-league/placement",
      }).nextRoute,
    ).toBe("/en/career-league/placement");
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
