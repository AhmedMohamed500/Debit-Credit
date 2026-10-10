"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  ChartNoAxesCombined,
  ChevronRight,
  FileText,
  GraduationCap,
  Home,
  LockKeyhole,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { cloudUser, CloudFailure, requestJSON } from "@/lib/cloud/runtime";
import { roleCatalog } from "@/lib/career/catalog";
import { activitySummary } from "@/lib/career/activity-summary";
import { firstShiftMissionProgress } from "@/lib/campaign/first-shift-hub";
import { useGame } from "@/lib/campaign/store";
import { stepIds, type StudentState } from "@/lib/student/unit";
import {
  PORTFOLIO_LIMIT,
  courseInput,
  certificateInput,
  recentEvidence,
  CERTIFICATE_IMAGE_LIMIT,
  type Portfolio,
  type PortfolioCommand,
  type Course,
  type Certificate,
} from "@/lib/career/portfolio";
import type {
  CareerProfile,
  SkillEvidence,
  SkillResult,
} from "@/lib/career/model";
import type { Locale } from "@/types";
import { ProfilePhoto } from "./profile-photo";
import { useShowcase, ShowcaseIdentity, ShowcasePanel } from "./showcase";
import { useStudentJourney } from "@/components/student/student-journey";
import "@/app/member-profile.css";

type Tab = "profile" | "courses" | "progress" | "certifications";
export async function prepareCertificate(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error("INVALID_FILE");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000)
      throw new Error("IMAGE_TOO_LARGE");
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("CANVAS_UNAVAILABLE");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg", 0.88);
    if (image.length > CERTIFICATE_IMAGE_LIMIT)
      throw new Error("IMAGE_TOO_LARGE");
    return image;
  } finally {
    bitmap.close();
  }
}

