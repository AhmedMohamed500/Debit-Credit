import { ProductLanding } from "@/components/landing/product-landing";
import type { Locale } from "@/types";
export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) { const { locale } = await params; return <ProductLanding locale={locale}/>; }
