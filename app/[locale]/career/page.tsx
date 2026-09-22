import {CareerHub} from '@/components/platform/career-hub';import type{Locale}from'@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <CareerHub locale={locale}/>}
