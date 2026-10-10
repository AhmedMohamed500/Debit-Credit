import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth/guards";
import { backendConfigured } from "@/lib/server/security/env";
import { HttpError } from "@/lib/server/security/http";
import { personalFor } from "@/lib/server/profiles/personal";
import { StudentUnit } from "@/components/student/student-unit";
import type { Locale } from "@/types";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Source documents to books",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!backendConfigured())
    return (
      <main className="cloud-page">
        <h1>
          {locale === "ar"
            ? "التدريب المحفوظ يتطلب إعداد الحساب"
            : "Saved training requires a configured account"}
        </h1>
      </main>
    );
  let user;
  try {
    user = await requireUser(await headers());
  } catch (error) {
    if (error instanceof HttpError && error.status === 401)
      redirect(
        `/${locale}/login?next=${encodeURIComponent(`/${locale}/student`)}`,
      );
    throw error;
  }
  if (!(await personalFor(user.id)).data)
    redirect(
      `/${locale}/student-profile?next=${encodeURIComponent(`/${locale}/student`)}`,
    );
  return <StudentUnit locale={locale} />;
}
