import { MarketingLanding } from '@/components/platform/marketing-landing';
import type { Locale } from '@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const {locale}=await params;return <MarketingLanding locale={locale}/>;}
