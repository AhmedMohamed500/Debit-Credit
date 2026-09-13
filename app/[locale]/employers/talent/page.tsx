import{TalentDashboard}from'@/components/companies/talent-dashboard';import{PlatformNav}from'@/components/platform/platform-nav';import type{Locale}from'@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <main className="platform-page employer-platform"><PlatformNav locale={locale}/><TalentDashboard locale={locale}/></main>}
