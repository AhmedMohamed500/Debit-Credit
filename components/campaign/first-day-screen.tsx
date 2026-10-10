"use client";
import '@/app/first-shift-scene.css';
import '@/app/first-shift-v2.css';
import '@/app/accounting-workspace.css';
import '@/app/first-shift-world.css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect,useRef,useState } from 'react';
import {BriefcaseBusiness,ChevronRight,Coins,LockKeyhole,Trophy,X,Zap} from 'lucide-react';
import { CinematicChapterIntro } from './cinematic-chapter-intro';
import { FirstShiftNavigation } from './first-shift-navigation';
import { AccountingCaseWorkspace } from './first-day-case-workbench';
import {FirstShiftMissionHub} from './first-shift-world';
import { firstDayIntro } from '@/lib/campaign/first-day-story';
import { accountLabel,closeFirstDayDocument,completeFirstDayIntro,enterFirstDayDesk,FIRST_DAY_INTRO_VERSION,firstDayCompany,firstDayDocuments,firstDayProgress,markFirstDayCompletionSeen,saveFirstDayDraft,selectFirstDayDocument,submitFirstDayDocument,type FirstDayDocumentId } from '@/lib/campaign/first-day';
import { useGame } from '@/lib/campaign/store';
import type { GameState } from '@/lib/campaign/model';
import type { Locale } from '@/types';
import { caseClock,caseworkState,inspectCaseDocument,recordCaseFieldMatch,requestCaseManagerHelp,selectCaseAction } from '@/lib/cases/engine';
import { getFirstShiftCase } from '@/lib/cases/first-shift-cases';
import { kareemPerformanceFeedback,projectCasePerformance,projectShiftPerformance } from '@/lib/cases/performance';
import type { AccountingCaseAction,CaseActionResult,CaseMatchVerdict } from '@/lib/cases/model';
import { closingWeekMetadata } from '@/lib/cases/chapter-two';
import {firstShiftMissionProgress,markFirstShiftLedgerReviewed} from '@/lib/campaign/first-shift-hub';

