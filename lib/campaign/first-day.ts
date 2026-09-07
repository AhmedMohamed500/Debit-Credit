import { w,type Account,type Attempt,type GameState,type Line,type Words } from './model';

export type FirstDayDocumentId='supplier-invoice'|'customer-receipt'|'office-expense';
export type FirstDayDocument={id:FirstDayDocumentId;number:string;title:Words;party:Words;subtitle:Words;date:Words;amount:number;accent:'blue'|'green'|'orange';details:{label:Words;value:Words}[];expected:Line[]};
export type FirstDayProgress={cinematicSeen:boolean;introVersion:number;opened:FirstDayDocumentId[];completed:FirstDayDocumentId[];selected:FirstDayDocumentId|null;rewarded:boolean;completionSeen:boolean;mistakes:Partial<Record<FirstDayDocumentId,number>>};
export type FirstDayCompanyState={assets:number;liabilities:number;revenue:number;profit:number;cash:number;bank:number;supplierBalance:number;customerBalance:number;pendingDocuments:number;pendingEntries:number;monthEndProgress:number;ledgerErrors:number;unreconciledAmount:number};

export const FIRST_DAY_KEY='first-day';
export const FIRST_DAY_INTRO_VERSION=3;
export const DOCUMENT_REWARD={xp:25,coins:10};
export const MISSION_REWARD={xp:100,coins:50};
export const firstDayDocuments:FirstDayDocument[]=[
 {id:'supplier-invoice',number:'INV-1048',title:w('Supplier Invoice','فاتورة مورد'),party:w('Al-Noor Supplies','النور للتوريدات'),subtitle:w('Office furniture received on credit','أثاث مكتبي تم استلامه على الحساب'),date:w('12 Mar 2024','١٢ مارس ٢٠٢٤'),amount:100000,accent:'blue',details:[{label:w('Office desks','مكاتب إدارية'),value:w('3 × EGP 30,000','٣ × ٣٠٬٠٠٠ جنيه')},{label:w('Office chairs','كراسي مكتبية'),value:w('5 × EGP 2,000','٥ × ٢٬٠٠٠ جنيه')},{label:w('Payment','السداد'),value:w('Due in 30 days','آجل خلال ٣٠ يومًا')}],expected:[{account:'equipment',debit:100000,credit:0},{account:'suppliers',debit:0,credit:100000}]},
 {id:'customer-receipt',number:'REC-4587',title:w('Customer Receipt','سند قبض عميل'),party:w('Elite Stores','إيليت ستورز'),subtitle:w('Collection of an existing receivable','تحصيل مديونية عميل قائمة'),date:w('12 Mar 2024','١٢ مارس ٢٠٢٤'),amount:75000,accent:'green',details:[{label:w('Receipt no.','رقم السند'),value:w('4587','٤٥٨٧')},{label:w('Method','الطريقة'),value:w('Bank transfer','تحويل بنكي')},{label:w('Reference','المرجع'),value:w('Old customer invoice','فاتورة عميل سابقة')}],expected:[{account:'bank',debit:75000,credit:0},{account:'customers',debit:0,credit:75000}]},
 {id:'office-expense',number:'PV-2201',title:w('Office Expense','مصروف مكتب'),party:w('QuickMart','كويك مارت'),subtitle:w('Stationery paid immediately','أدوات مكتبية مدفوعة فورًا'),date:w('12 Mar 2024','١٢ مارس ٢٠٢٤'),amount:2500,accent:'orange',details:[{label:w('Items','البيان'),value:w('Stationery & office tools','أدوات كتابية ومكتبية')},{label:w('Method','الطريقة'),value:w('Petty cash','نقدية من الصندوق')},{label:w('Period','الفترة'),value:w('Current month','الشهر الحالي')}],expected:[{account:'officeExpense',debit:2500,credit:0},{account:'cash',debit:0,credit:2500}]},
];

