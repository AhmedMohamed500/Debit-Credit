import{createPlacementState,migratePlacementState}from'./engine';import type{PlacementState}from'./model';
export const PLACEMENT_KEY='debit-credit-placement-v1';
export class BrowserPlacementRepository{get(){if(typeof window==='undefined')return createPlacementState();try{return migratePlacementState(JSON.parse(localStorage.getItem(PLACEMENT_KEY)??'null'))}catch{return createPlacementState()}}save(state:PlacementState){const next=migratePlacementState(state);if(typeof window!=='undefined')localStorage.setItem(PLACEMENT_KEY,JSON.stringify(next));return next}}
