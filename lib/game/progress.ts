"use client";
import { applyGameActivity, createPlayerState, derivePlayerSnapshot, mapExternalSkills } from "@/lib/game/engine";
import type { GameActivityKind, GameSkillId, PlayerSnapshot, PlayerState } from "@/types/game";

export const PLAYER_STORAGE_KEY="debit-credit-player-v1",PLAYER_UPDATED="debit-credit-player-updated",PLAYER_SYNC_MARKER="debit-credit-player-sync-v1";
export function loadPlayerState():PlayerState{if(typeof window==="undefined")return createPlayerState();try{const parsed=JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)||"null") as PlayerState|null;return parsed?.schemaVersion===1&&parsed.activities?{...createPlayerState(parsed.displayName),...parsed}:createPlayerState()}catch{return createPlayerState()}}
export function savePlayerState(state:PlayerState){if(typeof window!=="undefined"){localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent(PLAYER_UPDATED,{detail:state}))}return state}
export function recordGameActivity(kind:GameActivityKind,id:string,score:number,skills:GameSkillId[],completedAt?:string,attempts=1){return savePlayerState(applyGameActivity(loadPlayerState(),{kind,id,score,skills,completedAt,attempts}))}
export function loadPlayerSnapshot():PlayerSnapshot{return derivePlayerSnapshot(loadPlayerState())}
export function updatePlayerName(displayName:string){return savePlayerState({...loadPlayerState(),displayName:displayName.trim()||"Debit & Credit Learner"})}
export function spendCoins(amount:number){const current=loadPlayerState();if(amount<0||current.coins<amount)return false;savePlayerState({...current,coins:current.coins-amount});return true}
export function subscribePlayer(handler:(snapshot:PlayerSnapshot)=>void){if(typeof window==="undefined")return()=>undefined;const listener=()=>handler(loadPlayerSnapshot());window.addEventListener(PLAYER_UPDATED,listener);return()=>window.removeEventListener(PLAYER_UPDATED,listener)}

type StoredRecord={completed?:boolean;solved?:boolean;bestScore?:number;bestAccuracy?:number;lastPlayedAt?:string;lastCompletedAt?:string};
export function syncExistingEducationProgress(){
  if(typeof window==="undefined"||localStorage.getItem(PLAYER_SYNC_MARKER))return loadPlayerSnapshot();let state=loadPlayerState();
  const apply=(kind:GameActivityKind,id:string,score:number,skills:GameSkillId[],date?:string)=>{state=applyGameActivity(state,{kind,id,score,skills,completedAt:date??new Date().toISOString()})};
  try{const academy=JSON.parse(localStorage.getItem("debit-credit-progress-v1")||"{}");for(const id of academy.completedLessonIds??[])apply("lesson",id,academy.quizScores?.[id]??80,["fundamentals","debit-credit"],new Date().toISOString())}catch{}
  for(const [key,kind,skills] of [["debit-credit-money-flow-v1","money-flow",["transaction-analysis","debit-credit"]],["debit-credit-missions-v1","mission",["business-cases","journal-entries"]],["debit-credit-detective-v1","detective",["error-detection","business-cases"]]] as const){try{const parsed=JSON.parse(localStorage.getItem(key)||"{}");for(const [id,value] of Object.entries(parsed.records??{})){const item=value as StoredRecord;if(item.completed||item.solved)apply(kind,id,item.bestAccuracy??item.bestScore??80,[...skills],item.lastPlayedAt??item.lastCompletedAt)}}catch{}}
  try{const arena=JSON.parse(localStorage.getItem("debit-credit-arena-v1")||"{}");for(const attempt of arena.attempts??[])apply(attempt.mode==="daily"?"daily":"arena",attempt.caseId,attempt.accuracy??0,mapExternalSkills(attempt.skills??[]),attempt.completedAt)}catch{}
  savePlayerState(state);localStorage.setItem(PLAYER_SYNC_MARKER,new Date().toISOString());return derivePlayerSnapshot(state);
}

