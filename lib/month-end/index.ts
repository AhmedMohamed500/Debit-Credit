import type{LocalizedText}from'@/lib/career/model';
export type CloseArea='bank'|'ap'|'ar'|'accruals'|'prepayments'|'fixed-assets'|'adjustments'|'trial-balance';
export interface CloseTask{id:CloseArea;title:LocalizedText;requiredEvidence:string[];critical:boolean}
const t=(en:string,ar:string)=>({en,ar});
export const closeTasks:CloseTask[]=[
 {id:'bank',title:t('Bank Reconciliation','تسوية البنك'),requiredEvidence:['bank-statement','bank-ledger','reconciliation-workpaper'],critical:true},
 {id:'ap',title:t('AP Review','مراجعة الموردين'),requiredEvidence:['ap-aging','supplier-exceptions'],critical:true},
 {id:'ar',title:t('AR Review','مراجعة العملاء'),requiredEvidence:['ar-aging','unapplied-cash'],critical:true},
 {id:'accruals',title:t('Accrual Review','مراجعة الاستحقاقات'),requiredEvidence:['consumption-support','accrual-schedule'],critical:true},
 {id:'prepayments',title:t('Prepayment Release','استنفاد المصروفات المقدمة'),requiredEvidence:['prepayment-schedule'],critical:false},
 {id:'fixed-assets',title:t('Fixed Asset Close','إقفال الأصول الثابتة'),requiredEvidence:['fixed-asset-register','depreciation-schedule'],critical:false},
 {id:'adjustments',title:t('Adjusting Entries','قيود التسوية'),requiredEvidence:['approved-journals'],critical:true},
 {id:'trial-balance',title:t('Trial Balance Review','مراجعة ميزان المراجعة'),requiredEvidence:['final-trial-balance','balance-substantiation'],critical:true},
];
export interface CloseTaskResult{area:CloseArea;status:'resolved'|'blocked';inspectedEvidence:string[];approved:boolean;note:string}
export interface MonthEndState{version:1;chapterStatus:'locked'|'open'|'closed';results:Partial<Record<CloseArea,CloseTaskResult>>;closedAt:string|null}
export const createMonthEndState=():MonthEndState=>({version:1,chapterStatus:'locked',results:{},closedAt:null});
export const openClosingWeek=(state:MonthEndState,prerequisitesMet:boolean)=>prerequisitesMet&&state.chapterStatus==='locked'?{...state,chapterStatus:'open' as const}:state;
export function recordCloseTask(state:MonthEndState,result:CloseTaskResult){if(state.chapterStatus!=='open')return state;const task=closeTasks.find(item=>item.id===result.area);if(!task)return state;const completeEvidence=task.requiredEvidence.every(id=>result.inspectedEvidence.includes(id));const safe=result.status==='resolved'&&result.approved&&completeEvidence;return{...state,results:{...state.results,[result.area]:{...result,status:safe?'resolved':'blocked'}}}}
export function closeReadiness(state:MonthEndState){const missing=closeTasks.filter(task=>state.results[task.id]?.status!=='resolved').map(task=>task.id),critical=closeTasks.filter(task=>task.critical&&state.results[task.id]?.status!=='resolved').map(task=>task.id);return{ready:state.chapterStatus==='open'&&missing.length===0,missing,criticalBlockers:critical}}
export function closeTheMonth(state:MonthEndState,at:string){if(!closeReadiness(state).ready)return{state,status:'close-blocked' as const};return{state:{...state,chapterStatus:'closed' as const,closedAt:at},status:'month-closed' as const}}
