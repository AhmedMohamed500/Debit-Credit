import type { Locale } from "@/types";
import { stepIds } from "./unit";

type JourneyTitle = Record<Locale, string>;
type LevelStatus = "done" | "current" | "locked" | "development";
type JourneyItem = { id: string; route: string; title: JourneyTitle };
type SetupItem = JourneyItem & { kind: "setup"; done: boolean; detail: string };

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
};

type LearningOutcome = JourneyItem & { kind: "outcome"; available: boolean };

const levelDefinitions = [
  { id: "foundations", title: { ar: "أساسيات المحاسبة", en: "Accounting Foundations" }, description: { ar: "ابدأ بفحص المستند وفهم أثر العملية قبل تسجيلها.", en: "Start by controlling the source document before recording it." }, missionIds: ["document-control"] },
  { id: "documents", title: { ar: "دورة المستندات", en: "Source Documents" }, description: { ar: "حلّل مستندات رأس المال والمعدات والمخزون.", en: "Analyse capital, equipment and inventory source documents." }, missionIds: ["journal-capital", "journal-equipment", "journal-inventory"] },
  { id: "journal", title: { ar: "القيود اليومية", en: "Journal Entries" }, description: { ar: "سجّل الخدمة والتحصيل والمصروفات بقيود متوازنة.", en: "Record service, collection and expense entries correctly." }, missionIds: ["journal-service", "journal-receipt", "journal-rent"] },
  { id: "ledger", title: { ar: "دفتر الأستاذ", en: "General Ledger" }, description: { ar: "رحّل الحركات واستخرج رصيد النقدية الصحيح.", en: "Post the entries and calculate the correct cash balance." }, missionIds: ["ledger-cash"] },
  { id: "trial-balance", title: { ar: "ميزان المراجعة", en: "Trial Balance" }, description: { ar: "اختبر توازن الأرصدة قبل الانتقال للمراجعة.", en: "Verify that account balances agree before review." }, missionIds: ["trial-balance"] },
  { id: "statements", title: { ar: "القوائم المالية", en: "Financial Statements" }, description: { ar: "محتوى القوائم المالية قيد التطوير ولن يمنح إنجازًا قبل اكتماله.", en: "Financial-statement training is in development and awards no completion yet." }, missionIds: [] },
  { id: "review", title: { ar: "المراجعة والتحليل", en: "Review & Analysis" }, description: { ar: "اكتشف خطأ التصنيف وأكمل ورقة المراجعة.", en: "Find the classification error and complete the review worksheet." }, missionIds: ["classification-error", "worksheet"] },
  { id: "company-simulation", title: { ar: "مشروع شركة متكامل", en: "Final Company Simulation" }, description: { ar: "طبّق ما تعلمته في أول وردية وراجع الدفاتر.", en: "Apply the journey in First Shift and review the posted books." }, missionIds: ["first-shift/supplier-invoice", "first-shift/customer-receipt", "first-shift/office-expense", "first-shift/journal", "first-shift/ledger"] },
] as const;

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
  const acceptedSet = new Set(accepted.filter((id) => stepIds.includes(id)));
  const count = acceptedSet.size;
  const path = (suffix: string) => `/${locale}${suffix}`;
  const setup: SetupItem = { id: "personal", kind: "setup", route: path("/student-profile"), title: { ar: "بياناتي", en: "My details" }, done: personalComplete, detail: personalComplete ? "✓" : "" };

  let priorImplementedDone = true;
  const learningStages: UnifiedJourneyLevel[] = levelDefinitions.map((level, index) => {
    const implemented = level.missionIds.length > 0;
    const earned = index === 7 ? Math.min(shiftCompleted, level.missionIds.length) : level.missionIds.filter((id) => acceptedSet.has(id)).length;
    const done = implemented && earned === level.missionIds.length;
    const status: LevelStatus = !implemented ? "development" : done ? "done" : priorImplementedDone ? "current" : "locked";
    if (implemented) priorImplementedDone = priorImplementedDone && done;
    return {
      ...level,
      kind: "learning",
      number: index + 1,
      route: index === 7 ? path("/game/first-shift") : path("/game/student"),
      done,
      earned,
      total: level.missionIds.length,
      detail: implemented ? `${earned}/${level.missionIds.length}` : locale === "ar" ? "قيد التطوير" : "In development",
      status,
      implemented,
    };
  });

  const currentLevel = learningStages.find((level) => level.status === "current");
  const hasEvidence = count > 0 || shiftCompleted > 0 || excelCompletedSteps > 0;
  const hasPracticalWork = count > 0 || shiftCompleted > 0;
  const outcomes: LearningOutcome[] = [
    { id: "skills", kind: "outcome", route: path("/career-profile/skills"), title: { ar: "جواز المهارات", en: "Skill Passport" }, available: hasEvidence },
    { id: "practical-work", kind: "outcome", route: `${path("/career-profile")}#work`, title: { ar: "الأعمال العملية", en: "Practical Work" }, available: hasPracticalWork },
    { id: "career-profile", kind: "outcome", route: path("/career-profile"), title: { ar: "الملف المهني", en: "Career Profile" }, available: personalComplete },
    { id: "cv", kind: "outcome", route: path("/career-profile/cv"), title: { ar: "الـCV الإنجليزي", en: "English CV" }, available: personalComplete },
    { id: "achievements", kind: "outcome", route: `${path("/career-profile")}#work`, title: { ar: "الإنجازات", en: "Achievements" }, available: hasEvidence },
  ];
  const exactOutcome = outcomes.find((item) => !item.route.includes("#") && pathname === item.route);
  const current = exactOutcome ?? currentLevel;
  const implementedLevels = learningStages.filter((level) => level.implemented);
  const completedLevels = implementedLevels.filter((level) => level.done);
  const missionTotal = stepIds.length + 5;
  const missionEarned = count + Math.min(5, shiftCompleted);
  const learningProgress = { completed: completedLevels.length, total: learningStages.length, percent: Math.round((missionEarned / missionTotal) * 100) };
  const learningComplete = implementedLevels.every((level) => level.done);
  const resultReview: JourneyItem & { kind: "outcome-review" } = { id: "results", kind: "outcome-review", route: path("/career-profile"), title: { ar: "راجع نتائج تعلمك", en: "Review learning outcomes" } };
  const next = !personalComplete ? setup : currentLevel ? currentLevel : exactOutcome ? null : resultReview;
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
    learningProgress,
    missionProgress: { earned: missionEarned, total: missionTotal },
    learningComplete,
    latestMilestone: [...learningStages].reverse().find((level) => level.done),
    inCurrentTask: Boolean(next && pathname === next.route),
    foundationsDone: count === stepIds.length,
    shiftDone: shiftCompleted >= 5,
    completedBadges: completedLevels,
  };
}
