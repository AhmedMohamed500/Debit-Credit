"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { useGame } from "@/lib/campaign/store";
export function StudentWorld({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const {state}=useGame();
  const modern=/^\/(ar|en)(\/(campaign|arena|profile|companies))?\/?$/.test(pathname);
  if(modern)return <div className="new-game-shell">{children}</div>;
  const classic=/\/(account-guide|companies)(\/|$)/.test(pathname);
  return <div className={classic?"classic-world":"student-world"}>{pathname.includes('account-guide')&&<Link className="manual-return" href={pathname.startsWith('/ar')?'/ar':'/en'}>{pathname.startsWith('/ar')?'← ارجع للمكتب — مسودتك محفوظة':'← Return to office — your draft is saved'}{state.active?` · ${state.active.stage+1}`:''}</Link>}{children}</div>;
}
