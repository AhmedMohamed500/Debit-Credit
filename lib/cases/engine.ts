import type { GameState } from '@/lib/campaign/model';
import { firstShiftCases,FIRST_SHIFT_RUBRIC_VERSION,FIRST_SHIFT_SCENARIO_VERSION,getFirstShiftCase } from './first-shift-cases';
import type { AccountingCaseAction,AccountingCaseRuntime,CaseActionResult,CaseworkState,GameplayEvent,GameplayEventOutcome,GameplayEventType,GameplayPayload } from './model';
import { gameStateCaseworkRepository } from './repository';

const iso=(now:number)=>new Date(now).toISOString();
const attemptId=(caseId:string)=>`first-shift/${caseId}/attempt-1`;
const emptyRuntime=(caseId:string):AccountingCaseRuntime=>({caseId,status:'new',attemptId:attemptId(caseId),openedAt:null,inspectedDocumentIds:[],selectedActions:[],submissionCount:0,managerHelpCount:0,resolvedAt:null});
export const emptyCasework=():CaseworkState=>({schemaVersion:1,scenarioVersion:FIRST_SHIFT_SCENARIO_VERSION,rubricVersion:FIRST_SHIFT_RUBRIC_VERSION,localCandidateId:'local-player',shiftStartedAt:null,workMinutes:0,cases:Object.fromEntries(firstShiftCases.map(item=>[item.id,emptyRuntime(item.id)])),events:[],scheduledConsequences:[]});

export function caseworkState(state:GameState):CaseworkState{
 const saved=gameStateCaseworkRepository.read(state);if(saved?.schemaVersion===1&&Array.isArray(saved.events))return{...emptyCasework(),...saved,cases:Object.fromEntries(firstShiftCases.map(item=>[item.id,{...emptyRuntime(item.id),...saved.cases?.[item.id]}]))};
 const base=emptyCasework(),progress=state.legacy['first-day'] as {completed?:string[]}|undefined;
 for(const id of progress?.completed??[]){if(base.cases[id])base.cases[id]={...base.cases[id],status:'resolved',resolvedAt:state.evidence.filter(item=>item.activityId===`first-day/${id}`&&item.correct).at(-1)?.completedAt??null};}
 return base;
}
const save=(state:GameState,casework:CaseworkState):GameState=>gameStateCaseworkRepository.write(state,casework);
const event=(casework:CaseworkState,type:GameplayEventType,id:string,now:number,caseId:string|null,attempt:string|null,payload:GameplayPayload={},outcome:GameplayEventOutcome='recorded',reference:string|null=null):GameplayEvent=>({eventId:id,schemaVersion:1,scenarioVersion:casework.scenarioVersion,rubricVersion:casework.rubricVersion,timestamp:iso(now),chapterId:1,caseId,attemptId:attempt,localCandidateId:casework.localCandidateId,eventType:type,payload,outcome,accountingReference:reference});
const append=(casework:CaseworkState,...events:GameplayEvent[])=>({...casework,events:[...casework.events,...events.filter(item=>!casework.events.some(existing=>existing.eventId===item.eventId))]});

