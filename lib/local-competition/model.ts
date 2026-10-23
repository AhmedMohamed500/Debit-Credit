import type{PlayerPersona}from'@/lib/career-league/model';import type{SpecialistTrack}from'@/lib/career-content/model';
export interface LocalPlayerProfile{id:string;displayName:string;persona:PlayerPersona;level:number;track:SpecialistTrack;createdAt:string;updatedAt:string;data:Record<string,string>}
export interface MultiProfileState{version:1;activeProfileId:string;profiles:LocalPlayerProfile[]}
export interface ChallengeSeed{challengeId:string;challengeVersion:number;rulesetVersion:number;seed:string;caseId:string;difficulty:number;issuedFor:string;localOnly:true}
