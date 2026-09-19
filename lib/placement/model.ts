import type{LocalizedText}from'@/lib/career/model';
import type{PlayerPersona}from'@/lib/career-league/model';

export type PlacementArea='classification'|'debit-credit'|'journals'|'documents'|'ledger'|'trial-balance'|'ap'|'ar'|'bank'|'accruals'|'prepayments'|'cut-off'|'month-end'|'controls'|'review';
export type PlacementTrack='foundation-refresh'|'graduate-practical'|'general-accounting-practice'|'corporate-bridge-foundation';
export interface PlacementTask{id:string;personas:PlayerPersona[];area:PlacementArea;scenario:LocalizedText;options:LocalizedText[];correctIndex:number;responsibility:LocalizedText}
export interface PlacementResult{score:number;strengths:PlacementArea[];gaps:PlacementArea[];recommendedTrack:PlacementTrack;explanation:LocalizedText;localOnly:true;grantsEvidence:false}
export interface PlacementState{version:1;persona:PlayerPersona|null;answers:Record<string,number>;result:PlacementResult|null;completedAt:string|null}
