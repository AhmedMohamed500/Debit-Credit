import type{Attempt,GameState}from'@/lib/campaign/model';
import{firstDayDocuments,type FirstDayDocumentId}from'@/lib/campaign/first-day';
import{roleCatalog,skillIds}from'./catalog';
import type{RoleId,RoleReadiness,SkillEvidence,SkillId,SkillResult}from'./model';
const mapping:Record<FirstDayDocumentId,{skills:SkillId[];roles:RoleId[]}>={
 'supplier-invoice':{skills:['document-analysis','account-classification','debit-credit','journal-entries','accounts-payable','supplier-documents'],roles:['junior-accountant','general-accountant','ap-accountant']},
 'customer-receipt':{skills:['document-analysis','debit-credit','journal-entries','accounts-receivable','cash-treasury'],roles:['junior-accountant','general-accountant','ar-accountant','treasury-accountant']},
 'office-expense':{skills:['accounting-fundamentals','account-classification','debit-credit','journal-entries','expense-recognition','cash-treasury'],roles:['junior-accountant','general-accountant','ap-accountant','treasury-accountant']},
};
export function firstShiftSkillEvidence(state:GameState,localCandidateId:string):SkillEvidence[]{
 return state.evidence.filter(a=>a.activityId.startsWith('first-day/')).flatMap(attempt=>{
  const id=attempt.activityId.split('/')[1] as FirstDayDocumentId,config=mapping[id],doc=firstDayDocuments.find(item=>item.id===id);if(!config||!doc)return[];
  return config.skills.map(skillId=>fromAttempt(attempt,skillId,config.roles,doc.title.ar,doc.title.en,localCandidateId));
 });
}
function fromAttempt(a:Attempt,skillId:SkillId,roles:RoleId[],titleAr:string,titleEn:string,localCandidateId:string):SkillEvidence{return{version:1,evidenceId:`${a.activityId}:${skillId}:${a.completedAt}:${a.attempts}`,localCandidateId,activityId:a.activityId,activityType:'document',chapterId:a.chapterId,missionId:a.missionId,skillId,roleRelevance:roles,difficulty:Math.min(3,Math.max(1,a.difficulty))as 1|2|3,score:a.score,accuracy:a.accuracy,firstAttemptCorrect:a.correct&&a.attempts===1,hintsUsed:a.hintsUsed,attempts:a.attempts,independentCompletion:a.independentCompletion,criticalErrors:a.criticalErrors,completedAt:a.completedAt,source:'mission',assessmentIntegrity:a.correct?'demonstrated':'practice',titleAr:`${titleAr} — أول وردية`,titleEn:`${titleEn} — First Shift`}}
export function calculateSkill(skillId:SkillId,all:SkillEvidence[]):SkillResult{
 const records=all.filter(e=>e.skillId===skillId),activities=new Set(records.map(e=>e.activityId)),successful=new Set(records.filter(e=>e.accuracy>=70&&e.criticalErrors===0).map(e=>e.activityId)),verified=records.some(e=>e.source==='verified_assessment'&&(e.assessmentIntegrity==='verified_local_beta'||e.assessmentIntegrity==='verified_server'));
 if(!records.length)return{skillId,status:'unassessed',score:null,confidence:'insufficient',evidenceCount:0,uniqueActivities:0,successfulActivities:0};
 let total=0,weight=0;for(const e of records){const w=1+(e.difficulty-1)*.25;const value=e.accuracy*.55+e.score*.2+(e.independentCompletion?10:0)+(e.firstAttemptCorrect?10:0)+e.difficulty*2.5-e.criticalErrors*12-e.hintsUsed*3;total+=Math.max(0,Math.min(100,value))*w;weight+=w}
 const score=activities.size<2?null:Math.round(Math.min(100,total/weight+Math.min(6,(activities.size-1)*2)));
 const status=verified?'verified':successful.size>=2&&(score??0)>=70?'demonstrated':'practiced';
 const confidence=activities.size<2?'insufficient':activities.size<4?'developing':activities.size<7?'strong':'extensive';
 return{skillId,status,score,confidence,evidenceCount:records.length,uniqueActivities:activities.size,successfulActivities:successful.size};
}
export const calculatePassport=(all:SkillEvidence[])=>skillIds.map(id=>calculateSkill(id,all));
export function calculateRoleReadiness(roleId:RoleId,passport:SkillResult[]):RoleReadiness{
 const role=roleCatalog[roleId],items=Object.entries(role.skills)as[SkillId,number][],available=items.filter(([id])=>passport.find(s=>s.skillId===id)?.score!==null),coverage=available.reduce((n,[,w])=>n+w,0),evaluatedSkills=available.length;
 if(evaluatedSkills<3||coverage<.4)return{roleId,score:null,coverage:Math.round(coverage*100),status:'not_enough_evidence',evaluatedSkills};
 const raw=available.reduce((n,[id,w])=>n+(passport.find(s=>s.skillId===id)!.score??0)*w,0)/coverage,score=Math.round(raw*Math.min(1,.65+coverage*.35));
 return{roleId,score,coverage:Math.round(coverage*100),status:score>=70?'ready':'developing',evaluatedSkills};
}
export function accountingDna(passport:SkillResult[],evidence:SkillEvidence[]){const demonstrated=passport.filter(s=>s.status==='demonstrated'||s.status==='verified').sort((a,b)=>(b.score??0)-(a.score??0));if(new Set(evidence.filter(e=>e.accuracy>=70).map(e=>e.activityId)).size<3||demonstrated.length<3)return null;const ids=new Set(demonstrated.slice(0,5).map(s=>s.skillId));const archetype=ids.has('journal-entries')&&ids.has('document-analysis')?'transaction-specialist':ids.has('error-detection')?'error-investigator':ids.has('bank-reconciliation')?'reconciliation-specialist':ids.has('month-end-closing')?'closing-specialist':'accounting-generalist';return{archetype,strengths:demonstrated.slice(0,3).map(s=>s.skillId),improvements:passport.filter(s=>s.status==='unassessed').slice(0,3).map(s=>s.skillId)}}
