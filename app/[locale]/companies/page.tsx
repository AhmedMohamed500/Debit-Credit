import { GameApp } from '@/components/campaign/game-app';
import type { Locale } from '@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const {locale}=await params;return <GameApp locale={locale} view="employer"/>;}
