import type { Locale } from "@/types";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  redirect(`/${locale}/account#learning-competition`);
}
