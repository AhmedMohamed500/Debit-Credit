import { TalentSearch } from "@/components/employer/talent-search";
import type { Locale } from "@/types";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <TalentSearch locale={locale} />;
}
