import { MarketingLanding } from "@/components/platform/marketing-landing";
import type { Locale } from "@/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GameHub } from "@/components/platform/game-hub";
import { backendConfigured } from "@/lib/server/security/env";
import { requireUser } from "@/lib/server/auth/guards";
import { HttpError } from "@/lib/server/security/http";
import { personalFor } from "@/lib/server/profiles/personal";
import "@/app/student.css";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  let user = null;
  if (backendConfigured()) {
    try {
      user = await requireUser(await headers());
    } catch (error) {
      if (!(error instanceof HttpError && error.status === 401)) throw error;
    }
  }
  if (!user) return <MarketingLanding locale={locale} />;
  const personal = await personalFor(user.id);
  if (!personal.data)
    redirect(
      `/${locale}/student-profile?next=${encodeURIComponent(`/${locale}`)}`,
    );
  return <GameHub locale={locale} />;
}
