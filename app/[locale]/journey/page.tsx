import { GameHub } from "@/components/platform/game-hub";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth/guards";
import { personalFor } from "@/lib/server/profiles/personal";
import type { Locale } from "@/types";

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const route = `/${locale}/journey`;
  let user;
  try {
    user = await requireUser(await headers());
  } catch {
    redirect(`/${locale}/login?next=${encodeURIComponent(route)}`);
  }
  const personal = await personalFor(user.id);
  if (!personal.data)
    redirect(`/${locale}/student-profile?next=${encodeURIComponent(route)}`);
  return <GameHub locale={locale} />;
}
