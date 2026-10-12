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
  ArrowRight,
  CheckCircle2,
  ListChecks,
  Calendar,
  Clock,
  Languages,
  Download,
  Share2,
} from "lucide-react";
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
  locale,
  open,
}: {
  data: Showcase | null;
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
      <small>{ar ? "المعرّف المهني" : "Career ID"}</small>
      <b dir="ltr">
        {data?.token
          ? `DC-${data.token.slice(0, 12).toUpperCase()}`
          : "Debit & Credit"}
      </b>
      <div className="career-pass-qr">
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
          <div className="career-pass-private">
            <b>{ar ? "المشاركة غير مفعلة" : "Sharing is off"}</b>
            <small>
              {ar
                ? "فعّل رابط المشاركة لإنشاء QR حقيقي"
                : "Activate your share link to create a real QR"}
            </small>
            <button onClick={open}>
              {ar ? "تفعيل المشاركة" : "Activate sharing"}
            </button>
          </div>
        )}
      </div>
      {url && (
        <div className="career-pass-actions">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {ar ? "عرض البروفايل العام" : "View public profile"}
          </a>
          <button onClick={open}>
            <Share2 size={12} />
            {ar ? "مشاركة" : "Share"}
          </button>
        </div>
      )}
    </aside>
  );
}
export function CandidateHero({
  profile,
  locale,
  showcase,
  open,
}: {
  profile: CareerProfile;
  locale: Locale;
  showcase: Showcase | null;
  completeness: number;
  open: () => void;
}) {
  const role = roleCatalog[profile.targetRoleId].label;
  const headline =
    profile.headline && profile.headline !== role.ar
      ? profile.headline
      : role.en;
  const socials = {
    linkedin: profile.linkedIn || "",
    github: "",
    facebook: "",
    instagram: "",
    website: profile.portfolio || "",
    ...showcase?.settings.socials,
  };
  socials.linkedin ||= profile.linkedIn || "";
  socials.website ||= profile.portfolio || "";
  return (
    <>
      <section className="member-hero professional-hero">
        <div className="member-portrait">
          <ProfilePhoto locale={locale} name={profile.fullName} />
        </div>
        <div className="member-hero-copy" dir="ltr" lang="en">
          <h1 dir="auto">{profile.fullName}</h1>
          <p className="candidate-role">{headline}</p>
          <p className="candidate-target-role">Aspiring {role.en}</p>
          <div className="candidate-meta">
            <span className="candidate-location">
              <MapPin size={15} />
              {[profile.location, profile.country].filter(Boolean).join(", ") ||
                "Location not added"}
            </span>
            {showcase && (
              <div className="showcase-identity">
                <Availability
                  value={showcase.settings.availability}
                  locale="en"
                  compact
                />
              </div>
            )}
          </div>
          <p className="candidate-summary" dir="auto">
            {profile.summary ||
              "Your practical training and skill evidence, brought together in a professional portfolio. Simulation is not employment."}
          </p>
          <div className="candidate-actions">
            <Link
              className="member-primary"
              href={`/${locale}/career-profile/cv`}
            >
              <Download size={16} />
              Download CV
            </Link>
            <button onClick={open}>Contact</button>
            {
              <SocialLinks
                socials={{
                  ...socials,
                  facebook: "",
                  instagram: "",
                }}
              />
            }
          </div>
        </div>
        <CareerPass data={showcase} locale={locale} open={open} />
      </section>
    </>
  );
}
export function CandidateSkills({
  passport,
  locale,
  limit,
  onViewAll,
}: {
  passport: SkillResult[];
  locale: Locale;
  limit?: number;
  onViewAll?: () => void;
}) {
  const ar = locale === "ar",
    supported = passport.filter((row) => row.status !== "unassessed");
  return (
    <section className="member-card candidate-skill-section">
      <header>
        <h2>
          <Shield size={18} />
          {ar ? "مهارات مدعومة بالممارسة" : "Skills supported by practice"}
        </h2>
        {onViewAll && (
          <button onClick={onViewAll}>
            {ar ? "عرض الكل" : "View all skills"}
          </button>
        )}
      </header>
      <div className="candidate-skills">
        {supported.slice(0, limit).map((row) => (
          <article key={row.skillId}>
            <FileText size={20} aria-hidden="true" />
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
                <span
                  className="candidate-evidence-score"
                  title={
                    ar
                      ? "تقييم الدليل التدريبي، ليس ملاءمة للتوظيف"
                      : "Training evidence score, not hiring match"
                  }
                >
                  {row.score}%
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
  completeness,
  passport,
  showcase,
  nextAction,
  open,
}: {
  profile: CareerProfile;
  locale: Locale;
  portfolio: Portfolio | null;
  evidence: SkillEvidence[];
  completeness: number;
  passport: SkillResult[];
  showcase: Showcase | null;
  nextAction: { href: string; label: string };
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
              [
                ar ? "التوفر" : "Availability",
                showcase?.settings.availability.status === "work"
                  ? ar
                    ? "متاح للعمل"
                    : "Open to work"
                  : showcase?.settings.availability.status === "internship"
                    ? ar
                      ? "متاح لتدريب"
                      : "Internship"
                    : ar
                      ? "غير باحث حاليًا"
                      : "Not looking",
              ],
              [ar ? "اللغات" : "Languages", profile.languages.join(" · ")],
            ].map(([label, value], index) => {
              const Icon = [
                GraduationCap,
                Calendar,
                MapPin,
                BriefcaseBusiness,
                Clock,
                Languages,
              ][index];
              return (
                <div key={label}>
                  <dt>
                    <Icon size={16} />
                    {label}
                  </dt>
                  <dd dir="auto">{value || "—"}</dd>
                </div>
              );
            })}
          </dl>
        </section>
        {showcase && (
          <section className="member-card">
            <h2>{ar ? "روابط مهنية" : "Professional links"}</h2>
            <SocialLinks socials={showcase.settings.socials} details />
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
              showcase?.works.length ??
                new Set(evidence.map((row) => row.activityId)).size,
              ar ? "أعمال تدريبية" : "Practical projects",
              FileText,
            ],
            [
              `${completeness}%`,
              ar
                ? "اكتمال البيانات · لا يقيس التأهيل"
                : "Profile complete · not readiness",
              Target,
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
        <div className="candidate-development">
          <section className="member-card candidate-target">
            <h2>
              <Target size={18} />
              {ar ? "الهدف المهني" : "Career target"}
            </h2>
            <b>{roleCatalog[profile.targetRoleId].label[locale]}</b>
            <button onClick={() => open("progress")}>
              {ar ? "عرض خطة التعلم" : "See learning plan"}{" "}
              <ArrowRight size={14} />
            </button>
          </section>
          <section className="member-card candidate-next">
            <h2>
              <ListChecks size={18} />
              {ar ? "الخطوات التالية" : "Next steps"}
            </h2>
            <Link href={nextAction.href}>
              <CheckCircle2 size={14} />
              {nextAction.label}
            </Link>
            <Link href={`/${locale}/game/bank-reconciliation`}>
              <CheckCircle2 size={14} />
              {ar
                ? "تدرّب على التسوية البنكية"
                : "Practice bank reconciliation"}
            </Link>
            {gaps.length > 0 && (
              <button onClick={() => open("skills")}>
                <ArrowRight size={14} />
                {ar ? "راجع فجوات المهارات" : "Review skill development gaps"}
              </button>
            )}
          </section>
        </div>
        <CandidateSkills
          passport={passport}
          locale={locale}
          limit={6}
          onViewAll={() => open("skills")}
        />
        <section className="member-card">
          <header>
            <h2>
              <BriefcaseBusiness size={18} />
              {ar
                ? "الأعمال العملية والمشروعات (محاكاة)"
                : "Practical Work & Projects (Simulations)"}
            </h2>
            <button onClick={() => open("work")}>
              {ar ? "عرض الأعمال" : "View work"}
            </button>
          </header>
          <div className="candidate-work-grid">
            {showcase?.works
              .toSorted((a, b) => {
                const pins = showcase.settings.pinned;
                const rank = (id: (typeof pins)[number]) =>
                  pins.includes(id) ? pins.indexOf(id) : pins.length;
                return rank(a.id) - rank(b.id);
              })
              .slice(0, 3)
              .map((work) => (
                <article key={work.id}>
                  <Image
                    className="work-thumbnail"
                    src="/game/first-shift-desk-v2.png"
                    width={64}
                    height={68}
                    alt=""
                  />
                  <div>
                    <h3>{work.title[locale]}</h3>
                    <p>{work.summary[locale]}</p>
                    <span className="work-skill">{work.skill[locale]}</span>
                    <small>
                      {ar
                        ? "محاكاة تدريبية · مهمة مقبولة"
                        : "Training simulation · accepted task"}
                    </small>
                    <button onClick={() => open("work")}>
                      <ArrowRight size={14} />
                      <span className="sr-only">
                        {ar ? "عرض الدليل" : "View evidence"}
                      </span>
                    </button>
                  </div>
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
          <div className="candidate-certificates">
            {portfolio?.certificates.slice(0, 3).map((row) => (
              <article className="candidate-certificate-highlight" key={row.id}>
                <Award size={23} />
                <div>
                  <b>{row.title}</b>
                  <small>
                    {row.issuer} · {row.date} ·{" "}
                    {ar
                      ? "مضافة منك، غير موثقة"
                      : "Self-reported, not verified"}
                  </small>
                </div>
              </article>
            ))}
          </div>
          {!portfolio?.certificates.length && (
            <p>{ar ? "لم تضف شهادات بعد." : "No certificates added yet."}</p>
          )}
        </section>
      </div>
    </div>
  );
}
