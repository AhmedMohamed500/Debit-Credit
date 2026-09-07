import { w, type Account, type Attempt, type GameState, type Line, type Words } from './model';

export type FirstDayDocumentId='supplier-invoice'|'customer-receipt'|'office-expense';
export type FirstDayDocument={id:FirstDayDocumentId;number:string;title:Words;party:Words;subtitle:Words;date:Words;amount:number;accent:'blue'|'green'|'orange';details:{label:Words;value:Words}[];expected:Line[]};
export type FirstDayProgress={cinematicSeen:boolean;opened:FirstDayDocumentId[];completed:FirstDayDocumentId[];rewarded:boolean};

export const FIRST_DAY_KEY='first-day';
export const firstDayDocuments:FirstDayDocument[]=[
 {id:'supplier-invoice',number:'INV-1048',title:w('Supplier Invoice','فاتورة مورد'),party:w('Al-Noor Supplies','النور للتوريدات'),subtitle:w('Office furniture received on credit','أثاث مكتبي تم استلامه على الحساب'),date:w('12 Mar 2024','١٢ مارس ٢٠٢٤'),amount:100000,accent:'blue',details:[{label:w('Office desks','مكاتب إدارية'),value:w('3 × EGP 30,000','٣ × ٣٠٬٠٠٠ جنيه')},{label:w('Office chairs','كراسي مكتبية'),value:w('5 × EGP 2,000','٥ × ٢٬٠٠٠ جنيه')},{label:w('Payment','السداد'),value:w('Due in 30 days','آجل خلال ٣٠ يومًا')}],expected:[{account:'equipment',debit:100000,credit:0},{account:'suppliers',debit:0,credit:100000}]},
 {id:'customer-receipt',number:'REC-4587',title:w('Customer Receipt','سند قبض عميل'),party:w('Elite Stores','إيليت ستورز'),subtitle:w('Collection of an existing receivable','تحصيل مديونية عميل قائمة'),date:w('12 Mar 2024','١٢ مارس ٢٠٢٤'),amount:75000,accent:'green',details:[{label:w('Receipt no.','رقم السند'),value:w('4587','٤٥٨٧')},{label:w('Method','الطريقة'),value:w('Bank transfer','تحويل بنكي')},{label:w('Reference','المرجع'),value:w('Old customer invoice','فاتورة عميل سابقة')}],expected:[{account:'bank',debit:75000,credit:0},{account:'customers',debit:0,credit:75000}]},
 {id:'office-expense',number:'PV-2201',title:w('Office Expense','مصروف مكتب'),party:w('QuickMart','كويك مارت'),subtitle:w('Stationery paid immediately','أدوات مكتبية مدفوعة فورًا'),date:w('12 Mar 2024','١٢ مارس ٢٠٢٤'),amount:2500,accent:'orange',details:[{label:w('Items','البيان'),value:w('Stationery & office tools','أدوات كتابية ومكتبية')},{label:w('Method','الطريقة'),value:w('Petty cash','نقدية من الصندوق')},{label:w('Period','الفترة'),value:w('Current month','الشهر الحالي')}],expected:[{account:'officeExpense',debit:2500,credit:0},{account:'cash',debit:0,credit:2500}]},
];

export const emptyFirstDay=():FirstDayProgress=>({cinematicSeen:false,opened:[],completed:[],rewarded:false});
export function firstDayProgress(s:GameState):FirstDayProgress{return {...emptyFirstDay(),...((s.legacy[FIRST_DAY_KEY] as FirstDayProgress|undefined)??{})};}
export function markCinematicSeen(s:GameState):GameState{return saveProgress(s,{...firstDayProgress(s),cinematicSeen:true});}
export function openFirstDayDocument(s:GameState,id:FirstDayDocumentId):GameState{const p=firstDayProgress(s);return saveProgress(s,{...p,opened:[...new Set([...p.opened,id])]});}
const normalize=(lines:Line[])=>lines.filter(l=>l.debit||l.credit).map(l=>`${l.account}:${l.debit}:${l.credit}`).sort().join('|');
export function submitFirstDayDocument(s:GameState,id:FirstDayDocumentId,draft:string,now=Date.now()){
 const doc=firstDayDocuments.find(d=>d.id===id);if(!doc)return {state:s,correct:false};let lines:Line[]=[];try{lines=JSON.parse(draft);}catch{}
 const correct=Array.isArray(lines)&&normalize(lines)===normalize(doc.expected);const prior=s.evidence.filter(e=>e.activityId===`first-day/${id}`).length;
 const evidence:Attempt={activityId:`first-day/${id}`,missionId:'first-day',chapterId:1,skillId:'journal',difficulty:1,accuracy:correct?100:0,attempts:prior+1,hintsUsed:0,completionTime:0,independentCompletion:correct&&prior===0,criticalErrors:correct?0:1,score:correct?Math.max(70,100-prior*10):0,completedAt:new Date(now).toISOString(),mode:'practice',response:draft,correct};
 let next={...s,evidence:[...s.evidence,evidence]};if(!correct)return {state:next,correct};const p=firstDayProgress(next),completed=[...new Set([...p.completed,id])];
 if(!next.journal.some(j=>j.id===`first-day/${id}`))next={...next,journal:[...next.journal,{id:`first-day/${id}`,documentIds:[doc.number],lines:doc.expected}]};
 const missionComplete=completed.length===firstDayDocuments.length,rewarded=p.rewarded||missionComplete;
 next={...next,xp:next.xp+(missionComplete&&!p.rewarded?100:0),coins:next.coins+(missionComplete&&!p.rewarded?50:0),rewardKeys:missionComplete?[...new Set([...next.rewardKeys,'first-day-complete'])]:next.rewardKeys};
 next=saveProgress(next,{...p,completed,rewarded});return {state:next,correct};
}
function saveProgress(s:GameState,p:FirstDayProgress):GameState{return {...s,legacy:{...s.legacy,[FIRST_DAY_KEY]:p}};}
export function firstDayCompany(s:GameState){const completed=firstDayProgress(s).completed;return {assets:1250000+(completed.includes('supplier-invoice')?100000:0)-(completed.includes('office-expense')?2500:0),liabilities:730000+(completed.includes('supplier-invoice')?100000:0),revenue:420000,profit:85000-(completed.includes('office-expense')?2500:0)};}
export function accountLabel(account:Account,locale:'ar'|'en'){const names:Record<Account,Words>={cash:w('Cash','الصندوق'),bank:w('Bank','البنك'),inventory:w('Inventory','المخزون'),equipment:w('Office equipment','الأجهزة والمعدات'),customers:w('Accounts receivable','العملاء'),suppliers:w('Accounts payable','الموردون'),capital:w('Capital','رأس المال'),revenue:w('Revenue','الإيرادات'),rent:w('Rent expense','مصروف الإيجار'),officeExpense:w('Office supplies expense','مصروف الأدوات المكتبية'),salary:w('Salary expense','مصروف الرواتب'),accrual:w('Accrued salaries','رواتب مستحقة'),depreciation:w('Depreciation expense','مصروف الإهلاك'),accumulated:w('Accumulated depreciation','مجمع الإهلاك')};return names[account][locale];}
