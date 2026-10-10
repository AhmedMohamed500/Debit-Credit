import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sharedShowcase } from "@/lib/server/profiles/showcase";
import { SharedProfile } from "@/components/career/showcase";
import type { Locale } from "@/types";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Professional training profile | Debit & Credit",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; token: string }>;
}) {
  const { locale, token } = await params;
  let data;
  try {
    data = await sharedShowcase(token);
  } catch {
    return (
      <main className="cloud-page">
        <h1>
          {locale === "ar"
            ? "البروفايل غير متاح مؤقتًا. حاول لاحقًا."
            : "Profile temporarily unavailable. Please retry later."}
        </h1>
      </main>
    );
  }
  if (!data) notFound();
  return <SharedProfile data={data} locale={locale} />;
}
