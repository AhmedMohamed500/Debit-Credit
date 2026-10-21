import type { Locale } from "@/types";
import { ExcelFoundations } from "@/components/foundations/excel-foundations";
import "@/app/excel-foundations.css";
import "@/app/excel-foundations-feedback.css";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <ExcelFoundations locale={locale} />;
}
