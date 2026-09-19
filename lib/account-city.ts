import {accountGuideCategories,accountLearningGuide,type AccountGuideCategory,type AccountLearningGuideItem} from '@/data/account-learning-guide';
import {applyGameActivity} from '@/lib/game/engine';
import {loadPlayerState,savePlayerState} from '@/lib/game/progress';
import type {GameSkillId} from '@/types/game';

export const ACCOUNT_CITY_KEY='debit-credit-account-city-v1';
export type AccountCityQuest='six-families'|'follow-money'|'debit-credit'|'build-transaction';
export interface AccountCityProgress {version:1;visited:AccountGuideCategory[];familyExamples:AccountGuideCategory[];discovered:string[];practiced:string[];quests:AccountCityQuest[]}
export const emptyAccountCityProgress=():AccountCityProgress=>({version:1,visited:[],familyExamples:[],discovered:[],practiced:[],quests:[]});
const categoryIds=new Set<string>(accountGuideCategories.map(item=>item.id));
const accountCodes=new Set(accountLearningGuide.map(item=>item.code));
const questIds=new Set<AccountCityQuest>(['six-families','follow-money','debit-credit','build-transaction']);
const validUnique=<T extends string>(value:unknown,valid:Set<string>):T[]=>Array.isArray(value)?[...new Set(value.filter((item):item is T=>typeof item==='string'&&valid.has(item)))]:[];
export function readAccountCityProgress():AccountCityProgress {
 if(typeof window==='undefined')return emptyAccountCityProgress();
 try{const value=JSON.parse(localStorage.getItem(ACCOUNT_CITY_KEY)||'null');if(value?.version!==1)return emptyAccountCityProgress();return {version:1,visited:validUnique(value.visited,categoryIds),familyExamples:validUnique(value.familyExamples,categoryIds),discovered:validUnique(value.discovered,accountCodes),practiced:validUnique(value.practiced,accountCodes),quests:validUnique(value.quests,questIds)}}catch{return emptyAccountCityProgress()}
}
export function saveAccountCityProgress(value:AccountCityProgress){if(typeof window!=='undefined')localStorage.setItem(ACCOUNT_CITY_KEY,JSON.stringify(value));return value}
export function addCityProgress<T extends string>(value:AccountCityProgress,key:'visited'|'familyExamples'|'discovered'|'practiced'|'quests',id:T):AccountCityProgress{return {...value,[key]:[...new Set([...value[key],id])]}}
export const cityCounts=Object.fromEntries(accountGuideCategories.map(category=>[category.id,accountLearningGuide.filter(account=>account.category===category.id).length])) as Record<AccountGuideCategory,number>;
export const cityTotal=accountLearningGuide.length;
export const cityAccount=(code:string)=>accountLearningGuide.find(account=>account.code===code);
export const featuredCodes:Record<AccountGuideCategory,string[]>={assets:['1100','1110','1120','1200','1300','1350'],liabilities:['2100','2300','2210','2201'],equity:['3100','3150','3160'],revenue:['4100','4200','4120'],expenses:['5100','5010','5200','5110'],contra:['1390','1129','4191','5001']};
export const featuredAccounts=(category:AccountGuideCategory)=>{
 const all=accountLearningGuide.filter(account=>account.category===category);
 return [...featuredCodes[category].map(cityAccount).filter((account):account is AccountLearningGuideItem=>Boolean(account)&&account?.category===category),...all.filter(account=>!featuredCodes[category].includes(account.code))].slice(0,6);
};
export function relatedCityAccounts(account:AccountLearningGuideItem){
 const example=account.exampleAr;
 const mentions=[...example.matchAll(/حـ\/\s*([^\.،:]+?)(?=\s+إلى|[.،]|$)/g)].map(match=>match[1].trim());
 return accountLearningGuide.filter(other=>other.code!==account.code&&mentions.some(mention=>mention.includes(other.nameAr)||other.nameAr.includes(mention))).slice(0,4);
}
export function recordCityPractice(id:string,score:number,skills:GameSkillId[],attempts=1){
 const before=loadPlayerState(),key=`practice:${id}`;
 const after=applyGameActivity(before,{kind:'practice',id,score,skills,attempts});
 const activity=after.activities[key];
 // City exploration/introductory quests award game XP only; reuse the existing practice engine and remove its coin component.
 return savePlayerState({...after,coins:before.coins,activities:{...after.activities,[key]:{...activity,coinsAwarded:before.activities[key]?.coinsAwarded??0}}});
}
