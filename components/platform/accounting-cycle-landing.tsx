"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, Building2, Check,
  ChevronLeft, ChevronRight, CirclePlay, ClipboardList, FileBadge,
  FileCheck2, FileText, Landmark, MonitorPlay, Mouse, ReceiptText,
  Scale, ScrollText,
} from "lucide-react";
import { AuthCTA } from "@/components/cloud/auth-cta";
import { accountingCycleStages, cycleStageFromProgress } from "@/lib/marketing/accounting-cycle";
import type { Locale } from "@/types";
import "@/app/accounting-cycle-landing.css";

type Props = { locale: Locale };
const stageIcons = [Building2, FileText, BarChart3, ReceiptText, BookOpen, Scale, Landmark, ClipboardList, Scale, ScrollText, FileCheck2, FileBadge] as const;

const ui = {
  ar: {
    eyebrow: "تجربة حقيقية داخل شركة محاسبية",
    headlineStart: "الدورة المحاسبية الكاملة",
    headlineAccent: "خطوة بخطوة",
    intro: "من أول تأسيس الشركة إلى إقفال السنة... وتحوّل إنجازاتك إلى مهارات وسيرة ذاتية احترافية.",
    hint: "مرر للأسفل لاكتشاف باقي المراحل",
    stage: "المرحلة",
    of: "من",
    try: "جرّب المرحلة الآن",
    openTool: "افتح الأداة الآن",
    locked: "المرحلة قيد التطوير",
    explain: "مشاهدة شرح قصير",
    learning: "في هذه المرحلة ستتعلم:",
    previous: "المرحلة السابقة",
    next: "المرحلة التالية",
    preview: "معاينة تدريبية — ليست بيانات حسابك",
    brand: "شركة ميزان للتجارة",
    side: ["لوحة التحكم", "إعداد الشركة", "دليل الحسابات", "المستندات", "القيود اليومية", "دفتر الأستاذ", "ميزان المراجعة", "القوائم المالية"],
    selected: "المرحلة المحددة",
    rail: "معاينات المراحل",
    scrollLeft: "العودة في المعاينات",
    scrollRight: "التقدم في المعاينات",
  },
  en: {
    eyebrow: "A real-world accounting-company experience",
    headlineStart: "The complete accounting cycle",
    headlineAccent: "step by step",
    intro: "From company setup to year-end closing... turn your achievements into skills and a professional CV.",
    hint: "Scroll down to discover the remaining stages",
    stage: "Stage",
    of: "of",
    try: "Try this stage",
    openTool: "Open learning tool",
    locked: "Stage in development",
    explain: "Read a short explanation",
    learning: "In this stage you will learn:",
    previous: "Previous stage",
    next: "Next stage",
    preview: "Training illustration — not your account data",
    brand: "Mizan Trading Company",
    side: ["Dashboard", "Company setup", "Account guide", "Documents", "Journal", "Ledger", "Trial balance", "Statements"],
    selected: "Selected stage",
    rail: "Stage previews",
    scrollLeft: "Previous previews",
    scrollRight: "Next previews",
  },
} as const;

type Preview = { heading: { ar: string; en: string }; tabs: { ar: string; en: string }[]; columns: { ar: string; en: string }[]; rows: string[][]; note: { ar: string; en: string }; kind?: "form" | "document" | "cv" };

