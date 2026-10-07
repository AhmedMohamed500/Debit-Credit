import { LeaderboardPlatform } from "@/components/platform/leaderboard-platform";
import type { Locale } from "@/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/server/auth/auth";
import { backendConfigured } from "@/lib/server/security/env";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (backendConfigured()) {
    const session = await auth().api.getSession({headers:await headers()});
    if (session) redirect(`/${locale}/competition`);
  }
  return <LeaderboardPlatform locale={locale} />;
}
