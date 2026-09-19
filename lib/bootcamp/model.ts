import type {LocalizedText} from '@/lib/career/model';

export type BootcampMissionId='business-world'|'missing-story'|'transaction-radar'|'equation-builder'|'account-city'|'movement-lab'|'debit-credit'|'document-dock'|'first-journal'|'mizan-boss';
export type BootcampMechanic='explore'|'repair'|'classify'|'build-equation'|'districts'|'movement'|'connect'|'documents'|'journal'|'boss';

export interface BootcampInteraction{id:string;label:LocalizedText;description:LocalizedText;correct:boolean}
export interface BootcampEntry{id:string;story:LocalizedText;debit:string;credit:string;amount:number}
export interface BootcampMission{id:BootcampMissionId;order:number;title:LocalizedText;subtitle:LocalizedText;brief:LocalizedText;mechanic:BootcampMechanic;interactions:BootcampInteraction[];entries?:BootcampEntry[];accountCityRoute?:string;skills:string[];evidenceRule:'practice-only'}
export interface BootcampState{version:1;currentMissionId:BootcampMissionId;completedMissionIds:BootcampMissionId[];interactionProgress:Partial<Record<BootcampMissionId,string[]>>;attempts:Partial<Record<BootcampMissionId,number>>;bossCompleted:boolean;mizanUnlocked:boolean;completedAt:string|null}