const previews: Preview[] = [
  { heading: { ar: "إعداد الشركة", en: "Company setup" }, tabs: [{ ar: "بيانات الشركة", en: "Company details" }, { ar: "السنة المالية", en: "Financial year" }, { ar: "دليل الحسابات", en: "Account guide" }], columns: [{ ar: "البيان", en: "Field" }, { ar: "قيمة تدريبية", en: "Illustrative value" }], rows: [["اسم الشركة / Company", "شركة ميزان للتجارة / Mizan Trading"], ["النشاط / Activity", "تجارة وتوزيع / Trading"], ["الفترة / Period", "2024/01/01 — 2024/12/31"], ["الأرصدة الافتتاحية / Opening", "نقدية 100,000 · رأس المال 100,000"]], note: { ar: "دليل الحسابات: نقدية · معدات · رأس مال", en: "Chart: Cash · Equipment · Capital" }, kind: "form" },
  { heading: { ar: "المستندات الواردة", en: "Source documents" }, tabs: [{ ar: "فاتورة مورد", en: "Supplier invoice" }, { ar: "المؤيدات", en: "Evidence" }], columns: [{ ar: "المرجع", en: "Reference" }, { ar: "تفاصيل المستند", en: "Document details" }], rows: [["EQ-002", "شراء معدات مكتبية / Office equipment"], ["القيمة / Amount", "20,000"], ["المؤيد / Evidence", "فاتورة + سند دفع / Invoice + payment"], ["الفحص / Review", "المصدر والمبلغ متطابقان / Matched"]], note: { ar: "مستند تدريبي توضيحي وليس فاتورة شركة حقيقية", en: "Illustrative training document, not a real invoice" }, kind: "document" },
  { heading: { ar: "تحليل العملية", en: "Transaction analysis" }, tabs: [{ ar: "الحسابات", en: "Accounts" }, { ar: "الأثر", en: "Impact" }], columns: [{ ar: "الحساب", en: "Account" }, { ar: "التصنيف والأثر", en: "Classification and effect" }], rows: [["معدات / Equipment", "أصل ↑ · مدين 20,000"], ["نقدية / Cash", "أصل ↓ · دائن 20,000"], ["المستند / Source", "EQ-002"], ["النتيجة / Result", "مدين = دائن / Debit = credit"]], note: { ar: "حدد طبيعة الحساب قبل كتابة القيد", en: "Classify accounts before entering the journal" } },
  { heading: { ar: "القيود اليومية", en: "Journal entries" }, tabs: [{ ar: "قيد EQ-002", en: "Entry EQ-002" }, { ar: "التحقق", en: "Validation" }], columns: [{ ar: "الحساب", en: "Account" }, { ar: "مدين", en: "Debit" }, { ar: "دائن", en: "Credit" }], rows: [["معدات / Equipment", "20,000", "—"], ["نقدية / Cash", "—", "20,000"], ["الإجمالي / Total", "20,000", "20,000"]], note: { ar: "✓ القيد متوازن — مثال تدريبي", en: "✓ Balanced entry — training example" } },
  { heading: { ar: "دفتر الأستاذ", en: "General ledger" }, tabs: [{ ar: "حساب النقدية", en: "Cash account" }, { ar: "الحركات", en: "Movements" }], columns: [{ ar: "المرجع", en: "Reference" }, { ar: "الحركة", en: "Movement" }, { ar: "الرصيد", en: "Balance" }], rows: [["CAP-001", "+100,000", "100,000"], ["EQ-002", "−20,000", "80,000"]], note: { ar: "الرصيد الجاري بعد ترحيل القيود المقبولة فقط", en: "Running balance after accepted entries only" } },
  { heading: { ar: "ميزان المراجعة", en: "Trial balance" }, tabs: [{ ar: "أرصدة الحسابات", en: "Account balances" }, { ar: "التحقق", en: "Check" }], columns: [{ ar: "الحساب", en: "Account" }, { ar: "مدين", en: "Debit" }, { ar: "دائن", en: "Credit" }], rows: [["نقدية / Cash", "80,000", "—"], ["معدات / Equipment", "20,000", "—"], ["رأس المال / Capital", "—", "100,000"], ["الإجمالي / Total", "100,000", "100,000"]], note: { ar: "✓ الفرق صفر — مثال مبسط من قيود CAP-001 وEQ-002", en: "✓ Zero difference — simplified CAP-001 and EQ-002 example" } },
  { heading: { ar: "التسوية البنكية", en: "Bank reconciliation" }, tabs: [{ ar: "كشف البنك", en: "Bank statement" }, { ar: "رصيد الدفاتر", en: "Book balance" }], columns: [{ ar: "البند", en: "Item" }, { ar: "الإجراء", en: "Action" }], rows: [["حركة متطابقة / Matched", "مطابقة / Match"], ["شيك معلق / Outstanding cheque", "فرق توقيت / Timing"], ["رسوم بنكية / Bank fee", "تصحيح دفتر / Book correction"]], note: { ar: "ورقة عمل مستقلة؛ لا تُرحّل تلقائيًا للأستاذ", en: "Separate workpaper; no automatic ledger posting" } },
  { heading: { ar: "تسويات نهاية الفترة", en: "Period-end adjustments" }, tabs: [{ ar: "معاينة تعليمية", en: "Learning preview" }], columns: [{ ar: "الموضوع", en: "Topic" }, { ar: "المراجعة", en: "Review" }], rows: [["الاستحقاق / Accrual", "مصروف يخص الفترة / Period expense"], ["المقدم / Prepayment", "توزيع على الفترات / Allocate periods"], ["الإهلاك / Depreciation", "استهلاك الأصل / Asset use"]], note: { ar: "هذه المرحلة ليست مهمة تفاعلية مفتوحة حاليًا", en: "This stage is not currently a playable mission" } },
  { heading: { ar: "الميزان المعدل", en: "Adjusted trial balance" }, tabs: [{ ar: "معاينة تعليمية", en: "Learning preview" }], columns: [{ ar: "الخطوة", en: "Step" }, { ar: "الغرض", en: "Purpose" }], rows: [["رصيد أولي / Initial balance", "من ميزان المراجعة / From trial balance"], ["أثر التسويات / Adjustments", "بعد مراجعة القيود / After review"], ["ميزان معدل / Adjusted balance", "التهيئة للقوائم / Prepare statements"]], note: { ar: "سير العمل المتكامل لهذه المرحلة قيد التطوير", en: "The integrated workflow is in development" } },
  { heading: { ar: "القوائم المالية", en: "Financial statements" }, tabs: [{ ar: "نتيجة النشاط", en: "Income" }, { ar: "المركز المالي", en: "Position" }], columns: [{ ar: "القائمة", en: "Statement" }, { ar: "المصدر", en: "Source" }], rows: [["قائمة الدخل / Income", "إيرادات ومصروفات / Revenue and expense"], ["المركز المالي / Position", "أصول والتزامات / Assets and liabilities"], ["التحقق / Review", "من أرصدة مقبولة / Accepted balances"]], note: { ar: "أداة لقطة تعليمية؛ القوائم الكاملة بعد الإقفال مقفولة", en: "Learning snapshot; full post-close statements are locked" } },
  { heading: { ar: "إقفال السنة", en: "Year-end closing" }, tabs: [{ ar: "معاينة تعليمية", en: "Learning preview" }], columns: [{ ar: "نوع الحساب", en: "Account type" }, { ar: "بعد الإقفال", en: "After close" }], rows: [["مؤقت / Temporary", "تُقفل نظريًا / Conceptually closed"], ["دائم / Permanent", "يبقى رصيده / Balance carries forward"], ["ميزان ما بعد الإقفال", "مراجعة المفهوم / Concept review"]], note: { ar: "لا توجد حاليًا مهمة إقفال سنة قابلة للعب", en: "No playable year-end closing mission currently exists" } },
  { heading: { ar: "جواز المهارات والـCV", en: "Skill Passport & CV" }, tabs: [{ ar: "أدلة التدريب", en: "Training evidence" }, { ar: "السيرة المهنية", en: "Professional CV" }], columns: [{ ar: "المصدر", en: "Source" }, { ar: "ما يُعرض", en: "Shown" }], rows: [["مهارة / Skill", "من تدريب مقبول فقط / Eligible training only"], ["مشروع / Project", "محاكاة تدريبية / Training simulation"], ["كورسات / Courses", "من بيانات المستخدم / User-supplied"], ["CV بنظام ATS", "نصي، بلا صورة / Text, no photo"]], note: { ar: "لا تُعرض خبرة عمل أو شهادات غير مدخلة ومؤهلة", en: "No invented employment or certificates" }, kind: "cv" },
];

