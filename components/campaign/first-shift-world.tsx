'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Check,
  CircleHelp,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  LibraryBig,
  LockKeyhole,
  ShieldCheck,
  Trophy,
  Zap,
} from 'lucide-react';
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

type PortalStatus = 'available' | 'active' | 'completed' | 'locked';
type Portal = {
  id: string;
  number: number;
  title: {ar: string; en: string};
  status: PortalStatus;
  icon: typeof FileText;
  onOpen: () => void;
};

function WorldArtwork() {
  return <Image className="fsh-artwork" src="/game/first-shift-world-art.png" alt="" fill priority unoptimized sizes="100vw" />;
}

function PortalHotspot({portal, locale}: {portal: Portal; locale: Locale}) {
  const ar = locale === 'ar';
  const Icon = portal.icon;
  const locked = portal.status === 'locked';
  const done = portal.status === 'completed';
  const statusText = {
    available: ar ? 'متاحة' : 'Available',
    active: ar ? 'المهمة الحالية' : 'Current mission',
    completed: ar ? 'مكتملة' : 'Completed',
    locked: ar ? 'مقفلة' : 'Locked',
  }[portal.status];
  const actionText = locked
    ? statusText
    : done
      ? ar ? 'راجع' : 'Review'
      : ar ? 'افتح المستند' : 'Open document';

  return <button
    type="button"
    className={`fsh-portal fsh-portal-${portal.number}`}
    data-status={portal.status}
    disabled={locked}
    aria-current={portal.status === 'active' ? 'step' : undefined}
    aria-label={`${portal.title[locale]} · ${locked ? statusText : actionText}`}
    onClick={portal.onOpen}
  >
    <span className="fsh-portal-number" aria-hidden="true">{portal.number}</span>
    <span className="fsh-portal-name"><Icon aria-hidden="true" />{portal.title[locale]}</span>
    <span className="fsh-portal-state">{done ? <Check aria-hidden="true" /> : locked ? <LockKeyhole aria-hidden="true" /> : null}{statusText}</span>
    <span className="fsh-portal-action" aria-hidden="true">{actionText}</span>
  </button>;
}

function WorldHud({locale, state, completed, total, level, ledgerErrors}: {
  locale: Locale;
  state: GameState;
  completed: number;
  total: number;
  level: number;
  ledgerErrors: number;
}) {
  const ar = locale === 'ar';
  const say = (en: string, arabic: string) => ar ? arabic : en;
  return <>
    <header className="fsh-world-header">
      <Link className="fsh-brand" href={`/${locale}`} aria-label="Debit & Credit · Home">
        <span className="fsh-brand-mark" aria-hidden="true">▂▅▇</span>
        <span>Debit &amp; Credit<small>by Money Coder</small></span>
      </Link>
      <div className="fsh-world-title">
        <small>{say('A real journey through accounting', 'رحلة عملية في عالم المحاسبة')}</small>
        <h1>{say('Your first shift.', 'أول وردية لك')}</h1>
        <p>{say('Learn · investigate · post · grow.', 'تعلّم · افحص · قيّد · وتقدّم في مستواك')}</p>
      </div>
      <div className="fsh-header-side">
        <div className="fsh-company"><Building2 aria-hidden="true" /><span><b>Mizan Trading</b><small>{say('Accounting department', 'مكتب الحسابات')}</small></span></div>
        <section className="fsh-progress" aria-label={say('Shift progress', 'تقدم الوردية')}>
          <div><span>{say('Level', 'المستوى')} <b>{level}</b></span><strong>{completed}/{total} {say('missions', 'مهام')}</strong></div>
          <div className="fsh-progress-track" role="progressbar" aria-label={say('Shift progress', 'تقدم الوردية')} aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}><i style={{width: `${completed / total * 100}%`}} /></div>
        </section>
        <div className="fsh-header-tools"><span><Zap aria-hidden="true" />{state.xp} XP</span><SimulationSound locale={locale} /><Link href={`/${ar ? 'en' : 'ar'}`} aria-label={say('Switch to Arabic', 'التبديل للإنجليزية')}>{ar ? 'EN' : 'AR'}</Link></div>
      </div>
    </header>
    <div className="fsh-books-health"><ShieldCheck aria-hidden="true" />{ledgerErrors ? say('Review the books before closing', 'راجع الدفاتر قبل الإقفال') : say('Accepted entries are protected', 'القيود المقبولة محمية')}</div>
  </>;
}