export const emptyFirstDay=():FirstDayProgress=>({cinematicSeen:false,introVersion:0,opened:[],completed:[],selected:null,rewarded:false,completionSeen:false,mistakes:{}});
export function firstDayProgress(s:GameState):FirstDayProgress{const saved=(s.legacy[FIRST_DAY_KEY] as Partial<FirstDayProgress>|undefined)??{};return {...emptyFirstDay(),...saved,mistakes:{...saved.mistakes}};}
export function completeFirstDayIntro(s:GameState):GameState{return saveProgress(s,{...firstDayProgress(s),cinematicSeen:true,introVersion:FIRST_DAY_INTRO_VERSION});}
export function selectFirstDayDocument(s:GameState,id:FirstDayDocumentId):GameState{const p=firstDayProgress(s);return saveProgress(s,{...p,selected:id,opened:[...new Set([...p.opened,id])]});}
export function closeFirstDayDocument(s:GameState):GameState{return saveProgress(s,{...firstDayProgress(s),selected:null});}
export function markFirstDayCompletionSeen(s:GameState):GameState{return saveProgress(s,{...firstDayProgress(s),completionSeen:true});}

const normalize=(lines:Line[])=>lines.filter(line=>line.debit||line.credit).map(line=>`${line.account}:${line.debit}:${line.credit}`).sort().join('|');
export function submitFirstDayDocument(s:GameState,id:FirstDayDocumentId,draft:string,now=Date.now(),hintsUsed=0){
 const doc=firstDayDocuments.find(item=>item.id===id);if(!doc)return {state:s,correct:false};let lines:Line[]=[];try{lines=JSON.parse(draft);}catch{}
 const correct=Array.isArray(lines)&&normalize(lines)===normalize(doc.expected),p=firstDayProgress(s),prior=s.evidence.filter(item=>item.activityId===`first-day/${id}`).length;
 const evidence:Attempt={activityId:`first-day/${id}`,missionId:'first-day',chapterId:1,skillId:'journal',difficulty:1,accuracy:correct?100:0,attempts:prior+1,hintsUsed,completionTime:0,independentCompletion:correct&&prior===0&&hintsUsed===0,criticalErrors:correct?0:1,score:correct?Math.max(70,100-prior*10-hintsUsed*5):0,completedAt:new Date(now).toISOString(),mode:'practice',response:draft,correct};
 let next={...s,evidence:[...s.evidence,evidence]};
 if(!correct){const mistakes={...p.mistakes,[id]:(p.mistakes[id]??0)+1};return {state:saveProgress(next,{...p,mistakes,selected:id}),correct};}
 const alreadyComplete=p.completed.includes(id),completed=[...new Set([...p.completed,id])],missionComplete=completed.length===firstDayDocuments.length,documentReward=!alreadyComplete,missionReward=missionComplete&&!p.rewarded;
 if(!next.journal.some(item=>item.id===`first-day/${id}`))next={...next,journal:[...next.journal,{id:`first-day/${id}`,documentIds:[doc.number],lines:doc.expected}]};
 next={...next,xp:next.xp+(documentReward?DOCUMENT_REWARD.xp:0)+(missionReward?MISSION_REWARD.xp:0),coins:next.coins+(documentReward?DOCUMENT_REWARD.coins:0)+(missionReward?MISSION_REWARD.coins:0),rewardKeys:[...new Set([...next.rewardKeys,...(documentReward?[`first-day-document/${id}`]:[]),...(missionReward?['first-day-complete']:[])])]};
 return {state:saveProgress(next,{...p,completed,selected:id,rewarded:p.rewarded||missionComplete,completionSeen:missionReward?false:p.completionSeen}),correct};
}

function saveProgress(s:GameState,p:FirstDayProgress):GameState{return {...s,legacy:{...s.legacy,[FIRST_DAY_KEY]:p}};}