export function startFirstShiftCasework(state:GameState,now=Date.now()):GameState{
 let work=caseworkState(state);if(work.shiftStartedAt)return save(state,work);
 work={...work,shiftStartedAt:iso(now)};work=append(work,event(work,'shift_started','first-shift:shift_started',now,null,null,{scheduledStart:'09:00'}),...firstShiftCases.map(item=>event(work,'case_received',`${attemptId(item.id)}:case_received`,now,item.id,attemptId(item.id),{documentCount:item.documents.length},'recorded',item.accountingReference)));
 return save(state,work);
}
export function openAccountingCase(state:GameState,caseId:string,now=Date.now()):GameState{
 const next=startFirstShiftCasework(state,now),definition=getFirstShiftCase(caseId);let work=caseworkState(next),runtime=work.cases[caseId];if(!runtime||!definition||runtime.status==='resolved')return next;
 runtime={...runtime,status:runtime.status==='new'?'opened':runtime.status,openedAt:runtime.openedAt??iso(now),inspectedDocumentIds:[...new Set([...runtime.inspectedDocumentIds,definition.primaryDocumentId])]};work={...work,cases:{...work.cases,[caseId]:runtime}};
 work=append(work,event(work,'case_opened',`${runtime.attemptId}:case_opened`,now,caseId,runtime.attemptId,{},'recorded',definition.accountingReference),event(work,'document_inspected',`${runtime.attemptId}:document_inspected:${definition.primaryDocumentId}`,now,caseId,runtime.attemptId,{documentId:definition.primaryDocumentId},'recorded',definition.accountingReference));return save(next,work);
}
export function inspectCaseDocument(state:GameState,caseId:string,documentId:string,now=Date.now()):GameState{
 const definition=getFirstShiftCase(caseId),work=caseworkState(state),runtime=work.cases[caseId],document=definition?.documents.find(item=>item.id===documentId);if(!runtime||!document||runtime.status==='resolved')return state;
 const updated={...runtime,status:'investigating' as const,inspectedDocumentIds:[...new Set([...runtime.inspectedDocumentIds,documentId])]};let next={...work,cases:{...work.cases,[caseId]:updated}};const type=document.kind==='source'?'document_inspected':'supporting_document_inspected';next=append(next,event(next,type,`${runtime.attemptId}:${type}:${documentId}`,now,caseId,runtime.attemptId,{documentId,documentKind:document.kind},'recorded',definition!.accountingReference));return save(state,next);
}
export function selectCaseAction(state:GameState,caseId:string,action:AccountingCaseAction,now=Date.now()):CaseActionResult{
 const definition=getFirstShiftCase(caseId),work=caseworkState(state),runtime=work.cases[caseId];if(!definition||!runtime||runtime.status==='resolved')return{state,readyToPost:false,missingDocumentIds:[],outcome:'blocked'};
 const required=definition.documents.filter(item=>item.required).map(item=>item.id),missing=required.filter(id=>!runtime.inspectedDocumentIds.includes(id)),ready=action==='post'&&missing.length===0,outcome:GameplayEventOutcome=ready?'accepted':action==='post'?'blocked':'recorded';
 const updated={...runtime,status:(ready?'ready':action==='post'?'investigating':'waiting') as AccountingCaseRuntime['status'],selectedActions:[...new Set([...runtime.selectedActions,action])]};let next={...work,cases:{...work.cases,[caseId]:updated}};next=append(next,event(next,'case_action_selected',`${runtime.attemptId}:case_action_selected:${action}`,now,caseId,runtime.attemptId,{action,missingDocumentIds:missing},outcome,definition.accountingReference));return{state:save(state,next),readyToPost:ready,missingDocumentIds:missing,outcome};
}
export function requestCaseManagerHelp(state:GameState,caseId:string,now=Date.now()):GameState{
 const definition=getFirstShiftCase(caseId),work=caseworkState(state),runtime=work.cases[caseId];if(!definition||!runtime||runtime.status==='resolved')return state;const count=Math.min(definition.managerGuidance.length,runtime.managerHelpCount+1);if(count===runtime.managerHelpCount)return state;
 const updated={...runtime,managerHelpCount:count};let next={...work,cases:{...work.cases,[caseId]:updated}};next=append(next,event(next,'manager_help_requested',`${runtime.attemptId}:manager_help_requested:${count}`,now,caseId,runtime.attemptId,{guidanceLevel:count},'recorded',definition.accountingReference));return save(state,next);
}
export function recordCaseEntrySubmission(state:GameState,caseId:string,correct:boolean,balanced:boolean,now=Date.now()):GameState{
 const definition=getFirstShiftCase(caseId),work=caseworkState(state),runtime=work.cases[caseId];if(!definition||!runtime||runtime.status==='resolved')return state;const submission=runtime.submissionCount+1,resolvedAt=correct?iso(now):null;
 const updated={...runtime,status:(correct?'resolved':'ready') as AccountingCaseRuntime['status'],submissionCount:submission,resolvedAt};let next={...work,cases:{...work.cases,[caseId]:updated}};next=append(next,event(next,'entry_submitted',`${runtime.attemptId}:entry_submitted:${submission}`,now,caseId,runtime.attemptId,{submission,balanced,semanticCorrect:correct},correct?'correct':'incorrect',definition.accountingReference));
 if(correct)next=append(next,event(next,'case_posted',`${runtime.attemptId}:case_posted`,now,caseId,runtime.attemptId,{journalReference:`first-day/${caseId}`},'accepted',definition.accountingReference),event(next,'case_resolved',`${runtime.attemptId}:case_resolved`,now,caseId,runtime.attemptId,{resolution:'posted'},'resolved',definition.accountingReference));
 const resolved=Object.values(next.cases).filter(item=>item.status==='resolved').length;next={...next,workMinutes:resolved===3?450:resolved*90};if(resolved===firstShiftCases.length)next=append(next,event(next,'shift_completed','first-shift:shift_completed',now,null,null,{resolvedCases:resolved,workdayEnd:'16:30'},'resolved'));
 return save(state,next);
}
export const caseClock=(state:GameState)=>{const minutes=9*60+caseworkState(state).workMinutes,hours=Math.floor(minutes/60)%24,mins=minutes%60;return`${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;};
