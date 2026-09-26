import {PersonalCareerMap} from '@/components/platform/personal-career-map';
import type {Locale} from '@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){return <PersonalCareerMap locale={(await params).locale}/>}
