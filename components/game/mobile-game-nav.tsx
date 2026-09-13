"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, ShieldCheck, Swords, UserRound } from "lucide-react";
import type { Locale } from "@/types";
export function MobileGameNav({locale}:{locale:Locale}){const pathname=usePathname();const ar=locale==="ar",items=[["game",Home,"الرئيسية","Home"],["academy",Map,"الأكاديمية","Academy"],["game/first-shift",ShieldCheck,"العب","Play"],["leaderboard",Swords,"الترتيب","Rank"],["career",UserRound,"المسار","Career"]] as const;return <nav className="game-mobile-nav" aria-label={ar?"تنقل الهاتف":"Mobile navigation"}>{items.map(([path,Icon,a,e])=><Link aria-current={pathname===`/${locale}/${path}`||pathname.startsWith(`/${locale}/${path}/`)?"page":undefined} href={`/${locale}/${path}`} key={path}><Icon/><span>{ar?a:e}</span></Link>)}</nav>}
