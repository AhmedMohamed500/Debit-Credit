import {roleCatalog,skillCatalog} from '@/lib/career/catalog';
import type {RoleId,SkillId,SkillResult} from '@/lib/career/model';
import {missionRoutes} from '@/lib/career-league/catalog';
import type {CareerLeagueState} from '@/lib/career-league/model';
import type {PlacementArea,PlacementResult} from '@/lib/placement/model';

export type MapStatus='locked'|'available'|'practiced'|'demonstrated'|'planned';
export interface CareerMapNode{skillId:SkillId;status:MapStatus;route:string|null;missionId:string|null;why:{ar:string;en:string};roles:RoleId[]}
const areaSkill:Record<PlacementArea,SkillId>={
 classification:'account-classification','debit-credit':'debit-credit',journals:'journal-entries',documents:'document-analysis',ledger:'ledger-posting','trial-balance':'trial-balance',ap:'accounts-payable',ar:'accounts-receivable',bank:'bank-reconciliation',accruals:'adjusting-entries',prepayments:'expense-recognition','cut-off':'expense-recognition','month-end':'month-end-closing',controls:'error-detection',review:'error-detection',
};
const preferredGeneral:SkillId[]=['journal-entries','bank-reconciliation','adjusting-entries','expense-recognition','trial-balance','month-end-closing','financial-statements'];
const fallbackRoute:Partial<Record<SkillId,string>>={'accounting-fundamentals':'/bootcamp','debit-credit':'/bootcamp','expense-recognition':'/game/month-end','financial-statements':'/financial-statements','error-detection':'/game/first-shift'};
export function diagnosticSkillIds(areas:PlacementArea[]):SkillId[]{return [...new Set(areas.map(area=>areaSkill[area]))]}
export function targetSkillIds(role:RoleId):SkillId[]{const weighted=Object.entries(roleCatalog[role].skills).sort((a,b)=>(b[1]??0)-(a[1]??0)).map(([id])=>id as SkillId);return role==='general-accountant'?preferredGeneral:[...weighted.slice(0,7)]}
export function personalCareerGap(role:RoleId,passport:SkillResult[],diagnostic:PlacementResult|null){
 const required=targetSkillIds(role),strong=required.filter(id=>passport.some(item=>item.skillId===id&&item.status==='demonstrated')),practiced=passport.filter(item=>item.status==='practiced'||item.status==='demonstrated').map(item=>item.skillId),missing=required.filter(id=>!strong.includes(id)&&!practiced.includes(id));
 return {strong,practiced,missing,diagnosticStrengths:diagnosticSkillIds(diagnostic?.strengths??[]),diagnosticGaps:diagnosticSkillIds(diagnostic?.gaps??[])};
}
export function personalCareerMap(state:CareerLeagueState,passport:SkillResult[],diagnostic:PlacementResult|null):CareerMapNode[]{
 const role=state.targetRoleId??'junior-accountant',gap=personalCareerGap(role,passport,diagnostic),required=targetSkillIds(role),firstUnmet=required.find(id=>{const mission=Object.values(missionRoutes).find(item=>item.skillId===id);return !gap.strong.includes(id)&&!gap.practiced.includes(id)&&!(mission?.locked)&&Boolean(mission?.route??fallbackRoute[id])});
 return required.map(skillId=>{
  const mission=Object.entries(missionRoutes).find(([,item])=>item.skillId===skillId),route=mission?.[1].route??fallbackRoute[skillId]??null;
  const status:MapStatus=gap.strong.includes(skillId)?'demonstrated':gap.practiced.includes(skillId)?'practiced':mission?.[1].locked||!route?'planned':skillId===firstUnmet?'available':'locked';
  const roles=[role,...(Object.keys(roleCatalog)as RoleId[]).filter(id=>id!==role&&roleCatalog[id].skills[skillId])].slice(0,4);
  return {skillId,status,route:status==='planned'?null:route,missionId:mission?.[0]??null,why:skillCatalog[skillId].description,roles};
 });
}
export function nextCareerActivity(nodes:CareerMapNode[]){return nodes.find(item=>item.status==='available')??nodes.find(item=>item.status==='locked'&&item.route)??null}
