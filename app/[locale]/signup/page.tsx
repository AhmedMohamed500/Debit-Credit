import { AuthForm } from "@/components/cloud/auth-form";
import { backendConfigured, emailConfigured } from "@/lib/server/security/env";
import type { Locale } from "@/types";
export const metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params,
    { next } = await searchParams;
  return (
    <AuthForm
      locale={locale}
      signup
      next={next ?? `/${locale}/onboarding`}
      enabled={backendConfigured()}
      google={
        backendConfigured() &&
        !!process.env.GOOGLE_CLIENT_ID &&
        !!process.env.GOOGLE_CLIENT_SECRET
      }
      email={emailConfigured()}
    />
  );
}
