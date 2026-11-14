"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileBadge2,
  FileCheck2,
  Flame,
  Gamepad2,
  Landmark,
  LockKeyhole,
  Medal,
  Play,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { ProfilePhoto } from "@/components/career/profile-photo";
import { requestJSON } from "@/lib/cloud/runtime";
import { useGame } from "@/lib/campaign/store";
import { completedFirstShiftMissionIds } from "@/lib/campaign/first-shift-hub";
import {
  studentJourney,
  type UnifiedJourneyLevel,
} from "@/lib/student/journey";
import { gameHubNextMission } from "@/lib/platform/journey";
import { BrowserCareerLeagueRepository } from "@/lib/career-league/repository";
import { BrowserPlacementRepository } from "@/lib/placement/repository";
import { BrowserSkillEvidenceRepository } from "@/lib/career/repository";
import { calculatePassport } from "@/lib/career/evidence";
import { bootcampMissions } from "@/lib/bootcamp/catalog";
import type { StudentState } from "@/lib/student/unit";
import type { BootcampState } from "@/lib/bootcamp/model";
import type { Locale } from "@/types";
import "@/app/student-journey.css";

type JourneyContext = {
  journey: ReturnType<typeof studentJourney>;
  locale: Locale;
  loading: boolean;
  error: boolean;
  retry: () => void;
  name: string;
  xp: number;
  coins: number;
  activeDays: string[];
};

const Context = createContext<JourneyContext | null>(null);
export const useStudentJourney = () => useContext(Context);

export function StudentJourneyProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const identity = useCloudIdentity();
  const owner = identity?.user.id;
  const pathname = usePathname();
  const { state, ready } = useGame();
  const enabled = Boolean(
    identity &&
    (!identity.profile.persona || identity.profile.persona === "student"),
  );
  const [progress, setProgress] = useState<{
    owner: string;
    accepted: string[];
    foundationCompleted: string[];
  } | null>(null);
  const [errorOwner, setErrorOwner] = useState<string | null>(null);
  const [advancedRoute, setAdvancedRoute] = useState("/onboarding");
  const [refresh, setRefresh] = useState(0);
  const retry = useCallback(() => setRefresh((value) => value + 1), []);

  useEffect(() => {
    window.addEventListener("student-progress-changed", retry);
    return () => window.removeEventListener("student-progress-changed", retry);
  }, [retry]);

  useEffect(() => {
    if (!enabled || !owner || !identity?.personalComplete) return;
    let alive = true;
    void Promise.all([
      requestJSON<{ data: StudentState }>("me/student-unit"),
      requestJSON<{ foundations: { data: BootcampState } }>("me/progress"),
    ])
      .then(([student, foundations]) => {
        if (!alive) return;
        setProgress({
          owner,
          accepted: student.data.accepted,
          foundationCompleted: foundations.foundations.data.completedMissionIds,
        });
        setErrorOwner(null);
      })
      .catch(() => {
        if (alive) setErrorOwner(owner);
      });
    const career = new BrowserCareerLeagueRepository().get();
    const diagnostic = new BrowserPlacementRepository().get().result;
    const passport = calculatePassport(
      new BrowserSkillEvidenceRepository().getAll(),
    );
    setAdvancedRoute(gameHubNextMission(career, passport, diagnostic).route);
    return () => {
      alive = false;
    };
  }, [enabled, owner, identity?.personalComplete, pathname, refresh]);

  if (!enabled || !identity) return children;
  const loaded = progress?.owner === owner;
  const shiftMissionIds = ready ? completedFirstShiftMissionIds(state) : [];
  const journey = studentJourney({
    locale,
    pathname,
    personalComplete: identity.personalComplete === true,
    accepted: loaded ? (progress?.accepted ?? []) : [],
    foundationCompleted: loaded ? (progress?.foundationCompleted ?? []) : [],
    shiftMissionIds,
    advancedRoute,
  });
  const loading = identity.personalComplete === true && (!loaded || !ready);
  return (
    <Context.Provider
      value={{
        journey,
        locale,
        loading,
        error: errorOwner === owner,
        retry,
        name: identity.profile.displayName,
        xp: state.xp,
        coins: state.coins,
        activeDays: state.activeDays,
      }}
    >
      <div data-student-guided="true">{children}</div>
    </Context.Provider>
  );
}

