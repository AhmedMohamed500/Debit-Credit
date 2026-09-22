import{ChallengesPlatform}from'@/components/platform/challenges-platform';import type{Locale}from'@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <ChallengesPlatform locale={locale}/>}
