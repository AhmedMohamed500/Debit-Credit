import type{Locale}from'@/types';
export type GameDestinationId='game-hub'|'inbox'|'missions'|'journal'|'ledger'|'trial-balance'|'financial-statements'|'nature-of-accounts'|'skill-passport'|'career'|'leaderboard'|'academy';
export type MizanZoneId='suppliers'|'customers'|'bank'|'logistics'|'month-end';
type Words={ar:string;en:string};
export interface GameDestination{id:GameDestinationId;path:string;label:Words}
export interface MizanZone{id:MizanZoneId;path:string;title:Words;subtitle:Words;status:'available'|'locked';skillIds:string[];caseIds:string[]}
export const GAME_DESTINATIONS:GameDestination[]=[
 {id:'game-hub',path:'/game',label:{ar:'مركز اللعب',en:'Game Hub'}},{id:'inbox',path:'/game/inbox',label:{ar:'الوارد',en:'Inbox'}},{id:'missions',path:'/challenges',label:{ar:'المهام',en:'Missions'}},{id:'journal',path:'/journal',label:{ar:'اليومية',en:'Journal'}},{id:'ledger',path:'/ledger',label:{ar:'دفتر الأستاذ',en:'Ledger'}},{id:'trial-balance',path:'/trial-balance',label:{ar:'ميزان المراجعة',en:'Trial Balance'}},{id:'financial-statements',path:'/financial-statements',label:{ar:'القوائم المالية',en:'Financial Statements'}},{id:'nature-of-accounts',path:'/account-guide',label:{ar:'طبيعة الحسابات',en:'Nature of Accounts'}},{id:'skill-passport',path:'/career-profile/skills',label:{ar:'جواز المهارات',en:'Skill Passport'}},{id:'career',path:'/career',label:{ar:'المسار المهني',en:'Career Hub'}},{id:'leaderboard',path:'/leaderboard',label:{ar:'الترتيب',en:'Leaderboard'}},{id:'academy',path:'/academy',label:{ar:'الأكاديمية',en:'Academy'}}
];
export const MIZAN_ZONES:MizanZone[]=[
 {id:'suppliers',path:'/game/suppliers',title:{ar:'الموردون',en:'Suppliers'},subtitle:{ar:'المشتريات والفواتير',en:'Purchases & invoices'},status:'available',skillIds:['accounts-payable','supplier-documents','document-analysis'],caseIds:['supplier-invoice']},
 {id:'customers',path:'/game/customers',title:{ar:'العملاء',en:'Customers'},subtitle:{ar:'المبيعات والعملاء',en:'Sales & receivables'},status:'available',skillIds:['accounts-receivable','cash-treasury','document-analysis'],caseIds:['customer-receipt']},
 {id:'bank',path:'/game/bank',title:{ar:'البنك',en:'Bank'},subtitle:{ar:'النقدية والتسويات',en:'Cash & bank accounting'},status:'available',skillIds:['cash-treasury','accounts-receivable','document-analysis'],caseIds:['customer-receipt']},
 {id:'logistics',path:'/game/logistics',title:{ar:'اللوجستيات',en:'Logistics'},subtitle:{ar:'المخزون والاستلام',en:'Inventory & receiving'},status:'locked',skillIds:['inventory-accounting','document-analysis'],caseIds:[]},
 {id:'month-end',path:'/game/month-end',title:{ar:'نهاية الشهر',en:'Month End'},subtitle:{ar:'أسبوع الإقفال · مقفول',en:'Closing Week · locked'},status:'locked',skillIds:['bank-reconciliation','month-end-closing','adjusting-entries'],caseIds:[]}
];
export const destination=(id:GameDestinationId)=>GAME_DESTINATIONS.find(item=>item.id===id)!;
export const zone=(id:MizanZoneId)=>MIZAN_ZONES.find(item=>item.id===id)!;
export const localizedPath=(locale:Locale,path:string)=>`/${locale}${path}`;
