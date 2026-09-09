import{CareerProfileApp}from"@/components/career/career-profile-app";import type{Locale}from"@/types";
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <CareerProfileApp locale={locale} view="employer"/>}
