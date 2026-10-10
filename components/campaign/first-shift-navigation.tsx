"use client";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  FileText,
  FolderOpen,
  UserRound,
} from "lucide-react";
import type { Locale } from "@/types";
import "@/app/first-day-entry.css";

export function FirstShiftNavigation({ locale }: { locale: Locale }) {
  const ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en);
  return (
    <header className="shift-navigation" dir={ar ? "rtl" : "ltr"}>
      <div className="shift-navigation-top">
        <Link className="shift-navigation-brand" href={`/${locale}`}>
          <span aria-hidden="true">▂▅▇</span>
          <b>
            Debit &amp; Credit
            <small>{say("Accounting workspace", "مساحة العمل المحاسبي")}</small>
          </b>
        </Link>
        <div className="shift-navigation-tools">
          <details
            className="shift-career-menu"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary")?.focus();
              }
            }}
          >
            <summary>
              <FolderOpen size={18} />
              {say("My career file", "ملفي المهني")}
            </summary>
            <nav aria-label={say("Career file", "الملف المهني")}>
              <Link href={`/${locale}/career-profile`}>
                <UserRound size={17} />
                {say("My profile", "بروفايلي")}
              </Link>
              <Link href={`/${locale}/career-profile/skills`}>
                <FolderOpen size={17} />
                {say("Skill evidence", "أدلة مهاراتي")}
              </Link>
              <Link href={`/${locale}/career-profile/cv`}>
                <FileText size={17} />
                English CV
              </Link>
              <Link href={`/${locale}/account-guide?return=first-day`}>
                <BookOpen size={17} />
                {say("Account guide", "دليل الحسابات")}
              </Link>
            </nav>
          </details>
          <Link
            className="shift-language"
            href={`/${ar ? "en" : "ar"}/game/first-shift`}
            aria-label={say("Switch to Arabic", "التبديل للإنجليزية")}
          >
            {ar ? "EN" : "ع"}
          </Link>
        </div>
      </div>
      <nav
        className="shift-breadcrumb"
        aria-label={say("Learning path", "مسار التعلم")}
      >
        <Link href={`/${locale}`}>{say("My journey", "رحلتي")}</Link>
        <ChevronRight aria-hidden="true" />
        <Link href={`/${locale}/game/student`}>
          {say("Foundations", "تدريب الأساس")}
        </Link>
        <ChevronRight aria-hidden="true" />
        <span aria-current="page">{say("First Shift", "أول وردية")}</span>
        <small>
          {say(
            "Accepted work → Skills → English CV",
            "الشغل المقبول ← المهارات ← CV الإنجليزي",
          )}
        </small>
      </nav>
    </header>
  );
}