function MizanOsHud({locale, portals, pendingDocuments, processedCount, onOpenCalculator}: {
  locale: Locale;
  portals: Portal[];
  pendingDocuments: number;
  processedCount: number;
  onOpenCalculator: () => void;
}) {
  const ar = locale === 'ar';
  const say = (en: string, arabic: string) => ar ? arabic : en;
  return <section className="fsh-os" role="region" aria-label={say('Mizan accounting system', 'نظام ميزان المحاسبي')}>
    <h2><Building2 aria-hidden="true" />Mizan OS</h2>
    <small>{pendingDocuments} {say('files in inbox', 'ملفات في الوارد')}</small>
    <ul>{portals.map(portal => <li key={portal.id} data-status={portal.status}><span aria-hidden="true">{portal.status === 'completed' ? <Check /> : portal.status === 'locked' ? <LockKeyhole /> : null}</span><b>{portal.title[locale]}</b><em>{portal.status === 'completed' ? '1/1' : '0/1'}</em></li>)}</ul>
    <div className="fsh-os-bottom"><p className="fsh-processed-tray">{say('PROCESSED TRAY', 'درج تمت المعالجة')} <b>{processedCount}</b></p><button type="button" onClick={onOpenCalculator} aria-label={say('Open calculator', 'افتح الآلة الحاسبة')}><Calculator aria-hidden="true" /></button></div>
  </section>;
}

function RewardHud({locale, xp}: {locale: Locale; xp: number}) {
  const ar = locale === 'ar';
  const say = (en: string, arabic: string) => ar ? arabic : en;
  const items = [
    {icon: Zap, title: 'XP', detail: `${xp}`},
    {icon: BriefcaseBusiness, title: say('Practical experience', 'خبرة عملية'), detail: say('Real casework', 'حالات عملية')},
    {icon: GraduationCap, title: say('Accounting skills', 'مهارات محاسبية'), detail: say('Evidence-based', 'بدليل عمل')},
    {icon: Trophy, title: say('Journal mastery', 'إتقان القيود'), detail: say('Balanced entries', 'قيود متوازنة')},
  ];
  return <section className="fsh-rewards" aria-label={say('Your journey rewards', 'مكافآتك في هذه الرحلة')}>
    <h2><Trophy aria-hidden="true" />{say('Your journey rewards', 'مكافآتك في هذه الرحلة')}</h2>
    <div>{items.map(item => {const Icon = item.icon; return <span key={item.title}><Icon aria-hidden="true" /><b>{item.title}</b><small>{item.detail}</small></span>;})}</div>
  </section>;
}

function JourneyProgress({locale}: {locale: Locale}) {
  const ar = locale === 'ar';
  const say = (en: string, arabic: string) => ar ? arabic : en;
  const steps = [
    {icon: CircleHelp, title: say('Understand the case', 'افهم الحالة'), detail: say('Read the scenario', 'اقرأ السيناريو التجاري')},
    {icon: ClipboardCheck, title: say('Inspect the document', 'افحص المستند'), detail: say('Check the evidence', 'راجع المستند والتفاصيل')},
    {icon: BriefcaseBusiness, title: say('Choose treatment', 'اختر المعالجة'), detail: say('Select the accounts', 'حدد الحسابات والاتجاه')},
    {icon: BookOpen, title: say('Post in journal', 'قيّد في اليومية'), detail: say('Record the balanced entry', 'سجّل القيد الصحيح')},
    {icon: Trophy, title: say('Earn progress', 'حقّق التقدم'), detail: say('Finish and move on', 'أكمل وانتقل للتالي')},
  ];
  return <section className="fsh-how" aria-label={say('How to play', 'طريقة اللعب')}><ol>{steps.map((step, index) => {const Icon = step.icon; return <li key={step.title}><span>{index + 1}</span><Icon aria-hidden="true" /><div><b>{step.title}</b><small>{step.detail}</small></div></li>;})}</ol></section>;
}

