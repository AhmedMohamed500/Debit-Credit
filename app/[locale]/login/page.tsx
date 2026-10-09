import { AuthForm } from "@/components/cloud/auth-form";
import {
  backendConfigured,
  emailConfigured,
  googleConfigured,
} from "@/lib/server/security/env";
import type { Locale } from "@/types";
export const metadata = {
  title: "Sign in",
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
      signup={false}
      next={next ?? `/${locale}/onboarding`}
      enabled={backendConfigured()}
      google={backendConfigured() && googleConfigured()}
      email={emailConfigured()}
    />
  );
}
