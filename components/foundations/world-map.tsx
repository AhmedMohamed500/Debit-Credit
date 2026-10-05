"use client";
import Link from "next/link";
import Image from "next/image";
import { Check, Lock, Trophy, ArrowLeft, ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import { bootcampMissions } from "@/lib/bootcamp/catalog";
import {
  bootcampProgress,
  isBootcampMissionUnlocked,
} from "@/lib/bootcamp/engine";
import type { BootcampMissionId, BootcampState } from "@/lib/bootcamp/model";
import { GuideCharacter } from "./visuals";
const positions = [
  [9, 29],
  [25, 28],
  [41, 29],
  [58, 29],
  [72, 41],
  [57, 51],
  [41, 48],
  [25, 48],
  [10, 57],
  [26, 70],
  [43, 73],
  [61, 73],
  [80, 65],
];
export function FoundationWorldMap({
  locale,
  state,
  onOpen,
}: {
  locale: Locale;
  state: BootcampState;
  onOpen: (id: BootcampMissionId) => void;
}) {
  const ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en),
    current =
      bootcampMissions.find((m) => !state.completedMissionIds.includes(m.id)) ??
      bootcampMissions[12],
    Arrow = ar ? ArrowLeft : ArrowRight;
  return (
    <div className="fdn-map-page">
      <header className="fdn-map-heading">
        <span>
          {say("STAGE 0 · A NEW BEGINNING", "المرحلة 0 · بداية جديدة")}
        </span>
        <h1>Accounting Foundations</h1>
        <p>من صفر محاسبة إلى أول يوم في Mizan Trading</p>
        <div>
          <progress
            aria-label={say("Foundation progress", "تقدم الأساسيات")}
            max="12"
            value={
              state.completedMissionIds.filter((id) => id !== "mizan-boss")
                .length
            }
          />
          <strong>{bootcampProgress(state)}%</strong>
        </div>
      </header>
      <div className="fdn-map-scene">
        <Image
          src="/foundations/world-v1.png"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
        />
        <div className="fdn-building-label">
          Mizan Trading
          <small>{say("YOUR FIRST COMPANY", "شركتك الأولى")}</small>
        </div>
        <nav
          className="fdn-mission-nodes"
          aria-label={say("Foundation missions", "مهام الأساسيات")}
        >
          {bootcampMissions.map((m, i) => {
            const completed = state.completedMissionIds.includes(m.id),
              unlocked = isBootcampMissionUnlocked(state, m.id);
            return (
              <button
                key={m.id}
                style={{
                  left: `${positions[i][0]}%`,
                  top: `${positions[i][1]}%`,
                }}
                className={`fdn-node ${completed ? "completed" : unlocked ? "available" : "locked"} ${m.id === current.id ? "current" : ""} ${i === 12 ? "boss" : ""}`}
                onClick={() => onOpen(m.id)}
                disabled={!unlocked}
                aria-label={`${m.order}. ${m.title[locale]}`}
                aria-current={m.id === current.id ? "step" : undefined}
              >
                <span>
                  {completed ? (
                    <Check />
                  ) : i === 12 ? (
                    <Trophy />
                  ) : unlocked ? (
                    m.order
                  ) : (
                    <Lock />
                  )}
                </span>
                <b>{m.title[locale]}</b>
                <small>
                  {completed
                    ? say("Completed", "مكتملة")
                    : unlocked
                      ? say("Available", "متاحة")
                      : say("Locked", "مقفلة")}
                </small>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="fdn-map-bottom">
        <GuideCharacter
          locale={locale}
          dialogue={say(
            "Welcome! We’ll start a company and discover accounting by doing. No experience needed.",
            "أهلًا بيك! هنفتح شركة ونفهم المحاسبة بالتجربة. مش محتاج تعرف أي حاجة قبل البداية.",
          )}
        />
        <div>
          <small>{say("YOUR NEXT MISSION", "مهمتك التالية")}</small>
          <h2>{current.title[locale]}</h2>
          <p>{current.brief[locale]}</p>
          <button className="fdn-primary" onClick={() => onOpen(current.id)}>
            {say("Let’s begin", "لنبدأ")}
            <Arrow />
          </button>
          {state.legacy.completedMissionIds.length > 0 && (
            <p className="fdn-legacy">
              {say(
                "Your previous Bootcamp history and company access are preserved. New missions are available for practice.",
                "سجل المعسكر القديم وإتاحة الشركة محفوظان. المهمات الجديدة متاحة للتدريب.",
              )}
            </p>
          )}
        </div>
      </div>
      {state.mizanUnlocked && (
        <Link className="fdn-unlock-link" href={`/${locale}/game/first-shift`}>
          {say("Start your first shift", "ابدأ أول وردية")}
          <Arrow />
        </Link>
      )}
    </div>
  );
}
