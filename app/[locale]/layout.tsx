import { notFound } from "next/navigation";
import { StorageMigration } from "@/components/storage-migration";
import { StudentWorld } from "@/components/game/student-world";
import type { Locale } from "@/types";
import { CloudSessionBoundary } from "@/components/cloud/session-boundary";
import { backendConfigured } from "@/lib/server/security/env";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!['ar', 'en'].includes(locale)) notFound();
  const selected = locale as Locale;
  return <div lang={selected} dir={selected === 'ar' ? 'rtl' : 'ltr'} className="dc-shell"><CloudSessionBoundary locale={selected} enabled={backendConfigured()}><StorageMigration/><StudentWorld>{children}</StudentWorld></CloudSessionBoundary></div>;
}
