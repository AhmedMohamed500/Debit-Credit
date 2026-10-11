import { CompaniesLanding } from '@/components/employer/companies-landing';
import type { Locale } from '@/types';
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const {locale}=await params;return <CompaniesLanding locale={locale}/>;}
