import { CareerDashboard } from "@/components/game/career-dashboard";
import type { Locale } from "@/types";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <CareerDashboard locale={locale} />;
}
