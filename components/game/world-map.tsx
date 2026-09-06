"use client";
import Link from "next/link";
import { Check, Flag, LockKeyhole, Play } from "lucide-react";
import { usePlayer } from "@/components/game/use-player";
import { learningLevels, levelThresholds } from "@/data/game";
import type { Locale } from "@/types";

export function WorldMap({locale}:{locale:Locale}) {
  const ar=locale==="ar",player=usePlayer();
  return <div className="world-map-scene">
    <svg className="world-terrain" viewBox="0 0 440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="mountain" x2="0" y2="1"><stop stopColor="#3d9ccc"/><stop offset="1" stopColor="#0a294e"/></linearGradient></defs><circle cx="340" cy="90" r="65" fill="#6de5ff" opacity=".09"/><path d="M-60 380 70 100 135 260 220 20 330 290 385 135 510 410V800H0Z" fill="url(#mountain)"/><path d="m70 100-25 95 25-25 30 37Zm150-80-45 138 46-39 38 35Zm165 115-29 98 28-25 30 47Z" fill="#b9e9ff" opacity=".75"/><path d="M-20 420 80 280 180 460 295 245 480 480V800H0Z" fill="#103d60"/><path d="M-20 590 100 440 175 570 320 430 460 600V800H0Z" fill="#08243f"/><path d="M0 720 90 580 165 690 300 585 440 730V800H0Z" fill="#05192f"/></svg>
    <div className="world-map-caption"><Flag/><span>{ar?"من الأساسيات إلى قمة الاحتراف":"FROM FOUNDATIONS TO PROFESSIONAL"}</span></div>
    <ol className="world-path">{learningLevels.map(level=>{const locked=level.id>player.level,current=level.id===player.level;return <li key={level.id} className={locked?"locked":current?"current":"completed"}><div className="world-node">{locked?<LockKeyhole/>:current?<Play/>:<Check/>}</div><div className="world-node-copy"><small>{ar?"المستوى":"LEVEL"} {level.id}{current&&<em>{ar?"أنت هنا":"YOU ARE HERE"}</em>}</small>{locked?<b>{ar?level.titleAr:level.titleEn}</b>:<Link href={`/${locale}/learning-map#level-${level.id}`}>{ar?level.titleAr:level.titleEn}</Link>}<span>{locked?(ar?"يُفتح عند":"Unlock at")+` ${levelThresholds[level.id-1]} XP`:current?(ar?"واصل رحلتك":"Continue your journey"):(ar?"مستوى مفتوح":"Level unlocked")}</span></div></li>})}</ol>
  </div>;
}
