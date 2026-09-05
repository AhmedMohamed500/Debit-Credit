import Link from "next/link";
import { Home, Map, ShieldCheck, Swords, UserRound } from "lucide-react";
import type { Locale } from "@/types";
export function MobileGameNav({locale}:{locale:Locale}){const ar=locale==="ar",items=[["",Home,"الرئيسية","Home"],["learning-map",Map,"الخريطة","Map"],["missions",ShieldCheck,"المهمة","Mission"],["arena",Swords,"الساحة","Arena"],["profile",UserRound,"الملف","Profile"]] as const;return <nav className="game-mobile-nav" aria-label={ar?"تنقل الهاتف":"Mobile navigation"}>{items.map(([path,Icon,a,e])=><Link href={`/${locale}${path?`/${path}`:""}`} key={path}><Icon/><span>{ar?a:e}</span></Link>)}</nav>}

