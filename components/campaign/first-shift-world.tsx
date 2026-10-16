'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,BookOpen,Calculator,Check,ChevronRight,FileCheck2,FileText,GraduationCap,Landmark,LockKeyhole,NotebookPen,ShieldCheck,Zap} from 'lucide-react';
import {accountLabel,firstDayDocuments,firstDayProgress,type FirstDayDocumentId} from '@/lib/campaign/first-day';
import {firstShiftMissionProgress} from '@/lib/campaign/first-shift-hub';
import type {GameState} from '@/lib/campaign/model';
import type {Locale} from '@/types';
import {SimulationSound} from './simulation-sound';

type Props={
  locale:Locale;state:GameState;inactive:boolean;pendingDocuments:number;ledgerErrors:number;processedAnimation:FirstDayDocumentId|null;
  onOpenCase:(id:FirstDayDocumentId)=>void;onOpenJournal:()=>void;onOpenLedger:()=>void;onOpenCalculator:()=>void;
};
type Stage={id:string;number:number;title:{ar:string;en:string};done:boolean;status:'active'|'available'|'completed'|'locked';onOpen:()=>void};
function stageLabel(stage:Stage,locale:Locale){
  const ar=locale==='ar';
  return stage.status==='locked'?(ar?'مقفلة':'Locked'):stage.done?(ar?'راجع':'Review'):(ar?'افتح المستند':'Open document');
}

