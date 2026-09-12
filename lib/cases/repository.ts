import type { GameState } from '@/lib/campaign/model';
import type { CaseworkState,GameplayEvent } from './model';

export interface CaseworkRepository<Container>{read(container:Container):CaseworkState|undefined;write(container:Container,state:CaseworkState):Container}
export interface GameplayEventRepository<Container>{list(container:Container):GameplayEvent[];append(container:Container,events:GameplayEvent[]):Container}

export const gameStateCaseworkRepository:CaseworkRepository<GameState>={read:state=>state.casework,write:(state,casework)=>({...state,casework})};
export const gameStateEventRepository:GameplayEventRepository<GameState>={list:state=>state.casework?.events??[],append:(state,events)=>state.casework?{...state,casework:{...state.casework,events:[...state.casework.events,...events.filter(event=>!state.casework!.events.some(existing=>existing.eventId===event.eventId))]}}:state};
