import type {GameState} from './model';
import {firstDayDocuments,firstDayProgress} from './first-day';

const HUB_KEY='first-shift-mission-hub-v1';
type HubSave={ledgerReviewed?:boolean};

export function firstShiftMissionProgress(state:GameState){
 const completed=firstDayProgress(state).completed;
 const cases=firstDayDocuments.map(item=>({id:item.id,done:completed.includes(item.id)}));
 const journalComplete=cases.every(item=>item.done)&&cases.every(item=>state.journal.some(entry=>entry.id===`first-day/${item.id}`));
 const saved=state.legacy[HUB_KEY] as HubSave|undefined;
 const ledgerReviewed=saved?.ledgerReviewed===true;
 const ledgerComplete=journalComplete&&ledgerReviewed;
 const completedCount=cases.filter(item=>item.done).length+Number(journalComplete)+Number(ledgerComplete);
 return {cases,journalComplete,ledgerReviewed,ledgerComplete,completedCount,total:5,level:completedCount===5?2:1};
}

export function markFirstShiftLedgerReviewed(state:GameState):GameState{
 if(!firstShiftMissionProgress(state).journalComplete)return state;
 const saved=state.legacy[HUB_KEY] as HubSave|undefined;
 if(saved?.ledgerReviewed)return state;
 return {...state,legacy:{...state.legacy,[HUB_KEY]:{...saved,ledgerReviewed:true}}};
}
