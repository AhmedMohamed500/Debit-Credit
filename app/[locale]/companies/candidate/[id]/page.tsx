import { CandidateProfile } from "@/components/companies/candidate-profile";import type { Locale } from "@/types";
export default async function Page({params}:{params:Promise<{locale:Locale;id:string}>}){const{locale,id}=await params;return <CandidateProfile locale={locale} id={id}/>}
