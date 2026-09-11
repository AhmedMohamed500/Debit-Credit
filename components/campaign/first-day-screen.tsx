"use client";
import '@/app/first-shift-scene.css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect,useRef,useState } from 'react';
import { AlertTriangle,BookOpen,BriefcaseBusiness,Building2,Calculator,Check,ChevronRight,Clock3,Coins,FileCheck2,FileText,LockKeyhole,Mail,PenLine,Trophy,X,Zap } from 'lucide-react';
import { CinematicChapterIntro } from './cinematic-chapter-intro';
import { FirstDayCaseWorkbench } from './first-day-case-workbench';
import { firstDayIntro,storyCharacters } from '@/lib/campaign/first-day-story';
import { accountLabel,closeFirstDayDocument,completeFirstDayIntro,enterFirstDayDesk,FIRST_DAY_INTRO_VERSION,firstDayCompany,firstDayDocuments,firstDayProgress,markFirstDayCompletionSeen,saveFirstDayDraft,selectFirstDayDocument,submitFirstDayDocument,type FirstDayDocumentId } from '@/lib/campaign/first-day';
import { useGame } from '@/lib/campaign/store';
import type { GameState } from '@/lib/campaign/model';
import type { Locale } from '@/types';
import { caseClock,caseworkState,inspectCaseDocument,requestCaseManagerHelp,selectCaseAction } from '@/lib/cases/engine';
import { getFirstShiftCase } from '@/lib/cases/first-shift-cases';
import { kareemPerformanceFeedback,projectCasePerformance,projectShiftPerformance } from '@/lib/cases/performance';
import type { AccountingCaseAction,CaseActionResult } from '@/lib/cases/model';
import { closingWeekMetadata } from '@/lib/cases/chapter-two';
import { SimulationSound } from './simulation-sound';