export function FirstShiftMissionHub({locale,state,inactive,pendingDocuments,ledgerErrors,processedAnimation,onOpenCase,onOpenJournal,onOpenLedger,onOpenCalculator}:Props){
  const ar=locale==='ar',say=(en:string,arabic:string)=>ar?arabic:en,mission=firstShiftMissionProgress(state),progress=firstDayProgress(state);
  const base=[
    ...firstDayDocuments.map((item,index)=>({id:item.id,number:index+1,title:item.title,done:mission.cases[index].done,onOpen:()=>onOpenCase(item.id)})),
    {id:'journal',number:4,title:{ar:'دفتر اليومية',en:'Journal'},done:mission.journalComplete,onOpen:onOpenJournal},
    {id:'ledger',number:5,title:{ar:'دفتر الأستاذ',en:'Ledger'},done:mission.ledgerComplete,onOpen:onOpenLedger},
  ];
  const nextIndex=base.findIndex(item=>!item.done);
  const stages:Stage[]=base.map((item,index)=>({...item,status:item.done?'completed':index>0&&!base[index-1].done?'locked':progress.selected===item.id||index===nextIndex?'active':'available'}));
  const current=stages[nextIndex],currentDocument=firstDayDocuments.find(item=>!progress.completed.includes(item.id))??firstDayDocuments.at(-1)!;
  const acceptedEntries=state.journal.filter(item=>item.id.startsWith('first-day/')),latestEntry=acceptedEntries.at(-1),processed=mission.cases.filter(item=>item.done).length;
  const DirectionArrow=ar?ArrowLeft:ArrowRight;
  return <section className="shift-home fsh-shell" dir={ar?'rtl':'ltr'} inert={inactive}>
    <header className="fsh-topbar"><div className="fsh-location"><span className="fsh-live-dot"/>MIZAN TRADING<span>/</span><small>{say('FINANCE OFFICE','مكتب الحسابات')}</small></div><div className="fsh-header-tools"><span><Zap aria-hidden="true"/>{state.xp} XP</span><SimulationSound locale={locale}/></div></header>
    <main className="fsh-world">
      <div className="fsh-office-layout">
        <section className="fsh-office-scene" aria-label={say('Mizan Trading training office','مكتب ميزان للتجارة التدريبي')}>
          <Image className="fsh-artwork" src="/game/first-shift-approved-office.png" alt="" fill priority sizes="(max-width: 760px) 100vw, 75vw"/>
          <div className="fsh-office-shade"/>
          <div className="fsh-office-intro"><small>{say('MIZAN TRADING · TRAINING SIMULATION','ميزان للتجارة · محاكاة تدريبية')}</small><h1>{say('Your first shift.','أول وردية لك')}</h1><p>{say('Inspect the source files, record supported entries, and review how each accepted decision changes the books.','افحص المستندات المؤيدة، وسجّل القيود الصحيحة، وراجع أثر كل قرار مقبول على الدفاتر.')}</p><span className="fsh-office-context"><ShieldCheck aria-hidden="true"/>{say('Simulated accounting work, not employment','عمل محاسبي محاكى، وليس خبرة توظيف')}</span></div>
          <div className="fsh-office-hotspots" role="group" aria-label={say('Office work zones','مناطق العمل بالمكتب')}>
            <button type="button" className="fsh-hotspot fsh-hotspot-docs" onClick={()=>onOpenCase(currentDocument.id)}><FileText aria-hidden="true"/><span>{say('Source files','المستندات')}</span><small>{pendingDocuments} {say('pending','معلقة')}</small></button>
            <button type="button" className="fsh-hotspot fsh-hotspot-journal" onClick={onOpenJournal}><NotebookPen aria-hidden="true"/><span>{say('Journal','اليومية')}</span><small>{acceptedEntries.length} {say('accepted','مقبولة')}</small></button>
            <button type="button" className="fsh-hotspot fsh-hotspot-ledger" onClick={onOpenLedger}><BookOpen aria-hidden="true"/><span>{say('Ledger','الأستاذ')}</span><small>{say('Review balances','راجع الأرصدة')}</small></button>
            <button type="button" className="fsh-hotspot fsh-hotspot-calc" onClick={onOpenCalculator} aria-label={say('Open calculator','افتح الآلة الحاسبة')}><Calculator aria-hidden="true"/><span>{say('Calculator','الآلة الحاسبة')}</span></button>
          </div>
        </section>
        <aside className="fsh-mission-rail" aria-label={say('First Shift missions','مهام أول وردية')}>
          <div className="fsh-rail-heading"><span className="fsh-rail-icon"><FileCheck2 aria-hidden="true"/></span><div><small>{say('YOUR ACTIVE WORK','عملك الحالي')}</small><h2>{say('First Shift tasks','مهام أول وردية')}</h2></div></div>
          <section className="fsh-os" role="region" aria-label={say('Mizan accounting system','نظام ميزان المحاسبي')}><p>{say('Your current mission','مهمتك الحالية')}<strong>{current?current.title[locale]:say('Shift complete','الوردية مكتملة')}</strong></p><div className="fsh-progress"><strong>{mission.completedCount} / {mission.total}</strong><div className="fsh-progress-track" role="progressbar" aria-label={say('Shift progress','تقدم الوردية')} aria-valuemin={0} aria-valuemax={mission.total} aria-valuenow={mission.completedCount}><i style={{width:`${mission.completedCount/mission.total*100}%`}}/></div></div><small>{pendingDocuments} {say('files in inbox','ملفات في الوارد')}</small></section>
          <nav className="fsh-portals" aria-label={say('Mission sequence','ترتيب المهام')}>{stages.map(stage=><button type="button" key={stage.id} className="fsh-portal" data-status={stage.status} disabled={stage.status==='locked'} aria-current={stage.status==='active'?'step':undefined} aria-label={`${stage.title[locale]} · ${stageLabel(stage,locale)}`} onClick={stage.onOpen}><span className="fsh-portal-number" aria-hidden="true">{stage.done?<Check/>:stage.status==='locked'?<LockKeyhole/>:stage.number}</span><span className="fsh-portal-caption"><span className="fsh-portal-name">{stage.title[locale]}</span><span className="fsh-portal-state">{stageLabel(stage,locale)}</span></span><DirectionArrow className="fsh-portal-arrow" aria-hidden="true"/></button>)}</nav>
          <div className="fsh-processed-tray"><span>{say('PROCESSED TRAY','درج تمت المعالجة')}</span><b>{processed.toString().padStart(2,'0')}</b></div>
        </aside>
      </div>
      <div className="fsh-desk-strip">
        <section className="fsh-desk-card fsh-source-card"><header><span><FileText aria-hidden="true"/>{say('Current source file','المستند الحالي')}</span><b>{currentDocument.number}</b></header><div><small>{currentDocument.date[locale]}</small><h2>{currentDocument.title[locale]}</h2><p>{currentDocument.party[locale]} · {currentDocument.subtitle[locale]}</p><strong>{currentDocument.amount.toLocaleString(locale)} {say('EGP','جنيه')}</strong></div><button type="button" onClick={()=>onOpenCase(currentDocument.id)}>{say('Inspect case documents','افحص مستندات الحالة')}<DirectionArrow aria-hidden="true"/></button></section>
        <section className="fsh-desk-card fsh-journal-card"><header><span><NotebookPen aria-hidden="true"/>{say('Accepted journal','اليومية المقبولة')}</span><small>{acceptedEntries.length} / {firstDayDocuments.length}</small></header>{latestEntry?<div className="fsh-journal-lines"><b>{latestEntry.documentIds.join(' · ')}</b>{latestEntry.lines.map((line,index)=><p key={`${line.account}-${index}`}><span>{accountLabel(line.account,locale)}</span><span>{(line.debit||line.credit).toLocaleString(locale)} {line.debit?say('Dr','مدين'):say('Cr','دائن')}</span></p>)}</div>:<p className="fsh-empty-journal">{say('No accepted entry yet. Review the first source file to begin.','لا توجد قيود مقبولة بعد. ابدأ بمراجعة أول مستند.')}</p>}<button type="button" onClick={onOpenJournal}>{say('Open journal','افتح اليومية')}<DirectionArrow aria-hidden="true"/></button></section>
        <section className="fsh-desk-card fsh-review-card"><header><span><Landmark aria-hidden="true"/>{say('Review and next step','المراجعة والخطوة التالية')}</span></header><p>{ledgerErrors?say('A draft attempt needs review. Unaccepted entries have not changed the books.','توجد محاولة تحتاج مراجعة. القيود غير المقبولة لم تغيّر الدفاتر.'):say('Only accepted entries affect the journal and company balances.','القيود المقبولة فقط تؤثر على اليومية وأرصدة الشركة.')}</p><div className="fsh-next-task"><span className="fsh-task-index">{current?`0${current.number}`:<Check aria-hidden="true"/>}</span><div><small>{current?say('NEXT TASK','المهمة التالية'):say('SHIFT COMPLETE','الوردية مكتملة')}</small><b>{current?current.title[locale]:say('All five stages completed','أنجزت المراحل الخمس')}</b></div>{current?<button type="button" onClick={current.onOpen}>{say('Start','ابدأ')}<DirectionArrow aria-hidden="true"/></button>:<Link href={`/${locale}/career-profile/skills`}>{say('My skills','مهاراتي')}<DirectionArrow aria-hidden="true"/></Link>}</div></section>
      </div>
      <footer className="fsh-shift-footer"><ol className="fsh-stage-progress" aria-label={say('Mission sequence','ترتيب المهام')}>{stages.map(stage=><li key={stage.id} data-status={stage.status}><span>{stage.done?<Check aria-hidden="true"/>:stage.number}</span><small>{stage.title[locale]}</small><ChevronRight className="fsh-step-chevron" aria-hidden="true"/></li>)}</ol><span className="fsh-books-health"><ShieldCheck aria-hidden="true"/>{ledgerErrors?say('Review the draft','راجع المسودة'):say('Books protected','الدفاتر محمية')}</span></footer>
      <nav className="fsh-world-links" aria-label={say('Learning resources','مصادر التعلم')}><Link href={`/${locale}/account-guide?return=first-day`}><BookOpen aria-hidden="true"/>{say('Account guide','دليل الحسابات')}</Link><Link href={`/${locale}/career-league/map`}><GraduationCap aria-hidden="true"/>{say('Career map','المسار المهني')}</Link><Link href={`/${locale}/game/bank-reconciliation`}>{say('Bank reconciliation','التسوية البنكية')}<DirectionArrow aria-hidden="true"/></Link></nav>
    </main>
    {processedAnimation&&<div className="fsh-filed-toast" role="status"><FileCheck2 aria-hidden="true"/>{say('File posted and moved to processed work','تم تسجيل الملف ونقله للمعالجة')}</div>}
    {state.storageWarning&&<p className="fsh-storage-warning" role="alert">{say('Storage unavailable. Keep this tab open to retain progress.','التخزين غير متاح. اترك الصفحة مفتوحة للحفاظ على تقدمك.')}</p>}
  </section>;
}
