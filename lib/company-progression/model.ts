import type{LocalizedText}from'@/lib/career/model';
export type MizanStageId='first-shift'|'supplier-control'|'customer-control'|'bank-control'|'close-readiness';
export type MissionOutcome='resolved'|'held'|'escalated';
export interface MizanStage{id:MizanStageId;order:number;department:'accounting-desk'|'suppliers'|'customers'|'bank'|'month-end';title:LocalizedText;responsibility:LocalizedText;route:string;requiredMissionIds:string[];status:'implemented'|'available-foundation'|'locked-preview'}
export interface CompanyProgressionState{version:1;companyId:'mizan-trading';currentStageId:MizanStageId;completedMissionIds:string[];outcomes:Partial<Record<string,MissionOutcome>>;unlockedStageIds:MizanStageId[];updatedAt:string}