export function FirstDayScreen({locale}:{locale:Locale}){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en,{state,ready,change}=useGame(),progress=firstDayProgress(state),company=firstDayCompany(state),casework=caseworkState(state);
 const [active,setActive]=useState<FirstDayDocumentId|null>(null),[queuedProcessed,setQueuedProcessed]=useState<FirstDayDocumentId|null>(null),[processedAnimation,setProcessedAnimation]=useState<FirstDayDocumentId|null>(null);const restored=useRef(false);const [tool,setTool]=useState<'journal'|'ledger'|'calculator'|null>(null);
 useEffect(()=>{if(!processedAnimation)return;const timer=window.setTimeout(()=>setProcessedAnimation(null),1350);return()=>window.clearTimeout(timer);},[processedAnimation]);
 useEffect(()=>{if(!ready||restored.current)return;restored.current=true;if(progress.selected)setActive(progress.selected);},[ready,progress.selected]);
 if(!ready)return <div className="first-day-loading">{say('Preparing your first day…','بنجهّز أول يوم ليك…')}</div>;
 if(progress.introVersion<FIRST_DAY_INTRO_VERSION||!progress.deskEntered)return <><FirstShiftNavigation locale={locale}/><CinematicChapterIntro chapter={firstDayIntro} locale={locale} variant="intro" onComplete={()=>change(current=>enterFirstDayDesk(completeFirstDayIntro(current)))}/></>;
 if(progress.rewarded&&firstShiftMissionProgress(state).ledgerComplete&&!progress.completionSeen&&!active&&!processedAnimation&&!tool)return <><FirstShiftNavigation locale={locale}/><ShiftComplete locale={locale} state={state} onContinue={()=>change(markFirstDayCompletionSeen)}/></>;
 const doc=firstDayDocuments.find(item=>item.id===active);
 const openDocument=(id:FirstDayDocumentId)=>{window.dispatchEvent(new CustomEvent('debit-credit-sound-event',{detail:{type:'paper-open',documentId:id}}));change(current=>selectFirstDayDocument(current,id));setActive(id);};
 const closeDocument=()=>{change(closeFirstDayDocument);setActive(null);if(queuedProcessed){setProcessedAnimation(queuedProcessed);setQueuedProcessed(null);}};
 const submit=(id:FirstDayDocumentId,draft:string,hints:number)=>{let correct=false;change(current=>{const result=submitFirstDayDocument(current,id,draft,Date.now(),hints);correct=result.correct;return result.state;});if(correct)setQueuedProcessed(id);window.dispatchEvent(new CustomEvent('debit-credit-sound-event',{detail:{type:correct?'correct-answer':'wrong-answer',documentId:id}}));return correct;};
 const inspectEvidence=(id:FirstDayDocumentId,documentId:string)=>change(current=>inspectCaseDocument(current,id,documentId));
 const chooseCaseAction=(id:FirstDayDocumentId,action:AccountingCaseAction)=>{let result:CaseActionResult={state,readyToPost:false,missingDocumentIds:[],missingMatchIds:[],outcome:'blocked'};change(current=>{result=selectCaseAction(current,id,action);return result.state});return result};
 const chooseFieldMatch=(id:FirstDayDocumentId,fieldId:string,verdict:CaseMatchVerdict)=>{let accepted=false;change(current=>{const result=recordCaseFieldMatch(current,id,fieldId,verdict);accepted=result.accepted;return result.state});return accepted};
 const askKareem=(id:FirstDayDocumentId)=>{let count=0;change(current=>{const next=requestCaseManagerHelp(current,id);count=caseworkState(next).cases[id].managerHelpCount;return next});return count};
 return <div className="first-day shift-scene fsh-active" dir={ar?'rtl':'ltr'}>
  <div inert={!!doc||!!tool}><FirstShiftNavigation locale={locale}/></div>
  <FirstShiftMissionHub locale={locale} state={state} inactive={!!doc||!!tool} pendingDocuments={company.pendingDocuments} ledgerErrors={company.ledgerErrors} processedAnimation={processedAnimation} onOpenCase={openDocument} onOpenJournal={()=>setTool("journal")} onOpenLedger={()=>{change(markFirstShiftLedgerReviewed);setTool("ledger")}} onOpenCalculator={()=>setTool("calculator")}/>
  {doc&&<AccountingCaseWorkspace key={doc.id} locale={locale} doc={doc} caseDefinition={getFirstShiftCase(doc.id)!} runtime={casework.cases[doc.id]} performance={projectCasePerformance(state,doc.id)} completed={progress.completed.includes(doc.id)} completedIds={progress.completed} initialDraft={progress.drafts[doc.id]} initialHint={progress.draftHints[doc.id]} pendingAfter={company.pendingDocuments} ledgerErrors={company.ledgerErrors} clock={caseClock(state)} gameXp={state.xp} onClose={closeDocument} onSelectCase={openDocument} onDraftChange={(draft,hintUsed)=>change(current=>saveFirstDayDraft(current,doc.id,draft,hintUsed))} onInspect={documentId=>inspectEvidence(doc.id,documentId)} onMatch={(fieldId,verdict)=>chooseFieldMatch(doc.id,fieldId,verdict)} onAction={action=>chooseCaseAction(doc.id,action)} onHelp={()=>askKareem(doc.id)} onSubmit={(draft,hints)=>submit(doc.id,draft,hints)}/>}
  {tool&&<DeskTool tool={tool} locale={locale} state={state} onClose={()=>setTool(null)}/>}
 </div>;
}

function ShiftComplete({locale,state,onContinue}:{locale:Locale;state:GameState;onContinue:()=>void}){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en,performance=projectShiftPerformance(state),feedback=kareemPerformanceFeedback(state),firstAttempts=performance.cases.filter(item=>item.firstAttemptCorrect).length;
 return <section className="fd-shift-complete" dir={ar?'rtl':'ltr'}><Image src="/game/first-day-cinematic.png" fill priority sizes="100vw" alt=""/><div className="fd-complete-shade"/><div className="fd-complete-card" role="status"><span className="fd-complete-trophy"><Trophy/></span><small>{say('16:30 · WORKDAY REVIEW','١٦:٣٠ · مراجعة يوم العمل')}</small><h1>{say('The files are cleared. The books are protected.','الملفات اتقفلت. والدفاتر محمية.')}</h1><p>“{feedback[locale]}”</p><div className="fd-shift-results fd-professional-results"><span><b>3/3</b><small>{say('Cases handled','ملفات تمت معالجتها')}</small></span><span><b>{performance.accuracy}%</b><small>{say('Accounting accuracy','الدقة المحاسبية')}</small></span><span><b>{firstAttempts}/3</b><small>{say('First-attempt accuracy','من أول محاولة')}</small></span><span><b>{performance.managerAssistance}</b><small>{say('Manager assistance','مساعدة المدير')}</small></span><span><b>{performance.investigation}%</b><small>{say('Investigation','جودة التحقيق')}</small></span><span><b>{performance.accountingJudgment}%</b><small>{say('Accounting judgment','الحكم المحاسبي')}</small></span></div><div className="fd-professional-impact"><b>{say('Professional record','السجل المهني')}</b><span>{say('All three source files were reviewed and posted. Accepted ledger entries: 3.','تمت مراجعة وترحيل الملفات الثلاثة. القيود المقبولة في الدفتر: ٣.')}</span></div><div className="fd-evidence-added"><BriefcaseBusiness/><span><small>{say('EVENT-BASED EVIDENCE ADDED','تمت إضافة أدلة من أحداث العمل')}</small><b>{say('Case investigation · Journal entries · Accounting judgment','تحقيق الحالات · القيود اليومية · الحكم المحاسبي')}</b></span><Link href={`/${locale}/career-profile/skills`}>{say('Why did my skills change?','ليه مهاراتي اتغيرت؟')}</Link></div><div className="fd-shift-reward"><small>{say('Secondary game reward','مكافأة اللعب الثانوية')}</small><Zap/>+300 XP <Coins/>+150 {say('Coins','عملة')}</div><div className="fd-next-case"><LockKeyhole/><span><small>{say('CHAPTER 2 · ARCHITECTURE READY · LOCKED','الفصل ٢ · البنية جاهزة · مقفول')}</small><b>{closingWeekMetadata.title[locale]}</b><p>{closingWeekMetadata.subtitle[locale]}</p></span></div><button onClick={onContinue}>{say('RETURN TO MIZAN DESK','ارجع لمكتب ميزان')}<ChevronRight/></button></div></section>;
}

