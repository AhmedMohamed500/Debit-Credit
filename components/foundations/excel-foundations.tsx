"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, BookOpen, BriefcaseBusiness, Check, ChevronDown, CircleHelp, Download, FileSpreadsheet, Home, Info, Lightbulb, Medal, RotateCcw, Search, Settings, ShieldCheck, Sigma, Trophy, UserRound, X } from "lucide-react";
import { ProfilePhoto } from "@/components/career/profile-photo";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { assessStep, createExcelProgress, editableCells, evaluateCell, finalWorkbook, initialWorkbook, scenarios, type ExcelProgress, type ExcelStep, type Workbook } from "@/lib/excel-foundations/engine";
import type { Locale } from "@/types";

const steps = [1, 2, 3, 4, 5] as const;
const labels = {
  ar: {
    learn: "التعلم", skills: "المهارات", projects: "المشاريع", certificates: "الشهادات", profile: "ملفي المهني", search: "ابحث في الدروس أو المهارات...",
    journey: "رحلتي التعليمية", bootcamp: "المحاسب Bootcamp", progress: "التقدم", upcoming: "المهام القادمة", arena: "ساحة المحاسبة", support: "المجتمع والدعم",
    sub: "الخلايا والعمليات الأساسية والمعادلة المحاسبية", description: "ابدأ رحلتك في المحاسبة من خلال إتقان أساسيات Excel، وتعلّم كيف تنظم الأرقام وتتحقق من توازن المعادلة المحاسبية داخل ورقة عمل حقيقية.",
    step: ["مفهوم الخلايا", "المعادلة المحاسبية", "إدخال البيانات", "استخدام SUM", "مهمة تطبيقية"] as string[],
    stepSub: ["والعمليات الأساسية", "وتطبيقها على Excel", "وجداول منظمة", "لحساب الإجماليات", "ومراجعة"] as string[],
    lesson: "شرح الدرس", example: "مثال عملي", files: "ملفات التحميل", notes: "ملاحظات", workbook: "جرّب بنفسك — ورقة تفاعلية", current: "المهمة الحالية", verify: "تحقق من الحل", next: "الدرس التالي", previous: "الدرس السابق", saved: "حُفظ تقدمك", complete: "أُنجزت المرحلة", guest: "يمكنك التجربة الآن. سجّل الدخول لحفظ التقدم والحصول على تقييم معتمد داخل المنصة.", signin: "تسجيل الدخول", save: "حفظ المسودة", replay: "إعادة ضبط الورقة", evaluation: "التقييم", excel: "مهارات Excel", accounting: "المحاسبة", cell: "الخلية", error: "راجع الخانات المحددة وأكمل الإجابات؛ لا تُمنح النقاط إلا بعد التحقق على الخادم.", offline: "تعذر الاتصال بالخادم الآن. يمكنك مواصلة التدريب محليًا، لكن لن يُحفظ التقدم.", course: "أساسيات Excel والمحاسبة", stage: "المرحلة 1", training: "تدريب تعليمي، وليس خبرة وظيفية أو شهادة مهنية.",
  },
  en: {
    learn: "Learn", skills: "Skills", projects: "Projects", certificates: "Certificates", profile: "Career profile", search: "Search lessons or skills...",
    journey: "My learning", bootcamp: "Accounting Bootcamp", progress: "Progress", upcoming: "Upcoming missions", arena: "Accounting Arena", support: "Community & support",
    sub: "Cells, basic operations and the accounting equation", description: "Learn Excel fundamentals in an accounting context. Organize figures and verify the accounting equation in a real interactive worksheet.",
    step: ["Cells and basics", "Accounting equation", "Enter data", "Use SUM", "Applied challenge"] as string[],
    stepSub: ["and operations", "in Excel", "structured tables", "for totals", "and review"] as string[],
    lesson: "Lesson", example: "Worked example", files: "Downloads", notes: "Notes", workbook: "Try it yourself — interactive worksheet", current: "Current task", verify: "Check answer", next: "Next lesson", previous: "Previous lesson", saved: "Progress saved", complete: "Stage completed", guest: "You can try it now. Sign in to save progress and receive a verified in-platform assessment.", signin: "Sign in", save: "Save draft", replay: "Reset worksheet", evaluation: "Assessment", excel: "Excel skills", accounting: "Accounting", cell: "Cell", error: "Check the highlighted cells and answers. XP is awarded only after server validation.", offline: "Server unavailable. You can keep practicing locally, but progress will not be saved.", course: "Excel and accounting foundations", stage: "Stage 1", training: "Educational training, not employment experience or a professional certificate.",
  },
};
type Tab = "lesson" | "example" | "files" | "notes";
type CellFormat = {
  fontFamily: "Arial" | "Calibri" | "Tahoma";
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
};
type ApiState = { data: ExcelProgress; revision: number; correct?: boolean; assessment?: ReturnType<typeof assessStep> };
const defaultCellFormat: CellFormat = { fontFamily: "Arial", fontSize: 14, bold: false, italic: false, underline: false };
const numericCells = editableCells.filter((address) => address.startsWith("B"));
const step5Questions = {
  ar: ["تصنيف القرض البنكي", "المعادلة المحاسبية", "شراء معدات نقدًا", "هل توازن المعادلة وحده يثبت صحة كل قيد؟"],
  en: ["Classify the bank loan", "Accounting equation", "Cash equipment purchase", "Does a balanced equation prove every entry is correct?"],
};
const answerOptions = {
  loan: [["", "—"], ["liability", "خصوم / Liability"], ["asset", "أصول / Asset"]],
  equation: [["", "—"], ["assets=liabilities+equity", "الأصول = الخصوم + حقوق الملكية"], ["assets=liabilities-equity", "الأصول = الخصوم − حقوق الملكية"]],
  equipment: [["", "—"], ["asset-exchange", "تبادل بين أصلين"], ["revenue", "إيراد"]],
  balance: [["", "—"], ["not-proof", "لا، يلزم مراجعة التصنيف والمستند"], ["proof", "نعم، التوازن يكفي"]],
  concept: [["", "—"], ["cell", "تقاطع صف وعمود / Cell"], ["row", "صف فقط / Row"]],
} as const;
const rowTitles: Record<number, [string, string]> = {
  1: ["البند", "Item"], 2: ["النقدية", "Cash"], 3: ["مدينون", "Receivables"], 4: ["مخزون", "Inventory"], 5: ["معدات", "Equipment"], 6: ["إجمالي الأصول", "Total assets"], 7: ["", ""], 8: ["قرض بنكي", "Bank loan"], 9: ["دائنون", "Payables"], 10: ["رأس المال", "Capital"], 11: ["إجمالي الخصوم وحقوق الملكية", "Total liabilities and equity"],
};

