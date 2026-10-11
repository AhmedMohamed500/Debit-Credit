"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Award,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  MapPin,
  Shield,
  Target,
} from "lucide-react";
import { ThemeToggle } from "@/components/platform/theme-provider";
import { ProfilePhoto } from "./profile-photo";
import { Availability, SocialLinks } from "./showcase";
import { roleCatalog, skillCatalog } from "@/lib/career/catalog";
import type {
  CareerProfile,
  SkillEvidence,
  SkillResult,
} from "@/lib/career/model";
import type { Portfolio } from "@/lib/career/portfolio";
import type { Showcase } from "@/lib/career/showcase";
import type { Locale } from "@/types";
import "@/app/talent-platform.css";

export function CareerPass({
  data,
  profile,
  locale,
  open,
}: {
  data: Showcase | null;
  profile: CareerProfile;
  locale: Locale;
  open: () => void;
}) {
  const [qr, setQr] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    let alive = true;
    setQr("");
    setUrl("");
    if (data?.token) {
      const link = `${window.location.origin}/${locale}/portfolio/${data.token}`;
      setUrl(link);
      void QRCode.toDataURL(link, {
        margin: 2,
        width: 180,
        color: { dark: "#143c47", light: "#ffffff" },
      })
        .then((value) => {
          if (alive) setQr(value);
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [data?.token, locale]);
  const ar = locale === "ar";
  return (
    <aside className="career-pass">
      <small>{ar ? "بطاقتك المهنية" : "CAREER PASS"}</small>
      <b dir="auto">{profile.fullName}</b>
      <span>{roleCatalog[profile.targetRoleId].label[locale]}</span>
      <span dir="auto">
        {[profile.location, profile.country].filter(Boolean).join(", ")}
      </span>
      {data?.token ? (
        <>
          <b dir="ltr">DC-{data.token.slice(0, 12).toUpperCase()}</b>
          <small>
            {ar
              ? "معرّف مشاركة · ليس رقم الحساب"
              : "Share identifier · not account ID"}
          </small>
        </>
      ) : (
        <b>{ar ? "المشاركة غير مفعّلة" : "Private by default"}</b>
      )}
      {qr ? (
        <Image
          src={qr}
          alt={
            ar
              ? "QR للرابط العام المختار"
              : "QR for your selected public profile"
          }
          width={116}
          height={116}
          unoptimized
        />
      ) : (
        <Shield size={42} aria-hidden="true" />
      )}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {ar ? "عرض البروفايل العام" : "View public profile"}
        </a>
      )}
      <button onClick={open}>
        {ar ? "الكارت واختيارات المشاركة" : "Card & sharing choices"}
      </button>
    </aside>
  );
}
export function CandidateHero({
  profile,
  locale,
  showcase,
  completeness,
  open,
}: {
  profile: CareerProfile;
  locale: Locale;
  showcase: Showcase | null;
  completeness: number;
  open: () => void;
}) {
  const ar = locale === "ar";
  return (
    <>
      <section className="member-hero professional-hero">
        <div className="member-portrait">
          <ProfilePhoto locale={locale} name={profile.fullName} />
        </div>
        <div className="member-hero-copy">
          <small>
            {ar ? "ملفك المهني في المحاسبة" : "ACCOUNTING CAREER PORTFOLIO"}
          </small>
          <h1 dir="auto">{profile.fullName}</h1>
          <p className="candidate-role">
            {profile.headline ||
              roleCatalog[profile.targetRoleId].label[locale]}
          </p>
          <span className="candidate-location">
            <MapPin size={15} />
            {[profile.location, profile.country].filter(Boolean).join(", ") ||
              (ar ? "لم تضف المكان بعد" : "Location not added")}
          </span>
          {showcase && (
            <div className="showcase-identity">
              <Availability
                value={showcase.settings.availability}
                locale={locale}
              />
              <SocialLinks socials={showcase.settings.socials} />
            </div>
          )}
          <p className="candidate-summary" dir="auto">
            {profile.summary ||
              (ar
                ? "أعمالك التدريبية وأدلة مهاراتك تجمع هنا في ملف مهني واضح. المحاكاة ليست خبرة توظيف."
                : "Your practical training and skill evidence, brought together in a professional portfolio. Simulation is not employment.")}
          </p>
          <div className="candidate-actions">
            <Link
              className="member-primary"
              href={`/${locale}/career-profile/cv`}
            >
              <FileText size={16} />
              {ar ? "معاينة CV / حفظ PDF" : "Preview CV / Save PDF"}
            </Link>
            <button onClick={open}>
              {ar ? "إدارة المشاركة" : "Manage sharing"}
            </button>
            <ThemeToggle compact />
          </div>
          <span className="candidate-completeness">
            {completeness}%{" "}
            {ar
              ? "اكتمال البيانات الشخصية · ليس تقييم مهارات"
              : "personal profile complete · not a skill score"}
          </span>
        </div>
        <CareerPass
          data={showcase}
          profile={profile}
          locale={locale}
          open={open}
        />
      </section>
    </>
  );
}
export function CandidateSkills({
  passport,
  locale,
  limit,
}: {
  passport: SkillResult[];
  locale: Locale;
  limit?: number;
}) {
  const ar = locale === "ar",
    supported = passport.filter((row) => row.status !== "unassessed");
  return (
    <section className="member-card candidate-skill-section">
      <h2>
        <Shield size={18} />
        {ar ? "مهارات مدعومة بالممارسة" : "Skills supported by practice"}
      </h2>
      <p className="member-note">
        {ar
          ? "تقييم الدليل التدريبي، وليس نسبة ملاءمة لوظيفة. الكورسات والشهادات المضافة لا تمنح اعتمادًا."
          : "Evidence scores, not hiring-match percentages. Added courses and certificates do not award assessed skills."}
      </p>
      <div className="candidate-skills">
        {supported.slice(0, limit).map((row) => (
          <article key={row.skillId}>
            <b>{skillCatalog[row.skillId].label[locale]}</b>
            <small>
              {row.status === "verified"
                ? ar
                  ? "موثقة حسب قواعد الدليل"
                  : "Verified under evidence rules"
                : row.status === "demonstrated"
                  ? ar
                    ? "تم إثباتها"
                    : "Demonstrated"
                  : ar
                    ? "تم التدريب"
                    : "Practiced"}{" "}
              · {row.evidenceCount} {ar ? "دليل" : "evidence"}
            </small>
            {row.score !== null && (
              <>
                <progress
                  value={row.score}
                  max={100}
                  aria-label={skillCatalog[row.skillId].label[locale]}
                />
                <span>
                  {row.score}% {ar ? "تقييم الدليل" : "evidence score"}
                </span>
              </>
            )}
          </article>
        ))}
      </div>
      {!supported.length && (
        <p>
          {ar
            ? "أكمل مهمة محاسبية ليظهر دليل مهاراتك هنا."
            : "Complete an accounting task to build your first supported skill."}
        </p>
      )}
    </section>
  );
}
export function ProfessionalOverview({
  profile,
  locale,
  portfolio,
  evidence,
  passport,
  showcase,
  open,
}: {
  profile: CareerProfile;
  locale: Locale;
  portfolio: Portfolio | null;
  evidence: SkillEvidence[];
  passport: SkillResult[];
  showcase: Showcase | null;
  open: (
    tab: "skills" | "work" | "courses" | "certifications" | "progress",
  ) => void;
}) {
  const ar = locale === "ar",
    supported = passport.filter((row) => row.status !== "unassessed"),
    gaps = Object.keys(roleCatalog[profile.targetRoleId].skills)
      .filter((id) => !supported.some((row) => row.skillId === id))
      .slice(0, 3);
  return (
    <div className="candidate-overview">
      <aside className="candidate-basics">
        <section className="member-card">
          <h2>
            <BriefcaseBusiness size={18} />
            {ar ? "نبذة عني" : "About me"}
          </h2>
          <p dir="auto">
            {profile.summary ||
              (ar
                ? "أضف نبذة مهنية من تعديل البيانات. نتائج المحاكاة تُعرض منفصلة عن الخبرة الفعلية."
                : "Add a professional summary in your career details. Simulation outcomes remain separate from real employment.")}
          </p>
        </section>
        <section className="member-card">
          <h2>
            <GraduationCap size={18} />
            {ar ? "المعلومات الأساسية" : "Basic information"}
          </h2>
          <dl className="member-details">
            {[
              [
                ar ? "التعليم" : "Education",
                profile.education
                  .map(
                    (row) => `${row.institution} · ${row.degree} ${row.field}`,
                  )
                  .join(" / "),
              ],
              [ar ? "سنة التخرج" : "Graduation", profile.graduationYear],
              [
                ar ? "المكان" : "Location",
                [profile.location, profile.country].filter(Boolean).join(", "),
              ],
              [ar ? "نوع العمل" : "Work type", profile.preferredWorkType],
              [ar ? "اللغات" : "Languages", profile.languages.join(" · ")],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd dir="auto">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
        {showcase && (
          <section className="member-card">
            <h2>{ar ? "روابط مهنية" : "Professional links"}</h2>
            <SocialLinks socials={showcase.settings.socials} />
          </section>
        )}
      </aside>
      <div className="candidate-main">
        <div className="candidate-metrics">
          {[
            [
              supported.length,
              ar ? "مهارات مدعومة" : "Supported skills",
              Shield,
            ],
            [
              portfolio
                ? portfolio.courses.filter((row) => row.status === "completed")
                    .length
                : "—",
              ar
                ? "كورسات مكتملة · مضافة منك"
                : "Completed courses · self-reported",
              GraduationCap,
            ],
            [
              portfolio?.certificates.length ?? "—",
              ar
                ? "شهادات مضافة · غير موثقة"
                : "Certificates added · self-reported",
              Award,
            ],
            [
              new Set(evidence.map((row) => row.activityId)).size,
              ar ? "أنشطة تدريبية" : "Practical activities",
              FileText,
            ],
          ].map(([count, label, Icon]) => {
            const MetricIcon = Icon as typeof Shield;
            return (
              <article key={String(label)}>
                <MetricIcon size={22} />
                <b>{String(count)}</b>
                <small>{String(label)}</small>
              </article>
            );
          })}
        </div>
        <section className="member-card candidate-target">
          <h2>
            <Target size={18} />
            {ar ? "الهدف المهني" : "Career target"}
          </h2>
          <b>{roleCatalog[profile.targetRoleId].label[locale]}</b>
          <p>
            {ar
              ? "مجالات التطوير التالية بناءً على الأدلة المتاحة، وليست حكم توظيف:"
              : "Next development areas based on available evidence, not a hiring judgment:"}
          </p>
          <ul>
            {gaps.map((id) => (
              <li key={id}>
                {skillCatalog[id as keyof typeof skillCatalog].label[locale]}
              </li>
            ))}
          </ul>
          <button onClick={() => open("progress")}>
            {ar ? "عرض الرحلة المهنية" : "See career journey"}
          </button>
        </section>
        <CandidateSkills passport={passport} locale={locale} limit={6} />
        {supported.length > 6 && (
          <button onClick={() => open("skills")}>
            {ar ? "عرض كل المهارات المدعومة" : "View all supported skills"}
          </button>
        )}
        <section className="member-card">
          <header>
            <h2>
              {ar ? "أعمال المحاكاة المحاسبية" : "Accounting simulation work"}
            </h2>
            <button onClick={() => open("work")}>
              {ar ? "عرض الأعمال" : "View work"}
            </button>
          </header>
          <div className="candidate-work-grid">
            {showcase?.works.slice(0, 3).map((work) => (
              <article key={work.id}>
                <FileText size={25} />
                <h3>{work.title[locale]}</h3>
                <p>{work.summary[locale]}</p>
                <small>
                  {ar
                    ? "محاكاة تدريبية · مهمة مقبولة"
                    : "Training simulation · accepted task"}
                </small>
                <button onClick={() => open("work")}>
                  {ar ? "عرض الدليل" : "View evidence"}
                </button>
              </article>
            ))}
          </div>
          {!showcase?.works.length && (
            <p>
              {ar
                ? "أعمالك تظهر بعد قبول مهامها، دون مشروعات وهمية."
                : "Your work appears after its tasks are accepted. No placeholder projects."}
            </p>
          )}
        </section>
        <section className="member-card">
          <header>
            <h2>{ar ? "الشهادات" : "Certificates"}</h2>
            <button onClick={() => open("certifications")}>
              {ar ? "عرض وإدارة" : "View & manage"}
            </button>
          </header>
          {portfolio?.certificates.slice(0, 3).map((row) => (
            <article className="candidate-certificate-highlight" key={row.id}>
              <Award size={23} />
              <div>
                <b>{row.title}</b>
                <small>
                  {row.issuer} · {row.date} ·{" "}
                  {ar ? "مضافة منك، غير موثقة" : "Self-reported, not verified"}
                </small>
              </div>
            </article>
          ))}
          {!portfolio?.certificates.length && (
            <p>{ar ? "لم تضف شهادات بعد." : "No certificates added yet."}</p>
          )}
        </section>
      </div>
    </div>
  );
}
