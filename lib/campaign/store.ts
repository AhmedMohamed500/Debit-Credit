"use client";
import { useEffect, useState } from 'react';
import { initialState, safeLoad } from './director';
import type { GameState } from './model';
export const GAME_KEY='debit-credit-world-v2';
const EVENT='debit-credit-world-updated';
let memory:GameState|undefined;
export function readGame():GameState{if(typeof window==='undefined')return initialState();if(memory?.storageWarning)return memory;try{return safeLoad(localStorage.getItem(GAME_KEY));}catch{return memory??initialState();}}
export function changeGame(fn:(s:GameState)=>GameState){const s=fn(readGame());try{localStorage.setItem(GAME_KEY,JSON.stringify(s));delete s.storageWarning;}catch{s.storageWarning='Storage unavailable: keep this tab open; progress is only in memory.';}memory=s;window.dispatchEvent(new CustomEvent(EVENT,{detail:s}));window.dispatchEvent(new CustomEvent('debit-credit-sound-event',{detail:{type:'state-change'}}));return s;}
export function useGame(){const [state,setState]=useState(initialState);const [ready,setReady]=useState(false);useEffect(()=>{setState(readGame());setReady(true);const update=(e:Event)=>setState(e instanceof CustomEvent?e.detail:readGame());window.addEventListener(EVENT,update);window.addEventListener('storage',update);return()=>{window.removeEventListener(EVENT,update);window.removeEventListener('storage',update);};},[]);return {state,ready,change:changeGame};}
export function archiveLegacyEducation(){if(typeof window==='undefined')return;changeGame(s=>{if(Object.keys(s.legacy).length)return s;const legacy:Record<string,unknown>={};for(const key of ['debit-credit-player-v1','debit-credit-progress-v1','debit-credit-money-flow-v1','debit-credit-missions-v1','debit-credit-detective-v1','debit-credit-arena-v1']){try{const value=localStorage.getItem(key);if(value)legacy[key]=JSON.parse(value);}catch{}}return {...s,legacy};});}
