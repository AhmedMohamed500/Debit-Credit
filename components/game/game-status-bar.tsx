"use client";
import Link from "next/link";
import { Coins, Flame, Target, Zap } from "lucide-react";
import { usePlayer } from "@/components/game/use-player";
import type { Locale } from "@/types";
export function GameStatusBar({locale}:{locale:Locale}){const ar=locale==="ar",player=usePlayer();return <aside className="game-status" aria-label={ar?"حالة رحلتك":"Journey status"}><div className="game-status-inner"><Link className="game-level" href={`/${locale}/learning-map`}><span>{ar?"المستوى":"LEVEL"} {player.level}</span><i><b style={{width:`${player.levelProgress}%`}}/></i><small>{player.levelProgress}%</small></Link><div className="game-stat"><Zap/><b>{player.xp}</b><small>XP</small></div><div className="game-stat"><Coins/><b>{player.coins}</b><small>{ar?"عملة":"Coins"}</small></div><div className="game-stat"><Flame/><b>{player.streak}</b><small>{ar?"أيام":"Days"}</small></div><Link className="game-objective" href={`/${locale}${player.currentObjective.route}`}><Target/><span><small>{ar?"هدفك الحالي":"CURRENT OBJECTIVE"}</small><b>{ar?player.currentObjective.titleAr:player.currentObjective.titleEn}</b></span></Link></div></aside>}

