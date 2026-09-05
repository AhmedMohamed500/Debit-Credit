import type { DemoCandidate } from "@/data/employers";
import type { GameSkillId } from "@/types";
export interface CandidateFilters{skill?:GameSkillId;minReadiness:number;minAccuracy:number;minLevel:number}
export function filterCandidates(candidates:DemoCandidate[],filters:CandidateFilters){return candidates.filter(candidate=>candidate.level>=filters.minLevel&&candidate.readiness>=filters.minReadiness&&candidate.accuracy>=filters.minAccuracy&&(!filters.skill||(candidate.skills[filters.skill]??0)>0)).sort((a,b)=>b.readiness-a.readiness)}

