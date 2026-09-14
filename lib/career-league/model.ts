import type {RoleId,SkillId,SkillStatus} from '@/lib/career/model';
import type {LocalizedText} from '@/lib/career/model';

export type PlayerPersona='student'|'graduate'|'working-accountant';
export type WorkEnvironment='small-business'|'accounting-office'|'retail'|'restaurant'|'trading-company'|'other';
export type CareerGoal='first-job'|'bigger-company'|'general-accountant'|'ap'|'ar'|'treasury'|'gl'|'cost'|'corporate-accounting';
export type PlacementPath='start-basics'|'take-challenge';
export type CompanyTierId=1|2|3|4|5;
export type AccessTier='free'|'pro';
export type CareerFeature='foundation'|'first-shift'|'daily-challenge'|'basic-profile'|'career-league'|'corporate-bridge'|'company-tiers'|'promotion-assessments'|'advanced-cases'|'seasons'|'career-gap'|'full-passport'|'role-cv';

export interface CareerLeagueState{version:1;persona:PlayerPersona|null;workEnvironment:WorkEnvironment|null;goal:CareerGoal|null;placementPath:PlacementPath|null;placementScore:number|null;placementRecommendation:CompanyTierId;targetOpportunityId:string|null;acceptedOfferId:string|null;onboardingComplete:boolean;assessmentResults:Record<string,'pass'|'needs-practice'>;updatedAt:string}
export interface SkillRequirement{skillId:SkillId;minimum:Exclude<SkillStatus,'unassessed'|'verified'>}
export interface CompanyUnlockRule{requiredMissionIds:string[];requirements:SkillRequirement[];promotionAssessmentId:string|null}
export interface VirtualCompany{id:string;tier:CompanyTierId;name:LocalizedText;environment:LocalizedText;simulationLabel:LocalizedText;characteristics:LocalizedText[];unlock:CompanyUnlockRule}
export interface CareerOpportunity{id:string;companyId:string;roleId:RoleId;title:LocalizedText;companyName:LocalizedText;summary:LocalizedText;requirements:SkillRequirement[];trainingMissionIds:string[];access:AccessTier;fictional:true}
export interface CareerGap{opportunityId:string;strong:SkillId[];developing:SkillId[];missing:SkillId[];met:number;total:number;ready:boolean}
export interface TrainingStep{skillId:SkillId;missionId:string;route:string|null;locked:boolean;reason:LocalizedText}
export interface PromotionAssessment{id:string;fromTier:CompanyTierId;toTier:CompanyTierId;title:LocalizedText;roleId:RoleId;requiredMissionIds:string[];requirements:SkillRequirement[];tasks:LocalizedText[];dimensions:string[];access:AccessTier}
export interface PlacementTask{id:string;area:LocalizedText;scenario:LocalizedText;options:LocalizedText[];correctIndex:number}
export interface PromotionResult{status:'pass'|'needs-practice';score:number;developmentAreas:string[]}
export interface CareerReputation{managerTrust:number;booksHealth:number;professionalReputation:number;auditRisk:number;independence:number;reliability:number;gameOnly:true}
export interface CareerSeason{id:string;title:LocalizedText;status:'active-demo'|'planned';eventIds:string[];localOnly:true}
export interface LeagueTrack{id:'junior'|'ap'|'ar'|'treasury'|'gl'|'closing';title:LocalizedText;requiredSkills:SkillId[];demo:boolean}
