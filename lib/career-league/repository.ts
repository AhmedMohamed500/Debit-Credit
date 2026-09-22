import {PLATFORM_KEY,type PlatformState} from '@/lib/platform/repository';
import {createCareerLeagueState,migrateCareerLeagueState} from './engine';
import type {CareerLeagueState} from './model';

export const CAREER_LEAGUE_KEY='debit-credit-career-league-v1';
const storage=()=>typeof window==='undefined'?null:window.localStorage;
export class BrowserCareerLeagueRepository{
 get(){const store=storage();if(!store)return createCareerLeagueState();try{const raw=store.getItem(CAREER_LEAGUE_KEY);const legacyRaw=store.getItem(PLATFORM_KEY);const legacy=legacyRaw?JSON.parse(legacyRaw)as PlatformState:undefined;return migrateCareerLeagueState(raw?JSON.parse(raw):null,legacy)}catch{return createCareerLeagueState()}}
 save(value:CareerLeagueState){const next=migrateCareerLeagueState({...value,updatedAt:new Date().toISOString()});storage()?.setItem(CAREER_LEAGUE_KEY,JSON.stringify(next));return next}
 clear(){storage()?.removeItem(CAREER_LEAGUE_KEY)}
}
