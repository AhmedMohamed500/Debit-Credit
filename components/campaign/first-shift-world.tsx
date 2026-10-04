'use client';

import {useEffect, useRef} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, BookOpen, Check, Calculator, ChevronRight, FileCheck2, GraduationCap, LockKeyhole, ShieldCheck, Zap} from 'lucide-react';
import {firstDayDocuments, firstDayProgress, type FirstDayDocumentId} from '@/lib/campaign/first-day';
import {firstShiftMissionProgress} from '@/lib/campaign/first-shift-hub';
import type {GameState} from '@/lib/campaign/model';
import type {Locale} from '@/types';
import {SimulationSound} from './simulation-sound';

type Props = {
  locale: Locale;
  state: GameState;
  inactive: boolean;
  pendingDocuments: number;
  ledgerErrors: number;
  processedAnimation: FirstDayDocumentId | null;
  onOpenCase: (id: FirstDayDocumentId) => void;
  onOpenJournal: () => void;
  onOpenLedger: () => void;
  onOpenCalculator: () => void;
};

type Stage = {
  id: string;
  number: number;
  title: {ar: string; en: string};
  done: boolean;
  status: 'active' | 'available' | 'completed' | 'locked';
  onOpen: () => void;
};

function stageLabel(stage: Stage, locale: Locale) {
  const ar = locale === 'ar';
  return stage.status === 'locked' ? ar ? 'مقفلة' : 'Locked'
    : stage.done ? ar ? 'راجع' : 'Review'
      : ar ? 'افتح المستند' : 'Open document';
}

