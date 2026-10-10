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
  Compass,
  FileText,
  Gamepad2,
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
import type { Locale } from "@/types";
import "@/app/student-journey.css";

type JourneyContext = {
  journey: ReturnType<typeof studentJourney>;
  locale: Locale;
  loading: boolean;
  error: boolean;
  retry: () => void;
  name: string;
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
    void requestJSON<{ data: StudentState }>("me/student-unit")
      .then((row) => {
        if (alive) {
          setProgress({ owner, accepted: row.data.accepted });
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
      }}
    >
      <div data-student-guided="true">
        <StudentJourneyBar />
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
      {journey.steps.map((step, index) => (
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
                  : step.detail ||
                    (index > 2
                      ? locale === "ar"
                        ? "نتيجة شغلك"
                        : "Your work results"
                      : "")}
              </small>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
export function JourneyNextAction({ compact = false }: { compact?: boolean }) {
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
        : journey.next?.id === "shift"
          ? say(
              "Your foundations file is complete. Apply it in the first shift, then review the journal and ledger. The two training companies keep separate books.",
              "ملف الأساس خلص. طبّقه في أول وردية، وبعدها راجع اليومية والأستاذ. دفاتر الشركتين التدريبيتين تفضل منفصلة.",
            )
          : journey.next?.id === "skills"
            ? say(
                "Your work is complete. Review the skill evidence created by the accepted tasks, then open your English CV.",
                "الشغل خلص. راجع أدلة المهارات اللي اتبنت من مهامك المقبولة، وبعدها افتح الـCV الإنجليزي.",
              )
            : journey.next?.id === "cv"
              ? say(
                  "These skills already update your English CV. Review the document and export it; no extra Generate step is required.",
                  "المهارات دي بتتضاف للـCV الإنجليزي تلقائيًا. راجع الوثيقة وصدّرها؛ مش محتاج خطوة توليد إضافية.",
                )
              : say(
                  "Your introductory work and CV are ready to review. Continue the career track selected from its existing prerequisites.",
                  "شغلك التمهيدي وسيرتك جاهزين للمراجعة. كمّل المسار المهني حسب شروطه الحالية.",
                );
  return (
    <section
      className={`student-next-action ${compact ? "compact" : ""}`}
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
        {!compact && <p>{explanation}</p>}
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
function StudentJourneyBar() {
  const context = useStudentJourney(),
    pathname = usePathname();
  if (!context) return null;
  const { locale } = context;
  if (
    [
      `/${locale}`,
      `/${locale}/game`,
      `/${locale}/game/first-shift`,
      `/${locale}/student-profile`,
      `/${locale}/career-profile`,
    ].includes(pathname)
  )
    return null;
  return (
    <nav
      className="student-journey-bar"
      aria-label={
        locale === "ar" ? "مكانك في الرحلة" : "Your place in the journey"
      }
    >
      <Link className="student-journey-home" href={`/${locale}`}>
        <Compass size={18} />
        {locale === "ar" ? "رحلتي" : "My journey"}
      </Link>
      <JourneySteps />
      <JourneyNextAction compact />
    </nav>
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
      <JourneyNextAction />
      <section className="student-journey-results">
        <h2>{say("What your work builds", "شغلك بيبني إيه؟")}</h2>
        <p>
          {say(
            "Accepted tasks create accounting skill evidence and update the English CV automatically. These pages show your results; they are not separate courses you must start again.",
            "المهام المقبولة بتبني أدلة مهارات محاسبية وبتحدّث الـCV الإنجليزي تلقائيًا. الصفحات دي لنتائج شغلك، مش كورسات منفصلة تبدأها من جديد.",
          )}
        </p>
        <div>
          <Link href={`/${locale}/career-profile/skills`}>
            {say("Review my skills", "راجع مهاراتي")}
          </Link>
          <Link href={`/${locale}/career-profile/cv`}>
            <FileText size={18} />
            English CV
          </Link>
          <Link href={`/${locale}/career-profile/edit`}>
            {say("Profile & photo settings", "بياناتي وصورتي")}
          </Link>
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
            ["/career-league/map", "Career map", "الخريطة المهنية"],
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