const levelIcons = [
  BookOpen,
  FileCheck2,
  FileBadge2,
  Landmark,
  Scale,
  BarChart3,
  ShieldCheck,
  Building2,
];
const taskLabels: Record<string, Record<Locale, string>> = {
  "equation-builder": {
    ar: "تطبيق المعادلة المحاسبية",
    en: "Apply the accounting equation",
  },
  "account-city": {
    ar: "تصنيف الأصول والالتزامات وحقوق الملكية",
    en: "Classify assets, liabilities and equity",
  },
  "debit-credit": {
    ar: "تحديد المدين والدائن",
    en: "Apply debit and credit rules",
  },
  "document-control": {
    ar: "فحص المستند ومنع التكرار",
    en: "Control the source document",
  },
  "journal-capital": {
    ar: "تحليل مستند رأس المال",
    en: "Analyse the capital document",
  },
  "journal-equipment": {
    ar: "تحليل شراء المعدات",
    en: "Analyse the equipment purchase",
  },
  "journal-inventory": {
    ar: "تحليل شراء المخزون",
    en: "Analyse the inventory purchase",
  },
  "journal-service": { ar: "قيد إيراد الخدمة", en: "Post the service entry" },
  "journal-receipt": {
    ar: "قيد تحصيل العميل",
    en: "Post the customer receipt",
  },
  "journal-rent": { ar: "قيد مصروف الإيجار", en: "Post the rent expense" },
  "ledger-cash": { ar: "ترحيل رصيد النقدية", en: "Post the cash ledger" },
  "trial-balance": {
    ar: "إعداد ميزان المراجعة",
    en: "Prepare the trial balance",
  },
  "classification-error": {
    ar: "اكتشاف خطأ التصنيف",
    en: "Find the classification error",
  },
  worksheet: { ar: "إكمال ورقة المراجعة", en: "Complete the review worksheet" },
  "first-shift/supplier-invoice": {
    ar: "معالجة فاتورة المورد",
    en: "Process the supplier invoice",
  },
  "first-shift/customer-receipt": {
    ar: "معالجة تحصيل العميل",
    en: "Process the customer receipt",
  },
  "first-shift/office-expense": {
    ar: "معالجة مصروف المكتب",
    en: "Process the office expense",
  },
  "first-shift/journal": {
    ar: "مراجعة القيود المرحلة",
    en: "Review posted entries",
  },
  "first-shift/ledger": { ar: "مراجعة دفتر الأستاذ", en: "Review the ledger" },
};

