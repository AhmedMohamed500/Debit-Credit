"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  FileCheck2,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Menu,
  Share2,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { ProfilePhoto } from "./profile-photo";
import type { Locale } from "@/types";

type Section = "dashboard" | "cv" | "skills" | "edit";

export function ApprovedCareerShell({
  locale,
  section,
  children,
}: {
  locale: Locale;
  section: Section;
  children: ReactNode;
}) {
  const identity = useCloudIdentity();
  const pathname = usePathname() || `/${locale}/career-profile`;
  const [hash, setHash] = useState("");
  const ar = locale === "ar";
  const say = (en: string, arabic: string) => (ar ? arabic : en);
  useEffect(() => {
    const read = () => setHash(window.location.hash.slice(1));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [pathname]);

  const base = `/${locale}/career-profile`;
  const navigation = [
    { href: `/${locale}`, en: "My journey", ar: "رحلتي", icon: LayoutDashboard },
    { href: `/${locale}/game/student`, en: "Learning missions", ar: "مهام التعلم", icon: GraduationCap },
    { href: `/${locale}/game/first-shift`, en: "First Shift", ar: "أول وردية", icon: BriefcaseBusiness },
    { href: `/${locale}/academy`, en: "Accounting library", ar: "المكتبة المحاسبية", icon: BookOpen },
    { href: `${base}/skills`, en: "Skill Passport", ar: "جواز المهارات", icon: ShieldCheck },
    { href: base, en: "Career profile", ar: "الملف المهني", icon: UserRound },
    { href: `${base}/cv`, en: "English CV", ar: "الـCV الإنجليزي", icon: FileText },
    { href: `${base}#settings`, en: "Sharing & visibility", ar: "المشاركة والظهور", icon: Share2 },
    { href: `/${locale}/account`, en: "Settings", ar: "الإعدادات", icon: Settings },
  ];
  const tabs = [
    { href: base, en: "Overview", ar: "نظرة عامة", icon: Home, active: section === "dashboard" && (!hash || hash === "profile") },
    { href: `${base}/cv`, en: "ATS CV", ar: "الـCV", icon: FileText, active: section === "cv" },
    { href: `${base}#skills`, en: "Skills", ar: "المهارات", icon: Sparkles, active: section === "dashboard" && hash === "skills" },
    { href: `${base}/skills`, en: "Skill evidence", ar: "أدلة المهارات", icon: ShieldCheck, active: section === "skills" },
    { href: `${base}#courses`, en: "Courses", ar: "الكورسات", icon: BookOpen, active: section === "dashboard" && hash === "courses" },
    { href: `${base}#certifications`, en: "Certificates", ar: "الشهادات", icon: Award, active: section === "dashboard" && hash === "certifications" },
    { href: `${base}#work`, en: "Projects & experience", ar: "الأعمال والخبرة", icon: FileCheck2, active: section === "dashboard" && hash === "work" },
  ];

  const sideLinks = (
    <nav aria-label={say("Career navigation", "تنقل المسار المهني")}>
      {navigation.map(({ href, en, ar: arabic, icon: Icon }) => {
        const active = (hash ? `${pathname}#${hash}` : pathname) === href || (href === base && (section === "edit" || hash === "profile"));
        const content = <><Icon size={19} aria-hidden="true" /><span>{ar ? arabic : en}</span></>;
        return href.includes("#")
          ? <a key={href} href={href} aria-current={active ? "page" : undefined}>{content}</a>
          : <Link key={href} href={href} aria-current={active ? "page" : undefined}>{content}</Link>;
      })}
    </nav>
  );

  return (
    <div className="career-approved" dir={ar ? "rtl" : "ltr"}>
      <header className="career-approved-header">
        <Link className="career-approved-brand" href={`/${locale}`}>
          <BookOpen size={30} aria-hidden="true" />
          <span>
            <strong>Debit &amp; Credit</strong>
            <small>{say("Learn accounting by practice", "تعلّم المحاسبة بالممارسة")}</small>
          </span>
        </Link>
        <nav aria-label={say("Main site navigation", "تنقل الموقع الرئيسي")}>
          <Link href={`/${locale}`}>{say("Home", "الرئيسية")}</Link>
          <Link href={`/${locale}/game/student`}>{say("Learning", "التعلم")}</Link>
          <Link href={`/${locale}/academy`}>{say("Library", "المكتبة")}</Link>
          <Link href={base} aria-current={section === "dashboard" ? "page" : undefined}>{say("Profile", "الملف المهني")}</Link>
        </nav>
        <div className="career-approved-header-actions">
          <Link className="career-approved-language" href={`/${ar ? "en" : "ar"}${pathname.replace(/^\/(ar|en)/, "")}${hash ? `#${hash}` : ""}`}>
            {ar ? "EN" : "ع"}
          </Link>
          <Link className="career-approved-account" href={`/${locale}/account`}>
            <ProfilePhoto locale={locale} name={identity?.profile.displayName || ""} />
            <span>{identity?.profile.displayName || say("My account", "حسابي")}</span>
            <ChevronDown size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>
      <div className="career-approved-stage">
        <aside className="career-approved-sidebar" dir={ar ? "rtl" : "ltr"}>
          {sideLinks}
          <p>{say("Your work, skills and CV in one connected journey.", "شغلك ومهاراتك وسيرتك في رحلة واحدة مترابطة.")}</p>
        </aside>
        <div className="career-approved-main" dir={ar ? "rtl" : "ltr"}>
          <details className="career-approved-mobile-navigation">
            <summary><Menu size={19} /> {say("Career menu", "قائمة الملف المهني")}</summary>
            {sideLinks}
          </details>
          <section className="career-approved-hero" aria-labelledby="career-approved-title">
            <div>
              <span>{say("YOUR CAREER RECORD", "سِجلّك المهني")}</span>
              <h1 id="career-approved-title">{say("Career profile & CV", "الملف المهني والـCV")}</h1>
              <p>{say("Your saved profile, real practice and eligible evidence—connected in one place.", "بياناتك المحفوظة وتدريبك الحقيقي وأدلته المؤهلة في مكان واحد.")}</p>
            </div>
          </section>
          <nav className="career-approved-tabs" aria-label={say("Career profile sections", "أقسام الملف المهني")}>
            {tabs.map(({ href, en, ar: arabic, icon: Icon, active }) => (
              <a href={href} key={href} aria-current={active ? "page" : undefined}>
                <Icon size={17} aria-hidden="true" />
                {ar ? arabic : en}
              </a>
            ))}
          </nav>
          <div className="career-approved-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
