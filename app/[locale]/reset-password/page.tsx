import { ResetForm } from "@/components/cloud/reset-form";
import { emailConfigured } from "@/lib/server/security/env";
import type { Locale } from "@/types";
export const metadata={title:"Reset password",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function Page({params,searchParams}:{params:Promise<{locale:Locale}>;searchParams:Promise<{token?:string}>}){
 const {locale}=await params,{token}=await searchParams;return <ResetForm locale={locale} token={token??""} enabled={emailConfigured()}/>;
}
