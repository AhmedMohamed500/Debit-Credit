import{GameHub}from'@/components/platform/game-hub';import type{Locale}from'@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <GameHub locale={locale}/>}
