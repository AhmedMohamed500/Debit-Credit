"use client";
import "@/app/career-profile.css";
import "@/app/career-profile-documents.css";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { ProfilePhoto } from "./profile-photo";
import { activitySummary } from "@/lib/career/activity-summary";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Languages,
  Lock,
  Printer,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { useGame } from "@/lib/campaign/store";
import {
  accountingDna,
  calculatePassport,
  calculateRoleReadiness,
  firstShiftSkillEvidence,
} from "@/lib/career/evidence";
import {
  roleCatalog,
  roleIds,
  skillCatalog,
  skillIds,
} from "@/lib/career/catalog";
import {
  BrowserCareerProfileRepository,
  BrowserCvPreferencesRepository,
  BrowserSkillEvidenceRepository,
  createDefaultProfile,
} from "@/lib/career/repository";
import { buildCv, exportCareerData } from "@/lib/career/cv";
import { checkAtsFormat, cvToPlainText } from "@/lib/career/ats";
import { BrowserCvVersionRepository } from "@/lib/career/cv-history";
import type {
  CareerProfile,
  CvPreferences,
  RoleId,
  SkillEvidence,
  SkillId,
  SkillResult,
} from "@/lib/career/model";
import type { Locale } from "@/types";
type View =
  "dashboard" | "edit" | "skills" | "skill" | "cv" | "employer" | "public";
const profileRepo = new BrowserCareerProfileRepository(),
  evidenceRepo = new BrowserSkillEvidenceRepository(),
  cvRepo = new BrowserCvPreferencesRepository();
