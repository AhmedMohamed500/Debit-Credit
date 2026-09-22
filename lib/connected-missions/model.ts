import type{LocalizedText}from'@/lib/career/model';import type{MissionOutcome}from'@/lib/company-progression/model';
export type CareerConsequenceKind='balance'|'queue'|'control'|'reputation'|'close-blocker';
export interface ConnectedMissionEdge{id:string;sourceMissionId:string;sourceOutcome:MissionOutcome;targetMissionId:string;kind:CareerConsequenceKind;description:LocalizedText;value?:number;flag:string}
export interface ProjectedMissionConsequence{edgeId:string;targetMissionId:string;kind:CareerConsequenceKind;description:LocalizedText;value:number|null;flag:string}
