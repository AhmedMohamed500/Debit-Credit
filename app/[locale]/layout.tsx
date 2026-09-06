import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StorageMigration } from "@/components/storage-migration";
import { GameStatusBar } from "@/components/game/game-status-bar";
import { MobileGameNav } from "@/components/game/mobile-game-nav";
import { StudentWorld } from "@/components/game/student-world";
import type { Locale } from "@/types";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!['ar', 'en'].includes(locale)) notFound();
  const selected = locale as Locale;
  return <div lang={selected} dir={selected === 'ar' ? 'rtl' : 'ltr'} className="dc-shell"><StorageMigration/><StudentWorld><SiteHeader locale={selected}/><GameStatusBar locale={selected}/><main>{children}</main><SiteFooter locale={selected}/><MobileGameNav locale={selected}/></StudentWorld></div>;
}
