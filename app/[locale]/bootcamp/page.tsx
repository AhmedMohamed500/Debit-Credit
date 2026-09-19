import {AccountingBootcamp} from '@/components/platform/accounting-bootcamp';
import type {Locale} from '@/types';

export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return <AccountingBootcamp locale={locale}/>}
