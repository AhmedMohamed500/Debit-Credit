"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldCheck, Swords, UserRound } from "lucide-react";
import type { Locale } from "@/types";
export function MobileGameNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const ar = locale === "ar",
    items = [
      ["student", Home, "رحلتي", "My journey"],
      ["game/first-shift", ShieldCheck, "التدريب", "Training"],
      ["competition", Swords, "التحديات", "Challenges"],
      ["career-profile/skills", ShieldCheck, "المهارات", "Skills"],
      ["career-profile", UserRound, "ملفي", "Profile"],
    ] as const;
  return (
    <nav className="game-mobile-nav" aria-label={ar ? "تنقل الهاتف" : "Mobile navigation"}>
      {items.map(([path, Icon, a, e]) => (
        <Link aria-current={pathname === `/${locale}/${path}` || pathname.startsWith(`/${locale}/${path}/`) ? "page" : undefined} href={`/${locale}/${path}`} key={path}>
          <Icon />
          <span>{ar ? a : e}</span>
        </Link>
      ))}
    </nav>
  );
}
