import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth/guards";
import { backendConfigured } from "@/lib/server/security/env";
import { HttpError } from "@/lib/server/security/http";
import { personalFor } from "@/lib/server/profiles/personal";
import { safeNext } from "@/lib/auth/safe-next";
import type { Locale } from "@/types";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ next?: string }> }) {
  const { locale } = await params;
  const requested = safeNext((await searchParams).next, locale);
  const target = /^\/(ar|en)\/(auth\/continue|student-profile)(?:[/?#]|$)/.test(requested) ? `/${locale}` : requested;
  if (!backendConfigured()) redirect(`/${locale}/login`);
  let user;
  try { user = await requireUser(await headers()); }
  catch (error) { if (error instanceof HttpError && error.status === 401) redirect(`/${locale}/login?next=${encodeURIComponent(target)}`); throw error; }
  if (!(await personalFor(user.id)).data) redirect(`/${locale}/student-profile?next=${encodeURIComponent(target)}`);
  redirect(target);
}
