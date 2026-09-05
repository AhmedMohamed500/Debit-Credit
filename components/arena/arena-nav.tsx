import Link from "next/link";
import { BookOpenCheck, BriefcaseBusiness, CalendarCheck, FileSearch, Workflow, Goal, Trophy, UserRound } from "lucide-react";
import type { Locale } from "@/types";
const items=[["career",BriefcaseBusiness,"المسار المهني","Career"],["missions",Goal,"المهام","Missions"],["money-flow",Workflow,"تدفق الأموال","Money Flow"],["detective",FileSearch,"المحقق","Detective"],["arena/daily",CalendarCheck,"التحدي اليومي","Daily"],["leaderboard",Trophy,"الترتيب","Leaderboard"],["profile",UserRound,"الملف المهني","Profile"],["account-guide",BookOpenCheck,"طبيعة الحسابات","Account Nature"]] as const;
export function ArenaNav({locale}:{locale:Locale}){const ar=locale==="ar";return <nav className="arena-nav" aria-label={ar?"تنقل لعبة Debit & Credit":"Debit & Credit game navigation"}>{items.map(([route,Icon,a,e])=><Link key={route} href={`/${locale}/${route}`}><Icon size={18}/><span>{ar?a:e}</span></Link>)}</nav>}