const statusCopy = {
  unassessed: { ar: "غير مُقيّم", en: "Unassessed" },
  practiced: { ar: "تم التدريب", en: "Practiced" },
  demonstrated: { ar: "تم إثباتها", en: "Demonstrated" },
  verified: { ar: "موثقة", en: "Verified" },
};
const confidenceCopy = {
  insufficient: { ar: "أدلة غير كافية", en: "Insufficient evidence" },
  developing: { ar: "نامية", en: "Developing" },
  strong: { ar: "قوية", en: "Strong" },
  extensive: { ar: "موسعة", en: "Extensive" },
};
export function CareerProfileApp({
  locale,
  view,
  skillId,
  slug,
}: {
  locale: Locale;
  view: View;
  skillId?: string;
  slug?: string;
}) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    { state: game, ready: gameReady } = useGame(),
    [profile, setProfile] = useState<CareerProfile | null>(null),
    [evidence, setEvidence] = useState<SkillEvidence[]>([]),
    [prefs, setPrefs] = useState<CvPreferences | null>(null);
  useEffect(() => {
    if (!gameReady) return;
    const current = profileRepo.get() ?? createDefaultProfile(game.name),
      synced = evidenceRepo.merge(
        firstShiftSkillEvidence(game, current.localCandidateId),
      ),
      savedPrefs = cvRepo.get() ?? {
        version: 1,
        targetRoleId: current.targetRoleId,
        accent: "navy",
        includeScores: true,
        updatedAt: new Date().toISOString(),
      };
    profileRepo.save(current);
    cvRepo.save(savedPrefs);
    setProfile(current);
    setEvidence(synced);
    setPrefs(savedPrefs);
  }, [game, gameReady]);
  const save = (patch: Partial<CareerProfile>) =>
    setProfile((current) => {
      if (!current) return current;
      const next = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      profileRepo.save(next);
      return next;
    });
  const passport = calculatePassport(evidence),
    readiness = roleIds.map((id) => calculateRoleReadiness(id, passport)),
    dna = accountingDna(passport, evidence);
  if (!profile || !prefs)
    return (
      <main className="career-loading">
        {say("Opening your professional profile…", "بنجهّز ملفك المهني…")}
      </main>
    );
  const selectedSkill = skillIds.includes(skillId as SkillId)
    ? (skillId as SkillId)
    : undefined;
  const updatePrefs = (next: Partial<CvPreferences>) => {
    const value = { ...prefs, ...next, updatedAt: new Date().toISOString() };
    cvRepo.save(value);
    setPrefs(value);
  };
  return (
    <main className="career-app" dir={ar ? "rtl" : "ltr"}>
      <CareerHeader locale={locale} profile={profile} />
      {view === "edit" ? (
        <CareerEditor locale={locale} profile={profile} save={save} />
      ) : view === "skills" ? (
        <Passport locale={locale} passport={passport} />
      ) : view === "skill" && selectedSkill ? (
        <SkillDetail
          locale={locale}
          result={passport.find((s) => s.skillId === selectedSkill)!}
          evidence={evidence.filter((e) => e.skillId === selectedSkill)}
        />
      ) : view === "cv" ? (
        <CvView
          locale={locale}
          profile={profile}
          passport={passport}
          evidence={evidence}
          prefs={prefs}
          updatePrefs={updatePrefs}
        />
      ) : view === "employer" ? (
        <TalentView
          locale={locale}
          profile={profile}
          passport={passport}
          readiness={readiness}
          evidence={evidence}
          preview
        />
      ) : view === "public" ? (
        <PublicView
          locale={locale}
          profile={profile}
          passport={passport}
          readiness={readiness}
          evidence={evidence}
          slug={slug ?? ""}
        />
      ) : (
        <Dashboard
          locale={locale}
          profile={profile}
          passport={passport}
          readiness={readiness}
          evidence={evidence}
          dna={dna}
        />
      )}
    </main>
  );
}
function CareerHeader({
  locale,
  profile,
}: {
  locale: Locale;
  profile: CareerProfile;
}) {
  const ar = locale === "ar",
    pathname = usePathname() ?? `/${locale}/career-profile`,
    say = (en: string, a: string) => (ar ? a : en);
  return (
    <header className="career-header">
      <Link className="career-brand" href={`/${locale}`}>
        <span>▂▅▇</span>
        <b>
          Debit & Credit
          <small>{say("Professional Career", "المسار المهني")}</small>
        </b>
      </Link>
      <nav>
        <Link href={`/${locale}`}>
          {say("My journey", "رحلتي")}
        </Link>
        <Link href={`/${locale}/career-profile`}>
          {say("Profile", "الملف")}
        </Link>
        <Link href={`/${locale}/career-profile/skills`}>
          {say("Skill Passport", "جواز المهارات")}
        </Link>
        <Link href={`/${locale}/career-profile/cv`}>
          {say("Auto CV", "السيرة الذاتية")}
        </Link>
        <Link href={`/${locale}/career-profile/employer-preview`}>
          {say("Employer view", "معاينة الشركة")}
        </Link>
      </nav>
      <div>
        <span className={profile.openToWork ? "open" : ""}>
          {profile.openToWork
            ? say("Open to work", "متاح للعمل")
            : say("Career profile", "ملف مهني")}
        </span>
        <Link href={`/${ar ? "en" : "ar"}${pathname.replace(/^\/(ar|en)/, "")}`}>
          <Languages />
          {ar ? "EN" : "AR"}
        </Link>
      </div>
    </header>
  );
}
function Dashboard({
  locale,
  profile,
  passport,
  readiness,
  evidence,
  dna,
}: {
  locale: Locale;
  profile: CareerProfile;
  passport: SkillResult[];
  readiness: ReturnType<typeof calculateRoleReadiness>[];
  evidence: SkillEvidence[];
  dna: ReturnType<typeof accountingDna>;
}) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    role = roleCatalog[profile.targetRoleId],
    top = passport
      .filter((s) => s.status === "demonstrated" || s.status === "verified")
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3),
    target = readiness.find((r) => r.roleId === profile.targetRoleId)!;
  return (
    <div className="career-shell">
      <section className="career-identity">
        <div className="career-avatar">
          <ProfilePhoto locale={locale} name={profile.fullName} />
        </div>
        <div>
          <small>{say("PLAYER CAREER PROFILE", "الهوية المهنية للاعب")}</small>
          <h1>
            {profile.fullName ||
              say("Build your professional identity", "ابنِ هويتك المهنية")}
          </h1>
          <p>{profile.headline || role.label[locale]}</p>
          <span>
            {[profile.location, profile.country].filter(Boolean).join(" · ") ||
              say("Location not added", "لم يضف الموقع")}
          </span>
        </div>
        <aside>
          <b>{role.label[locale]}</b>
          <span>
            {profile.openToWork
              ? say("Open to work", "متاح للعمل")
              : say("Preferences private", "التفضيلات خاصة")}
          </span>
          <Link href={`/${locale}/career-profile/edit`}>
            {profile.completed
              ? say("Edit profile", "تعديل الملف")
              : say("Complete profile", "أكمل الملف")}
          </Link>
        </aside>
      </section>
      {!profile.completed && (
        <div className="career-callout">
          <Target />
          <div>
            <b>
              {say(
                "Your career identity is not complete yet.",
                "هويتك المهنية لسه غير مكتملة.",
              )}
            </b>
            <p>
              {say(
                "Finish the short setup now, or save and continue later.",
                "كمّل الإعداد السريع الآن، أو احفظ وارجع لاحقًا.",
              )}
            </p>
          </div>
          <Link href={`/${locale}/career-profile/edit`}>
            {say("Start setup", "ابدأ الإعداد")}
          </Link>
        </div>
      )}
      <div className="career-grid">
        <section className="career-panel readiness-panel">
          <header>
            <div>
              <small>{say("ROLE READINESS", "الجاهزية للدور")}</small>
              <h2>{role.label[locale]}</h2>
            </div>
            <Target />
          </header>
          {target.score === null ? (
            <div className="insufficient">
              <b>{say("Not Enough Evidence", "الأدلة غير كافية")}</b>
              <p>
                {say(
                  `Evidence covers ${target.coverage}% of this role. Complete more professional cases before a percentage is shown.`,
                  `الأدلة تغطي ${target.coverage}٪ من الدور. أكمل حالات مهنية أكثر قبل عرض نسبة.`,
                )}
              </p>
            </div>
          ) : (
            <div className="readiness-value">
              <b>{target.score}%</b>
              <span>
                {say("Evidence-based readiness", "جاهزية مبنية على الأدلة")}
              </span>
              <meter min="0" max="100" value={target.score} />
            </div>
          )}
          <div className="role-mini-list">
            {readiness
              .filter((r) => r.roleId !== profile.targetRoleId)
              .slice(0, 3)
              .map((r) => (
                <span key={r.roleId}>
                  <b>{roleCatalog[r.roleId].label[locale]}</b>
                  <em>
                    {r.score === null
                      ? say("Not enough evidence", "أدلة غير كافية")
                      : `${r.score}%`}
                  </em>
                </span>
              ))}
          </div>
        </section>
        <section className="career-panel dna-panel">
          <header>
            <div>
              <small>ACCOUNTING DNA</small>
              <h2>{say("Evidence summary", "ملخص الأدلة")}</h2>
            </div>
            <Sparkles />
          </header>
          {dna ? (
            <>
              <strong>{dnaName(dna.archetype, locale)}</strong>
              <p>
                {say(
                  "Your strongest demonstrated areas:",
                  "أقوى المهارات المثبتة:",
                )}
              </p>
              <div className="tag-row">
                {dna.strengths.map((id) => (
                  <span key={id}>{skillCatalog[id].label[locale]}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="insufficient">
              <b>
                {say(
                  "Still discovering your Accounting DNA",
                  "لسه بنكتشف بصمتك المحاسبية",
                )}
              </b>
              <p>
                {say(
                  "Keep playing professional cases. An archetype appears only after enough diverse evidence.",
                  "كمّل الحالات المهنية. لن يظهر النمط إلا بعد وجود أدلة متنوعة كافية.",
                )}
              </p>
            </div>
          )}
        </section>
      </div>
      <section className="career-panel">
        <header>
          <div>
            <small>
              {say(
                "TOP EVIDENCE-BACKED SKILLS",
                "أهم المهارات المبنية على أدلة",
              )}
            </small>
            <h2>{say("Skill Passport", "جواز المهارات")}</h2>
          </div>
          <Link href={`/${locale}/career-profile/skills`}>
            {say("View all", "عرض الكل")}
          </Link>
        </header>
        {top.length ? (
          <div className="top-skills">
            {top.map((s) => (
              <SkillRow key={s.skillId} locale={locale} result={s} />
            ))}
          </div>
        ) : (
          <div className="insufficient">
            <b>
              {say("No demonstrated skills yet", "لا توجد مهارات مثبتة بعد")}
            </b>
            <p>
              {say(
                "Practice records will appear after meaningful accounting activities.",
                "ستظهر الأدلة بعد تنفيذ أنشطة محاسبية فعلية.",
              )}
            </p>
          </div>
        )}
      </section>
      <section className="career-panel simulation">
        <p><Link href={`/${locale}/student`}>{say("Student unit: Source documents to books", "وحدة الطالب: من المستند إلى الدفاتر")}</Link> · {activitySummary(evidence, "student-unit1/").completed}/11 {say("accepted training tasks", "تاسك تدريبي مقبول")}</p>
        <header>
          <div>
            <small>{say("PROFESSIONAL EVIDENCE", "الأدلة المهنية")}</small>
            <h2>Mizan Trading — First Shift</h2>
          </div>
          <BriefcaseBusiness />
        </header>
        <div className="simulation-stats">
          <span>
            <b>
              {activitySummary(evidence, "first-day/").completed}
              /3
            </b>
            {say("Documents completed", "مستندات مكتملة")}
          </span>
          <span>
            <b>
              {activitySummary(evidence, "first-day/").accuracy ?? "—"}
              {activitySummary(evidence, "first-day/").accuracy !== null ? "%" : ""}
            </b>
            {say("Evidence accuracy", "دقة الأدلة")}
          </span>
          <span>
            <b>
              {activitySummary(evidence, "first-day/").firstAttempt}
            </b>
            {say("First-attempt documents", "مستندات من أول محاولة")}
          </span>
          <span>
            <b>{activitySummary(evidence, "first-day/").hints}</b>
            {say("Recorded hints", "تلميحات مسجلة")}
          </span>
        </div>
        <p className="integrity-note">
          <ShieldCheck />
          {say(
            "Practical simulation · Practiced or Demonstrated by evidence. No standardized verified assessment yet.",
            "محاكاة عملية · تدريب أو إثبات حسب الأدلة. لا يوجد تقييم مهني موثق معياري حتى الآن.",
          )}
        </p>
      </section>
      <section className="career-panel assessment-panel">
        <header>
          <div>
            <small>{say("ASSESSMENTS", "التقييمات")}</small>
            <h2>
              {say("Verified Career Assessments", "التقييمات المهنية الموثقة")}
            </h2>
          </div>
          <ShieldCheck />
        </header>
        <div className="empty-assessment">
          <Lock />
          <div>
            <b>
              {say(
                "No Verified Career Assessment yet",
                "لا يوجد تقييم مهني موثق حتى الآن",
              )}
            </b>
            <p>
              {say(
                "This area is ready for future standardized assessments. First Shift skills remain Practiced until their evidence meets the Demonstrated threshold.",
                "هذا القسم جاهز للتقييمات المعيارية مستقبلًا. تظل مهارات أول وردية في حالة تدريب حتى تستوفي أدلتها حد الإثبات.",
              )}
            </p>
          </div>
        </div>
      </section>
      <section className="career-documents">
        <div>
          <small>{say("CAREER DOCUMENTS", "المستندات المهنية")}</small>
          <h2>
            {say(
              "Use your real profile and evidence",
              "استخدم ملفك وأدلتك الحقيقية",
            )}
          </h2>
        </div>
        <div className="career-actions">
          <Link href={`/${locale}/career-profile/cv`}>
            <FileText />
            {say("Generate role-based CV", "أنشئ سيرة حسب الدور")}
          </Link>
          <Link href={`/${locale}/career-profile/employer-preview`}>
            <Eye />
            {say("What would a company see?", "ماذا سترى الشركة؟")}
          </Link>
        </div>
      </section>
    </div>
  );
}
function SkillRow({ locale, result }: { locale: Locale; result: SkillResult }) {
  return (
    <Link
      className="passport-row"
      href={`/${locale}/career-profile/skills/${result.skillId}`}
    >
      <span className={result.status}>
        <Check />
      </span>
      <div>
        <b>{skillCatalog[result.skillId].label[locale]}</b>
        <small>
          {confidenceCopy[result.confidence][locale]} ·{" "}
          {result.uniqueActivities} {locale === "ar" ? "أنشطة" : "activities"}
        </small>
      </div>
      <em className={result.status}>{statusCopy[result.status][locale]}</em>
      <strong>{result.score === null ? "—" : `${result.score}%`}</strong>
      <ChevronLeft />
    </Link>
  );
}
function Passport({
  locale,
  passport,
}: {
  locale: Locale;
  passport: SkillResult[];
}) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en);
  return (
    <div className="career-shell">
      <section className="career-page-title">
        <small>DEBIT & CREDIT</small>
        <h1>{say("Accounting Skill Passport", "جواز المهارات المحاسبية")}</h1>
        <p>
          {say(
            "Every status and score below comes from stored activity evidence. Verified is reserved for future standardized assessments.",
            "كل حالة ودرجة هنا تأتي من أدلة نشاط محفوظة. حالة موثقة محجوزة للتقييمات المعيارية المستقبلية.",
          )}
        </p>
      </section>
      <div className="passport-legend">
        {(["unassessed", "practiced", "demonstrated", "verified"] as const).map(
          (id) => (
            <span className={id} key={id}>
              {statusCopy[id][locale]}
              <small>
                {id === "verified"
                  ? say("Future assessments only", "للتقييمات المستقبلية فقط")
                  : ""}
              </small>
            </span>
          ),
        )}
      </div>
      <section className="career-panel passport-list">
        {passport.map((s) => (
          <SkillRow key={s.skillId} locale={locale} result={s} />
        ))}
      </section>
    </div>
  );
}
function SkillDetail({
  locale,
  result,
  evidence,
}: {
  locale: Locale;
  result: SkillResult;
  evidence: SkillEvidence[];
}) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en);
  return (
    <div className="career-shell">
      <Link className="career-back" href={`/${locale}/career-profile/skills`}>
        {ar ? <ChevronRight /> : <ChevronLeft />}
        {say("Skill Passport", "جواز المهارات")}
      </Link>
      <section className="career-page-title skill-title">
        <small>{statusCopy[result.status][locale]}</small>
        <h1>{skillCatalog[result.skillId].label[locale]}</h1>
        <p>{skillCatalog[result.skillId].description[locale]}</p>
        <div>
          <span>
            <b>
              {result.score === null
                ? say("Insufficient", "غير كافية")
                : `${result.score}%`}
            </b>
            {say("Current score", "الدرجة الحالية")}
          </span>
          <span>
            <b>{confidenceCopy[result.confidence][locale]}</b>
            {say("Evidence confidence", "قوة الأدلة")}
          </span>
        </div>
      </section>
      <section className="career-panel">
        <header>
          <div>
            <small>{say("SOURCE RECORDS", "سجلات المصدر")}</small>
            <h2>{say("Professional evidence", "الأدلة المهنية")}</h2>
          </div>
          <b>{evidence.length}</b>
        </header>
        {evidence.length ? (
          <div className="evidence-list">
            {evidence.map((e) => (
              <article key={e.evidenceId}>
                <div>
                  <b>{ar ? e.titleAr : e.titleEn}</b>
                  <small>
                    {new Date(e.completedAt).toLocaleDateString(locale)} ·{" "}
                    {e.source} · {e.assessmentIntegrity}
                  </small>
                </div>
                <dl>
                  <div>
                    <dt>{say("Accuracy", "الدقة")}</dt>
                    <dd>{e.accuracy}%</dd>
                  </div>
                  <div>
                    <dt>{say("Difficulty", "الصعوبة")}</dt>
                    <dd>{e.difficulty}/3</dd>
                  </div>
                  <div>
                    <dt>{say("Attempts", "المحاولات")}</dt>
                    <dd>{e.attempts}</dd>
                  </div>
                  <div>
                    <dt>{say("First attempt", "أول محاولة")}</dt>
                    <dd>
                      {e.firstAttemptCorrect === null
                        ? say("Unknown", "غير معروف")
                        : e.firstAttemptCorrect
                          ? say("Yes", "نعم")
                          : say("No", "لا")}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      {e.projectionVersion === 2
                        ? say("Manager assistance", "مساعدة المدير")
                        : say("Hints", "التلميحات")}
                    </dt>
                    <dd>{e.hintsUsed}</dd>
                  </div>
                </dl>
                {e.rationaleEn && (
                  <div className="evidence-rationale">
                    <b>
                      {say("Why this skill changed", "لماذا تغيرت هذه المهارة")}
                    </b>
                    <p>{ar ? e.rationaleAr : e.rationaleEn}</p>
                    {e.inspectedEvidence?.length ? (
                      <small>
                        {say("Evidence reviewed", "الأدلة التي تمت مراجعتها")}:{" "}
                        {e.inspectedEvidence.join(" · ")}
                      </small>
                    ) : null}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="insufficient">
            {say("No meaningful evidence yet.", "لا توجد أدلة فعلية حتى الآن.")}
          </div>
        )}
      </section>
      <section className="career-panel future-box">
        <Lock />
        <div>
          <small>{say("FUTURE INTEGRATION", "تكامل مستقبلي")}</small>
          <h2>{say("Verified Assessments", "التقييمات الموثقة")}</h2>
          <p>
            {say(
              "No Verified Career Assessment yet. This area will accept versioned, integrity-checked assessment attempts later.",
              "لا يوجد تقييم مهني موثق حتى الآن. هذا القسم جاهز لاستقبال محاولات تقييم ذات إصدار وتحقق لاحقًا.",
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
function CareerEditor({
  locale,
  profile,
  save,
}: {
  locale: Locale;
  profile: CareerProfile;
  save: (p: Partial<CareerProfile>) => void;
}) {
  const ar = locale === "ar",
    account = useCloudIdentity(),
    say = (en: string, a: string) => (ar ? a : en),
    [step, setStep] = useState(
      Math.min(5, Math.max(1, profile.onboardingStep)),
    ),
    edu = profile.education[0] ?? {
      id: "education-1",
      institution: "",
      degree: "",
      field: "Accounting",
      graduationYear: profile.graduationYear,
    };
  const field = (key: keyof CareerProfile, label: string, type = "text") => (
    <label>
      <span>{label}</span>
      <input
        type={type}
        readOnly={Boolean(account && ["fullName", "country", "location", "email", "phone", "linkedIn", "portfolio"].includes(key))}
        value={String(profile[key] ?? "")}
        onChange={(e) =>
          save({
            [key]: type === "number" ? Number(e.target.value) : e.target.value,
          } as Partial<CareerProfile>)
        }
      />
    </label>
  );
  const go = (n: number) => {
    save({ onboardingStep: n });
    setStep(n);
  };
  return (
    <div className="career-shell edit-shell">
      <ProfilePhoto locale={locale} editable name={profile.fullName}/>
      {account && <p><Link href={`/${locale}/student-profile?next=${encodeURIComponent(`/${locale}/career-profile/edit`)}`}>{say("Update account CV details (name, phone, education, languages and links)", "تعديل بيانات CV المحفوظة بالحساب: الاسم والهاتف والتعليم واللغات والروابط")}</Link></p>}
      <section className="career-page-title">
        <small>{say(`STEP ${step} OF 5`, `الخطوة ${step} من 5`)}</small>
        <h1>
          {
            [
              say("Who are you?", "من أنت؟"),
              say("Your target accounting role", "دورك المحاسبي المستهدف"),
              say("Education & experience", "التعليم والخبرة"),
              say("Career preferences", "تفضيلات العمل"),
              say("Your Skill Passport", "جواز مهاراتك"),
            ][step - 1]
          }
        </h1>
        <div className="step-track">
          {[1, 2, 3, 4, 5].map((n) => (
            <i className={n <= step ? "active" : ""} key={n} />
          ))}
        </div>
      </section>
      <section className="career-panel career-form">
        {step === 1 && (
          <div className="form-grid">
            {field("fullName", say("Full name", "الاسم الكامل"))}
            {field("headline", say("Professional headline", "العنوان المهني"))}
            {field("country", say("Country", "الدولة"))}
            {field("location", say("Location", "الموقع"))}
            {field("email", say("Email", "البريد"), "email")}
            {field("phone", say("Phone · optional", "الهاتف · اختياري"), "tel")}
            {field("linkedIn", "LinkedIn · optional", "url")}
            {field(
              "portfolio",
              say("Portfolio · optional", "معرض الأعمال · اختياري"),
              "url",
            )}
            <label className="wide">
              <span>{say("Short professional summary", "ملخص مهني قصير")}</span>
              <textarea
                value={profile.summary}
                onChange={(e) => save({ summary: e.target.value })}
              />
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="role-picker">
            {roleIds.map((id) => (
              <button
                className={profile.targetRoleId === id ? "selected" : ""}
                onClick={() => save({ targetRoleId: id })}
                key={id}
              >
                <Target />
                <b>{roleCatalog[id].label[locale]}</b>
                <small>
                  {Object.keys(roleCatalog[id].skills)
                    .slice(0, 3)
                    .map((s) => skillCatalog[s as SkillId].label[locale])
                    .join(" · ")}
                </small>
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="form-grid">
            <label>
              <span>{say("Institution", "المؤسسة التعليمية")}</span>
              <input
                value={edu.institution}
                readOnly={Boolean(account)}
                onChange={(e) =>
                  save({ education: [{ ...edu, institution: e.target.value }] })
                }
              />
            </label>
            <label>
              <span>{say("Degree", "الدرجة العلمية")}</span>
              <input
                value={edu.degree}
                readOnly={Boolean(account)}
                onChange={(e) =>
                  save({ education: [{ ...edu, degree: e.target.value }] })
                }
              />
            </label>
            <label>
              <span>{say("Field", "التخصص")}</span>
              <input
                value={edu.field}
                readOnly={Boolean(account)}
                onChange={(e) =>
                  save({ education: [{ ...edu, field: e.target.value }] })
                }
              />
            </label>
            <label>
              <span>{say("Graduation year", "سنة التخرج")}</span>
              <input
                inputMode="numeric"
                value={profile.graduationYear}
                readOnly={Boolean(account)}
                onChange={(e) =>
                  save({
                    graduationYear: e.target.value,
                    education: [{ ...edu, graduationYear: e.target.value }],
                  })
                }
              />
            </label>
            <label>
              <span>{say("Experience level", "مستوى الخبرة")}</span>
              <select
                value={profile.experienceLevel}
                disabled={Boolean(account)}
                onChange={(e) =>
                  save({
                    experienceLevel: e.target
                      .value as CareerProfile["experienceLevel"],
                  })
                }
              >
                <option value="student">{say("Student", "طالب")}</option>
                <option value="fresh-graduate">
                  {say("Fresh graduate", "حديث التخرج")}
                </option>
                <option value="junior">{say("Junior", "مبتدئ")}</option>
                <option value="mid">{say("Mid-level", "متوسط")}</option>
                <option value="senior">{say("Senior", "خبير")}</option>
              </select>
            </label>
            {field(
              "yearsOfExperience",
              say("Years of experience", "سنوات الخبرة"),
              "number",
            )}
          </div>
        )}
        {step === 4 && (
          <div className="form-grid">
            <label>
              <span>
                {say("Languages · separated by commas", "اللغات · افصل بفواصل")}
              </span>
              <input
                value={profile.languages.join(", ")}
                readOnly={Boolean(account)}
                onChange={(e) =>
                  save({
                    languages: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            {field(
              "employmentStatus",
              say("Employment status", "الحالة الوظيفية"),
            )}
            <label>
              <span>{say("Preferred work type", "نوع العمل المفضل")}</span>
              <select
                value={profile.preferredWorkType}
                onChange={(e) =>
                  save({
                    preferredWorkType: e.target
                      .value as CareerProfile["preferredWorkType"],
                  })
                }
              >
                <option value="flexible">{say("Flexible", "مرن")}</option>
                <option value="onsite">{say("On-site", "من المقر")}</option>
                <option value="hybrid">{say("Hybrid", "هجين")}</option>
                <option value="remote">{say("Remote", "عن بعد")}</option>
              </select>
            </label>
            {field(
              "preferredLocation",
              say("Preferred location", "الموقع المفضل"),
            )}
            <label className="switch wide">
              <input
                type="checkbox"
                checked={profile.openToWork}
                onChange={(e) => save({ openToWork: e.target.checked })}
              />
              <span>{say("Open to work", "متاح لفرص العمل")}</span>
            </label>
          </div>
        )}
        {step === 5 && (
          <div className="setup-review">
            <ShieldCheck />
            <h2>
              {say(
                "Your claims stay evidence-based.",
                "كل معلومة مهنية مرتبطة بمصدر حقيقي.",
              )}
            </h2>
            <p>
              {say(
                "Current gameplay can create Practiced or Demonstrated evidence. Verified stays empty until standardized assessments exist.",
                "اللعب الحالي ينتج أدلة تدريب أو إثبات. تظل حالة موثقة فارغة حتى وجود تقييمات معيارية.",
              )}
            </p>
            <label>
              <span>{say("Profile visibility", "ظهور الملف")}</span>
              <select
                value={profile.privacy.visibility}
                onChange={(e) =>
                  save({
                    privacy: {
                      ...profile.privacy,
                      visibility: e.target
                        .value as CareerProfile["privacy"]["visibility"],
                    },
                  })
                }
              >
                <option value="private">{say("Private", "خاص")}</option>
                <option value="link">
                  {say(
                    "Share by link · local preview",
                    "مشاركة بالرابط · معاينة محلية",
                  )}
                </option>
                <option value="companies_future">
                  {say(
                    "Discoverable by companies · future only",
                    "قابل للاكتشاف بواسطة الشركات · مستقبلًا",
                  )}
                </option>
              </select>
            </label>
            <small>
              {profile.privacy.visibility === "companies_future"
                ? say(
                    "Company discovery is not live. This only saves your future preference.",
                    "اكتشاف الشركات غير متاح حاليًا. هذا يحفظ تفضيلك المستقبلي فقط.",
                  )
                : ""}
            </small>
          </div>
        )}
        <footer>
          <button disabled={step === 1} onClick={() => go(step - 1)}>
            {ar ? <ChevronRight /> : <ChevronLeft />}
            {say("Back", "السابق")}
          </button>
          <span>
            {say(
              "Saved in this browser · continue later anytime",
              "محفوظ في هذا المتصفح · يمكنك المتابعة لاحقًا",
            )}
          </span>
          {step < 5 ? (
            <button className="primary" onClick={() => go(step + 1)}>
              {say("Save & continue", "احفظ وتابع")}
              {ar ? <ChevronLeft /> : <ChevronRight />}
            </button>
          ) : (
            <Link
              className="primary"
              href={`/${locale}/career-profile`}
              onClick={() => save({ completed: true, onboardingStep: 5 })}
            >
              {say("Open career profile", "افتح الملف المهني")}
              <Check />
            </Link>
          )}
        </footer>
      </section>
    </div>
  );
}
function CvView({
  locale,
  profile,
  passport,
  evidence,
  prefs,
  updatePrefs,
}: {
  locale: Locale;
  profile: CareerProfile;
  passport: SkillResult[];
  evidence: SkillEvidence[];
  prefs: CvPreferences;
  updatePrefs: (p: Partial<CvPreferences>) => void;
}) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    cv = buildCv(profile, passport, evidence, prefs.targetRoleId),
    plainText = cvToPlainText(profile, cv),
    formatChecks = checkAtsFormat(profile, cv);
  // Document language is independent of the surrounding site language.
  const documentLocale = "en" as const;
  const documentCopy = (...[en]: [string, string]) => en;
  useEffect(() => {
    new BrowserCvVersionRepository().save(cv, plainText);
  }, [cv, plainText]);
  const download = () => {
      const blob = new Blob([exportCareerData(profile, cv, evidence)], {
          type: "application/json",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "debit-credit-career-profile.json";
      a.click();
      URL.revokeObjectURL(url);
    },
    downloadText = () => {
      const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "debit-credit-ats-cv.txt";
      a.click();
      URL.revokeObjectURL(url);
    };
  return (
    <div className="career-shell cv-shell">
      <section className="cv-controls">
        <div>
          <small>AUTO CV</small>
          <p>{say("English CV · one-column, text-based document. Enter personal details and real experience in English; your photo stays on your website profile only.", "CV إنجليزي · عمود واحد ونص قابل للقراءة. اكتب بياناتك وخبرتك الحقيقية بالإنجليزي؛ صورتك تظهر في بروفايل الموقع فقط.")}</p>
          {/[\u0600-\u06ff]/u.test(JSON.stringify([profile.fullName, profile.country, profile.location, profile.education, profile.experience, profile.languages])) && <p role="note">{say("Some saved personal details are still in Arabic. Update them in English before using this CV. Existing details are preserved; names and qualifications are not automatically translated.", "بعض بياناتك المحفوظة ما زالت بالعربي. عدّلها بالإنجليزي قبل استخدام السيرة. احتفظنا ببياناتك؛ لا نترجم الأسماء والمؤهلات تلقائيًا.")}</p>}
          <h1>{say("Role-based professional CV", "سيرة ذاتية موجهة للدور")}</h1>
          <p>
            {say(
              "Changing the role reorders only your real skills and evidence.",
              "تغيير الدور يعيد ترتيب مهاراتك وأدلتك الحقيقية فقط.",
            )}
          </p>
          <small>
            {formatChecks.filter((item) => item.passed).length}/
            {formatChecks.length}{" "}
            {say(
              "deterministic format checks passed · not an ATS score",
              "فحوص تنسيق حتمية ناجحة · ليست درجة ATS",
            )}
          </small>
          <p><Link href={`/${locale}/student-profile?next=${encodeURIComponent(`/${locale}/career-profile/cv`)}`}>{say("Edit account CV details", "تعديل بيانات CV بالحساب")}</Link></p>
        </div>
        <label>
          {say("CV target role", "الدور المستهدف")}
          <select
            value={prefs.targetRoleId}
            onChange={(e) =>
              updatePrefs({ targetRoleId: e.target.value as RoleId })
            }
          >
            {roleIds.map((id) => (
              <option key={id} value={id}>
                {roleCatalog[id].label[locale]}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => window.print()}>
          <Printer />
          {say("Print / Save PDF", "طباعة / حفظ PDF")}
        </button>
        <button onClick={downloadText}>
          <FileText />
          {say("Plain Text CV", "سيرة نصية")}
        </button>
        <button onClick={download}>
          <Download />
          {say("Export CV data", "تنزيل بيانات CV")}
        </button>
      </section>
      <article className="professional-cv" lang="en" dir="ltr">
        <header>
          <div>
            <h1>{profile.fullName || "Your Name"}</h1>
            <p>{cv.headline}</p>
            <b>{roleCatalog[cv.targetRoleId].label[documentLocale]}</b>
          </div>
          <address>
            {[profile.email, profile.phone, profile.location, profile.country]
              .filter(Boolean)
              .map((v) => (
                <span key={v}>{v}</span>
              ))}
          </address>
        </header>
        <CvSection title={documentCopy("Professional Summary", "الملخص المهني")}>
          <p>{cv.summary}</p>
        </CvSection>
        {profile.education.length > 0 && (
          <CvSection title={documentCopy("Education", "التعليم")}>
            {profile.education.map((e) => (
              <p key={e.id}>
                <b>
                  {e.degree} {e.field && `— ${e.field}`}
                </b>
                <br />
                {e.institution} {e.graduationYear && `· ${e.graduationYear}`}
              </p>
            ))}
          </CvSection>
        )}
        {profile.experience.length > 0 && (
          <CvSection title={documentCopy("Experience", "الخبرة")}>
            {profile.experience.map((e) => (
              <p key={e.id}>
                <b>
                  {e.title} — {e.company}
                </b>
                <br />
                {e.description}
                <br />{e.startDate} — {e.current ? "Present" : e.endDate}
              </p>
            ))}
          </CvSection>
        )}
        <CvSection
          title={documentCopy("Core Accounting Skills", "المهارات المحاسبية الأساسية")}
        >
          <div className="cv-skills">
            {cv.coreSkills.length ? (
              cv.coreSkills.slice(0, 8).map((s) => (
                <span key={s.skillId}>
                  {skillCatalog[s.skillId].label[documentLocale]}{" "}
                  <small>
                    {statusCopy[s.status][documentLocale]}
                  </small>
                </span>
              ))
            ) : (
              <p>
                {documentCopy(
                  "No Demonstrated claims yet. Continue building qualifying case evidence.",
                  "لا توجد مهارات مثبتة بعد. استمر في بناء أدلة حالات مؤهلة.",
                )}
              </p>
            )}
          </div>
        </CvSection>
        {cv.practiceSkills.length > 0 && (
          <CvSection
            title={documentCopy(
              "Accounting Practice & Skills in Development",
              "التدريب المحاسبي والمهارات قيد التطوير",
            )}
          >
            <div className="cv-skills">
              {cv.practiceSkills.slice(0, 8).map((s) => (
                <span key={s.skillId}>
                  {skillCatalog[s.skillId].label[documentLocale]}{" "}
                  <small>{statusCopy[s.status][documentLocale]}</small>
                </span>
              ))}
            </div>
          </CvSection>
        )}
        <CvSection
          title={documentCopy(
            "Accounting Simulation Experience",
            "خبرة المحاكاة المحاسبية",
          )}
        >
          <h3>Mizan Trading — Accounting Career Simulation</h3>
          {cv.simulationBullets.length ? (
            <ul>
              {cv.simulationBullets.map((item) => (
                <li key={item.evidenceId}>{item.text}</li>
              ))}
            </ul>
          ) : (
            <p>
              {documentCopy(
                "Complete qualifying Mizan Trading cases to generate evidence-backed experience bullets.",
                "أكمل حالات مؤهلة في Mizan Trading لتوليد نقاط خبرة مدعومة بالأدلة.",
              )}
            </p>
          )}
          <small>
            {documentCopy(
              "Practical Simulation · not employment or a verified assessment",
              "محاكاة عملية · ليست خبرة عمل أو تقييمًا موثقًا",
            )}
          </small>
        </CvSection>
        {(profile.linkedIn || profile.portfolio) && <CvSection title="Links"><p>{[profile.linkedIn, profile.portfolio].filter(Boolean).map(link => <span key={link}>{link}<br/></span>)}</p></CvSection>}
        {profile.languages.length > 0 && (
          <CvSection title="Languages">
            <p>{profile.languages.join(" · ")}</p>
          </CvSection>
        )}
        <footer>
          Debit & Credit Skill Passport ·{" "}
          {documentCopy(
              "Evidence-based training record · not professional certification",
              "سجل تدريب مبني على الأدلة · ليس شهادة مهنية",
          )}
        </footer>
      </article>
    </div>
  );
}
function CvSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function TalentView({
  locale,
  profile,
  passport,
  readiness,
  evidence,
  preview = false,
}: {
  locale: Locale;
  profile: CareerProfile;
  passport: SkillResult[];
  readiness: ReturnType<typeof calculateRoleReadiness>[];
  evidence: SkillEvidence[];
  preview?: boolean;
}) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    role = roleCatalog[profile.targetRoleId],
    target = readiness.find((r) => r.roleId === profile.targetRoleId)!,
    demonstrated = passport
      .filter((s) => s.status === "demonstrated" || s.status === "verified")
      .slice(0, 6),
    p = profile.privacy;
  return (
    <div className="career-shell talent-shell">
      {preview && (
        <div className="preview-ribbon">
          <Eye />
          {say(
            "Employer preview · using the same local career profile",
            "معاينة صاحب العمل · تستخدم نفس بيانات الملف المحلي",
          )}
        </div>
      )}
      <section className="talent-card">
        <header>
          <div className="career-avatar">
            <UserRound />
          </div>
          <div>
            <small>DEBIT & CREDIT TALENT</small>
            <h1>
              {profile.fullName ||
                say("Candidate name not added", "لم يضف اسم المرشح")}
            </h1>
            <p>{role.label[locale]}</p>
            {p.showLocation && (
              <span>
                {[profile.location, profile.country]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
          {profile.openToWork && <b>{say("Open to work", "متاح للعمل")}</b>}
        </header>
        <div className="talent-readiness">
          <span>
            <small>{say("Role readiness", "الجاهزية للدور")}</small>
            <b>
              {target.score === null
                ? say("Not Enough Evidence", "الأدلة غير كافية")
                : `${target.score}%`}
            </b>
          </span>
          <span>
            <small>{say("Evidence source", "مصدر الأدلة")}</small>
            <b>{say("Local gameplay", "لعب محلي")}</b>
          </span>
        </div>
        <section>
          <h2>{say("Demonstrated skills", "المهارات المثبتة")}</h2>
          {demonstrated.length ? (
            <div className="tag-row">
              {demonstrated.map((s) => (
                <span key={s.skillId}>
                  {skillCatalog[s.skillId].label[locale]}
                  {p.showSkillScores && s.score !== null ? (
                    <small>{s.score}%</small>
                  ) : null}
                </span>
              ))}
            </div>
          ) : (
            <p>
              {say("No demonstrated skills yet.", "لا توجد مهارات مثبتة بعد.")}
            </p>
          )}
        </section>
        {p.showSimulationResults && (
          <section>
            <h2>{say("Professional simulations", "المحاكاة المهنية")}</h2>
            <article>
              <b>Mizan Trading — First Shift</b>
              <p>
                {activitySummary(evidence, "first-day/").completed}
                /3 {say("documents completed", "مستندات مكتملة")}
              </p>
              <small>
                {say(
                  "Practical simulation · not standardized verification",
                  "محاكاة عملية · ليست تحققًا معياريًا",
                )}
              </small>
            </article>
          </section>
        )}
        <section>
          <h2>{say("Verified assessments", "التقييمات الموثقة")}</h2>
          <p className="empty-assessment">
            <Lock />
            {say(
              "No standardized Verified Career Assessment yet.",
              "لا يوجد تقييم مهني موثق معياري حتى الآن.",
            )}
          </p>
        </section>
        {(p.showEmail || p.showPhone) && (
          <section>
            <h2>{say("Contact", "التواصل")}</h2>
            <p>
              {p.showEmail && profile.email} {p.showPhone && profile.phone}
            </p>
          </section>
        )}
      </section>
      <p className="integrity-note">
        <ShieldCheck />
        {say(
          "Frontend-only local preview. No live employer discovery, authentication or server verification.",
          "معاينة محلية في المرحلة الحالية. لا يوجد اكتشاف شركات أو حسابات أو تحقق بالخادم.",
        )}
      </p>
    </div>
  );
}
function PublicView(
  props: Parameters<typeof TalentView>[0] & { slug: string },
) {
  const { locale, profile, slug } = props,
    ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en);
  if (profile.privacy.visibility === "private" || slug !== profile.slug)
    return (
      <div className="career-shell private-profile">
        <Lock />
        <h1>
          {say("This talent profile is private.", "ملف المواهب هذا خاص.")}
        </h1>
        <p>
          {say(
            "Public publishing requires the candidate to enable Share by Link. Current links are local previews on this browser only.",
            "تحتاج المعاينة إلى اختيار المشاركة بالرابط. الروابط الحالية معاينات محلية داخل هذا المتصفح فقط.",
          )}
        </p>
        <Link href={`/${locale}/career-profile`}>
          {say("Return to career profile", "العودة للملف المهني")}
        </Link>
      </div>
    );
  return <TalentView {...props} />;
}
function dnaName(id: string, locale: Locale) {
  const names: Record<string, { ar: string; en: string }> = {
    "transaction-specialist": {
      ar: "متخصص معاملات",
      en: "Transaction Specialist",
    },
    "error-investigator": { ar: "محقق أخطاء", en: "Error Investigator" },
    "reconciliation-specialist": {
      ar: "متخصص تسويات",
      en: "Reconciliation Specialist",
    },
    "closing-specialist": { ar: "متخصص إقفال", en: "Closing Specialist" },
    "accounting-generalist": { ar: "محاسب شامل", en: "Accounting Generalist" },
  };
  return names[id]?.[locale] ?? id;
}
