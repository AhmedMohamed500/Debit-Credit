import { ProgressDashboard } from "@/components/progress/progress-dashboard";
import type { Locale } from "@/types";
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <ProgressDashboard locale={locale}/>;}