export function MemberProfile({
  locale,
  profile,
  evidence,
  passport,
}: {
  locale: Locale;
  profile: CareerProfile;
  evidence: SkillEvidence[];
  passport: SkillResult[];
}) {
  const identity = useCloudIdentity(),
    owner = identity?.user.id;
  const journey = useStudentJourney();
  const showcase = useShowcase(owner);
  const nextRoute =
    journey && !journey.loading && !journey.error
      ? journey.journey.nextRoute
      : `/${locale}`;
  const say = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const { state: game } = useGame();
  const [tab, setTab] = useState<Tab>("profile"),
    [refresh, setRefresh] = useState(0);
  const [saved, setSaved] = useState<{ owner: string; data: Portfolio } | null>(
    null,
  );
  const [unit, setUnit] = useState<{
    owner: string;
    data: StudentState;
  } | null>(null);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState(false),
    [unitError, setUnitError] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null),
    [addingCourse, setAddingCourse] = useState(false),
    [addingCertificate, setAddingCertificate] = useState(false);
  const [preview, setPreview] = useState<{
    owner: string;
    certificate: Certificate;
    image: string;
  } | null>(null);
  const portfolio = saved && saved.owner === owner ? saved.data : null;
  const personalFields = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.location,
    profile.country,
    profile.education[0]?.institution,
    profile.education[0]?.degree,
    profile.languages.length > 0,
  ];
  const completeness = Math.round(
    (personalFields.filter(Boolean).length / personalFields.length) * 100,
  );
  const latest = recentEvidence(evidence);
  const shift = firstShiftMissionProgress(game).completedCount;
  const accepted =
    unit && unit.owner === owner ? unit.data.accepted.length : null;
  const demonstrated = passport.filter(
    (row) => row.status === "demonstrated" || row.status === "verified",
  ).length;
  const status = (value: Course["status"]) =>
    ({
      "not-started": say("Not started", "لم يبدأ"),
      "in-progress": say("In progress", "جارٍ الدراسة"),
      completed: say("Completed", "مكتمل"),
    })[value];
  function selectTab(value: Tab) {
    setTab(value);
    setMessage("");
    window.history.replaceState(null, "", `#${value}`);
  }
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (["profile", "courses", "progress", "certifications"].includes(hash))
      setTab(hash as Tab);
  }, []);
  useEffect(() => {
    if (!owner) return;
    let alive = true;
    setSaved(null);
    setUnit(null);
    setPreview(null);
    setMessage("");
    setLoadError(false);
    setUnitError(false);
    setEditing(null);
    setAddingCourse(false);
    setAddingCertificate(false);
    void requestJSON<Portfolio>("me/portfolio")
      .then((data) => {
        if (alive) setSaved({ owner, data });
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    void requestJSON<{ data: StudentState }>("me/student-unit")
      .then((result) => {
        if (alive) setUnit({ owner, data: result.data });
      })
      .catch(() => {
        if (alive) setUnitError(true);
      });
    return () => {
      alive = false;
    };
  }, [owner, refresh]);
  async function mutate(
    command: Omit<PortfolioCommand, "revision"> & Record<string, unknown>,
  ) {
    if (!owner || !portfolio || busy) return false;
    setBusy(true);
    setMessage("");
    try {
      const data = await requestJSON<Portfolio>("me/portfolio", "PUT", {
        ...command,
        revision: portfolio.revision,
      });
      if (cloudUser() !== owner) return false;
      setSaved({ owner, data });
      setMessage(
        say("Saved privately to your account.", "اتحفظت بشكل خاص بحسابك."),
      );
      return true;
    } catch (error) {
      if (cloudUser() === owner)
        setMessage(
          error instanceof CloudFailure && error.status === 409
            ? say(
                "This profile changed in another tab. Reload your records before saving again.",
                "الملف اتغيّر في تبويب تاني. أعد تحميل بياناتك قبل الحفظ.",
              )
            : say(
                "Not saved. Check the fields, image size and connection, then retry.",
                "لم يتم الحفظ. راجع البيانات وحجم الصورة والاتصال وحاول تاني.",
              ),
        );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function submitCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget),
      parsed = courseInput.safeParse(Object.fromEntries(data));
    if (!parsed.success) {
      setMessage(
        say(
          "Enter a course title and provider (2–160 characters).",
          "اكتب اسم الكورس والجهة من حرفين إلى 160 حرفًا.",
        ),
      );
      return;
    }
    if (
      await mutate({
        action: "save-course",
        course: parsed.data,
        ...(editing ? { id: editing.id } : {}),
      })
    ) {
      setAddingCourse(false);
      setEditing(null);
    }
  }
  async function submitCertificate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget),
      file = data.get("image");
    data.delete("image");
    const parsed = certificateInput.safeParse(Object.fromEntries(data));
    if (!parsed.success || !(file instanceof File) || !file.size) {
      setMessage(
        say(
          "Add the certificate title, issuer and an image.",
          "أضف اسم الشهادة والجهة وصورة الشهادة.",
        ),
      );
      return;
    }
    const capturedOwner = owner;
    // Disable submissions during image decoding too, not only during the API call.
    setBusy(true);
    setMessage("");
    let image: string;
    try {
      image = await prepareCertificate(file);
    } catch {
      setMessage(
        say(
          "Use a clear JPG, PNG or WebP up to 5 MB. Maximum saved edge: 1600 px; the full document is preserved.",
          "استخدم JPG أو PNG أو WebP واضحة حتى 5MB. أطول ضلع محفوظ 1600 بكسل، بدون قص الشهادة.",
        ),
      );
      setBusy(false);
      return;
    }
    setBusy(false);
    if (cloudUser() !== capturedOwner) return;
    if (
      await mutate({
        action: "add-certificate",
        certificate: parsed.data,
        image,
      })
    )
      setAddingCertificate(false);
  }
  async function viewCertificate(certificate: Certificate) {
    if (!owner || busy) return;
    setBusy(true);
    try {
      const data = await requestJSON<{ image: string }>(
        `me/certificates/${certificate.id}`,
      );
      if (cloudUser() === owner)
        setPreview({ owner, certificate, image: data.image });
    } catch {
      setMessage(
        say(
          "Could not load the private image. Retry.",
          "تعذّر تحميل الصورة الخاصة. حاول تاني.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  function trainingRows() {
    return (
      <div className="member-course-list">
        {[
          {
            title: say(
              "Accounting Foundations — From Documents to Books",
              "أساسيات المحاسبة — من المستند إلى الدفاتر",
            ),
            count: accepted,
            total: stepIds.length,
            href: `/${locale}/game/student`,
            icon: GraduationCap,
            note: say(
              "Server-accepted accounting tasks",
              "تاسكات محاسبية مقبولة بالخادم",
            ),
          },
          {
            title: "Mizan Trading — First Shift",
            count: shift,
            total: 5,
            href: `/${locale}/game/first-shift`,
            icon: BookOpen,
            note: say(
              "Cases, journal and ledger in your simulation",
              "حالات ودفتر يومية وأستاذ داخل المحاكاة",
            ),
          },
        ].map((row) => (
          <Link className="member-course-row" href={row.href} key={row.href}>
            <span className="member-course-icon">
              <row.icon size={23} />
            </span>
            <div>
              <b>{row.title}</b>
              <small>{row.note}</small>
              <progress
                data-testid="personal-completeness"
                max={row.total}
                value={row.count ?? 0}
                aria-label={row.title}
              />
            </div>
            <span>
              {row.count === null ? "—" : `${row.count}/${row.total}`}
              <ChevronRight size={18} />
            </span>
          </Link>
        ))}
        {unitError && (
          <p>
            {say(
              "Foundation progress is unavailable, not zero. Reload to retry.",
              "تقدم الأساسيات غير متاح الآن، وليس صفرًا. أعد التحميل للمحاولة.",
            )}
          </p>
        )}
      </div>
    );
  }
  return (
    <main className="member-profile" dir={locale === "ar" ? "rtl" : "ltr"}>
      <header className="member-top">
        <span>
          <UserRound size={18} />
          {profile.fullName || identity?.profile.displayName}
        </span>
        <Link href={`/${locale}`}>
          <ChartNoAxesCombined />
          Debit & Credit
        </Link>
      </header>
      <div className="member-layout">
        <aside
          className="member-sidebar"
          aria-label={say("Profile navigation", "تنقل البروفايل")}
        >
          <Link href={`/${locale}`}>
            <Home />
            {say("Home", "الرئيسية")}
          </Link>
          <button
            onClick={() => selectTab("profile")}
            aria-current={tab === "profile" ? "page" : undefined}
          >
            <UserRound />
            {say("My profile", "البروفايل")}
          </button>
          <button
            onClick={() => selectTab("courses")}
            aria-current={tab === "courses" ? "page" : undefined}
          >
            <BookOpen />
            {say("My courses", "كورساتي")}
          </button>
          <button
            onClick={() => selectTab("progress")}
            aria-current={tab === "progress" ? "page" : undefined}
          >
            <ChartNoAxesCombined />
            {say("My progress", "تقدمي")}
          </button>
          <button
            onClick={() => selectTab("certifications")}
            aria-current={tab === "certifications" ? "page" : undefined}
          >
            <Award />
            {say("Certifications", "الشهادات")}
          </button>
          <Link href={`/${locale}/game`}>
            <GraduationCap />
            {say("Play & learn", "اللعب والتعلم")}
          </Link>
          <Link href={`/${locale}/career-profile/cv`}>
            <FileText />
            {say("My English CV", "الـCV بالإنجليزي")}
          </Link>
          <Link href={`/${locale}/account-guide`}>
            <BookOpen />
            {say("Accounting guide", "دليل المحاسبة")}
          </Link>
          <p>
            <LockKeyhole size={16} />
            {say(
              "Your personal records and images are private.",
              "بياناتك وصورك خاصة بحسابك.",
            )}
          </p>
        </aside>
        <div className="member-content">
          <section className="member-hero">
            <div className="member-portrait">
              <ProfilePhoto locale={locale} name={profile.fullName} />
            </div>
            <div className="member-hero-copy">
              <small>
                {say("YOUR ACCOUNTING CAREER", "رحلتك المهنية في المحاسبة")}
              </small>
              <h1 dir="auto">
                {profile.fullName || identity?.profile.displayName}
              </h1>
              <p dir="auto">
                {profile.headline ||
                  roleCatalog[profile.targetRoleId].label[locale]}
              </p>
              <progress
                max={100}
                value={completeness}
                aria-label={say(
                  "Personal profile completeness",
                  "اكتمال البيانات الشخصية",
                )}
              />
              <span>
                {completeness}%{" "}
                {say(
                  "personal profile complete · not a skill score",
                  "اكتمال البيانات الشخصية · ليس تقييم مهارات",
                )}
              </span>
              <ShowcaseIdentity data={showcase.data} locale={locale} />
            </div>
            <div className="member-hero-art" aria-hidden="true">
              <ChartNoAxesCombined />
              <div className="member-skyline">
                {[38, 70, 50, 92, 63, 110, 80].map((height, index) => (
                  <i key={index} style={{ height }} />
                ))}
              </div>
              <Award />
            </div>
          </section>
          <div className="member-hero-actions">
            <span>
              {[profile.location, profile.country].filter(Boolean).join(" · ")}
            </span>
            <Link href={`/${locale}/career-profile/edit`}>
              <Pencil size={15} />
              {say("Edit career details", "تعديل البيانات المهنية")}
            </Link>
            <Link
              href={`/${locale}/student-profile?next=${encodeURIComponent(`/${locale}/career-profile`)}`}
            >
              {say("Personal details & experience", "البيانات الشخصية والخبرة")}
            </Link>
          </div>
          <nav
            className="member-tabs"
            aria-label={say("Profile sections", "أقسام البروفايل")}
          >
            {(
              ["profile", "courses", "progress", "certifications"] as Tab[]
            ).map((value) => (
              <button
                key={value}
                aria-current={tab === value ? "page" : undefined}
                onClick={() => selectTab(value)}
              >
                {
                  {
                    profile: say("Profile", "البروفايل"),
                    courses: say("Courses", "الكورسات"),
                    progress: say("Progress", "التقدم"),
                    certifications: say("Certifications", "الشهادات"),
                  }[value]
                }
              </button>
            ))}
          </nav>
          <div className="member-feedback" role="status" aria-live="polite">
            {message}
            {loadError && (
              <p>
                {say(
                  "Your records could not be loaded. Nothing has been replaced.",
                  "تعذّر تحميل بياناتك. لم يتم استبدال أي بيانات.",
                )}
              </p>
            )}
            {(!portfolio || loadError) && (
              <button
                disabled={busy}
                onClick={() => setRefresh((value) => value + 1)}
              >
                {say("Reload records", "أعد تحميل البيانات")}
              </button>
            )}
          </div>
          <div className="member-columns">
            <div>
              {tab === "profile" && (
                <>
                  <ShowcasePanel controller={showcase} locale={locale} owner={owner} />
                  <section className="member-card">
                    <header>
                      <h2>{say("Your learning journey", "رحلتك في التعلم")}</h2>
                      <button onClick={() => selectTab("courses")}>
                        {say("All courses", "كل الكورسات")}
                      </button>
                    </header>
                    {trainingRows()}
                  </section>
                  <section className="member-card">
                    <header>
                      <h2>{say("About you", "نبذة عنك")}</h2>
                      <span className="member-pill">
                        {
                          {
                            student: say("Student", "طالب"),
                            "fresh-graduate": say("Graduate", "خريج"),
                            junior: say("Junior professional", "بداية مهنية"),
                            mid: say("Working professional", "محترف"),
                            senior: say(
                              "Experienced professional",
                              "خبرة متقدمة",
                            ),
                          }[profile.experienceLevel]
                        }
                      </span>
                    </header>
                    <p>
                      {profile.summary ||
                        say(
                          "Add your professional summary from Edit career details.",
                          "أضف نبذة مهنية من تعديل البيانات المهنية.",
                        )}
                    </p>
                    <dl className="member-details">
                      {[
                        [
                          say("Email", "الإيميل"),
                          identity?.user.email || profile.email,
                        ],
                        [say("Phone", "التليفون"), profile.phone],
                        [
                          say("Location", "المكان"),
                          [profile.location, profile.country]
                            .filter(Boolean)
                            .join(" · "),
                        ],
                        [
                          say("Languages", "اللغات"),
                          profile.languages.join(" · "),
                        ],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd dir="auto">
                            {value || say("Not added", "لم تُضف")}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                  <section className="member-card">
                    <h2>
                      {say(
                        "Education & real work experience",
                        "التعليم والخبرة العملية الفعلية",
                      )}
                    </h2>
                    {profile.education.map((row) => (
                      <article className="member-record" key={row.id}>
                        <GraduationCap />
                        <div>
                          <b>
                            {row.degree} {row.field}
                          </b>
                          <p>
                            {row.institution} · {row.graduationYear}
                          </p>
                        </div>
                      </article>
                    ))}
                    {profile.experience.map((row) => (
                      <article className="member-record" key={row.id}>
                        <FileText />
                        <div>
                          <b>
                            {row.title} — {row.company}
                          </b>
                          <p>
                            {row.startDate} —{" "}
                            {row.current
                              ? say("Present", "حتى الآن")
                              : row.endDate}
                          </p>
                          <p>{row.description}</p>
                        </div>
                      </article>
                    ))}
                    {!profile.education.length &&
                      !profile.experience.length && (
                        <p>
                          {say(
                            "No education or work experience added yet.",
                            "لم تُضف بيانات تعليم أو خبرة بعد.",
                          )}
                        </p>
                      )}
                  </section>
                  <section className="member-card">
                    <h2>{say("Profile photo", "صورة البروفايل")}</h2>
                    <ProfilePhoto
                      locale={locale}
                      name={profile.fullName}
                      editable
                    />
                  </section>
                </>
              )}
              {tab === "courses" && (
                <>
                  <section className="member-card">
                    <h2>
                      {say(
                        "Platform courses & simulations",
                        "كورسات ومحاكاة المنصة",
                      )}
                    </h2>
                    {trainingRows()}
                  </section>
                  <section className="member-card">
                    <header>
                      <h2>
                        {say("Courses you have taken", "الكورسات اللي درستها")}
                      </h2>
                      <button
                        className="member-primary"
                        disabled={
                          !portfolio ||
                          busy ||
                          portfolio.courses.length >= PORTFOLIO_LIMIT
                        }
                        onClick={() => {
                          setEditing(null);
                          setAddingCourse(true);
                        }}
                      >
                        <Plus size={16} />
                        {say("Add course", "أضف كورس")}
                      </button>
                    </header>
                    <p className="member-note">
                      {say(
                        "External courses are self-reported, not platform-assessed skills. Up to 20 courses.",
                        "الكورسات الخارجية مضافة منك، وليست تقييم مهارات من المنصة. حتى 20 كورسًا.",
                      )}
                    </p>
                    {addingCourse && (
                      <form
                        key={editing?.id ?? "new"}
                        className="member-form"
                        onSubmit={submitCourse}
                      >
                        <h3>
                          {editing
                            ? say("Edit course", "تعديل الكورس")
                            : say("New course", "كورس جديد")}
                        </h3>
                        <label>
                          {say("Course title", "اسم الكورس")}
                          <input
                            name="title"
                            required
                            minLength={2}
                            maxLength={160}
                            defaultValue={editing?.title}
                          />
                        </label>
                        <label>
                          {say("Training provider", "جهة التدريب")}
                          <input
                            name="provider"
                            required
                            minLength={2}
                            maxLength={160}
                            defaultValue={editing?.provider}
                          />
                        </label>
                        <label>
                          {say(
                            "Course date (optional)",
                            "تاريخ الكورس (اختياري)",
                          )}
                          <input
                            type="month"
                            name="date"
                            defaultValue={editing?.date}
                          />
                        </label>
                        <label>
                          {say("Your course status", "حالة الكورس")}
                          <select
                            name="status"
                            defaultValue={editing?.status ?? "in-progress"}
                          >
                            <option value="not-started">
                              {status("not-started")}
                            </option>
                            <option value="in-progress">
                              {status("in-progress")}
                            </option>
                            <option value="completed">
                              {status("completed")}
                            </option>
                          </select>
                        </label>
                        <label>
                          {say(
                            "What you learned (optional)",
                            "اتعلمت إيه (اختياري)",
                          )}
                          <textarea
                            name="notes"
                            maxLength={1000}
                            defaultValue={editing?.notes}
                          />
                        </label>
                        <div className="member-form-actions">
                          <button
                            className="member-primary"
                            disabled={busy}
                            type="submit"
                          >
                            {busy
                              ? say("Saving…", "جارٍ الحفظ…")
                              : say("Save course", "احفظ الكورس")}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setAddingCourse(false);
                              setEditing(null);
                            }}
                          >
                            {say("Cancel", "إلغاء")}
                          </button>
                        </div>
                      </form>
                    )}
                    {portfolio?.courses.map((course) => (
                      <article className="member-record" key={course.id}>
                        <span className="member-course-icon">
                          <BookOpen />
                        </span>
                        <div>
                          <b dir="auto">{course.title}</b>
                          <p dir="auto">
                            {course.provider}{" "}
                            {course.date && `· ${course.date}`}
                          </p>
                          <span
                            className="member-pill"
                            data-completed={course.status === "completed"}
                          >
                            {status(course.status)}
                          </span>
                          {course.notes && <p dir="auto">{course.notes}</p>}
                          <small>
                            {say("Self-reported course", "كورس مضاف منك")}
                          </small>
                        </div>
                        <div className="member-record-actions">
                          <button
                            disabled={busy}
                            onClick={() => {
                              setEditing(course);
                              setAddingCourse(true);
                            }}
                            aria-label={`${say("Edit", "تعديل")} ${course.title}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => {
                              if (
                                window.confirm(
                                  say(
                                    "Remove this course from your private profile?",
                                    "تحذف الكورس من بروفايلك الخاص؟",
                                  ),
                                )
                              )
                                void mutate({
                                  action: "remove-course",
                                  id: course.id,
                                });
                            }}
                            aria-label={`${say("Remove", "حذف")} ${course.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </article>
                    ))}
                    {portfolio?.courses.length === 0 && (
                      <p className="member-empty">
                        {say(
                          "Add your university, online or professional training courses here.",
                          "أضف كورسات الجامعة أو الأونلاين أو التدريب المهني هنا.",
                        )}
                      </p>
                    )}
                  </section>
                </>
              )}
              {tab === "progress" && (
                <section className="member-card">
                  <h2>
                    {say(
                      "Progress earned through your work",
                      "التقدم الناتج عن شغلك",
                    )}
                  </h2>
                  {trainingRows()}
                  <div className="member-stats">
                    <div>
                      <b>{demonstrated}</b>
                      <span>
                        {say(
                          "Demonstrated / verified skills",
                          "مهارات مثبتة / موثقة",
                        )}
                      </span>
                    </div>
                    <div>
                      <b>{evidence.length}</b>
                      <span>
                        {say("Skill evidence records", "سجلات أدلة مهارات")}
                      </span>
                    </div>
                  </div>
                  <p>
                    {say(
                      "Uploaded certificates and external courses never increase these skill scores. Simulation progress is separate from professional certification.",
                      "الشهادات المرفوعة والكورسات الخارجية لا تزود تقييم المهارات. تقدم المحاكاة منفصل عن الشهادات المهنية.",
                    )}
                  </p>
                  <Link
                    className="member-primary"
                    href={`/${locale}/career-profile/skills`}
                  >
                    {say("Open Skill Passport", "افتح جواز المهارات")}
                  </Link>
                  <p>
                    {say(
                      "First Shift reviewed documents",
                      "مستندات الوردية المُراجعة",
                    )}
                    : {activitySummary(evidence, "first-day/").completed}/3
                  </p>
                </section>
              )}
              {tab === "certifications" && (
                <section className="member-card">
                  <header>
                    <h2>{say("Your certifications", "شهاداتك")}</h2>
                    <button
                      className="member-primary"
                      disabled={
                        !portfolio ||
                        busy ||
                        portfolio.certificates.length >= PORTFOLIO_LIMIT
                      }
                      onClick={() => setAddingCertificate(true)}
                    >
                      <Plus size={16} />
                      {say("Add certificate", "أضف شهادة")}
                    </button>
                  </header>
                  <p className="member-note">
                    {say(
                      "Upload a clear image of your course or professional certificate. Private, self-reported and not verified by Debit & Credit. Up to 20 certificates. Images are never added to your ATS CV or leaderboard.",
                      "ارفع صورة واضحة لشهادة كورس أو شهادة مهنية. خاصة بحسابك ومضافة منك، وليست موثقة من Debit & Credit. حتى 20 شهادة. الصور لا تدخل الـCV بنظام ATS أو ترتيب المنافسات.",
                    )}
                  </p>
                  {addingCertificate && (
                    <form className="member-form" onSubmit={submitCertificate}>
                      <label>
                        {say("Certificate title", "اسم الشهادة")}
                        <input
                          name="title"
                          required
                          minLength={2}
                          maxLength={160}
                        />
                      </label>
                      <label>
                        {say("Issuing organization", "الجهة المانحة")}
                        <input
                          name="issuer"
                          required
                          minLength={2}
                          maxLength={160}
                        />
                      </label>
                      <label>
                        {say(
                          "Issue date (optional)",
                          "تاريخ الإصدار (اختياري)",
                        )}
                        <input type="month" name="date" />
                      </label>
                      <label>
                        {say(
                          "Credential ID (optional)",
                          "رقم الشهادة (اختياري)",
                        )}
                        <input name="credentialId" maxLength={120} />
                      </label>
                      <label className="member-file">
                        {say("Certificate image", "صورة الشهادة")}
                        <input
                          type="file"
                          name="image"
                          aria-label={say("Certificate image", "صورة الشهادة")}
                          aria-describedby="certificate-image-help"
                          required
                          accept="image/jpeg,image/png,image/webp"
                        />
                        <small id="certificate-image-help">
                          {say(
                            "JPG / PNG / WebP, up to 5 MB. Full aspect ratio preserved; longest saved edge 1600 px. Location metadata removed.",
                            "JPG / PNG / WebP حتى 5MB. نحافظ على أبعاد الشهادة بدون قص، وأطول ضلع 1600 بكسل. تُحذف بيانات الموقع.",
                          )}
                        </small>
                      </label>
                      <div className="member-form-actions">
                        <button
                          className="member-primary"
                          disabled={busy}
                          type="submit"
                        >
                          {busy
                            ? say("Saving…", "جارٍ الحفظ…")
                            : say("Save certificate", "احفظ الشهادة")}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setAddingCertificate(false)}
                        >
                          {say("Cancel", "إلغاء")}
                        </button>
                      </div>
                    </form>
                  )}
                  <div className="member-certificates">
                    {portfolio?.certificates.map((certificate) => (
                      <article
                        className="member-certificate"
                        key={certificate.id}
                      >
                        <div className="member-certificate-art">
                          <Award size={42} />
                          <LockKeyhole size={15} />
                        </div>
                        <h3 dir="auto">{certificate.title}</h3>
                        <p dir="auto">{certificate.issuer}</p>
                        <small>
                          {certificate.date}
                          {certificate.credentialId &&
                            ` · ${certificate.credentialId}`}
                        </small>
                        <span className="member-pill">
                          {say("Uploaded · not verified", "مرفوعة · غير موثقة")}
                        </span>
                        <button
                          disabled={busy}
                          onClick={() => void viewCertificate(certificate)}
                        >
                          {say("View certificate image", "عرض صورة الشهادة")}
                        </button>
                        <button
                          disabled={busy}
                          className="member-remove"
                          aria-label={`${say("Remove", "حذف")} ${certificate.title}`}
                          onClick={() => {
                            if (
                              window.confirm(
                                say(
                                  "Permanently remove this certificate and its stored image?",
                                  "تحذف الشهادة وصورتها المحفوظة نهائيًا؟",
                                ),
                              )
                            ) {
                              setPreview(null);
                              void mutate({
                                action: "remove-certificate",
                                id: certificate.id,
                              });
                            }
                          }}
                        >
                          <Trash2 size={14} />
                          {say("Remove", "حذف")}
                        </button>
                      </article>
                    ))}
                  </div>
                  {portfolio?.certificates.length === 0 && (
                    <p className="member-empty">
                      {say(
                        "Your first certificate belongs here. Nothing is published automatically.",
                        "أول شهادة ليك مكانها هنا. لا يتم نشر أي شيء تلقائيًا.",
                      )}
                    </p>
                  )}
                </section>
              )}
            </div>
            <aside>
              <section className="member-card">
                <h2>{say("Recent activity", "آخر نشاط")}</h2>
                {latest.length ? (
                  latest.map((row) => (
                    <article className="member-activity" key={row.activityId}>
                      <span className="member-course-icon">
                        <FileText size={18} />
                      </span>
                      <div>
                        <small>
                          {say("Accounting simulation", "محاكاة محاسبية")}
                        </small>
                        <b>{activityLabel(row, locale)}</b>
                        <p>
                          {say("Accuracy", "الدقة")}: {row.accuracy}%
                        </p>
                        <progress
                          max={100}
                          value={row.accuracy}
                          aria-label={row.activityId}
                        />
                        <time dateTime={row.completedAt}>
                          {new Date(row.completedAt).toLocaleDateString(
                            locale === "ar" ? "ar-EG" : "en-GB",
                          )}
                        </time>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="member-empty">
                    {say(
                      "Complete your first accounting task to see real activity here.",
                      "حل أول تاسك محاسبي علشان يظهر نشاطك الحقيقي هنا.",
                    )}
                  </p>
                )}
              </section>
              <section className="member-card member-next">
                <GraduationCap size={32} />
                <h2>
                  {say("Keep your journey connected", "كمّل رحلتك خطوة بخطوة")}
                </h2>
                <p>
                  {say(
                    "Practice in the game → build skill evidence → update your English CV.",
                    "اتدرب في اللعب ← أثبت مهاراتك ← الـCV بالإنجليزي يتحدث.",
                  )}
                </p>
                <Link className="member-primary" href={nextRoute}>
                  {say("Continue my journey", "كمّل رحلتي")}
                  <ChevronRight size={16} />
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </div>
      {preview && preview.owner === owner && (
        <CertificateDialog close={() => setPreview(null)}>
          <header>
            <h2 id="certificate-preview-title">{preview.certificate.title}</h2>
            <button
              onClick={() => setPreview(null)}
              aria-label={say("Close certificate", "إغلاق الشهادة")}
            >
              <X />
            </button>
          </header>
          <Image
            src={preview.image}
            width={preview.certificate.width}
            height={preview.certificate.height}
            alt={preview.certificate.title}
            unoptimized
          />
          <p>
            {say(
              "Private upload · not independently verified",
              "صورة خاصة مرفوعة · لم يتم التحقق منها مستقلًا",
            )}
          </p>
        </CertificateDialog>
      )}
    </main>
  );
}

function activityLabel(row: SkillEvidence, locale: Locale) {
  const labels: Record<string, { en: string; ar: string }> = {
    "student-unit1/document-control": {
      en: "Duplicate document review",
      ar: "مراجعة تكرار المستندات",
    },
    "student-unit1/ledger-cash": {
      en: "Cash ledger reconciliation",
      ar: "مراجعة رصيد أستاذ النقدية",
    },
    "student-unit1/trial-balance": {
      en: "Trial balance preparation",
      ar: "إعداد ميزان المراجعة",
    },
    "student-unit1/classification-error": {
      en: "Equipment reclassification",
      ar: "تصحيح تصنيف المعدات",
    },
    "student-unit1/worksheet": {
      en: "Trial balance spreadsheet",
      ar: "ورقة عمل ميزان المراجعة",
    },
  };
  return (
    labels[row.activityId]?.[locale] ??
    (locale === "ar" ? row.titleAr : row.titleEn)
  );
}

function CertificateDialog({
  children,
  close,
}: {
  children: React.ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="member-certificate-dialog"
      aria-labelledby="certificate-preview-title"
      onCancel={close}
      onClose={close}
    >
      {children}
    </dialog>
  );
}
