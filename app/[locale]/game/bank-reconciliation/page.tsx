import{BankReconciliationWorkspace}from'@/components/bank-reconciliation/workspace';
import type{Locale}from'@/types';
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const{locale}=await params;return<BankReconciliationWorkspace locale={locale}/>}
