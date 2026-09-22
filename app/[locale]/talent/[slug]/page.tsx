import{CareerProfileApp}from"@/components/career/career-profile-app";import type{Locale}from"@/types";
export default async function Page({params}:{params:Promise<{locale:Locale;slug:string}>}){const{locale,slug}=await params;return <CareerProfileApp locale={locale} view="public" slug={slug}/>}
