import { LearningMap } from "@/components/game/learning-map";
import type { Locale } from "@/types";
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <LearningMap locale={locale}/>}

