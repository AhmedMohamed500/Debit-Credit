import { JournalChallengeEngine } from "@/components/practice/journal-challenge-engine";
import type { Locale } from "@/types";
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <JournalChallengeEngine locale={locale}/>}

