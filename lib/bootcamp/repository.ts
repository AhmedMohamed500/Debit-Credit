import {createBootcampState,migrateBootcampState} from './engine';
import type {BootcampState} from './model';

export const BOOTCAMP_KEY='debit-credit-bootcamp-v1';
export class BrowserBootcampRepository{get():BootcampState{if(typeof window==='undefined')return createBootcampState();try{return migrateBootcampState(JSON.parse(localStorage.getItem(BOOTCAMP_KEY)??'null'))}catch{return createBootcampState()}}save(state:BootcampState){const next=migrateBootcampState(state);if(typeof window!=='undefined')localStorage.setItem(BOOTCAMP_KEY,JSON.stringify(next));return next}}
