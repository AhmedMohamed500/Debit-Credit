import type { Locale } from "@/types";
import { bootcampMissionIds } from "@/lib/bootcamp/catalog";
import { stepIds } from "./unit";

type JourneyTitle = Record<Locale, string>;
type LevelStatus = "done" | "current" | "locked" | "development";
type JourneyItem = { id: string; route: string; title: JourneyTitle };
type SetupItem = JourneyItem & { kind: "setup"; done: boolean; detail: string };
type ProgressAuthority = "server" | "local-practice" | "development";

export type UnifiedJourneyLevel = JourneyItem & {
  kind: "learning";
  number: number;
  description: JourneyTitle;
  missionIds: readonly string[];
  done: boolean;
  earned: number;
  total: number;
  detail: string;
  status: LevelStatus;
  implemented: boolean;
  completedMissionIds: readonly string[];
  nextMissionId: string | null;
  authority: ProgressAuthority;
  statusReason: JourneyTitle;
  nextStep: JourneyTitle;
};

type LearningOutcome = JourneyItem & { kind: "outcome"; available: boolean };

const levelDefinitions = [
  {
    id: "foundations",
    authority: "server",
    title: { ar: "أساسيات المحاسبة", en: "Accounting Foundations" },
    description: {
      ar: "افهم المحاسبة والمعادلة وأنواع الحسابات وطبيعتها، ثم طبّق المدين والدائن ودورة التسجيل في اختبار عملي.",
      en: "Understand accounting, the equation, account types and normal balances, then apply debit/credit and the recording cycle in a practical mastery test.",
    },
    missionIds: bootcampMissionIds,
  },
  {
    id: "documents",
    authority: "server",
    title: { ar: "دورة المستندات", en: "Source Documents" },
    description: {
      ar: "حلّل مستندات رأس المال والمعدات والمخزون.",
      en: "Analyse capital, equipment and inventory source documents.",
    },
    missionIds: [
      "document-control",
      "journal-capital",
      "journal-equipment",
      "journal-inventory",
    ],
  },
  {
    id: "journal",
    authority: "server",
    title: { ar: "القيود اليومية", en: "Journal Entries" },
    description: {
      ar: "سجّل الخدمة والتحصيل والمصروفات بقيود متوازنة.",
      en: "Record service, collection and expense entries correctly.",
    },
    missionIds: ["journal-service", "journal-receipt", "journal-rent"],
  },
  {
    id: "ledger",
    authority: "server",
    title: { ar: "دفتر الأستاذ", en: "General Ledger" },
    description: {
      ar: "رحّل الحركات واستخرج رصيد النقدية الصحيح.",
      en: "Post the entries and calculate the correct cash balance.",
    },
    missionIds: ["ledger-cash"],
  },
  {
    id: "trial-balance",
    authority: "server",
    title: { ar: "ميزان المراجعة", en: "Trial Balance" },
    description: {
      ar: "اختبر توازن الأرصدة قبل الانتقال للمراجعة.",
      en: "Verify that account balances agree before review.",
    },
    missionIds: ["trial-balance"],
  },
  {
    id: "statements",
    authority: "development",
    title: { ar: "القوائم المالية", en: "Financial Statements" },
    description: {
      ar: "محتوى القوائم المالية قيد التطوير ولن يمنح إنجازًا أو شهادة قبل وجود تدريس وتقييم فعليين.",
      en: "Financial-statement training is in development and awards no completion or certificate until real teaching and grading exist.",
    },
    missionIds: [],
  },
  {
    id: "review",
    authority: "server",
    title: { ar: "المراجعة والتحليل", en: "Review & Analysis" },
    description: {
      ar: "اكتشف خطأ التصنيف وأكمل ورقة المراجعة.",
      en: "Find the classification error and complete the review worksheet.",
    },
    missionIds: ["classification-error", "worksheet"],
  },
  {
    id: "company-simulation",
    authority: "local-practice",
    title: { ar: "مشروع شركة متكامل", en: "Final Company Simulation" },
    description: {
      ar: "طبّق ما تعلمته في أول وردية. هذا تقدم ممارسة محلي وليس إنجازًا مهنيًا معتمدًا من الخادم.",
      en: "Apply the journey in First Shift. This is local practice progress, not a server-certified professional achievement.",
    },
    missionIds: [
      "first-shift/supplier-invoice",
      "first-shift/customer-receipt",
      "first-shift/office-expense",
      "first-shift/journal",
      "first-shift/ledger",
    ],
  },
] as const;

