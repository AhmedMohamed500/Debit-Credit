import{emptyCompetition,type CompetitionState}from'./v2';
export const COMPETITION_V2_KEY='debit-credit-competition-v2';
export class BrowserCompetitionRepository{get():CompetitionState{if(typeof localStorage==='undefined')return emptyCompetition();try{const value=JSON.parse(localStorage.getItem(COMPETITION_V2_KEY)??'null')as CompetitionState;return value?.version===2&&Array.isArray(value.results)?value:emptyCompetition()}catch{return emptyCompetition()}}save(value:CompetitionState){localStorage.setItem(COMPETITION_V2_KEY,JSON.stringify(value));return value}}
