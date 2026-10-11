import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth/guards";
import { HttpError } from "@/lib/server/security/http";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  try {
    await requireUser(await headers());
  } catch (error) {
    if (error instanceof HttpError && error.status === 401)
      redirect(
        `/${locale}/login?next=${encodeURIComponent(`/${locale}/employer/candidates`)}`,
      );
    if (error instanceof HttpError && error.status === 503)
      return (
        <main>
          <p>
            {locale === "ar"
              ? "خدمة الشركات غير متاحة حاليًا؛ لا توجد بيانات مرشحين تجريبية."
              : "Employer service is temporarily unavailable. No demo candidate data."}
          </p>
        </main>
      );
    throw error;
  }
  return children;
}