export const foundationJourneyMissionIds = bootcampMissionIds;

export function studentJourney({
  locale,
  pathname,
  personalComplete,
  excelCompletedSteps = 0,
  foundationCompleted = [],
  accepted,
  shiftMissionIds = [],
  advancedRoute = "/onboarding",
}: {
  locale: Locale;
  pathname: string;
  personalComplete: boolean;
  excelCompletedSteps?: number;
  foundationCompleted?: string[];
  accepted: string[];
  shiftMissionIds?: string[];
  advancedRoute?: string;
}) {
  const acceptedSet = new Set(accepted.filter((id) => stepIds.includes(id)));
  const foundationSet = new Set(foundationCompleted);
  const shiftSet = new Set(
    shiftMissionIds.filter((id) => id.startsWith("first-shift/")),
  );
  const count = acceptedSet.size;
  const path = (suffix: string) => `/${locale}${suffix}`;
  const setup: SetupItem = {
    id: "personal",
    kind: "setup",
    route: path("/student-profile"),
    title: { ar: "بياناتي", en: "My details" },
    done: personalComplete,
    detail: personalComplete ? "✓" : "",
  };

  let priorImplementedDone = true;
  const learningStages: UnifiedJourneyLevel[] = levelDefinitions.map(
    (level, index) => {
      const implemented = level.missionIds.length > 0;
      const source =
        level.authority === "local-practice"
          ? shiftSet
          : index === 0
            ? foundationSet
            : acceptedSet;
      const completedMissionIds = level.missionIds.filter((id) =>
        source.has(id),
      );
      const earned = completedMissionIds.length;
      const done = implemented && earned === level.missionIds.length;
      const status: LevelStatus = !implemented
        ? "development"
        : done
          ? "done"
          : priorImplementedDone
            ? "current"
            : "locked";
      if (implemented) priorImplementedDone = priorImplementedDone && done;
      const nextMissionId =
        level.missionIds.find((id) => !source.has(id)) ?? null;
      const statusReason: JourneyTitle =
        status === "development"
          ? {
              ar: "لا يوجد تقييم مكتمل لهذا المستوى بعد، لذلك لا يمنح إتمامًا أو مكافأة.",
              en: "This level has no complete assessment yet, so it awards no completion or reward.",
            }
          : status === "locked"
            ? {
                ar: "أكمل المستويات السابقة المتاحة أولًا حتى تفتح هذا المستوى.",
                en: "Complete the previous available levels to unlock this level.",
              }
            : status === "done"
              ? {
                  ar: "أكملت كل متطلبات هذا المستوى ويمكنك مراجعته في أي وقت.",
                  en: "You completed every requirement in this level and can review it at any time.",
                }
              : {
                  ar: "هذا هو المستوى المتاح لك الآن بناءً على نتائجك المحفوظة.",
                  en: "This is your available level based on your saved results.",
                };
      const nextStep: JourneyTitle =
        status === "development"
          ? {
              ar: "تابع المستويات المتاحة الأخرى حتى يجهز التقييم.",
              en: "Continue the other available levels while its assessment is being built.",
            }
          : status === "done"
            ? {
                ar: "راجع المستوى أو انتقل إلى المستوى المتاح التالي.",
                en: "Review this level or move to the next available level.",
              }
            : status === "locked"
              ? {
                  ar: "ارجع إلى أول مستوى حالي وأكمل مهمته التالية.",
                  en: "Return to the current level and complete its next mission.",
                }
              : {
                  ar: "افتح المهمة التالية وأكملها بتقييم صحيح.",
                  en: "Open the next mission and complete its graded work.",
                };
      return {
        ...level,
        kind: "learning",
        number: index + 1,
        route:
          index === 0
            ? `${path("/bootcamp")}?mission=${encodeURIComponent(nextMissionId ?? level.missionIds[0]!)}`
            : index === 7
              ? path("/game/first-shift")
              : implemented
                ? `${path("/game/student")}?focus=${encodeURIComponent(nextMissionId ?? level.missionIds[0]!)}`
                : path("/journey"),
        done,
        earned,
        total: level.missionIds.length,
        detail: implemented
          ? `${earned}/${level.missionIds.length}`
          : locale === "ar"
            ? "قيد التطوير"
            : "In development",
        status,
        implemented,
        completedMissionIds,
        nextMissionId,
        authority: level.authority,
        statusReason,
        nextStep,
      };
    },
  );

  const currentLevel = learningStages.find(
    (level) => level.status === "current",
  );
  const authoritativeFoundationCount = foundationJourneyMissionIds.filter(
    (id) => foundationSet.has(id),
  ).length;
  const hasEvidence =
    count > 0 || authoritativeFoundationCount > 0 || excelCompletedSteps > 0;
  const hasPracticalWork = count > 0;
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
  const exactOutcome = outcomes.find(
    (item) => !item.route.includes("#") && pathname === item.route,
  );
  const current = exactOutcome ?? currentLevel;
  const implementedLevels = learningStages.filter((level) => level.implemented);
  const completedLevels = implementedLevels.filter((level) => level.done);
  const availableTrainingProgress = {
    completed: completedLevels.length,
    total: implementedLevels.length,
    percent: Math.round(
      (completedLevels.length / implementedLevels.length) * 100,
    ),
  };
  const completedProgramLevels = learningStages.filter(
    (level) => level.done,
  ).length;
  const fullProgramProgress = {
    completed: completedProgramLevels,
    total: learningStages.length,
    percent: Math.round((completedProgramLevels / learningStages.length) * 100),
  };
  const availableTrainingComplete = implementedLevels.every(
    (level) => level.done,
  );
  const fullProgramComplete = learningStages.every(
    (level) => level.implemented && level.done,
  );
  const authoritativeMissionProgress = {
    earned: authoritativeFoundationCount + count,
    total: foundationJourneyMissionIds.length + stepIds.length,
  };
  const localPracticeProgress = {
    earned: shiftSet.size,
    total: levelDefinitions[7].missionIds.length,
  };
  const resultReview: JourneyItem & { kind: "outcome-review" } = {
    id: "results",
    kind: "outcome-review",
    route: path("/career-profile"),
    title: { ar: "راجع نتائج تعلمك", en: "Review learning outcomes" },
  };
  const next = !personalComplete
    ? setup
    : currentLevel
      ? currentLevel
      : exactOutcome
        ? null
        : resultReview;
  return {
    setup,
    learningStages,
    outcomes,
    current,
    currentLevel,
    next,
    nextRoute: next?.route ?? path(advancedRoute),
    count,
    excelCompletedSteps,
    learningProgress: fullProgramProgress,
    fullProgramProgress,
    availableTrainingProgress,
    authoritativeMissionProgress,
    localPracticeProgress,
    missionProgress: {
      earned:
        authoritativeMissionProgress.earned + localPracticeProgress.earned,
      total: authoritativeMissionProgress.total + localPracticeProgress.total,
    },
    learningComplete: fullProgramComplete,
    fullProgramComplete,
    availableTrainingComplete,
    latestMilestone: [...learningStages].reverse().find((level) => level.done),
    inCurrentTask: Boolean(next && pathname === next.route),
    foundationsDone: foundationJourneyMissionIds.every((id) =>
      foundationSet.has(id),
    ),
    shiftDone: levelDefinitions[7].missionIds.every((id) => shiftSet.has(id)),
    completedBadges: completedLevels.filter(
      (level) => level.authority === "server",
    ),
  };
}