function LaptopScreen({ locale, active }: { locale: Locale; active: number }) {
  const t = ui[locale];
  const p = previews[active];
  return <div className="ac-laptop" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="ac-laptop-lid"><div className="ac-laptop-camera"/><div className="ac-software">
      <div className="ac-software-top"><strong><BarChart3 size={17}/> Debit &amp; Credit</strong><span className="ac-software-search">⌕ &nbsp; {locale === "ar" ? "ابحث في الحسابات أو المستندات..." : "Search accounts or documents..."}</span><span className="ac-software-user">{locale === "ar" ? "متدرب" : "Trainee"}</span></div>
      <div className="ac-software-main"><aside className="ac-software-sidebar"><div className="ac-software-company"><Building2 size={17}/><b>{t.brand}</b></div>{t.side.map((item, index) => <div key={item} className={index === Math.min(active + 1, t.side.length - 1) ? "is-active" : ""}><FileText size={13}/><span>{item}</span></div>)}</aside>
        <div className="ac-software-workspace" key={active}>
          <div className="ac-workspace-heading"><div><span className="ac-workspace-crumb">{t.brand} › {p.heading[locale]}</span><h3>{accountingCycleStages[active].title[locale]}</h3></div><span className="ac-workspace-label">{t.preview}</span></div>
          <div className="ac-workspace-tabs">{p.tabs.map((tab,i)=><span className={i===0?"is-active":""} key={tab.en}>{tab[locale]}</span>)}</div>
          <div className="ac-workspace-card">
            <div className="ac-workspace-card-title"><FileCheck2 size={17}/><strong>{p.heading[locale]}</strong><span>#{String(active+1).padStart(2,"0")}</span></div>
            {p.kind === "form" ? <div className="ac-company-form">{p.rows.map((row,i)=><div key={i}><small>{locale === "ar" ? row[0].split(" / ")[0] : row[0].split(" / ")[1]}</small><strong>{locale === "ar" ? row[1].split(" / ")[0] : (row[1].split(" / ")[1] || row[1])}</strong></div>)}</div> :
              <table><thead><tr>{p.columns.map(c=><th key={c.en}>{c[locale]}</th>)}</tr></thead><tbody>{p.rows.map((row,i)=><tr key={`${active}-${i}`}>{row.map((cell,j)=><td key={j}>{locale === "ar" ? cell.split(" / ")[0] : (cell.split(" / ")[1] || cell)}</td>)}</tr>)}</tbody></table>}
            <p className="ac-workspace-note"><Check size={14}/>{p.note[locale]}</p>
          </div>
        </div>
      </div></div></div><div className="ac-laptop-base"/></div>;
}

