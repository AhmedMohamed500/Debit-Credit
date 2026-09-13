import {LeaderboardPlatform} from '@/components/platform/leaderboard-platform';import type{Locale}from'@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <LeaderboardPlatform locale={locale}/>}
