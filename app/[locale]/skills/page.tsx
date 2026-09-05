import { SkillsDashboard } from "@/components/game/skills-dashboard";import type { Locale } from "@/types";
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <SkillsDashboard locale={locale}/>}