function money(value:number,locale:Locale){return `${value.toLocaleString(locale)} EGP`;}
function DeskTool({tool,locale,state,onClose}:{tool:'journal'|'ledger'|'calculator';locale:Locale;state:GameState;onClose:()=>void}){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en,company=firstDayCompany(state),ref=useRef<HTMLElement>(null);
 const [a,setA]=useState(''),[b,setB]=useState(''),[operation,setOperation]=useState('+');
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const dialog=ref.current;dialog?.querySelector<HTMLElement>('button')?.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();if(event.key==='Tab'&&dialog){const items=Array.from(dialog.querySelectorAll<HTMLElement>('button,input,select,a'));const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}};document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous?.focus();};},[onClose]);
 const result=operation==='+'?Number(a)+Number(b):operation==='-'?Number(a)-Number(b):operation==='×'?Number(a)*Number(b):Number(b)===0?null:Number(a)/Number(b);
 const rows=[[say('Cash balance','رصيد الصندوق'),company.cash],[say('Bank balance','رصيد البنك'),company.bank],[say('Supplier balance','رصيد الموردين'),company.supplierBalance],[say('Customer balance','رصيد العملاء'),company.customerBalance],[say('Pending entries','قيود معلقة'),company.pendingEntries],[say('Unresolved errors','أخطاء غير محلولة'),company.ledgerErrors]] as const;
 return <div className="fd-modal-backdrop"><section ref={ref} className="scene-tool" role="dialog" aria-modal="true" aria-label={tool==='journal'?say('Journal','دفتر اليومية'):tool==='ledger'?say('General Ledger','دفتر الأستاذ'):say('Calculator','الآلة الحاسبة')}><button className="fd-close" onClick={onClose} aria-label={say('Close','إغلاق')}><X/></button><h2>{tool==='journal'?say('Journal','دفتر اليومية'):tool==='ledger'?say('General Ledger','دفتر الأستاذ'):say('Calculator','الآلة الحاسبة')}</h2>
 {tool==='journal'&&(state.journal.filter(entry=>entry.id.startsWith('first-day/')).length?state.journal.filter(entry=>entry.id.startsWith('first-day/')).map(entry=><div className="scene-tool-entry" key={entry.id}><b>{entry.documentIds.join(' · ')}</b>{entry.lines.map((line,index)=><p key={index}><span>{accountLabel(line.account,locale)}</span><b>{money(line.debit||line.credit,locale)} · {line.debit?say('Debit','مدين'):say('Credit','دائن')}</b></p>)}</div>):<p>{say('The journal is empty. Record a document to write your first entry.','الدفتر لسه فاضي. سجّل مستند عشان تضيف أول قيد.')}</p>)}
 {tool==='ledger'&&rows.map(([label,value])=><p className="scene-ledger-row" key={label}><span>{label}</span><b>{value.toLocaleString(locale)}</b></p>)}
 {tool==='calculator'&&<><label>{say('First number','الرقم الأول')}<input type="number" value={a} onChange={event=>setA(event.target.value)}/></label><label>{say('Operation','العملية')}<select value={operation} onChange={event=>setOperation(event.target.value)}>{['+','-','×','÷'].map(op=><option key={op}>{op}</option>)}</select></label><label>{say('Second number','الرقم الثاني')}<input type="number" value={b} onChange={event=>setB(event.target.value)}/></label><output aria-live="polite">{result===null?say('Cannot divide by zero','لا يمكن القسمة على صفر'):result.toLocaleString(locale)}</output></>}
 </section></div>;
}