export function firstDayCompany(s:GameState):FirstDayCompanyState{
 const p=firstDayProgress(s),done=(id:FirstDayDocumentId)=>p.completed.includes(id),unresolved=firstDayDocuments.filter(item=>!done(item.id)&&(p.mistakes[item.id]??0)>0);
 return {assets:1250000+(done('supplier-invoice')?100000:0)-(done('office-expense')?2500:0),liabilities:730000+(done('supplier-invoice')?100000:0),revenue:420000,profit:85000-(done('office-expense')?2500:0),cash:250000-(done('office-expense')?2500:0),bank:480000+(done('customer-receipt')?75000:0),supplierBalance:730000+(done('supplier-invoice')?100000:0),customerBalance:320000-(done('customer-receipt')?75000:0),pendingDocuments:firstDayDocuments.length-p.completed.length,pendingEntries:firstDayDocuments.length-p.completed.length,monthEndProgress:Math.round(p.completed.length/firstDayDocuments.length*100),ledgerErrors:unresolved.length,unreconciledAmount:unresolved.reduce((sum,item)=>sum+item.amount,0)};
}

export function firstDayReaction(id:FirstDayDocumentId,correct:boolean,locale:'ar'|'en'){
 const messages:Record<FirstDayDocumentId,{wrong:Words;correct:Words;impact:Words}>={
  'supplier-invoice':{wrong:w('Something does not add up. The supplier balance is missing EGP 100,000. Check what the company received and now owes.','في حاجة مش راكبة. رصيد المورد ناقص ١٠٠٬٠٠٠ جنيه. راجع الشركة استلمت إيه وبقى عليها إيه.'),correct:w('Good. The equipment and supplier balances are now correct.','تمام. رصيد المعدات والمورد بقى صحيح.'),impact:w('Supplier balance mismatch: EGP 100,000','فرق في رصيد المورد: ١٠٠٬٠٠٠ جنيه')},
  'customer-receipt':{wrong:w('The bank will not reconcile. Cash was collected from an existing customer balance.','البنك مش هيتطابق. المبلغ اتحصّل من رصيد عميل موجود بالفعل.'),correct:w('Correct. The bank increased and the customer balance decreased.','صح. البنك زاد ورصيد العميل انخفض.'),impact:w('Bank reconciliation difference: EGP 75,000','فرق مطابقة البنك: ٧٥٬٠٠٠ جنيه')},
  'office-expense':{wrong:w('Profit is overstated and petty cash is short. Check the expense and the cash movement.','الربح ظاهر أكبر من حقيقته والصندوق ناقص. راجع المصروف وحركة النقدية.'),correct:w('Exactly. The expense is recorded and petty cash now reconciles.','بالضبط. المصروف اتسجل والصندوق بقى متطابق.'),impact:w('Profit overstatement: EGP 2,500','زيادة غير صحيحة في الربح: ٢٬٥٠٠ جنيه')},
 };
 const message=messages[id];return {message:(correct?message.correct:message.wrong)[locale],impact:message.impact[locale]};
}

export function accountLabel(account:Account,locale:'ar'|'en'){const names:Record<Account,Words>={cash:w('Cash','الصندوق'),bank:w('Bank','البنك'),inventory:w('Inventory','المخزون'),equipment:w('Office equipment','الأجهزة والمعدات'),customers:w('Accounts receivable','العملاء'),suppliers:w('Accounts payable','الموردون'),capital:w('Capital','رأس المال'),revenue:w('Revenue','الإيرادات'),rent:w('Rent expense','مصروف الإيجار'),officeExpense:w('Office supplies expense','مصروف الأدوات المكتبية'),salary:w('Salary expense','مصروف الرواتب'),accrual:w('Accrued salaries','رواتب مستحقة'),depreciation:w('Depreciation expense','مصروف الإهلاك'),accumulated:w('Accumulated depreciation','مجمع الإهلاك')};return names[account][locale];}
