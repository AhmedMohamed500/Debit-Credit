import type{LocalizedText,SkillId}from'@/lib/career/model';
import type{PlayerPersona}from'@/lib/career-league/model';

export type CareerLevel=0|1|2|3|4|5|6|7|8;
export type ProfessionalResponsibility='understand'|'record'|'process'|'reconcile'|'review'|'control'|'analyze'|'manage'|'decide';
export type SpecialistTrack='foundation'|'ap'|'ar'|'treasury'|'inventory'|'fixed-assets'|'cost'|'payroll'|'tax'|'audit-support'|'gl'|'management-accounting'|'fpa';
export type ContentStatus='draft'|'review-required'|'approved';
export type CareerCaseType='visual-scenario'|'document-to-action'|'case-file'|'workpaper'|'close-file'|'review-file'|'control-room'|'command-center';
export interface CareerContentCase{id:string;version:number;level:CareerLevel;responsibility:ProfessionalResponsibility;personas:PlayerPersona[];companyTier:1|2|3|4|5;tracks:SpecialistTrack[];title:LocalizedText;objective:LocalizedText;caseType:CareerCaseType;mechanic:LocalizedText;prerequisites:string[];skills:SkillId[];evidenceRule:'practice-only'|'eligible-practiced'|'eligible-demonstrated';roleRelevance:LocalizedText;cvBehavior:LocalizedText|null;competitionEligible:boolean;status:ContentStatus;reviewRequirements:string[]}
export interface CareerContentAttempt{attemptId:string;caseId:string;caseVersion:number;profileId:string;score:number;successful:boolean;completedAt:string}
export interface CareerContentState{version:1;attempts:CareerContentAttempt[];completedCaseIds:string[];updatedAt:string}
