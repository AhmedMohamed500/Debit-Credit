import type { Locale } from "@/types";
import { stepIds } from "./unit";

type JourneyTitle = Record<Locale, string>;

type JourneyItem = {
  id: string;
  route: string;
  title: JourneyTitle;
};

type SetupItem = JourneyItem & {
  kind: "setup";
  done: boolean;
  detail: string;
};

type LearningStage = JourneyItem & {
  kind: "learning";
  done: boolean;
  detail: string;
};

type LearningOutcome = JourneyItem & {
  kind: "outcome";
  available: boolean;
};

export function studentJourney({
  locale,
  pathname,
  personalComplete,
  excelCompletedSteps = 0,
  accepted,
  shiftCompleted,
  advancedRoute = "/onboarding",
}: {
  locale: Locale;
  pathname: string;
  personalComplete: boolean;
  excelCompletedSteps?: number;
  accepted: string[];
  shiftCompleted: number;
  advancedRoute?: string;
}) {
  const count = new Set(accepted.filter((id) => stepIds.includes(id))).size;
  const path = (suffix: string) => `/${locale}${suffix}`;
  const setup: SetupItem = {
    id: "personal",
    kind: "setup",
    route: path("/student-profile"),
    title: { ar: "بياناتي", en: "My details" },
    done: personalComplete,
    detail: personalComplete ? "✓" : "",
  };
  const learningStages: LearningStage[] = [
    {
      id: "excel",
      kind: "learning",
      route: path("/bootcamp/excel-foundations"),
      title: { ar: "أساسيات Excel", en: "Excel Foundations" },
      done: excelCompletedSteps >= 5,
      detail: `${Math.min(5, excelCompletedSteps)}/5`,
    },
    {
      id: "training",
      kind: "learning",
      route: path("/game/student"),
      title: { ar: "وحدة الطالب", en: "Student Unit" },
      done: count === stepIds.length,
      detail: `${count}/${stepIds.length}`,
    },
    {
      id: "shift",
      kind: "learning",
      route: path("/game/first-shift"),
      title: { ar: "أول وردية", en: "First Shift" },
      done: shiftCompleted >= 5,
      detail: `${Math.min(5, shiftCompleted)}/5`,
    },
  ];
  const hasEvidence =
    excelCompletedSteps > 0 || count > 0 || shiftCompleted > 0;
  const hasPracticalWork = count > 0 || shiftCompleted > 0;
  const outcomes: LearningOutcome[] = [
    {
      id: "skills",
      kind: "outcome",
      route: path("/career-profile/skills"),
      title: { ar: "جواز المهارات", en: "Skill Passport" },
      available: hasEvidence,
    },
    {
      id: "practical-work",
      kind: "outcome",
      route: `${path("/career-profile")}#work`,
      title: { ar: "الأعمال العملية", en: "Practical Work" },
      available: hasPracticalWork,
    },
    {
      id: "career-profile",
      kind: "outcome",
      route: path("/career-profile"),
      title: { ar: "الملف المهني", en: "Career Profile" },
      available: personalComplete,
    },
    {
      id: "cv",
      kind: "outcome",
      route: path("/career-profile/cv"),
      title: { ar: "الـCV الإنجليزي", en: "English CV" },
      available: personalComplete,
    },
    {
      id: "achievements",
      kind: "outcome",
      route: `${path("/career-profile")}#work`,
      title: { ar: "الإنجازات", en: "Achievements" },
      available: hasEvidence,
    },
  ];
  const journeyItems = [setup, ...learningStages, ...outcomes];
  const exactCurrent = journeyItems.find(
    (item) => !item.route.includes("#") && pathname === item.route,
  );
  const nestedCurrent = journeyItems
    .filter((item) => pathname.startsWith(`${item.route.split("#")[0]}/`))
    .sort(
      (left, right) =>
        right.route.split("#")[0].length - left.route.split("#")[0].length,
    )[0];
  const current =
    exactCurrent ??
    nestedCurrent ??
    (pathname === path("/student") ? learningStages[1] : undefined);
  const completedLearningStages = learningStages.filter(
    (stage) => stage.done,
  ).length;
  const learningProgress = {
    completed: completedLearningStages,
    total: learningStages.length,
    percent: Math.round(
      (completedLearningStages / learningStages.length) * 100,
    ),
  };
  const learningComplete = completedLearningStages === learningStages.length;
  const resultReview: JourneyItem & { kind: "outcome-review" } = {
    id: "results",
    kind: "outcome-review",
    route: path("/career-profile"),
    title: { ar: "راجع نتائج تعلمك", en: "Review learning outcomes" },
  };
  const nextLearningStage = learningStages.find((stage) => !stage.done);
  const next = !personalComplete
    ? setup
    : nextLearningStage
      ? nextLearningStage
      : current?.kind === "outcome"
        ? null
        : resultReview;
  return {
    setup,
    learningStages,
    outcomes,
    current,
    next,
    nextRoute: next?.route ?? path(advancedRoute),
    count,
    excelCompletedSteps,
    learningProgress,
    learningComplete,
    latestMilestone: [...learningStages]
      .reverse()
      .find((stage) => stage.done),
    inCurrentTask: Boolean(next && current?.id === next.id),
    foundationsDone: count === stepIds.length,
    shiftDone: shiftCompleted >= 5,
  };
}