export function FirstShiftMissionHub({locale, state, inactive, pendingDocuments, ledgerErrors, processedAnimation, onOpenCase, onOpenJournal, onOpenLedger, onOpenCalculator}: Props) {
  const panorama = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = panorama.current;
    if (!element) return;
    const center = () => {element.scrollLeft = Math.max(0, (element.scrollWidth - element.clientWidth) / 2);};
    center();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(center);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const ar = locale === 'ar';
  const say = (en: string, arabic: string) => ar ? arabic : en;
  const mission = firstShiftMissionProgress(state);
  const progress = firstDayProgress(state);
  const base = [
    ...firstDayDocuments.map((item, index) => ({id: item.id, number: index + 1, title: item.title, done: mission.cases[index].done, onOpen: () => onOpenCase(item.id)})),
    {id: 'journal', number: 4, title: {ar: 'دفتر اليومية', en: 'Journal'}, done: mission.journalComplete, onOpen: onOpenJournal},
    {id: 'ledger', number: 5, title: {ar: 'دفتر الأستاذ', en: 'Ledger'}, done: mission.ledgerComplete, onOpen: onOpenLedger},
  ];
  const nextIndex = base.findIndex(item => !item.done);
  const stages: Stage[] = base.map((item, index) => ({...item,
    status: item.done ? 'completed' : index > 0 && !base[index - 1].done ? 'locked'
      : progress.selected === item.id || index === nextIndex ? 'active' : 'available',
  }));
  const current = stages[nextIndex];
  const DirectionArrow = ar ? ArrowLeft : ArrowRight;
  const processed = mission.cases.filter(item => item.done).length;

  return <section className="shift-home fsh-shell" dir={ar ? 'rtl' : 'ltr'} inert={inactive}>
    <header className="fsh-topbar">
      <Link className="fsh-brand" href={`/${locale}`} aria-label="Debit & Credit · Home"><span className="fsh-brand-mark" aria-hidden="true">D<span>&</span>C</span><span>Debit &amp; Credit<small>by Money Coder</small></span></Link>
      <div className="fsh-location"><span className="fsh-live-dot" />MIZAN TRADING<span>/</span><small>{say('FINANCE OFFICE', 'مكتب الحسابات')}</small></div>
      <div className="fsh-header-tools"><span><Zap aria-hidden="true" />{state.xp} XP</span><SimulationSound locale={locale} /><Link href={`/${ar ? 'en' : 'ar'}/game/first-shift`} aria-label={say('Switch to Arabic', 'التبديل للإنجليزية')}>{ar ? 'EN' : 'AR'}</Link></div>
    </header>

    <main className="fsh-world">
      <div ref={panorama} className="fsh-city-panorama" role="region" aria-label={say('Explore the accounting city', 'استكشف مدينة المحاسبة')} tabIndex={0}>
        <div className="fsh-city-stage">
          <Image className="fsh-artwork" src="/game/first-shift-world-art.png" alt="" fill priority unoptimized sizes="100vw" />
          <div className="fsh-city-shade" />
          <div className="fsh-world-title">
            <small>{say('CHAPTER 01 · YOUR JOURNEY BEGINS', 'الفصل ٠١ · رحلتك تبدأ هنا')}</small>
            <h1>{say('Your first shift.', 'أول وردية لك')}</h1>
          </div>
          <nav className="fsh-portals" aria-label={say('First Shift missions', 'مهام أول وردية')}>
            {stages.map(stage => <button type="button" key={stage.id} className={`fsh-portal fsh-portal-${stage.number}`} data-status={stage.status} disabled={stage.status === 'locked'} aria-current={stage.status === 'active' ? 'step' : undefined} aria-label={`${stage.title[locale]} · ${stageLabel(stage, locale)}`} onClick={stage.onOpen}>
              <span className="fsh-portal-number" aria-hidden="true">{stage.done ? <Check /> : stage.number}</span>
              <span className="fsh-portal-caption"><span className="fsh-portal-name">{stage.title[locale]}</span><span className="fsh-portal-state">{stage.status === 'locked' ? <LockKeyhole aria-hidden="true" /> : stage.done ? <Check aria-hidden="true" /> : null}{stageLabel(stage, locale)}{stage.status !== 'locked' && <DirectionArrow aria-hidden="true" />}</span></span>
            </button>)}
          </nav>
        </div>
      </div>
      <p className="fsh-pan-hint">{say('Swipe to explore the five city portals', 'اسحب لاستكشاف بوابات المدينة الخمس')} <span aria-hidden="true">↔</span></p>
      <section className="fsh-os" role="region" aria-label={say('Mizan accounting system', 'نظام ميزان المحاسبي')}>
        <header><span className="fsh-live-dot" /><b>MIZAN OS</b><small>{pendingDocuments} {say('files in inbox', 'ملفات في الوارد')}</small></header>
        <p>{say('Your current mission', 'مهمتك الحالية')}<strong>{current ? current.title[locale] : say('Shift complete', 'الوردية مكتملة')}</strong></p>
        <div className="fsh-progress"><strong>{mission.completedCount} / {mission.total}</strong><div className="fsh-progress-track" role="progressbar" aria-label={say('Shift progress', 'تقدم الوردية')} aria-valuemin={0} aria-valuemax={mission.total} aria-valuenow={mission.completedCount}><i style={{width: `${mission.completedCount / mission.total * 100}%`}} /></div></div>
        <div className="fsh-processed-tray"><span>{say('PROCESSED TRAY', 'درج تمت المعالجة')}</span><b>{processed.toString().padStart(2, '0')}</b></div>
      </section>

      <footer className="fsh-shift-footer">
        <div className="fsh-next-task"><span className="fsh-task-index">{current ? `0${current.number}` : <Check aria-hidden="true" />}</span><div><small>{current ? say('YOUR NEXT TASK', 'خطوتك التالية') : say('SHIFT COMPLETE', 'الوردية مكتملة')}</small><b>{current ? current.title[locale] : say('All five stages completed', 'أنجزت المراحل الخمس')}</b></div>{current && <button type="button" onClick={current.onOpen}>{say('Start', 'ابدأ')}<DirectionArrow aria-hidden="true" /></button>}</div>
        <ol className="fsh-stage-progress" aria-label={say('Mission sequence', 'ترتيب المهام')}>{stages.map(stage => <li key={stage.id} data-status={stage.status}><span>{stage.done ? <Check aria-hidden="true" /> : stage.number}</span><small>{stage.title[locale]}</small><ChevronRight className="fsh-step-chevron" aria-hidden="true" /></li>)}</ol>
        <button type="button" className="fsh-calculator" onClick={onOpenCalculator} aria-label={say('Open calculator', 'افتح الآلة الحاسبة')}><Calculator aria-hidden="true" /><span>{say('Calculator', 'الآلة الحاسبة')}</span></button>
        <span className="fsh-books-health"><ShieldCheck aria-hidden="true" />{ledgerErrors ? say('Review the books', 'راجع الدفاتر') : say('Books protected', 'الدفاتر محمية')}</span>
      </footer>
      <nav className="fsh-world-links" aria-label={say('Learning resources', 'مصادر التعلم')}><Link href={`/${locale}/account-guide?return=first-day`}><BookOpen aria-hidden="true" />{say('Account guide', 'دليل الحسابات')}</Link><Link href={`/${locale}/career-league/map`}><GraduationCap aria-hidden="true" />{say('Career map', 'المسار المهني')}</Link><Link href={`/${locale}/game/bank-reconciliation`}>{say('Bank reconciliation', 'التسوية البنكية')}<DirectionArrow aria-hidden="true" /></Link></nav>
    </main>
    {processedAnimation && <div className="fsh-filed-toast" role="status"><FileCheck2 aria-hidden="true" />{say('File posted and moved to processed work', 'تم تسجيل الملف ونقله للمعالجة')}</div>}
    {state.storageWarning && <p className="fsh-storage-warning" role="alert">{say('Storage unavailable. Keep this tab open to retain progress.', 'التخزين غير متاح. اترك الصفحة مفتوحة للحفاظ على تقدمك.')}</p>}
  </section>;
}
