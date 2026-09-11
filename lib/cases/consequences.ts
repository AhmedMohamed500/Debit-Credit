import type{GameState}from'@/lib/campaign/model';
import{caseworkState}from'./engine';
import type{CaseConsequenceDefinition,GameplayEvent,ScheduledCaseConsequence}from'./model';
import{gameStateCaseworkRepository}from'./repository';

const consequenceEvent=(state:ReturnType<typeof caseworkState>,type:'consequence_scheduled'|'consequence_revealed',item:ScheduledCaseConsequence,now:number):GameplayEvent=>({eventId:`first-shift/${item.sourceCaseId}:${type}:${item.consequenceId}`,schemaVersion:1,scenarioVersion:state.scenarioVersion,rubricVersion:state.rubricVersion,timestamp:new Date(now).toISOString(),chapterId:1,caseId:item.sourceCaseId,attemptId:state.cases[item.sourceCaseId]?.attemptId??null,localCandidateId:state.localCandidateId,eventType:type,payload:{consequenceId:item.consequenceId,timing:item.definition.timing,affectedAccounts:item.definition.affectedAccounts??[]},outcome:'recorded',accountingReference:null});

export function scheduleCaseConsequence(state:GameState,sourceCaseId:string,definition:CaseConsequenceDefinition,now=Date.now()):GameState{
 const work=caseworkState(state);if(work.scheduledConsequences.some(item=>item.consequenceId===definition.id))return state;
 const item:ScheduledCaseConsequence={consequenceId:definition.id,sourceCaseId,definition,scheduledAt:new Date(now).toISOString(),revealedAt:null},scheduledConsequences=[...work.scheduledConsequences,item],scheduled=consequenceEvent(work,'consequence_scheduled',item,now);
 return gameStateCaseworkRepository.write(state,{...work,scheduledConsequences,events:[...work.events,scheduled]});
}

export function revealDueConsequences(state:GameState,afterCaseId:string|null,atShiftEnd=false,now=Date.now()):GameState{
 const work=caseworkState(state),due=work.scheduledConsequences.filter(item=>!item.revealedAt&&(item.definition.timing==='immediate'||(item.definition.timing==='after_case'&&item.definition.revealAfterCaseId===afterCaseId)||(item.definition.timing==='shift_end'&&atShiftEnd)));
 if(!due.length)return state;const ids=new Set(due.map(item=>item.consequenceId)),scheduledConsequences=work.scheduledConsequences.map(item=>ids.has(item.consequenceId)?{...item,revealedAt:new Date(now).toISOString()}:item),events=[...work.events,...due.map(item=>consequenceEvent(work,'consequence_revealed',item,now)).filter(event=>!work.events.some(existing=>existing.eventId===event.eventId))];
 return gameStateCaseworkRepository.write(state,{...work,scheduledConsequences,events});
}