export function FirstShiftMissionHub({locale, state, inactive, pendingDocuments, ledgerErrors, processedAnimation, onOpenCase, onOpenJournal, onOpenLedger, onOpenCalculator}: Props) {
  const ar = locale === 'ar';
  const say = (en: string, arabic: string) => ar ? arabic : en;
  const mission = firstShiftMissionProgress(state);
  const progress = firstDayProgress(state);
  const base = [
    ...firstDayDocuments.map((item, index) => ({id: item.id, number: index + 1, title: item.title, done: mission.cases[index].done, icon: FileText, onOpen: () => onOpenCase(item.id)})),
    {id: 'journal', number: 4, title: {ar: 'دفتر اليومية', en: 'Journal'}, done: mission.journalComplete, icon: BookOpen, onOpen: onOpenJournal},
    {id: 'ledger', number: 5, title: {ar: 'دفتر الأستاذ', en: 'Ledger'}, done: mission.ledgerComplete, icon: LibraryBig, onOpen: onOpenLedger},
  ];
  const nextIndex = base.findIndex(item => !item.done);
  const portals: Portal[] = base.map((item, index) => {
    const locked = !item.done && index > 0 && !base[index - 1].done;
    const status: PortalStatus = item.done ? 'completed' : locked ? 'locked' : progress.selected === item.id ? 'active' : index === nextIndex ? 'active' : 'available';
    return {...item, status};
  });

  return <section className="shift-home fsh-shell" dir={ar ? 'rtl' : 'ltr'} inert={inactive}>
    <main className="fsh-world">
      <WorldArtwork />
      <WorldHud locale={locale} state={state} completed={mission.completedCount} total={mission.total} level={mission.level} ledgerErrors={ledgerErrors} />
      <nav className="fsh-portals" aria-label={say('First Shift missions', 'مهام أول وردية')}>
        {portals.map(portal => <PortalHotspot key={portal.id} portal={portal} locale={locale} />)}
      </nav>
      <MizanOsHud locale={locale} portals={portals} pendingDocuments={pendingDocuments} processedCount={mission.cases.filter(item => item.done).length} onOpenCalculator={onOpenCalculator} />
      <RewardHud locale={locale} xp={state.xp} />
      <JourneyProgress locale={locale} />
      <div className="fsh-world-links"><Link href={`/${locale}/account-guide?return=first-day`}><BookOpen aria-hidden="true" />{say('Account guide', 'دليل الحسابات')}</Link><Link href={`/${locale}/career-league/map`}><GraduationCap aria-hidden="true" />{say('Career map', 'المسار المهني')}</Link><Link href={`/${locale}/game/bank-reconciliation`}><ArrowLeft aria-hidden="true" />{say('Bank reconciliation', 'التسوية البنكية')}</Link></div>
    </main>
    {processedAnimation && <div className="fsh-filed-toast" role="status"><FileCheck2 aria-hidden="true" />{say('File posted and moved to processed work', 'تم تسجيل الملف ونقله للمعالجة')}</div>}
    {state.storageWarning && <p className="fsh-storage-warning" role="alert">{say('Storage unavailable. Keep this tab open to retain progress.', 'التخزين غير متاح. اترك الصفحة مفتوحة للحفاظ على تقدمك.')}</p>}
  </section>;
}
