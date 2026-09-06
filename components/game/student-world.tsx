"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RewardNotice } from "@/components/game/reward-notice";
export function StudentWorld({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const classic=/\/(account-guide|companies)(\/|$)/.test(pathname);
  return <div className={classic?"classic-world":"student-world"}>{children}{!classic&&<RewardNotice locale={pathname.startsWith("/ar")?"ar":"en"}/>}</div>;
}
