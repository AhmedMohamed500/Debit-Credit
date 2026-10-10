"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { ProfilePhoto } from "@/components/career/profile-photo";
import { SimulationSound } from "@/components/campaign/simulation-sound";
import type { Locale } from "@/types";
import "@/app/first-shift-world.css";
import "@/app/student-game.css";

export const studentStops = [
  { start: 0, end: 1, title: { ar: "مراجعة المستندات", en: "Source control" } },
  { start: 1, end: 7, title: { ar: "مكتب القيود", en: "Journal desk" } },
  { start: 7, end: 8, title: { ar: "دفتر الأستاذ", en: "Cash ledger" } },
  { start: 8, end: 10, title: { ar: "ميزان ومراجعة", en: "Trial balance" } },
  { start: 10, end: 11, title: { ar: "ورقة العمل", en: "Workpaper" } },
];
export function StudentCity({
  locale,
  completed,
  inactive,
  ready = true,
  onOpen,
}: {
  locale: Locale;
  completed: number;
  inactive: boolean;
  ready?: boolean;
  onOpen: () => void;
}) {
  const panorama = useRef<HTMLDivElement>(null),
    ar = locale === "ar",
    Arrow = ar ? ArrowLeft : ArrowRight;
  const say = (en: string, a: string) => (ar ? a : en);
  useEffect(() => {
    const element = panorama.current;
    if (element)
      element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
  }, []);
  return (
    <section
      className="shift-home fsh-shell student-city"
      dir={ar ? "rtl" : "ltr"}
      inert={inactive}
    >
      <header className="fsh-topbar">
        <Link className="fsh-brand" href={`/${locale}/game`}>
          <span className="fsh-brand-mark">D&amp;C</span>
          <span>
            Debit &amp; Credit<small>by Money Coder</small>
          </span>
        </Link>
        <div className="fsh-location">
          <span className="fsh-live-dot" />
          MIZAN TRADING{" "}
          <small>{say("STUDENT TRAINING DESK", "مكتب تدريب الطالب")}</small>
        </div>
        <div className="fsh-header-tools">
          <Link
            href={`/${locale}/career-profile`}
            aria-label={say("My profile", "ملفي")}
          >
            <ProfilePhoto locale={locale} />
          </Link>
          <SimulationSound locale={locale} />
          <Link href={`/${ar ? "en" : "ar"}/game/student`}>
            {ar ? "EN" : "AR"}
          </Link>
        </div>
      </header>
      <main className="fsh-world">
        <div
          ref={panorama}
          className="fsh-city-panorama"
          role="region"
          tabIndex={0}
          aria-label={say(
            "Explore the student accounting city",
            "استكشف مدينة تدريب المحاسبة",
          )}
        >
          <div className="fsh-city-stage">
            <Image
              className="fsh-artwork"
              src="/game/first-shift-world-art.png"
              fill
              priority
              unoptimized
              sizes="100vw"
              alt=""
            />
            <div className="fsh-city-shade" />
            <div className="fsh-world-title">
              <small>
                {say(
                  "UNIT ONE · SAVED TO YOUR ACCOUNT",
                  "الوحدة الأولى · محفوظة بحسابك",
                )}
              </small>
              <h1>{say("Your accounting desk", "مكتبك المحاسبي")}</h1>
            </div>
            <nav
              className="fsh-portals"
              aria-label={say(
                "Student accounting missions",
                "مهام تدريب الطالب",
              )}
            >
              {studentStops.map((stop, index) => {
                const done = completed >= stop.end,
                  locked = completed < stop.start;
                return (
                  <button
                    key={stop.start}
                    type="button"
                    disabled={locked || !ready}
                    className={`fsh-portal fsh-portal-${index + 1}`}
                    data-status={
                      done ? "completed" : locked ? "locked" : "active"
                    }
                    aria-current={!done && !locked ? "step" : undefined}
                    onClick={onOpen}
                  >
                    <span className="fsh-portal-number">
                      {done ? <Check /> : index + 1}
                    </span>
                    <span className="fsh-portal-caption">
                      <span className="fsh-portal-name">
                        {stop.title[locale]}
                      </span>
                      <span className="fsh-portal-state">
                        {locked ? (
                          <LockKeyhole />
                        ) : done ? (
                          <Check />
                        ) : (
                          <FileText />
                        )}
                        {locked
                          ? say("Locked", "مقفلة")
                          : done
                            ? say("Review accepted work", "راجع العمل المقبول")
                            : say("Open mission", "افتح المهمة")}{" "}
                        {!locked && <Arrow />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        <p className="fsh-pan-hint">
          {say(
            "Swipe through the city, then open your next assignment",
            "اسحب داخل المدينة وافتح ملف مهمتك التالية",
          )}{" "}
          ↔
        </p>
        <section className="student-city-status">
          <div>
            <small>MIZAN OS · {say("Training file", "ملف التدريب")}</small>
            <h2>
              {completed === 11
                ? say("Unit completed", "أنهيت الوحدة")
                : studentStops.find((stop) => completed < stop.end)?.title[
                    locale
                  ]}
            </h2>
            <p>
              {completed}/11{" "}
              {say(
                "accepted tasks · English CV updates automatically",
                "تاسك مقبول · الـCV الإنجليزي يتحدث تلقائيًا",
              )}
            </p>
            <div
              role="progressbar"
              aria-label={say("Training progress", "تقدم التدريب")}
              aria-valuemin={0}
              aria-valuemax={11}
              aria-valuenow={completed}
              className="student-city-meter"
            >
              <i style={{ width: `${(completed / 11) * 100}%` }} />
            </div>
          </div>
          <button className="student-start-mission" disabled={!ready} onClick={onOpen}>
            {completed === 11
              ? say("Review your books", "راجع دفاترك")
              : say("Open next mission", "افتح المهمة التالية")}
            <Arrow />
          </button>
        </section>
        <footer className="student-city-footer">
          <span>
            <ShieldCheck />
            {say(
              "Server-checked training; separate from your existing First Shift books",
              "تدريب يراجعه الخادم؛ دفاتره منفصلة عن أول وردية الحالية",
            )}
          </span>
          <Link href={`/${locale}/game/first-shift`}>
            {say("First Shift", "أول وردية")}
          </Link>
          <Link href={`/${locale}/career-profile/cv`}>English ATS CV</Link>
          <Link href={`/${locale}/game`}>{say("Game hub", "مركز اللعب")}</Link>
        </footer>
      </main>
    </section>
  );
}