export function FirstDayScreen({locale}:{locale:Locale}){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en,{state,ready,change}=useGame(),progress=firstDayProgress(state),company=firstDayCompany(state),casework=caseworkState(state);
 const [active,setActive]=useState<FirstDayDocumentId|null>(null),[queuedProcessed,setQueuedProcessed]=useState<FirstDayDocumentId|null>(null),[processedAnimation,setProcessedAnimation]=useState<FirstDayDocumentId|null>(null);const restored=useRef(false);const [mobileIndex,setMobileIndex]=useState(0),[tool,setTool]=useState<'journal'|'ledger'|'calculator'|null>(null);const swipeStart=useRef<number|null>(null);
 useEffect(()=>{if(!processedAnimation)return;const timer=window.setTimeout(()=>setProcessedAnimation(null),1350);return()=>window.clearTimeout(timer);},[processedAnimation]);
 useEffect(()=>{if(!ready||restored.current)return;restored.current=true;if(progress.selected)setActive(progress.selected);},[ready,progress.selected]);
 if(!ready)return <div className="first-day-loading">{say('Preparing your first day…','بنجهّز أول يوم ليك…')}</div>;
 if(progress.introVersion<FIRST_DAY_INTRO_VERSION)return <CinematicChapterIntro chapter={firstDayIntro} locale={locale} variant="intro" onComplete={()=>change(completeFirstDayIntro)} onSkip={()=>{}}/>;
 if(!progress.deskEntered)return <ManagerBriefing locale={locale} onContinue={()=>change(enterFirstDayDesk)}/>;
 if(progress.rewarded&&!progress.completionSeen&&!active&&!processedAnimation)return <ShiftComplete locale={locale} state={state} onContinue={()=>change(markFirstDayCompletionSeen)}/>;
 const completeCount=progress.completed.length,doc=firstDayDocuments.find(item=>item.id===active),manager=storyCharacters['finance-manager'];
 const openDocument=(id:FirstDayDocumentId)=>{window.dispatchEvent(new CustomEvent('debit-credit-sound-event',{detail:{type:'paper-open',documentId:id}}));change(current=>selectFirstDayDocument(current,id));setActive(id);};
 const closeDocument=()=>{change(closeFirstDayDocument);setActive(null);if(queuedProcessed){setProcessedAnimation(queuedProcessed);setQueuedProcessed(null);}};
 const submit=(id:FirstDayDocumentId,draft:string,hints:number)=>{let correct=false;change(current=>{const result=submitFirstDayDocument(current,id,draft,Date.now(),hints);correct=result.correct;return result.state;});if(correct)setQueuedProcessed(id);window.dispatchEvent(new CustomEvent('debit-credit-sound-event',{detail:{type:correct?'correct-answer':'wrong-answer',documentId:id}}));return correct;};
 const inspectEvidence=(id:FirstDayDocumentId,documentId:string)=>change(current=>inspectCaseDocument(current,id,documentId));
 const chooseCaseAction=(id:FirstDayDocumentId,action:AccountingCaseAction)=>{let result:CaseActionResult={state,readyToPost:false,missingDocumentIds:[],outcome:'blocked'};change(current=>{result=selectCaseAction(current,id,action);return result.state});return result};
 const askKareem=(id:FirstDayDocumentId)=>{let count=0;change(current=>{const next=requestCaseManagerHelp(current,id);count=caseworkState(next).cases[id].managerHelpCount;return next});return count};
 const stages=[say('Arrival','الوصول'),say('Meet Kareem','مقابلة كريم'),say('First Shift','وردية اليوم'),say("Something's Wrong",'في حاجة غلط'),say('End of Day','نهاية اليوم')];
 const pending=firstDayDocuments.filter(item=>!progress.completed.includes(item.id));
 const selectedMobile=pending[Math.min(mobileIndex,Math.max(0,pending.length-1))];
 const movePaper=(direction:number)=>setMobileIndex(current=>(Math.min(current,Math.max(0,pending.length-1))+direction+pending.length)%Math.max(1,pending.length));
 return <div className="first-day shift-scene" dir={ar?'rtl':'ltr'}>
  <div className="shift-home" inert={!!doc||!!tool}>
   <header className="scene-hud">
    <Link className="scene-brand" href={`/${locale}`}><span aria-hidden="true">▂▅▇</span><b>Debit & Credit<small>by Money Coder</small></b></Link>
    <nav className="scene-story" aria-label={say('Chapter progress','تقدم الفصل')}>{stages.map((label,index)=><span className={index<2?'done':index===2?'current':'locked'} aria-current={index===2?'step':undefined} key={label}>{index<2?<Check/>:index===2?<i>1</i>:<LockKeyhole/>}<small>{label}</small></span>)}</nav>
    <div className="scene-player"><Link className="scene-manual-link" href={`/${locale}/account-guide?return=first-day`} target="_blank" rel="noopener noreferrer"><BookOpen/>{say('Nature of Accounts','طبيعة الحسابات')}</Link><SimulationSound locale={locale}/><span><Coins/>{state.coins}</span><span><Zap/>{state.xp} XP</span><Link href={`/${ar?'en':'ar'}`} aria-label={say('Switch to Arabic','التبديل للإنجليزية')}>{ar?'EN':'AR'}</Link></div>
   </header>
   <main className="scene-desk" aria-label={say("Today's accounting desk",'مكتب محاسبة اليوم')}>
    <div className="scene-office-mark"><Building2/><div><b>Mizan Trading</b><small>{say('FINANCE OFFICE','مكتب الحسابات')}</small></div></div>
    <div className="scene-workday-feed"><span><Clock3/><b>{caseClock(state)}</b><small>{say('Workday clock','ساعة العمل')}</small></span><span><Mail/><b>{company.pendingDocuments}</b><small>{say('Assigned case files','ملفات عمل واردة')}</small></span></div>
    <div className="scene-assignment"><small>{say('CHAPTER 01 / FIRST DAY','الفصل ٠١ / أول يوم')}</small><h1>{say('Your first shift.','أول وردية ليك.')}</h1><p>{say('Inspect. Decide. Record.','افحص. قرر. سجّل.')}</p></div>
    <aside className="scene-manager"><div className="scene-portrait"><Image src="/arena/cfo-mentor.png" alt="" fill sizes="52px"/></div><div><small>{manager.name[locale]} · {manager.role[locale]}</small><h2>{completeCount<3?(getFirstShiftCase(pending[0]?.id)?.managerRequest[locale]??say('Open the next case file.','افتح ملف العمل التالي.')):say('The day is closed. Let us review your work.','اليوم اتقفل. تعال نراجع شغلك.')}</h2></div></aside>
    <LaptopMission locale={locale} progress={progress.completed}/>
    <button className="scene-book journal" onClick={()=>setTool('journal')}>{say('Journal','دفتر اليومية')}<small>{state.journal.filter(entry=>entry.id.startsWith('first-day/')).length} {say('entries','قيود')}</small></button>
    <button className="scene-book ledger" onClick={()=>setTool('ledger')}>{say('General Ledger','دفتر الأستاذ')}</button>
    <button className="scene-calculator" aria-label={say('Open calculator','افتح الآلة الحاسبة')} onClick={()=>setTool('calculator')}><span>{say('Calculate','احسب')}</span></button>
    <div className="scene-inbox"><b>{company.pendingDocuments}</b><span>{say('INBOX','الوارد')}</span></div>
    <div className={`scene-processed fd-processed-tray ${processedAnimation?'receiving':''}`} aria-live="polite"><div className="scene-filed-papers" aria-hidden="true">{progress.completed.map((id,index)=><i key={id} style={{transform:`translateY(${-index*5}px) rotate(${index*3-3}deg)`}}>✓</i>)}</div><b>{completeCount}</b><span>{say('PROCESSED TRAY','درج تمت المعالجة')}</span></div>
    <div className="scene-papers" onTouchStart={event=>{swipeStart.current=event.touches[0].clientX;}} onTouchEnd={event=>{if(swipeStart.current===null)return;const distance=event.changedTouches[0].clientX-swipeStart.current;if(Math.abs(distance)>45)movePaper((ar?distance:-distance)>0?1:-1);swipeStart.current=null;}}>
     {pending.map(item=>{const index=firstDayDocuments.indexOf(item),hasError=(progress.mistakes[item.id]??0)>0;return <button key={item.id} data-document={item.id} className={`scene-paper ${item.accent} paper-${index} ${selectedMobile?.id===item.id?'mobile-active':''}`} onClick={()=>openDocument(item.id)} aria-label={`${item.title[locale]} · ${say('Open document','افتح المستند')}`}>
      <span className="scene-clip" aria-hidden="true"/><span className="scene-paper-brand"><Building2/> Mizan Trading <i>{index+1}</i></span>
      <h2>{item.title[locale]}</h2><small className="scene-paper-subtitle">{item.subtitle[locale]}</small>
      <div className="scene-paper-party"><b>{item.party[locale]}</b><span>{item.number}</span></div>
      <div className="scene-paper-lines"><p><span>{say('Date','التاريخ')}</span><b>{item.date[locale]}</b></p>{item.details.slice(-2).map(row=><p key={row.label.en}><span>{row.label[locale]}</span><b>{row.value[locale]}</b></p>)}</div>
      <div className="scene-paper-total"><small>{say('TOTAL / EGP','الإجمالي / جنيه')}</small><strong>{item.amount.toLocaleString(locale)}</strong></div>
      <span className="scene-paper-hint">{hasError?<AlertTriangle/>:<PenLine/>}{hasError?say('Review correction','راجع التصحيح'):say('Inspect document','افحص المستند')}<ChevronRight/></span>
     </button>;})}
    </div>
    {processedAnimation&&<div className={`scene-transfer fd-paper-transfer ${processedAnimation}`} aria-hidden="true"><FileCheck2/><b>{say('RECORDED','تم التسجيل')}</b></div>}
    <div className="scene-sticky">{say('Check the source.','راجع المصدر.')}<br/>{say('Let the numbers tell the story.','سيب الأرقام تحكي.')}<span>✓</span></div>
    <div className="scene-desk-caption">{pending.length?say('Pick up a paper to begin','اختار مستند لتبدأ'):say('A clear desk. Balanced books.','مكتب خلصان. ودفاتر متوازنة.')}<span>↗</span></div>
    <div className="scene-mobile-actions">{pending.length>0&&<><button onClick={()=>movePaper(-1)} aria-label={say('Previous document','المستند السابق')}>‹</button><button onClick={()=>openDocument(selectedMobile.id)}>{say('Inspect document','افحص المستند')} <small>{Math.min(mobileIndex+1,pending.length)}/{pending.length}</small></button><button onClick={()=>movePaper(1)} aria-label={say('Next document','المستند التالي')}>›</button></>}</div>
    <div className="scene-mobile-tools"><button onClick={()=>setTool('journal')}><BookOpen/>{say('Journal','اليومية')}</button><button onClick={()=>setTool('ledger')}><Building2/>{say('Ledger','الأستاذ')}</button><button onClick={()=>setTool('calculator')}><Calculator/>{say('Calculator','الحاسبة')}</button><Link href={`/${locale}/account-guide?return=first-day`} target="_blank" rel="noopener noreferrer"><BookOpen/>{say('Accounts guide','طبيعة الحسابات')}</Link></div>
   </main>
   <footer className="scene-company" aria-label={say('Company status','حالة الشركة')}>
    <span className="scene-company-name"><Building2/><b>Mizan</b></span>
    <span><small>{say('Cash balance','رصيد الصندوق')}</small><b>{money(company.cash,locale)}</b></span><span><small>{say('Bank balance','رصيد البنك')}</small><b>{money(company.bank,locale)}</b></span>
    <span className="scene-pending"><small>{say('Pending documents','مستندات معلقة')}</small><b>{company.pendingDocuments}</b></span><span><small>{say('Month-end progress','تقدم إقفال الشهر')}</small><b>{company.monthEndProgress}%</b></span>
    <span className={`scene-books-health ${company.ledgerErrors?'has-errors':''}`}>{company.ledgerErrors?<AlertTriangle/>:<Check/>}{company.ledgerErrors?say('Review needed','مراجعة مطلوبة'):say('Books healthy','الدفاتر سليمة')}</span>
   </footer>
   {state.storageWarning&&<p className="scene-storage-warning" role="alert">{say('Storage unavailable. Keep this tab open to retain progress.','التخزين غير متاح. اترك الصفحة مفتوحة للحفاظ على تقدمك.')}</p>}
   {progress.completionSeen&&<div className="scene-next"><LockKeyhole/><small>{say('NEXT · LOCKED','التالي · مقفول')}</small><h2>{say('Chapter 2 — THE MISSING MONEY','الفصل ٢ — المال المفقود')}</h2></div>}
  </div>
  {doc&&<FirstDayCaseWorkbench key={doc.id} locale={locale} doc={doc} caseDefinition={getFirstShiftCase(doc.id)!} runtime={casework.cases[doc.id]} performance={projectCasePerformance(state,doc.id)} completed={progress.completed.includes(doc.id)} initialDraft={progress.drafts[doc.id]} initialHint={progress.draftHints[doc.id]} pendingAfter={company.pendingDocuments} onClose={closeDocument} onDraftChange={(draft,hintUsed)=>change(current=>saveFirstDayDraft(current,doc.id,draft,hintUsed))} onInspect={documentId=>inspectEvidence(doc.id,documentId)} onAction={action=>chooseCaseAction(doc.id,action)} onHelp={()=>askKareem(doc.id)} onSubmit={(draft,hints)=>submit(doc.id,draft,hints)}/>}
  {tool&&<DeskTool tool={tool} locale={locale} state={state} onClose={()=>setTool(null)}/>}
 </div>;
}

