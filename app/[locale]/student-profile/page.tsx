import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth/guards";
import { personalFor } from "@/lib/server/profiles/personal";
import { StudentProfileForm } from "@/components/career/student-profile-form";
import { HttpError } from "@/lib/server/security/http";
import { backendConfigured } from "@/lib/server/security/env";
import { safeNext } from "@/lib/auth/safe-next";
import type { Locale } from "@/types";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Student CV setup",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const next = safeNext((await searchParams).next, locale);
  if (!backendConfigured())
    return (
      <main className="cloud-page">
        <h1>
          {locale === "ar"
            ? "إعداد الحساب غير متاح في هذه النسخة"
            : "Account setup is unavailable in this environment"}
        </h1>
      </main>
    );
  let user;
  try {
    user = await requireUser(await headers());
  } catch (error) {
    if (error instanceof HttpError && error.status === 401)
      redirect(
        `/${locale}/login?next=${encodeURIComponent(`/${locale}/student-profile?next=${encodeURIComponent(next)}`)}`,
      );
    throw error;
  }
  const saved = await personalFor(user.id);
  return (
    <StudentProfileForm
      locale={locale}
      next={/^\/(ar|en)\/student-profile(?:[/?#]|$)/.test(next) ? `/${locale}` : next}
      email={user.email}
      saved={saved}
    />
  );
}
