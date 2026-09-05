import { learningLevels, levelThresholds } from "@/data/game";
import type { GameActivityEvidence, GameActivityKind, GameSkillId, MasteryBand, PlayerSnapshot, PlayerState } from "@/types/game";

export const GAME_REWARDS:Record<GameActivityKind,{xp:number;coins:number}> = {
  lesson:{xp:20,coins:5}, practice:{xp:30,coins:10}, "money-flow":{xp:60,coins:20}, mission:{xp:100,coins:35},
  detective:{xp:160,coins:50}, arena:{xp:120,coins:35}, daily:{xp:75,coins:25}, assessment:{xp:250,coins:80},
};
export const allGameSkills:GameSkillId[] = ["fundamentals","account-classification","debit-credit","transaction-analysis","journal-entries","ledger-posting","trial-balance","adjustments","financial-statements","error-detection","business-cases","accuracy","speed"];

export function createPlayerState(displayName="Debit & Credit Learner"):PlayerState {
  return {schemaVersion:1,displayName,xp:0,coins:0,streak:0,activities:{},badges:[],certificates:[]};
}

const day=(value:string)=>value.slice(0,10);
const yesterday=(iso:string)=>{const date=new Date(`${day(iso)}T12:00:00Z`);date.setUTCDate(date.getUTCDate()-1);return date.toISOString().slice(0,10)};
export function applyGameActivity(state:PlayerState,input:{kind:GameActivityKind;id:string;score:number;skills:GameSkillId[];completedAt?:string;attempts?:number}):PlayerState {
  const completedAt=input.completedAt??new Date().toISOString(),key=`${input.kind}:${input.id}`,previous=state.activities[key],reward=GAME_REWARDS[input.kind];
  const improved=Boolean(previous&&input.score>previous.bestScore),xpGain=!previous?reward.xp:improved?Math.ceil(reward.xp*.1):0,coinGain=!previous?reward.coins:improved?Math.ceil(reward.coins*.1):0;
  const evidence:GameActivityEvidence={key,kind:input.kind,bestScore:Math.max(previous?.bestScore??0,Math.max(0,Math.min(100,input.score))),completions:(previous?.completions??0)+1,attempts:(previous?.attempts??0)+(input.attempts??1),xpAwarded:(previous?.xpAwarded??0)+xpGain,coinsAwarded:(previous?.coinsAwarded??0)+coinGain,skills:Array.from(new Set([...(previous?.skills??[]),...input.skills])),completedAt};
  const today=day(completedAt),streak=state.lastActiveDate===today?state.streak:state.lastActiveDate===yesterday(completedAt)?state.streak+1:1;
  const next={...state,xp:state.xp+xpGain,coins:state.coins+coinGain,streak,lastActiveDate:today,activities:{...state.activities,[key]:evidence}};
  const snapshot=derivePlayerSnapshot(next),badges=[...next.badges];
  if(Object.keys(next.activities).length&&!badges.includes("first-step"))badges.push("first-step");
  if(snapshot.skillScores["journal-entries"]>=80&&!badges.includes("journal-master"))badges.push("journal-master");
  if(snapshot.skillScores["error-detection"]>=80&&!badges.includes("accounting-detective"))badges.push("accounting-detective");
  if(next.streak>=7&&!badges.includes("seven-day-streak"))badges.push("seven-day-streak");
  const certificates=[...next.certificates];
  if(snapshot.level>=2&&snapshot.skillScores.fundamentals>=60&&!certificates.includes("accounting-foundations"))certificates.push("accounting-foundations");
  if(snapshot.level>=3&&snapshot.skillScores["journal-entries"]>=70&&!certificates.includes("journal-entries"))certificates.push("journal-entries");
  if(snapshot.level===8&&snapshot.careerReadiness>=80&&!certificates.includes("full-accounting-cycle"))certificates.push("full-accounting-cycle");
  return {...next,badges,certificates};
}

export function calculateSkillScores(activities:Record<string,GameActivityEvidence>):Record<GameSkillId,number>{
  const result=Object.fromEntries(allGameSkills.map(skill=>[skill,0])) as Record<GameSkillId,number>;
  for(const skill of allGameSkills){const evidence=Object.values(activities).filter(item=>item.skills.includes(skill));if(evidence.length)result[skill]=Math.round(evidence.reduce((sum,item)=>sum+item.bestScore,0)/evidence.length)}
  return result;
}
export function masteryBand(score:number):MasteryBand{return score>=90?"mastered":score>=75?"advanced":score>=50?"intermediate":"beginner"}
export function playerLevel(xp:number){let level=1;levelThresholds.forEach((threshold,index)=>{if(xp>=threshold)level=index+1});return Math.min(8,level)}
export function calculateCareerReadiness(state:PlayerState,skills=calculateSkillScores(state.activities)){
  const activities=Object.values(state.activities),level=playerLevel(state.xp),skillValues=Object.values(skills),skillAverage=skillValues.reduce((a,b)=>a+b,0)/skillValues.length;
  const has=(kind:GameActivityKind)=>activities.filter(item=>item.kind===kind).length;
  return Math.min(100,Math.round(((level-1)/7)*25+skillAverage*.35+Math.min(15,has("mission")*3)+Math.min(10,has("detective")*3)+Math.min(10,has("arena")*2)+Math.min(5,state.streak)));
}
export function derivePlayerSnapshot(state:PlayerState):PlayerSnapshot{
  const level=playerLevel(state.xp),start=levelThresholds[level-1],next=level===8?start:levelThresholds[level],levelProgress=level===8?100:Math.round((state.xp-start)/(next-start)*100),skillScores=calculateSkillScores(state.activities),careerReadiness=calculateCareerReadiness(state,skillScores);
  const currentLevel=learningLevels[level-1],unfinished=currentLevel.steps.find(step=>!state.activities[`${step.kind==="classic"?"lesson":step.kind}:${step.id}`]);
  const objective=unfinished??currentLevel.steps[currentLevel.steps.length-1],reward=objective.kind==="classic"?GAME_REWARDS.lesson:GAME_REWARDS[objective.kind];
  return {...state,level,levelXp:Math.max(0,state.xp-start),nextLevelXp:level===8?start:next-start,levelProgress:Math.max(0,Math.min(100,levelProgress)),careerReadiness,skillScores,currentObjective:{titleAr:objective.titleAr,titleEn:objective.titleEn,route:objective.route,rewardXp:reward.xp,rewardCoins:reward.coins}};
}

export function mapExternalSkills(values:string[]):GameSkillId[]{
  const mapped:GameSkillId[]=[];for(const value of values){
    if(/account-nature|classification|chart-of-accounts/.test(value))mapped.push("account-classification","debit-credit");
    if(/journal/.test(value))mapped.push("journal-entries");if(/ledger|posting/.test(value))mapped.push("ledger-posting");if(/trial/.test(value))mapped.push("trial-balance");
    if(/adjust/.test(value))mapped.push("adjustments");if(/financial-statement|financial-impact/.test(value))mapped.push("financial-statements");if(/error|recovery|reconciliation/.test(value))mapped.push("error-detection");
    if(/cash|bank|customer|supplier|receivable|payable|revenue|expense|increase-decrease/.test(value))mapped.push("transaction-analysis");
    if(/accuracy/.test(value))mapped.push("accuracy");if(/speed|efficiency/.test(value))mapped.push("speed");
  }return Array.from(new Set(mapped.length?mapped:["business-cases"]));
}
