import { AdminDashboard } from "@/components/cloud/admin-dashboard";
import { CloudUnavailable } from "@/components/cloud/unavailable";
import { authorizePage } from "@/lib/server/auth/page";
import type { Locale } from "@/types";
export const metadata={title:"admin",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{locale:Locale}>}){
 const {locale}=await params;if(!await authorizePage(locale,"admin",true))return <CloudUnavailable locale={locale}/>;
 return <AdminDashboard locale={locale}/>;
}
