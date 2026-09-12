import {AcademyPlatform} from '@/components/platform/academy-platform';import type{Locale}from'@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <AcademyPlatform locale={locale}/>}
