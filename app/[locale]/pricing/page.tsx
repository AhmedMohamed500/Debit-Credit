import type { Metadata } from "next";
import type { Locale } from "@/types";
import { PricingPage } from "@/components/pricing/pricing-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الخطط والأسعار" : "Plans and pricing",
    description:
      locale === "ar"
        ? "استكشف تجربة Debit & Credit المجانية والأسعار المقترحة. الاشتراكات المدفوعة غير متاحة حاليًا."
        : "Explore Debit & Credit's free experience and proposed prices. Paid subscriptions are not available yet.",
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: { ar: "/ar/pricing", en: "/en/pricing" },
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <PricingPage locale={locale} />;
}
