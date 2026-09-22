import { AccountCity } from "@/components/academy/account-city";
import type { Locale } from "@/types";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <AccountCity locale={locale}/>;
}
