import { notFound } from "next/navigation";
import { z } from "zod";
import { TalentSearch } from "@/components/employer/talent-search";
import type { Locale } from "@/types";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  return <TalentSearch locale={locale} mode="candidate" candidateId={id} />;
}
