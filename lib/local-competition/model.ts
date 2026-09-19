import type{PlayerPersona}from'@/lib/career-league/model';import type{SpecialistTrack}from'@/lib/career-content/model';
export interface LocalPlayerProfile{id:string;displayName:string;persona:PlayerPersona;level:number;track:SpecialistTrack;createdAt:string;updatedAt:string;data:Record<string,string>}
export interface MultiProfileState{version:1;activeProfileId:string;profiles:LocalPlayerProfile[]}
export interface ChallengeSeed{challengeId:string;challengeVersion:number;rulesetVersion:number;seed:string;caseId:string;difficulty:number;issuedFor:string;localOnly:true}
export interface OfflineCompetitionResult{schema:'debit-credit-offline-result-v1';packageId:string;profileId:string;displayName:string;challenge:ChallengeSeed;score:number;accuracy:number;investigation:number;riskAwareness:number;assistanceUsed:number;completedAt:string;checksum:string;localOnly:true}
export interface CompetitionStanding{profileId:string;displayName:string;level:number;track:SpecialistTrack;score:number;accuracy:number;resultCount:number;gameTitle:string;localOnly:true}
