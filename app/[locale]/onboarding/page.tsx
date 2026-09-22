import{PlatformOnboarding}from'@/components/platform/onboarding';import type{Locale}from'@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <PlatformOnboarding locale={locale}/>}