export function AccountingCycleLanding({ locale }: Props) {
  const t = ui[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const previewRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const isCompact = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1100px)");
    isCompact.current = mq.matches;
    const onChange = () => { isCompact.current = mq.matches; };
    mq.addEventListener("change", onChange);
    let raf = 0;
    const onScroll = () => {
      if (isCompact.current || raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const range = Math.max(1, rect.height - window.innerHeight);
        if (rect.top > 0 || rect.bottom < window.innerHeight) return;
        setActive(cycleStageFromProgress(-rect.top / range));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { mq.removeEventListener("change", onChange); window.removeEventListener("scroll", onScroll); window.cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const item = previewRefs.current[active];
    if (rail && item && typeof rail.scrollTo === "function") rail.scrollTo({ left: item.offsetLeft - rail.offsetLeft - (rail.clientWidth - item.clientWidth) / 2, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [active]);

  const select = useCallback((index: number) => {
    const next = Math.min(accountingCycleStages.length - 1, Math.max(0, index));
    setActive(next);
    setExplanationOpen(false);
    if (!isCompact.current && sectionRef.current) {
      const section = sectionRef.current;
      const range = Math.max(1, section.offsetHeight - window.innerHeight);
      const top = window.scrollY + section.getBoundingClientRect().top + range * ((next + 0.3) / accountingCycleStages.length);
      window.scrollTo({ top, behavior: "instant" });
    }
  }, []);

  const current = accountingCycleStages[active];
  return <section id="accounting-cycle" ref={sectionRef} className="ac-section" data-active-stage={active + 1} aria-labelledby="ac-title" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="ac-sticky"><div className="ac-shell">
      <header className="ac-heading"><span className="ac-eyebrow">{t.eyebrow}</span><h2 id="ac-title">{t.headlineStart} <em>{t.headlineAccent}</em></h2><p>{t.intro}</p><span className="ac-scroll-hint"><Mouse size={24}/>{t.hint}</span></header>
      <div className="ac-main">
        <nav className="ac-stage-nav" aria-label={t.rail}>{accountingCycleStages.map((stage,index)=>{const Icon=stageIcons[index];return <button type="button" key={stage.id} className={`ac-stage-button ${index===active?"is-active":""}`} onClick={()=>select(index)} aria-current={index===active?"step":undefined}><span className="ac-stage-number">{index+1}</span><span className="ac-stage-icon"><Icon size={21}/></span><span className="ac-stage-copy"><strong>{stage.title[locale]}</strong><small>{stage.subtitle[locale]}</small></span></button>;})}</nav>
        <LaptopScreen locale={locale} active={active}/>
        <article className="ac-info" aria-live="polite"><div className="ac-info-top"><span className="ac-counter">{t.stage} {active+1} {t.of} 12</span><div className="ac-info-arrows"><button type="button" aria-label={t.previous} disabled={active===0} onClick={()=>select(active-1)}><ChevronRight size={21}/></button><button type="button" aria-label={t.next} disabled={active===11} onClick={()=>select(active+1)}><ChevronLeft size={21}/></button></div></div><h3>{current.title[locale]}</h3><h4>{current.subtitle[locale]}</h4><p className="ac-description">{current.description[locale]}</p><div className="ac-points"><strong>{t.learning}</strong><ul>{current.points.map(p=><li key={p.en}><Check size={17}/>{p[locale]}</li>)}</ul></div><div className="ac-info-actions">{current.route ? <AuthCTA className="ac-cta" href={`/${locale}${current.route}`}><CirclePlay size={25}/>{current.availability === "interactive" || active === 0 ? t.try : t.openTool}</AuthCTA> : <button className="ac-cta" type="button" disabled><CirclePlay size={25}/>{t.locked}</button>}<button className="ac-explain-button" type="button" aria-expanded={explanationOpen} onClick={()=>setExplanationOpen(v=>!v)}><MonitorPlay size={18}/>{t.explain}</button>{explanationOpen && <p className="ac-explanation">{current.description[locale]}</p>}<small className="ac-route-note">{current.routeNote[locale]}</small></div></article>
      </div>
      <div className="ac-bottom">
        <div className="ac-progress-strip" role="group" aria-label={t.rail}>
          {accountingCycleStages.map((stage,index) => <button type="button" key={stage.id} className={index === active ? "is-active" : ""} onClick={() => select(index)} aria-label={`${t.stage} ${index+1} — ${stage.title[locale]}`} aria-current={index === active ? "step" : undefined}><span>{index+1}</span><small>{stage.title[locale]}</small></button>)}
        </div>
        <div className="ac-rail-wrap"><button type="button" className="ac-rail-arrow" aria-label={t.scrollLeft} onClick={()=>select(active-1)} disabled={active===0}><ArrowLeft size={20}/></button><div ref={railRef} className="ac-rail" role="group" aria-label={t.rail}>{accountingCycleStages.map((stage,index)=>{const Icon=stageIcons[index];const preview=previews[index];return <button type="button" ref={el=>{previewRefs.current[index]=el;}} key={stage.id} className={`ac-preview ${index===active?"is-active":""}`} onClick={()=>select(index)} aria-label={`${t.stage} ${index+1}: ${stage.title[locale]}`} aria-current={index===active?"step":undefined}><span className="ac-preview-title"><span className="ac-preview-number">{index+1}</span><Icon size={19}/><strong>{stage.title[locale]}</strong></span><span className="ac-preview-subtitle">{stage.subtitle[locale]}</span><span className="ac-preview-mini"><b>{preview.heading[locale]}</b>{preview.rows.slice(0,2).map((row,rowIndex)=><span key={rowIndex}><i/>{locale === "ar" ? row[0].split(" / ")[0] : row[0].split(" / ")[1] || row[0]}</span>)}</span></button>;})}</div><button type="button" className="ac-rail-arrow" aria-label={t.scrollRight} onClick={()=>select(active+1)} disabled={active===11}><ArrowRight size={20}/></button></div>
      </div>
    </div></div>
  </section>;
}
