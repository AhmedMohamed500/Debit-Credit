"use client";
import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";
import { loadPlayerSnapshot, subscribePlayer } from "@/lib/game/progress";
import type { Locale } from "@/types";

export function RewardNotice({locale}:{locale:Locale}) {
  const [notice,setNotice]=useState<{xp:number;coins:number;level:number;badge:boolean}|null>(null);
  useEffect(()=>{
    let previous=loadPlayerSnapshot();
    return subscribePlayer(next=>{
      if(next.xp>previous.xp) setNotice({xp:next.xp-previous.xp,coins:Math.max(0,next.coins-previous.coins),level:next.level>previous.level?next.level:0,badge:next.badges.length>previous.badges.length});
      previous=next;
    });
  },[]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(null),7000);return()=>clearTimeout(timer)},[notice]);
  if(!notice)return null;
  const ar=locale==="ar";
  return <aside className="world-reward-notice" role="status" aria-live="polite"><Trophy/><div><b>{notice.level?(ar?`المستوى ${notice.level} اتفتح!`:`Level ${notice.level} unlocked!`):notice.badge?(ar?"شارة جديدة اتفتحت!":"Achievement unlocked!"):(ar?"مهمة منجزة. تقدم جديد!":"Activity complete. Progress earned!")}</b><span>+{notice.xp} XP · +{notice.coins} {ar?"عملات":"coins"}</span></div><button aria-label={ar?"إغلاق إشعار المكافأة":"Dismiss reward"} onClick={()=>setNotice(null)}><X/></button></aside>;
}
