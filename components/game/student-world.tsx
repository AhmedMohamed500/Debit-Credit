"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { useGame } from "@/lib/campaign/store";
import { StudentJourneyProvider } from "@/components/student/student-journey";
export function StudentWorld({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const {state}=useGame();
  if (/^\/(ar|en)\/portfolio\//.test(pathname)) return <div className="professional-profile-shell">{children}</div>;
 const modern=/^\/(ar|en)\/(student|student-profile|game|academy|account-guide|leaderboard|career|career-profile|career-league|employers|journal|ledger|trial-balance|financial-statements|challenges|profile|account|competition)(\/|$)/.test(pathname);
  const locale=pathname.startsWith('/ar')?'ar':'en';
  if(modern)return <StudentJourneyProvider locale={locale}><div className="new-game-shell">{children}</div></StudentJourneyProvider>;
  const classic=/\/(account-guide|companies)(\/|$)/.test(pathname);
  return <StudentJourneyProvider locale={locale}><div className={classic?"classic-world":"student-world"}>{pathname.includes('account-guide')&&<Link className="manual-return" href={pathname.startsWith('/ar')?'/ar':'/en'}>{pathname.startsWith('/ar')?'← ارجع للمكتب — مسودتك محفوظة':'← Return to office — your draft is saved'}{state.active?` · ${state.active.stage+1}`:''}</Link>}{children}</div></StudentJourneyProvider>;
}