function ManagerBriefing({locale,onContinue}:{locale:Locale;onContinue:()=>void}){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en,manager=storyCharacters['finance-manager'];
 return <section className="fd-manager-scene" dir={ar?'rtl':'ltr'}><Image src="/game/first-day-cinematic.png" fill priority sizes="100vw" alt=""/><div className="fd-manager-scene-shade"/><div className="fd-briefing-card"><header><b>OK</b><span><strong>{manager.name[locale]}</strong><small>{manager.role[locale]}</small></span></header><h1>{say('Welcome to Mizan Trading.','أهلًا بيك في ميزان للتجارة.')}</h1><p>{say('Today is your first day. Three transactions from yesterday still need to be recorded. Inspect each source, decide what changed, and keep the books balanced.','النهارده أول يوم ليك. عندنا ٣ معاملات من امبارح لسه محتاجة تتسجل. افحص كل مستند، قرر إيه اللي اتغيّر، وخلي الدفاتر متوازنة.')}</p><button onClick={onContinue}>{say('SHOW ME THE DESK','ورّيني المكتب')}<ChevronRight/></button></div><div className="fd-briefing-caption"><small>{say('8:45 AM · FINANCE OFFICE','٨:٤٥ صباحًا · الإدارة المالية')}</small><b>{say('Your decisions change the company.','قراراتك تغيّر حالة الشركة.')}</b></div></section>;
}

function LaptopMission({locale,progress}:{locale:Locale;progress:FirstDayDocumentId[]}){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en;
 return <section className="scene-laptop" aria-label={say('Mizan accounting system','نظام ميزان المحاسبي')}><header><span><Building2/></span><div><b>Mizan OS</b><small>{say('FIRST SHIFT · LIVE','الوردية الأولى · مباشر')}</small></div><i>{progress.length}/3</i></header><div className="fd-laptop-progress"><span><b style={{width:`${progress.length/3*100}%`}}/></span><small>{say(`${3-progress.length} documents in inbox`,`${3-progress.length} مستند في الوارد`)}</small></div><ul>{firstDayDocuments.map(item=><li className={progress.includes(item.id)?'done':''} key={item.id}>{progress.includes(item.id)?<Check/>:<FileText/>}<span><b>{item.title[locale]}</b><small>{progress.includes(item.id)?say('Posted to journal','تم ترحيله للدفتر'):say('Waiting for review','بانتظار المراجعة')}</small></span></li>)}</ul><footer><span>OK</span><p>“{say('Every entry should explain what changed.','كل قيد لازم يشرح إيه اللي اتغيّر.')}”</p></footer></section>;
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
