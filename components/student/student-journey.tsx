"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gamepad2,
  Trophy,
} from "lucide-react";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { ProfilePhoto } from "@/components/career/profile-photo";
import { ThemeToggle } from "@/components/platform/theme-provider";
import { requestJSON } from "@/lib/cloud/runtime";
import { useGame } from "@/lib/campaign/store";
import { firstShiftMissionProgress } from "@/lib/campaign/first-shift-hub";
import { studentJourney } from "@/lib/student/journey";
import { gameHubNextMission } from "@/lib/platform/journey";
import { BrowserCareerLeagueRepository } from "@/lib/career-league/repository";
import { BrowserPlacementRepository } from "@/lib/placement/repository";
import { BrowserSkillEvidenceRepository } from "@/lib/career/repository";
import { calculatePassport } from "@/lib/career/evidence";
import type { StudentState } from "@/lib/student/unit";
import {
  earnedExcelXp,
  type ExcelProgress,
} from "@/lib/excel-foundations/engine";
import type { Locale } from "@/types";
import "@/app/student-journey.css";

type JourneyContext = {
  journey: ReturnType<typeof studentJourney>;
  locale: Locale;
  loading: boolean;
  error: boolean;
  retry: () => void;
  name: string;
  excelProgress: ExcelProgress | null;
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
  const identity = useCloudIdentity(),
    owner = identity?.user.id,
    pathname = usePathname();
  const { state, ready } = useGame();
  const enabled = Boolean(
    identity &&
    (!identity.profile.persona || identity.profile.persona === "student"),
  );
  const [progress, setProgress] = useState<{
      owner: string;
      accepted: string[];
      excelCompletedSteps: number;
      excel: ExcelProgress;
    } | null>(null),
    [errorOwner, setErrorOwner] = useState<string | null>(null),
    [advancedRoute, setAdvancedRoute] = useState("/onboarding"),
    [refresh, setRefresh] = useState(0);
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
      requestJSON<{ data: ExcelProgress }>("me/excel-foundations"),
    ])
      .then(([student, excel]) => {
        if (alive) {
          setProgress({
            owner,
            accepted: student.data.accepted,
            excelCompletedSteps: excel.data.completedSteps.length,
            excel: excel.data,
          });
          setErrorOwner(null);
        }
      })
      .catch(() => {
        if (alive) setErrorOwner(owner);
      });
    const career = new BrowserCareerLeagueRepository().get(),
      diagnostic = new BrowserPlacementRepository().get().result,
      passport = calculatePassport(
        new BrowserSkillEvidenceRepository().getAll(),
      );
    setAdvancedRoute(gameHubNextMission(career, passport, diagnostic).route);
    return () => {
      alive = false;
    };
  }, [enabled, owner, identity?.personalComplete, pathname, refresh]);
  if (!enabled || !identity) return children;
  const loaded = progress?.owner === owner,
    journey = studentJourney({
      locale,
      pathname,
      personalComplete: identity.personalComplete === true,
      excelCompletedSteps: loaded ? (progress?.excelCompletedSteps ?? 0) : 0,
      accepted: loaded ? (progress?.accepted ?? []) : [],
      shiftCompleted: ready
        ? firstShiftMissionProgress(state).completedCount
        : 0,
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
        excelProgress: loaded ? (progress?.excel ?? null) : null,
      }}
    >
      <div data-student-guided="true">
        {children}
      </div>
    </Context.Provider>
  );
}
function JourneySteps() {
  const context = useStudentJourney();
  if (!context) return null;
  const { journey, locale, loading } = context;
  return (
    <ol
      className="student-journey-steps"
      aria-label={locale === "ar" ? "ترتيب رحلتك" : "Your journey sequence"}
    >
      {journey.learningStages.map((step, index) => (
        <li
          key={step.id}
          data-done={!loading && step.done}
          data-current={step.id === journey.current?.id}
        >
          <Link
            href={step.route}
            aria-current={step.id === journey.current?.id ? "step" : undefined}
          >
            <i>{!loading && step.done ? <Check size={14} /> : index + 1}</i>
            <span>
              {step.title[locale]}
              <small>
                {loading
                  ? "…"
                  : step.detail}
              </small>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
export function JourneyNextAction() {
  const context = useStudentJourney();
  if (!context) return null;
  const { journey, locale, loading, error, retry } = context,
    ar = locale === "ar",
    Arrow = ar ? ArrowLeft : ArrowRight;
  const say = (en: string, arabic: string) => (ar ? arabic : en);
  if (error)
    return (
      <div className="student-next-action" role="alert">
        <p>
          {say(
            "Saved progress could not be refreshed. No stage has been marked complete.",
            "تعذّر تحديث تقدمك المحفوظ. لم نعتبر أي مرحلة مكتملة.",
          )}
        </p>
        <button onClick={retry}>{say("Retry", "حاول ثانية")}</button>
      </div>
    );
  if (loading)
    return (
      <div className="student-next-action" role="status">
        {say(
          "Finding your saved next step…",
          "بنحدد خطوتك التالية من تقدمك المحفوظ…",
        )}
      </div>
    );
  const explanation =
    journey.next?.id === "personal"
      ? say(
          "Add your personal and education details once. Your accepted accounting work will build the CV automatically.",
          "اكتب بياناتك الشخصية والتعليم مرة واحدة. الشغل المحاسبي المقبول هيبني الـCV تلقائيًا.",
        )
      : journey.next?.id === "training"
        ? say(
            "Continue the training desk: source documents, entries, ledger, trial balance and the office computer. Finish this file before moving to the first shift.",
            "كمّل ملف تدريب الأساس: المستندات، القيود، الأستاذ، الميزان وكمبيوتر المكتب. بعد الملف ده ننتقل لأول وردية.",
          )
        : journey.next?.id === "excel"
          ? say(
              "Build spreadsheet and accounting-equation foundations first. Your five server-checked stages unlock the practical desk.",
              "ابدأ بأساسيات الجداول والمعادلة المحاسبية. المراحل الخمس المتحققة على الخادم تفتح لك مكتب التدريب العملي.",
            )
        : journey.next?.id === "shift"
          ? say(
              "Your foundations file is complete. Apply it in the first shift, then review the journal and ledger. The two training companies keep separate books.",
              "ملف الأساس خلص. طبّقه في أول وردية، وبعدها راجع اليومية والأستاذ. دفاتر الشركتين التدريبيتين تفضل منفصلة.",
            )
          : journey.next?.id === "results"
            ? say(
                "Your learning stages are complete. Review the evidence, practical work, profile, CV and achievements built from your saved work.",
                "مراحل التعلم اكتملت. راجع الأدلة والأعمال العملية والملف والـCV والإنجازات المبنية من شغلك المحفوظ.",
              )
            : say(
                "Your introductory work and CV are ready to review. Continue the career track selected from its existing prerequisites.",
                "شغلك التمهيدي وسيرتك جاهزين للمراجعة. كمّل المسار المهني حسب شروطه الحالية.",
              );
  return (
    <section
      className="student-next-action"
      aria-label={say("Your next step", "خطوتك التالية")}
    >
      <div>
        <small>
          {journey.inCurrentTask
            ? say("YOU ARE HERE", "أنت هنا")
            : say("ONE NEXT STEP", "خطوة واحدة تالية")}
        </small>
        <h2>
          {journey.next?.title[locale] ??
            say("Continue your career track", "كمّل المسار المهني")}
        </h2>
        <p>{explanation}</p>
      </div>
      {journey.inCurrentTask ? (
        <span className="student-current-task">
          {say(
            "Continue using the mission controls below",
            "كمّل من أزرار المهمة اللي تحت",
          )}
          <Gamepad2 size={18} />
        </span>
      ) : (
        <Link href={journey.nextRoute}>
          {say("Continue my journey", "كمّل رحلتي")}
          <Arrow size={20} />
        </Link>
      )}
    </section>
  );
}
export function StudentJourneyHome({ locale }: { locale: Locale }) {
  const context = useStudentJourney();
  if (!context) return null;
  const ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en);
  return (
    <main className="student-journey-page" dir={ar ? "rtl" : "ltr"}>
      <header className="student-journey-heading">
        <div>
          <small>DEBIT &amp; CREDIT</small>
          <h1>{say("Your accounting journey", "رحلتك المحاسبية")}</h1>
          <p>
            {say(
              "One starting point. Your next step follows your saved work.",
              "بداية واحدة. كل خطوة تسلّمك للخطوة اللي بعدها حسب شغلك المحفوظ.",
            )}
          </p>
        </div>
        <nav
          className="student-home-tools"
          aria-label={say(
            "Profile, language and theme",
            "الملف واللغة والمظهر",
          )}
        >
          <Link
            className="student-home-profile"
            href={`/${locale}/career-profile`}
          >
            <ProfilePhoto locale={locale} name={context.name} />
            <span>
              {context.name}
              <small>{say("My profile", "ملفي")}</small>
            </span>
          </Link>
          <Link
            className="student-home-language"
            href={`/${ar ? "en" : "ar"}`}
            aria-label={say("Switch to Arabic", "التبديل للإنجليزية")}
          >
            {ar ? "EN" : "ع"}
          </Link>
          <ThemeToggle compact />
        </nav>
      </header>
      <JourneySteps />
      <section className="student-journey-overview" aria-label={say("Learning progress summary", "ملخص التقدم التعليمي")}>
        <article><small>{say("Current stage", "المرحلة الحالية")}</small><strong>{context.journey.next?.title[locale] ?? say("Career track", "المسار المهني")}</strong></article>
        <article><small>{say("Completed learning stages", "مراحل التعلم المكتملة")}</small><strong>{context.journey.learningProgress.completed}/{context.journey.learningProgress.total}</strong></article>
        <article><small>{say("Latest successful milestone", "آخر إنجاز ناجح")}</small><strong>{context.journey.latestMilestone?.title[locale] ?? say("No completed stage yet", "لا توجد مرحلة مكتملة بعد")}</strong></article>
        <article><small>{say("True learning progress", "تقدم التعلم الحقيقي")}</small><strong>{context.journey.learningProgress.percent}%</strong></article>
      </section>
      <JourneyNextAction />
      <LearningCompetitionSummary locale={locale} />
      <section className="student-journey-results">
        <h2>
          {context.journey.learningComplete
            ? say("Review your learning outcomes", "راجع نتائج تعلمك")
            : say("What your work builds", "شغلك بيبني إيه؟")}
        </h2>
        <p>
          {say(
            "Accepted tasks create accounting skill evidence and update the English CV automatically. These pages show your results; they are not separate courses you must start again.",
            "المهام المقبولة بتبني أدلة مهارات محاسبية وبتحدّث الـCV الإنجليزي تلقائيًا. الصفحات دي لنتائج شغلك، مش كورسات منفصلة تبدأها من جديد.",
          )}
        </p>
        <div className="student-outcome-grid">
          {context.journey.outcomes.map((outcome) => (
            <Link
              key={outcome.id}
              href={outcome.route}
              data-available={outcome.available}
            >
              <strong>{outcome.title[locale]}</strong>
              <small>
                {outcome.available
                  ? say("Available from saved work", "متاح من شغلك المحفوظ")
                  : say("Builds as you complete real work", "يتكوّن مع إتمام شغل حقيقي")}
              </small>
            </Link>
          ))}
        </div>
      </section>
      <details className="student-journey-explore">
        <summary>
          {say(
            "Extra tools & activities (optional)",
            "أدوات وأنشطة إضافية — اختياري",
          )}
        </summary>
        <p>
          {say(
            "These do not replace the next step above. You can explore and return to My journey at any time.",
            "دي مش بديل لخطوتك الحالية اللي فوق. تقدر تستكشف وترجع لرحلتي في أي وقت.",
          )}
        </p>
        <nav>
          {[
            ["/account-guide", "Account guide", "دليل الحسابات"],
            [
              "/game/bank-reconciliation",
              "Bank reconciliation",
              "التسوية البنكية",
            ],
            ["/academy", "Academy", "الأكاديمية"],
            ["/career", "Career development", "التطوير المهني"],
            ["/competition", "Online competition", "المنافسة"],
            ["/account", "Account settings", "إعدادات الحساب"],
          ].map(([route, en, arabic]) => (
            <Link key={route} href={`/${locale}${route}`}>
              {say(en, arabic)}
            </Link>
          ))}
        </nav>
      </details>
    </main>
  );
}

function LearningCompetitionSummary({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const say = (en: string, arabic: string) => (ar ? arabic : en);
  const context = useStudentJourney();
  const state = context?.excelProgress ?? null;
  const [rank, setRank] = useState<number | null>(null);
  useEffect(() => {
    if (!state?.publicOptIn || !state.completedSteps.includes(5)) {
      setRank(null);
      return;
    }
    let active = true;
    void requestJSON<{ ownRank: number | null }>(
      "competition/excel-foundations?scope=overall",
    )
      .then((board) => {
        if (active) setRank(board.ownRank);
      })
      .catch(() => {
        if (active) setRank(null);
      });
    return () => {
      active = false;
    };
  }, [state]);
  if (!state) return null;
  const completed = state.completedSteps.length;
  return (
    <section className="student-learning-competition" aria-label={say("Learning progress competition", "منافسة التقدم التعليمي")}>
      <Trophy aria-hidden="true" />
      <div>
        <small>{say("LEARNING PROGRESS", "تقدم التعلم")}</small>
        <h2>{completed}/5 {say("verified Excel stages", "مراحل Excel متحققة")}</h2>
        <p>
          {state.completedSteps.includes(5)
            ? `${say("Mastery score", "درجة الإتقان")}: ${state.finalScore ?? 0}% · ${earnedExcelXp(state)} XP`
            : say("Only server-approved completions affect this progress.", "المراحل المقبولة من الخادم فقط تؤثر في هذا التقدم.")}
        </p>
      </div>
      <div className="student-learning-rank">
        {state.publicOptIn ? (
          <><small>{say("Your opt-in rank", "ترتيبك الاختياري")}</small><strong>{rank ? `#${rank}` : "—"}</strong></>
        ) : (
          <small>{say("Public ranking is off", "الترتيب العام غير مفعّل")}</small>
        )}
        <Link href={`/${locale}/account#learning-competition`}>{say("Participation settings", "إعدادات المشاركة")}</Link>
      </div>
    </section>
  );
}
