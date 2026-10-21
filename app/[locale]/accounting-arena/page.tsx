import type { Locale } from "@/types";
import { AccountingArena } from "@/components/foundations/accounting-arena";
import "@/app/excel-foundations.css";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <AccountingArena locale={locale} />;
}
