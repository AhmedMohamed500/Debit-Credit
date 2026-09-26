import {PLATFORM_KEY,type PlatformState} from '@/lib/platform/repository';
import {CAREER_PROFILE_KEY} from '@/lib/career/repository';
import {roleCatalog} from '@/lib/career/catalog';
import type {RoleId} from '@/lib/career/model';
import {createCareerLeagueState,migrateCareerLeagueState} from './engine';
import type {CareerLeagueState} from './model';

export const CAREER_LEAGUE_KEY='debit-credit-career-league-v1';
const storage=()=>typeof window==='undefined'?null:window.localStorage;
export class BrowserCareerLeagueRepository{
 get(){const store=storage();if(!store)return createCareerLeagueState();try{const raw=store.getItem(CAREER_LEAGUE_KEY),row=raw?JSON.parse(raw)as Partial<CareerLeagueState>:null,legacyRaw=store.getItem(PLATFORM_KEY),legacy=legacyRaw?JSON.parse(legacyRaw)as PlatformState:undefined,profileRaw=store.getItem(CAREER_PROFILE_KEY),profile=profileRaw?JSON.parse(profileRaw)as {targetRoleId?:RoleId}:null,next=migrateCareerLeagueState(row,legacy);if((!row||!Object.prototype.hasOwnProperty.call(row,'targetRoleId'))&&profile?.targetRoleId&&Object.prototype.hasOwnProperty.call(roleCatalog,profile.targetRoleId))next.targetRoleId=profile.targetRoleId;return next}catch{return createCareerLeagueState()}}
 save(value:CareerLeagueState){const next=migrateCareerLeagueState({...value,updatedAt:new Date().toISOString()});storage()?.setItem(CAREER_LEAGUE_KEY,JSON.stringify(next));return next}
 clear(){storage()?.removeItem(CAREER_LEAGUE_KEY)}
}