function Option({ id, value, onChange, locale }: { id: keyof typeof answerOptions; value: string; onChange: (value: string) => void; locale: Locale }) {
  return <select aria-label={id} value={value} onChange={(event) => onChange(event.target.value)}>
    {answerOptions[id].map(([key, label]) => <option key={key} value={key}>{locale === "en" && key ? key.replaceAll("-", " ") : label}</option>)}
  </select>;
}

export function ExcelFoundations({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const identity = useCloudIdentity();
  const [progress, setProgress] = useState<ExcelProgress>(createExcelProgress());
  const [revision, setRevision] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<ExcelStep>(1);
  const [cells, setCells] = useState<Workbook>(initialWorkbook());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState("B2");
  const [cellFormats, setCellFormats] = useState<Record<string, CellFormat>>({});
  const [tab, setTab] = useState<Tab>("lesson");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [lastAssessment, setLastAssessment] = useState<ReturnType<typeof assessStep> | null>(null);
  const [notes, setNotes] = useState("");
  const current = Math.min(5, progress.completedSteps.length + 1) as ExcelStep;
  const isCurrent = step === current && !progress.completedSteps.includes(5);
  const scenario = scenarios[progress.variant] ?? scenarios[0];
  const accountName = identity?.profile.displayName || (signedIn ? (locale === "ar" ? "حسابي" : "My account") : (locale === "ar" ? "ضيف" : "Guest"));
  const accountHref = identity || signedIn ? `/${locale}/account` : `/${locale}/login?next=${encodeURIComponent(`/${locale}/bootcamp/excel-foundations`)}`;
  const selectedFormat = cellFormats[selected] ?? defaultCellFormat;
  const canFormatSelected = selected.startsWith("B") && cellAllowed(selected);
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/me/excel-foundations", { credentials: "same-origin", cache: "no-store" });
      if (response.status === 401) { setSignedIn(false); return; }
      if (!response.ok) throw Error("server");
      const payload = await response.json() as ApiState;
      setSignedIn(true); setProgress(payload.data); setRevision(payload.revision);
      setCells(payload.data.draft); setAnswers(payload.data.answers);
      setStep(Math.min(5, payload.data.completedSteps.length + 1) as ExcelStep);
    } catch { setMessage(t.offline); }
    finally { setLoading(false); }
  }, [t.offline]);
  useEffect(() => { void load(); }, [load]);

  const updateCell = (address: string, value: string) => { if (!isCurrent) return; setCells((old) => ({ ...old, [address]: value.slice(0, 80) })); setErrors([]); };
  const updateFormat = (patch: Partial<CellFormat>) => {
    if (!canFormatSelected) return;
    setCellFormats((old) => ({ ...old, [selected]: { ...(old[selected] ?? defaultCellFormat), ...patch } }));
  };
  const focusCell = (address: string) => {
    setSelected(address);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-cell="${address}"]`)?.focus());
  };
  const moveFromCell = (address: string, direction: 1 | -1) => {
    const index = numericCells.indexOf(address as typeof numericCells[number]);
    if (index < 0) return;
    const target = numericCells[index + direction];
    if (target) focusCell(target);
  };
  const handleCellKey = (event: KeyboardEvent<HTMLInputElement>, address: string) => {
    if (event.key !== "Enter" && event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    moveFromCell(address, event.key === "ArrowUp" || (event.key === "Enter" && event.shiftKey) ? -1 : 1);
  };
  const cellStyle = (address: string): CSSProperties => {
    const format = cellFormats[address] ?? defaultCellFormat;
    return { fontFamily: format.fontFamily, fontSize: `${format.fontSize}px`, fontWeight: format.bold ? 800 : 500, fontStyle: format.italic ? "italic" : "normal", textDecoration: format.underline ? "underline" : "none" };
  };
  const updateAnswer = (key: string, value: string) => { if (!isCurrent) return; setAnswers((old) => ({ ...old, [key]: value })); setErrors([]); };
  const openStep = (target: ExcelStep) => {
    if (target > current) return;
    setStep(target); setErrors([]); setLastAssessment(null); setMessage(""); setSelected("B2");
    if (target === current) { setCells(progress.draft); setAnswers(progress.answers); }
    else { setCells(target === 5 ? finalWorkbook(progress.variant) : initialWorkbook()); setAnswers({}); }
  };
  const send = async (type: "save" | "submit") => {
    if (!isCurrent) return;
    setBusy(true); setMessage("");
    const local = assessStep(step, cells, { ...answers, cell: answers.cell ?? selected }, progress.variant);
    if (type === "submit") { setErrors(local.errors); setLastAssessment(local); }
    if (!signedIn) {
      if (type === "submit" && local.passed) {
        const next = { ...progress, completedSteps: [...progress.completedSteps, step], draft: step === 4 ? finalWorkbook(progress.variant) : cells, answers: {} } as ExcelProgress;
        setProgress(next); setStep(Math.min(5, step + 1) as ExcelStep); setCells(next.draft); setAnswers({}); setMessage(step === 5 ? `${t.complete}. ${t.guest}` : t.guest);
      } else setMessage(type === "submit" ? t.error : t.guest);
      setBusy(false); return;
    }
    try {
      const response = await fetch("/api/v1/me/excel-foundations", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commandId: crypto.randomUUID(), revision, type, step, cells, answers: { ...answers, cell: answers.cell ?? selected } }) });
      const result = await response.json() as ApiState & { error?: { code: string } };
      if (!response.ok) { if (response.status === 409) await load(); throw Error(result.error?.code ?? "server"); }
      setProgress(result.data); setRevision(result.revision); if (type === "submit") setLastAssessment(result.assessment ?? local);
      if (type === "submit" && result.correct) {
        const nextStep = Math.min(5, step + 1) as ExcelStep;
        setStep(nextStep); setCells(result.data.draft); setAnswers({}); setErrors([]);
        setMessage(step === 5 ? t.complete : t.saved);
      } else if (type === "submit") { setErrors(result.assessment?.errors ?? local.errors); setMessage(t.error); }
      else setMessage(t.saved);
    } catch { setMessage(t.offline); }
    finally { setBusy(false); }
  };
  const reset = () => { const draft = step === 5 ? finalWorkbook(progress.variant) : initialWorkbook(); setCells(draft); setAnswers({}); setCellFormats({}); setErrors([]); setLastAssessment(null); setMessage(""); };
  const downloadCsv = () => {
    const rows = Array.from({ length: 11 }, (_, index) => { const n = index + 1; return [rowTitles[n][locale === "ar" ? 0 : 1], cells[`B${n}`] ?? "", cells[`C${n}`] ?? "", cells[`D${n}`] ?? ""].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","); });
    const blob = new Blob(["\uFEFF" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "excel-foundations-practice.csv"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const nextRequired = useMemo(() => step === 1 ? ["B2", "concept"] : step === 2 ? ["C8", "C9", "C10", "loan", "equation"] : step === 3 ? ["B8", "B9", "B10"] : step === 4 ? ["B6", "B11"] : ["C8", "B6", "B11", "equipment", "balance"], [step]);
  return <div className="xf-shell" dir={locale === "ar" ? "rtl" : "ltr"}>
    <header className="xf-top"><Link className="xf-brand" href={`/${locale}`}><span className="xf-brand-mark"><ShieldCheck size={25}/></span><span>Debit & Credit</span></Link><div className="xf-search"><Search size={21}/><span>{t.search}</span><kbd>⌘ K</kbd></div><nav><Link className="active" href={`/${locale}/bootcamp/excel-foundations`}><Home size={19}/>{t.learn}</Link><Link href={`/${locale}/career-profile`}><Award size={19}/>{t.skills}</Link><Link href={`/${locale}/bootcamp`}><BriefcaseBusiness size={19}/>{t.projects}</Link><Link href={`/${locale}/accounting-arena`}><Trophy size={19}/>{t.arena}</Link></nav><Link className="xf-user" href={accountHref} aria-label={locale === "ar" ? `فتح حساب ${accountName}` : `Open ${accountName}'s account`}><span className="xf-notice" aria-hidden="true">●</span>{identity ? <ProfilePhoto locale={locale} name={accountName}/> : <span className="xf-avatar"><UserRound size={22}/></span>}<span className="xf-user-copy"><strong>{accountName}</strong><small>{signedIn || identity ? `${progress.completedSteps.length}/5 ${locale === "ar" ? "مراحل مكتملة" : "stages complete"}` : (locale === "ar" ? "سجّل الدخول لحفظ تقدمك" : "Sign in to save progress")}</small></span><ChevronDown size={18}/></Link></header>
    <aside className="xf-side"><div className="xf-side-title"><Home size={21}/>{t.journey}</div><Link className="xf-side-item boot" href={`/${locale}/bootcamp`}><BookOpen size={19}/>{t.bootcamp}<ChevronDown size={15}/></Link><div className="xf-side-meter"><span style={{ width: `${progress.completedSteps.length * 20}%` }}/></div><small>{progress.completedSteps.length * 20}%</small><div className="xf-side-steps">{steps.map((s) => <button key={s} className={step === s ? "chosen" : ""} disabled={s > current} onClick={() => openStep(s)}><span className="xf-mini-step">{progress.completedSteps.includes(s) ? <Check size={12}/> : s}</span>{s}. {t.step[s - 1]}</button>)}</div><div className="xf-side-links"><Link href={`/${locale}/accounting-arena`}><Trophy size={19}/>{t.arena}</Link><Link href={`/${locale}/career-profile`}><UserRound size={19}/>{t.profile}</Link><Link href={`/${locale}/bootcamp`}><Settings size={19}/>{t.upcoming}</Link></div><div className="xf-side-foot"><Trophy size={28}/><strong>{locale === "ar" ? "تقدم موثق" : "Verified progress"}</strong><span>{progress.completedSteps.length} / 5 {locale === "ar" ? "دروس" : "lessons"}</span><div className="xf-side-meter"><span style={{ width: `${progress.completedSteps.length * 20}%` }}/></div><Link href={`/${locale}/accounting-arena`}>{t.arena}</Link></div></aside>
    <main className="xf-main"><section className="xf-hero"><div className="xf-hero-copy"><div className="xf-crumb">{t.bootcamp} › Excel Foundations</div><h1>Excel Foundations <span>{t.stage}</span></h1><h2>{t.sub}</h2><p>{t.description}</p></div><div className="xf-equation"><span className="xf-excel-icon">X</span><div><strong>{locale === "ar" ? "الأصول" : "Assets"}</strong><small>Assets</small></div><b>=</b><div><strong>{locale === "ar" ? "الخصوم" : "Liabilities"}</strong><small>Liabilities</small></div><b>+</b><div><strong>{locale === "ar" ? "حقوق الملكية" : "Equity"}</strong><small>Equity</small></div></div></section>
      <div className="xf-stagebar">{steps.map((s) => <button key={s} className={progress.completedSteps.includes(s) ? "done" : step === s ? "active" : ""} disabled={s > current} onClick={() => openStep(s)}><span className="xf-stage-number">{progress.completedSteps.includes(s) ? <Check size={16}/> : s}</span><span><strong>{t.step[s - 1]}</strong><small>{t.stepSub[s - 1]}</small></span>{s < 5 && <ArrowRight className="xf-stage-arrow" size={21}/>}</button>)}</div>
      <div className="xf-workspace"><section className="xf-lesson-card"><div className="xf-tabs">{(["lesson", "example", "files", "notes"] as Tab[]).map((key) => <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{key === "lesson" ? t.lesson : key === "example" ? t.example : key === "files" ? t.files : t.notes}</button>)}</div>{tab === "lesson" && <div className="xf-lesson-content"><div className="xf-lesson-lead"><span className="xf-green-icon"><FileSpreadsheet size={33}/></span><div><h3>{t.step[step - 1]} {locale === "ar" ? "في Excel" : "in Excel"}</h3><p>{step === 1 ? (locale === "ar" ? "الخلية هي تقاطع صف وعمود. اضغط B2، ثم اختر معناها الصحيح. يمكنك كتابة قيمة أو معادلة في شريط الصيغة." : "A cell is where a row and column meet. Select B2, then identify a cell. Enter a value or formula in the formula bar.") : step === 2 ? (locale === "ar" ? "الأصول = الخصوم + حقوق الملكية. صنّف البنود ثم اختر سبب تصنيف القرض البنكي." : "Assets = liabilities + equity. Classify each item, then explain the bank loan classification.") : step === 3 ? (locale === "ar" ? "أدخل المبالغ الناقصة حسب المستند التعليمي. راجع المبالغ قبل الانتقال لحساب الإجمالي." : "Enter the missing amounts from the educational source. Review them before calculating totals.") : step === 4 ? (locale === "ar" ? "اكتب دالتي SUM في B6 وB11. سيحسب المحرك القيم ويتحقق من توازن المعادلة." : "Write SUM formulas in B6 and B11. The worksheet evaluates them and checks the equation.") : (locale === "ar" ? "تحدٍّ جديد بقيم مختلفة وخطأ تصنيف ونطاقي SUM غير صحيحين. اكتشفها وصحّحها ثم فسّر قرارك." : "A new variant has different amounts, one wrong category and two broken SUM ranges. Diagnose and fix them, then explain your reasoning.")}</p></div></div><div className="xf-concept-box"><strong>{locale === "ar" ? "ما ستتعلمه في هذا الدرس" : "What you will practice"}</strong><ul>{[locale === "ar" ? "إدخال البيانات في الخلايا" : "Enter data into cells", locale === "ar" ? "تصنيف الأصول والخصوم وحقوق الملكية" : "Classify assets, liabilities and equity", locale === "ar" ? "استخدام SUM لحساب الإجماليات" : "Use SUM for totals", locale === "ar" ? "فهم حدود التوازن الحسابي" : "Understand what a balanced equation does not prove"].map((item) => <li key={item}><Check size={16}/>{item}</li>)}</ul></div></div>}{tab === "example" && <div className="xf-lesson-content"><h3>{locale === "ar" ? "مثال محلول" : "Worked example"}</h3><p>{locale === "ar" ? "إذا كانت النقدية 50,000 والمدينون 30,000 والمخزون 20,000 والمعدات 100,000، فإن إجمالي الأصول 200,000. ولا يكفي تساوي الطرفين لإثبات صحة تصنيف البنود." : "Cash 50,000 + receivables 30,000 + inventory 20,000 + equipment 100,000 = assets 200,000. Equality alone does not prove correct classification."}</p><code>=SUM(B2:B5)</code></div>}{tab === "files" && <div className="xf-lesson-content"><h3>{t.files}</h3><p>{locale === "ar" ? "نزّل بيانات الورقة التي تعمل عليها بصيغة CSV وافتحها في Excel أو أي برنامج جداول." : "Download your current worksheet as CSV and open it in Excel or another spreadsheet program."}</p><button className="xf-outline" onClick={downloadCsv}><Download size={17}/> CSV</button></div>}{tab === "notes" && <div className="xf-lesson-content"><label htmlFor="xf-notes">{t.notes}</label><textarea id="xf-notes" value={notes} onChange={(event) => setNotes(event.target.value.slice(0, 2000))} placeholder={locale === "ar" ? "اكتب ملاحظاتك هنا (تبقى في هذه الجلسة فقط)" : "Write notes here (current session only)"}/></div>}</section>
      <section className="xf-sheet-card"><div className="xf-card-heading"><span className="xf-green-icon small"><FileSpreadsheet size={21}/></span><strong>{t.workbook}</strong><Info size={16}/><button onClick={reset} disabled={!isCurrent}><RotateCcw size={15}/>{t.replay}</button></div><p className="xf-sheet-help">{locale === "ar" ? "انقر أي خلية لتحديدها. اكتب ثم اضغط Enter للانتقال للخلية التالية، أو Shift + Enter للسابقة. أدوات الخط تعمل على الخلية المحددة." : "Select a cell, type, then press Enter for the next cell or Shift + Enter for the previous one. Font tools apply to the selected cell."}</p><div className="xf-sheet"><div className="xf-ribbon"><span>File</span><strong>Home</strong><span>Insert</span><span>Formulas</span><span>Data</span><span>View</span></div><div className="xf-tools" role="toolbar" aria-label={locale === "ar" ? "تنسيق الخلية" : "Cell formatting"}><select aria-label={locale === "ar" ? "نوع الخط" : "Font family"} value={selectedFormat.fontFamily} disabled={!canFormatSelected} onChange={(event) => updateFormat({ fontFamily: event.target.value as CellFormat["fontFamily"] })}><option>Arial</option><option>Calibri</option><option>Tahoma</option></select><select aria-label={locale === "ar" ? "حجم الخط" : "Font size"} value={selectedFormat.fontSize} disabled={!canFormatSelected} onChange={(event) => updateFormat({ fontSize: Number(event.target.value) })}>{[11, 12, 14, 16, 18, 20].map((size) => <option key={size} value={size}>{size}</option>)}</select><button type="button" aria-label={locale === "ar" ? "خط عريض" : "Bold"} aria-pressed={selectedFormat.bold} disabled={!canFormatSelected} onClick={() => updateFormat({ bold: !selectedFormat.bold })}><strong>B</strong></button><button type="button" aria-label={locale === "ar" ? "خط مائل" : "Italic"} aria-pressed={selectedFormat.italic} disabled={!canFormatSelected} onClick={() => updateFormat({ italic: !selectedFormat.italic })}><em>I</em></button><button type="button" aria-label={locale === "ar" ? "تسطير" : "Underline"} aria-pressed={selectedFormat.underline} disabled={!canFormatSelected} onClick={() => updateFormat({ underline: !selectedFormat.underline })}><u>U</u></button><span className="xf-format-label">{locale === "ar" ? "تنسيق محاسبي" : "Accounting"}</span></div><div className="xf-formula"><span>{selected}</span><span>✓</span><span>ƒx</span><input aria-label="Formula bar" disabled={!isCurrent || !editableCells.includes(selected as typeof editableCells[number]) || selected.startsWith("C")} value={cells[selected] ?? ""} style={cellStyle(selected)} onKeyDown={(event) => handleCellKey(event, selected)} onChange={(event) => updateCell(selected, event.target.value)}/></div><div className="xf-sheet-scroll"><table><thead><tr><th></th>{["A", "B", "C", "D"].map((col) => <th key={col} className={selected.startsWith(col) ? "selected" : ""}>{col}</th>)}</tr></thead><tbody>{Array.from({ length: 11 }, (_, index) => index + 1).map((row) => <tr key={row} className={row === 6 || row === 11 ? "total" : ""}><th>{row}</th><td>{rowTitles[row][locale === "ar" ? 0 : 1]}</td><td className={selected === `B${row}` ? "selected" : ""}><input data-cell={`B${row}`} aria-label={`B${row}`} disabled={!isCurrent || !cellAllowed(`B${row}`)} value={cellAllowed(`B${row}`) ? (cells[`B${row}`] ?? "") : ""} style={cellStyle(`B${row}`)} onFocus={() => { setSelected(`B${row}`); if (step === 1) setAnswers((old) => ({ ...old, cell: `B${row}` })); }} onKeyDown={(event) => handleCellKey(event, `B${row}`)} onChange={(event) => updateCell(`B${row}`, event.target.value)}/>{row === 6 || row === 11 ? <small>{formatValue(evaluateCell(cells, `B${row}`))}</small> : null}</td><td>{cellAllowed(`C${row}`) && row !== 6 && row !== 11 ? <select data-cell={`C${row}`} aria-label={`C${row}`} disabled={!isCurrent} value={cells[`C${row}`] ?? ""} onFocus={() => setSelected(`C${row}`)} onChange={(event) => updateCell(`C${row}`, event.target.value)}><option value="">—</option><option value="asset">{locale === "ar" ? "أصول" : "Asset"}</option><option value="liability">{locale === "ar" ? "خصوم" : "Liability"}</option><option value="equity">{locale === "ar" ? "حقوق ملكية" : "Equity"}</option></select> : ""}</td><td>{row === 6 || row === 11 ? (cells[`B${row}`] ?? "") : ""}</td></tr>)}</tbody></table></div><div className="xf-sheet-tabs"><button aria-label={locale === "ar" ? "إضافة ورقة" : "Add sheet"}>＋</button><button className="active">{locale === "ar" ? "الميزانية العمومية" : "Balance sheet"}</button><button>{locale === "ar" ? "البيانات الأصلية" : "Source data"}</button><button>{locale === "ar" ? "النموذج" : "Model"}</button></div></div><p className="xf-training-note">{t.training}</p></section>
      <aside className="xf-task-column"><div className="xf-task-card"><div className="xf-task-head"><Lightbulb size={19}/><strong>{t.current}</strong><span>{step === 5 ? (locale === "ar" ? "تحدٍ نهائي" : "Final challenge") : (locale === "ar" ? "مستوى مبتدئ" : "Beginner")}</span></div><h3>{step === 5 ? (locale === "ar" ? "راجع ميزانية الشركة" : "Review the balance sheet") : t.step[step - 1]}</h3><p>{step === 3 ? (locale === "ar" ? `المبالغ الناقصة: قرض ${scenario.loan.toLocaleString()}، دائنون ${scenario.payables.toLocaleString()}، رأس المال ${scenario.capital.toLocaleString()}.` : `Missing amounts: loan ${scenario.loan.toLocaleString()}, payables ${scenario.payables.toLocaleString()}, capital ${scenario.capital.toLocaleString()}.`) : step === 5 ? (locale === "ar" ? "صحح التصنيف ومعادلتي SUM؛ لا تغيّر مبالغ المستند. أجب عن أسئلة التحليل." : "Fix classification and both SUM formulas; do not alter source amounts. Answer the reasoning questions.") : locale === "ar" ? "أنجز الخطوات داخل الورقة، ثم اطلب التحقق من الحل." : "Complete the worksheet tasks, then check your answer."}</p><ol>{nextRequired.map((item, index) => <li key={item}><span>{index + 1}</span>{item === "concept" ? (locale === "ar" ? "اختر تعريف الخلية" : "Define a cell") : item === "loan" || item === "equation" || item === "equipment" || item === "balance" ? (locale === "ar" ? "أجب عن سؤال التحليل" : "Answer the reasoning question") : `${locale === "ar" ? "راجع" : "Check"} ${item}`}</li>)}</ol>{step === 1 && <label className="xf-question">{locale === "ar" ? "ما الخلية؟" : "What is a cell?"}<Option id="concept" value={answers.concept ?? ""} onChange={(value) => updateAnswer("concept", value)} locale={locale}/></label>}{(step === 2 || step === 5) && <><label className="xf-question">{step5Questions[locale][0]}<Option id="loan" value={answers.loan ?? ""} onChange={(value) => updateAnswer("loan", value)} locale={locale}/></label><label className="xf-question">{step5Questions[locale][1]}<Option id="equation" value={answers.equation ?? ""} onChange={(value) => updateAnswer("equation", value)} locale={locale}/></label></>}{step === 5 && <><label className="xf-question">{step5Questions[locale][2]}<Option id="equipment" value={answers.equipment ?? ""} onChange={(value) => updateAnswer("equipment", value)} locale={locale}/></label><label className="xf-question">{step5Questions[locale][3]}<Option id="balance" value={answers.balance ?? ""} onChange={(value) => updateAnswer("balance", value)} locale={locale}/></label></>}{lastAssessment && <div className={lastAssessment.passed ? "xf-assessment pass" : "xf-assessment"}><strong>{lastAssessment.passed ? (locale === "ar" ? "نجح التحقق" : "Assessment passed") : (locale === "ar" ? "لم تتحقق شروط الإتقان بعد" : "Mastery requirements not met")}</strong><span>{t.accounting}: {lastAssessment.accountingScore}%</span><span>{t.excel}: {lastAssessment.excelScore}%</span><span>{t.evaluation}: {lastAssessment.score}%</span></div>}{errors.length > 0 && <div className="xf-errors" role="alert"><X size={15}/>{t.error}<small>{errors.join(" · ")}</small></div>}{message && <div className="xf-message" role="status">{message}{!signedIn && <Link href={`/${locale}/login?next=/${locale}/bootcamp/excel-foundations`}>{t.signin}</Link>}</div>}{signedIn && progress.completedSteps.includes(5) && <div className="xf-victory"><Trophy size={20}/><strong>{locale === "ar" ? "أتممت تدريب Excel Foundations" : "Excel Foundations training complete"}</strong><span>{progress.finalScore}% · 380 XP</span><small>{t.training}</small><Link href={`/${locale}/bootcamp`}>{locale === "ar" ? "العودة إلى مسار المحاسب" : "Continue the accounting path"}</Link></div>}<div className="xf-task-buttons"><button onClick={() => void send("save")} disabled={!isCurrent || busy || loading} className="xf-outline">{t.save}</button><button onClick={() => void send("submit")} disabled={!isCurrent || busy || loading} className="xf-primary">{t.verify}<Check size={17}/></button></div></div><div className="xf-tip-card"><h4><Lightbulb size={17}/>{locale === "ar" ? "تلميحات ذكية" : "Helpful hints"}</h4><p><Sigma size={17}/>{locale === "ar" ? "استخدم SUM لحساب الإجماليات مثل: =SUM(B2:B5)" : "Use SUM for totals, e.g. =SUM(B2:B5)"}</p><p><FileSpreadsheet size={17}/>{locale === "ar" ? "تحقق من نطاق الخلايا والتصنيف الصحيح." : "Check cell ranges and classifications."}</p><p><ShieldCheck size={17}/>{locale === "ar" ? "لا تخمّن النتيجة: راجع السبب المحاسبي." : "Do not guess the result: explain the accounting logic."}</p></div></aside></div>
      <div className="xf-bottom"><div><BookOpen size={24}/><strong>{locale === "ar" ? "محتوى تفاعلي" : "Interactive content"}</strong><small>{locale === "ar" ? "شرح بسيط مع أمثلة عملية" : "Simple lessons with examples"}</small></div><div><FileSpreadsheet size={24}/><strong>{locale === "ar" ? "تطبيق مباشر" : "Hands-on practice"}</strong><small>{locale === "ar" ? "تمارين داخل ورقة تفاعلية" : "Interactive worksheet"}</small></div><div><CircleHelp size={24}/><strong>{locale === "ar" ? "تقييم فوري" : "Instant feedback"}</strong><small>{locale === "ar" ? "تحقق من إجاباتك" : "Check your answers"}</small></div><div><Medal size={24}/><strong>{locale === "ar" ? "إنجاز تدريبي" : "Training milestone"}</strong><small>{locale === "ar" ? "بعد إكمال هذه المرحلة" : "After completing this stage"}</small></div><button className="xf-outline" onClick={() => openStep(Math.max(1, step - 1) as ExcelStep)} disabled={step === 1}><ArrowLeft size={18}/>{t.previous}</button><button className="xf-primary" onClick={() => openStep(Math.min(current, step + 1) as ExcelStep)} disabled={step >= current}>{t.next}<ArrowRight size={18}/></button></div>
    </main></div>;
}
function cellAllowed(address: string) { return editableCells.includes(address as typeof editableCells[number]); }
function formatValue(value: ReturnType<typeof evaluateCell>) { return typeof value === "number" ? value.toLocaleString("en-US") : value; }
