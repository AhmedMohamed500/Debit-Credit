import { TalentDashboard } from "@/components/companies/talent-dashboard";import type { Locale } from "@/types";
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <TalentDashboard locale={locale}/>}
