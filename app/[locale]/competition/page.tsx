import { CloudCompetition } from "@/components/cloud/competition";
import { CloudUnavailable } from "@/components/cloud/unavailable";
import { authorizePage } from "@/lib/server/auth/page";
import type { Locale } from "@/types";
export const metadata={title:"competition",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{locale:Locale}>}){
 const {locale}=await params;if(!await authorizePage(locale,"competition",false))return <CloudUnavailable locale={locale}/>;
 return <CloudCompetition locale={locale}/>;
}