function currentStreak(days: string[]) {
  const values = new Set(days);
  let count = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  while (values.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}

export function JourneyNextAction() {
  const context = useStudentJourney();
  if (!context) return null;
  const { journey, locale, loading, error, retry } = context;
  const ar = locale === "ar";
  if (error)
    return (
      <div className="student-next-action" role="alert">
        <p>
          {ar
            ? "تعذّر تحديث تقدمك المحفوظ. لم نحسب أي إنجاز جديد."
            : "Saved progress could not be refreshed. No new completion was counted."}
        </p>
        <button onClick={retry}>{ar ? "حاول ثانية" : "Retry"}</button>
      </div>
    );
  if (loading)
    return (
      <div className="student-next-action" role="status">
        {ar
          ? "بنحمّل تقدم حسابك المحفوظ…"
          : "Loading your saved account progress…"}
      </div>
    );
  return (
    <section className="student-next-action">
      <div>
        <small>{ar ? "المهمة التالية" : "NEXT MISSION"}</small>
        <h2>
          {journey.next?.title[locale] ??
            (ar ? "راجع نتائجك" : "Review your results")}
        </h2>
        <p>
          {ar
            ? "المسار يفتح من النتائج المقبولة فقط، ويمكنك الرجوع لأي مستوى مكتمل للمراجعة."
            : "The route unlocks only from accepted results. Completed levels remain available for review."}
        </p>
      </div>
      <Link href={journey.nextRoute}>
        {ar ? "متابعة التدريب" : "Continue training"}
        <Play size={18} />
      </Link>
    </section>
  );
}

function LevelNode({
  level,
  selected,
  onSelect,
  locale,
}: {
  level: UnifiedJourneyLevel;
  selected: boolean;
  onSelect: () => void;
  locale: Locale;
}) {
  const Icon = levelIcons[level.number - 1];
  return (
    <li
      className={`journey-level-node level-${level.number}`}
      data-status={level.status}
      data-selected={selected}
    >
      <button
        onClick={onSelect}
        aria-current={level.status === "current" ? "step" : undefined}
        aria-label={`${level.number}. ${level.title[locale]} — ${level.detail}`}
      >
        <i>
          {level.status === "done" ? (
            <Check />
          ) : level.status === "locked" ? (
            <LockKeyhole />
          ) : level.status === "development" ? (
            <Sparkles />
          ) : (
            <Icon />
          )}
        </i>
        <span>
          <small>
            {locale === "ar"
              ? `المستوى ${level.number}`
              : `Level ${level.number}`}
          </small>
          <b>{level.title[locale]}</b>
          <em>
            {level.status === "done"
              ? locale === "ar"
                ? "مكتمل"
                : "Complete"
              : level.detail}
          </em>
        </span>
      </button>
    </li>
  );
}

export function StudentJourneyHome({ locale }: { locale: Locale }) {
  const context = useStudentJourney();
  const ar = locale === "ar";
  const say = (en: string, arabic: string) => (ar ? arabic : en);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => {
    if (!context) return null;
    return (
      context.journey.learningStages.find((level) => level.id === selectedId) ??
      context.journey.currentLevel ??
      context.journey.learningStages[0]
    );
  }, [context, selectedId]);
  if (!context || !selected) return null;
  if (context.error || context.loading)
    return (
      <main className="student-journey-page">
        <JourneyNextAction />
      </main>
    );
  const { journey } = context;
  const progress = journey.fullProgramProgress.percent;
  const streak = currentStreak(context.activeDays);
  const selectedTasks = selected.missionIds.map((id) => ({
    id,
    label:
      taskLabels[id]?.[locale] ??
      bootcampMissions.find((mission) => mission.id === id)?.title[locale] ??
      id,
    done: selected.completedMissionIds.includes(id),
  }));
  const Arrow = ar ? ChevronLeft : ChevronRight;
  return (
    <main className="student-journey-page" dir={ar ? "rtl" : "ltr"}>
      <section className="journey-shell">
        <aside className="journey-profile-panel">
          <div className="journey-profile-card">
            <div className="journey-avatar">
              <ProfilePhoto locale={locale} name={context.name} />
              <i>
                <Star />
              </i>
            </div>
            <h2>{context.name}</h2>
            <p>{say("Accounting trainee", "متدرب محاسبة")}</p>
            <Link href={`/${locale}/career-profile`}>
              {say("View career profile", "عرض الملف المهني")}
            </Link>
          </div>
          <div className="journey-xp">
            <span>
              <b>XP {context.xp.toLocaleString(locale)}</b>
              <small>
                {say(
                  "Local game progress · not server-certified",
                  "تقدم لعبة محلي · غير معتمد من الخادم",
                )}
              </small>
            </span>
            <div>
              <i
                style={{ width: `${Math.min(100, (context.xp % 1000) / 10)}%` }}
              />
            </div>
          </div>
          <div className="journey-mini-stats">
            <article>
              <Flame />
              <b>{streak}</b>
              <small>{say("day streak", "يوم متتالٍ")}</small>
            </article>
            <article>
              <Medal />
              <b>{journey.completedBadges.length}</b>
              <small>{say("learning badges", "شارات تعلم")}</small>
            </article>
            <article>
              <CircleDollarSign />
              <b>{context.coins}</b>
              <small>{say("local game coins", "عملات لعبة محلية")}</small>
            </article>
          </div>
          <section className="journey-total-progress">
            <header>
              <b>
                {say(
                  "Full eight-level program",
                  "البرنامج الكامل من 8 مستويات",
                )}
              </b>
              <strong>{journey.fullProgramProgress.completed}/8</strong>
            </header>
            <div>
              <i style={{ width: `${progress}%` }} />
            </div>
            <p>
              {say(
                `Available training: ${journey.availableTrainingProgress.completed}/${journey.availableTrainingProgress.total} levels. Level 6 remains in development.`,
                `التدريب المتاح: ${journey.availableTrainingProgress.completed}/${journey.availableTrainingProgress.total} مستويات. المستوى 6 ما زال قيد التطوير.`,
              )}
            </p>
            <small>
              {say(
                `${journey.authoritativeMissionProgress.earned}/${journey.authoritativeMissionProgress.total} server-accepted tasks · ${journey.localPracticeProgress.earned}/${journey.localPracticeProgress.total} local First Shift checkpoints`,
                `${journey.authoritativeMissionProgress.earned}/${journey.authoritativeMissionProgress.total} مهمة مقبولة بالخادم · ${journey.localPracticeProgress.earned}/${journey.localPracticeProgress.total} نقاط First Shift محلية`,
              )}
            </small>
          </section>
          <section className="journey-badges">
            <h3>{say("Earned learning badges", "شارات التعلم المكتسبة")}</h3>
            {journey.completedBadges.length ? (
              <div>
                {journey.completedBadges.slice(-3).map((level) => (
                  <span key={level.id}>
                    <Award />
                    {level.title[locale]}
                  </span>
                ))}
              </div>
            ) : (
              <p>
                {say(
                  "Complete the first assessed level to earn a learning badge.",
                  "أكمل أول مستوى مقيّم لتحصل على شارة تعلم.",
                )}
              </p>
            )}
            <small>
              {say(
                "Learning badges are not professional accreditation.",
                "شارات التعلم ليست اعتمادًا مهنيًا.",
              )}
            </small>
          </section>
          <section className="journey-week">
            <CalendarDays />
            <div>
              <b>{say("Weekly goal", "هدف الأسبوع")}</b>
              <p>
                {say(
                  "Not available until dated mission history is enabled.",
                  "غير متاح حتى تفعيل سجل زمني للمهام.",
                )}
              </p>
            </div>
          </section>
        </aside>

        <section className="journey-map-panel">
          <header className="journey-map-heading">
            <span>✦</span>
            <div>
              <h1>
                {say(
                  "Your journey to become a professional accountant",
                  "رحلتك لتصبح محاسبًا محترفًا",
                )}
              </h1>
              <p>
                {say(
                  "Eight connected levels built from your real assessed work",
                  "ثمانية مستويات مترابطة مبنية على عملك المقيّم فعليًا",
                )}
              </p>
            </div>
            <span>✦</span>
          </header>
          <div
            className="journey-map"
            aria-label={say(
              "Eight-level accounting journey map",
              "خريطة رحلة المحاسبة من ثمانية مستويات",
            )}
          >
            <svg
              className="journey-path"
              viewBox="0 0 1000 650"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M120 175 C260 80 350 215 465 170 S690 85 850 165 C930 220 880 315 745 340 S470 280 350 345 S110 410 160 500 C245 620 400 525 520 520 S745 635 865 515" />
            </svg>
            <ol>
              {journey.learningStages.map((level) => (
                <LevelNode
                  key={level.id}
                  level={level}
                  locale={locale}
                  selected={selected.id === level.id}
                  onSelect={() => setSelectedId(level.id)}
                />
              ))}
            </ol>
          </div>
          <section className="journey-benefits">
            <h2>
              <Star />
              {say("Program outcomes", "مخرجات البرنامج")}
            </h2>
            <div>
              {[
                [
                  BriefcaseBusiness,
                  say("Career profile", "ملف مهني قوي"),
                  "/career-profile",
                ],
                [
                  Award,
                  say("Completion evidence", "أدلة إتمام حقيقية"),
                  "/career-profile#work",
                ],
                [
                  Gamepad2,
                  say("Interactive practice", "تدريب تفاعلي"),
                  "/game/student",
                ],
                [
                  Trophy,
                  say("Optional competition", "منافسة اختيارية"),
                  "/competition",
                ],
              ].map(([Icon, label, route]) => (
                <Link key={String(route)} href={`/${locale}${route}`}>
                  <Icon />
                  <span>{String(label)}</span>
                  <Arrow />
                </Link>
              ))}
            </div>
          </section>
        </section>

        <aside className="journey-current-panel">
          <header>
            <small>{say("SELECTED LEVEL", "المستوى المحدد")}</small>
            <span>{selected.number}</span>
            <h2>{selected.title[locale]}</h2>
            <p>{selected.description[locale]}</p>
          </header>
          <div className="journey-level-meter">
            <span>
              <b>{say("Level progress", "تقدم المستوى")}</b>
              <strong>
                {selected.total
                  ? Math.round((selected.earned / selected.total) * 100)
                  : 0}
                %
              </strong>
            </span>
            <div>
              <i
                style={{
                  width: `${selected.total ? (selected.earned / selected.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <section className="journey-level-tasks">
            <h3>
              {selected.authority === "local-practice"
                ? say("Local practice checkpoints", "نقاط ممارسة محلية")
                : say("Assessed missions", "مهام المستوى")}
            </h3>
            {selected.implemented ? (
              <>
                <ol>
                  {selectedTasks.map((task, index) => (
                    <li key={task.id} data-done={task.done}>
                      <i>{task.done ? <Check /> : index + 1}</i>
                      <span>{task.label}</span>
                    </li>
                  ))}
                </ol>
                {selected.authority === "local-practice" && (
                  <p className="journey-authority-note">
                    {say(
                      "First Shift is saved simulation progress. It is not a server-certified professional achievement and does not complete the full program.",
                      "First Shift هو تقدم محاكاة محفوظ، وليس إنجازًا مهنيًا معتمدًا من الخادم ولا يُكمل البرنامج الكامل.",
                    )}
                  </p>
                )}
              </>
            ) : (
              <div className="journey-development">
                <Sparkles />
                <p>
                  {say(
                    "This level is visible for roadmap continuity, but no completion, certificate or reward is granted until real teaching and server grading are ready.",
                    "المستوى ظاهر لاستمرار الخريطة، لكن لا يُمنح إتمام أو شهادة أو مكافأة قبل جاهزية التدريس والتقييم الفعلي على الخادم.",
                  )}
                </p>
              </div>
            )}
            <div className="journey-level-guidance">
              <p>
                <b>{say("Why this status", "سبب الحالة")}</b>
                {selected.statusReason[locale]}
              </p>
              <p>
                <b>{say("Next step", "الخطوة التالية")}</b>
                {selected.nextStep[locale]}
              </p>
            </div>
          </section>
          {selected.status === "current" || selected.status === "done" ? (
            <Link className="journey-primary-cta" href={selected.route}>
              <Play />
              {selected.status === "done"
                ? say("Review level", "مراجعة المستوى")
                : say("Continue training", "متابعة التدريب")}
            </Link>
          ) : (
            <span className="journey-disabled-cta">
              <LockKeyhole />
              {selected.status === "development"
                ? say("In development", "قيد التطوير")
                : say(
                    "Complete previous levels first",
                    "أكمل المستويات السابقة أولًا",
                  )}
            </span>
          )}
          <section className="journey-professional-outcomes">
            <h3>
              <Target />
              {say("Your work builds", "شغلك يبني")}
            </h3>
            {journey.outcomes.map((outcome) => (
              <Link
                key={outcome.id}
                href={outcome.route}
                data-available={outcome.available}
              >
                <span>{outcome.title[locale]}</span>
                <Arrow />
              </Link>
            ))}
          </section>
          <section className="journey-competition">
            <Trophy />
            <div>
              <b>{say("Optional competition", "المنافسة اختيارية")}</b>
              <p>
                {say(
                  "No public rank is shown here without participation data.",
                  "لا نعرض ترتيبًا عامًا هنا بدون بيانات مشاركة.",
                )}
              </p>
              <Link href={`/${locale}/competition`}>
                {say("Open competition", "فتح المنافسة")}
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
