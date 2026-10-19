export type CycleCopy = { ar: string; en: string };
export type CycleAvailability = "interactive" | "tool" | "preview";
export type CycleStage = {
  id: string;
  title: CycleCopy;
  subtitle: CycleCopy;
  description: CycleCopy;
  points: CycleCopy[];
  availability: CycleAvailability;
  route?: string;
  routeNote: CycleCopy;
};

const t = (ar: string, en: string): CycleCopy => ({ ar, en });

/** Public illustrations only. The linked tools keep their own authoritative state. */
export const accountingCycleStages: readonly CycleStage[] = [
  {
    id: "company-setup", title: t("تأسيس الشركة", "Company Setup"),
    subtitle: t("ابدأ رحلتك بإعداد الشركة ودليل حساباتها", "Start with company information and the chart of accounts"),
    description: t("تتعرف على بيانات الشركة، وتنشئ دليل الحسابات المناسب لنشاطها، وتفهم الأرصدة الافتتاحية وبداية الدورة المحاسبية.", "Explore company details, the chart of accounts, opening balances and the start of the accounting cycle."),
    points: [t("إعداد بيانات الشركة والفترة المالية.", "Company details and financial period."), t("التعرف على دليل الحسابات وطبيعته.", "Chart of accounts and account nature."), t("فهم الأرصدة الافتتاحية.", "Opening-balance concepts."), t("التهيئة للعمل على مستندات محاسبية.", "Preparation for source documents.")],
    availability: "tool", route: "/academy/account-guide",
    routeNote: t("دليل الحسابات متاح كأداة تعليمية؛ تأسيس شركة كاملة ليس لعبة مفتوحة حاليًا.", "The account guide is an available learning tool; full company setup is not currently playable."),
  },
  {
    id: "source-documents", title: t("المستندات الواردة", "Source Documents"),
    subtitle: t("استلم المستند وافحص مصدره ومبلغه", "Inspect the source, amount and supporting evidence"),
    description: t("افتح فاتورة المورد ومستنداتها المؤيدة قبل اتخاذ القرار المحاسبي. المثال من تدريب أول وردية، لا من مستندات شركة حقيقية.", "Inspect a supplier invoice and its support before deciding the accounting treatment. This is First Shift training, not a real company document."),
    points: [t("قراءة مرجع المستند وتاريخه.", "Read the document reference and date."), t("مطابقة الفاتورة بالمؤيدات.", "Match invoice and supporting evidence."), t("تحديد الطرف والمبلغ.", "Identify party and amount."), t("رفض البيانات غير المتطابقة.", "Hold inconsistent information.")],
    availability: "interactive", route: "/game/first-shift",
    routeNote: t("حالة فحص المستندات متاحة داخل أول وردية.", "Document inspection is playable in First Shift."),
  },
  {
    id: "transaction-analysis", title: t("تحليل العمليات", "Transaction Analysis"),
    subtitle: t("حدد الحسابات المتأثرة وطبيعة كل حساب", "Identify affected accounts and their nature"),
    description: t("انتقل من قصة العملية إلى تصنيف الحسابات وتحديد الزيادة أو النقصان والطرف المدين والدائن قبل تسجيل أي قيد.", "Move from the transaction story to account classification, increases and decreases, and the debit/credit sides before posting."),
    points: [t("تصنيف الأصل والالتزام والإيراد.", "Classify assets, liabilities and revenue."), t("تحديد الحسابات المتأثرة.", "Identify affected accounts."), t("تحليل المدين والدائن.", "Analyse debit and credit."), t("مراجعة الأثر قبل القيد.", "Review the effect before posting.")],
    availability: "interactive", route: "/bootcamp",
    routeNote: t("تدريبات تصنيف وتحليل الحسابات متاحة في المعسكر.", "Account classification and analysis exercises are available in Bootcamp."),
  },
  {
    id: "journal-entries", title: t("تسجيل القيود", "Journal Entries"),
    subtitle: t("سجّل قيدًا متوازنًا مرتبطًا بالمستند", "Record a balanced, source-linked entry"),
    description: t("حدد الحسابات والمبالغ، ثم تحقق من تساوي المدين والدائن قبل قبول القيد داخل المحاكاة.", "Choose accounts and amounts, then verify that debit and credit agree before the simulation accepts the entry."),
    points: [t("اختيار الحسابات المناسبة.", "Select the right accounts."), t("إدخال المدين والدائن.", "Enter debit and credit."), t("التحقق من التوازن.", "Validate balance."), t("حماية الأستاذ من القيد الخاطئ.", "Keep incorrect entries out of the ledger.")],
    availability: "interactive", route: "/game/first-shift",
    routeNote: t("تسجيل قيود المستندات المؤيدة متاح داخل أول وردية.", "Source-linked journal posting is playable in First Shift."),
  },
  {
    id: "general-ledger", title: t("دفتر الأستاذ", "General Ledger"),
    subtitle: t("تابع الترحيل والحركة والرصيد الجاري", "Review posted movements and running balances"),
    description: t("اعرض حركة الحساب من القيود المقبولة فقط، وشاهد كيف يتغير الرصيد مع كل ترحيل.", "See account movements from accepted entries only and how the running balance changes after each posting."),
    points: [t("قراءة كود الحساب وطبيعته.", "Read account code and nature."), t("تتبع مرجع كل قيد.", "Trace each journal reference."), t("مراجعة الرصيد الجاري.", "Review running balance."), t("فتح أداة الأستاذ الموجودة.", "Open the existing ledger tool.")],
    availability: "tool", route: "/ledger",
    routeNote: t("أداة الأستاذ تقرأ القيود المقبولة من حسابك؛ المعاينة هنا تدريبية.", "The ledger tool reads your accepted entries; this preview is illustrative."),
  },
  {
    id: "trial-balance", title: t("ميزان المراجعة", "Trial Balance"),
    subtitle: t("تحقق من تساوي إجمالي المدين والدائن", "Check that total debits equal total credits"),
    description: t("تجمع أداة ميزان المراجعة أرصدة الحسابات من القيود المقبولة وتكشف الفرق إن وجد؛ المثال المعروض مبسط ومتوازن.", "The trial-balance tool totals accepted account balances and identifies any difference; the displayed example is simplified and balanced."),
    points: [t("عرض أرصدة الحسابات.", "Read account balances."), t("جمع طرفي الميزان.", "Total both sides."), t("كشف أي فرق.", "Identify any difference."), t("مراجعة المصدر قبل التصحيح.", "Review the source before correction.")],
    availability: "tool", route: "/trial-balance",
    routeNote: t("أداة ميزان المراجعة موجودة؛ بياناتها الحقيقية تعتمد على قيود حسابك المقبولة.", "The trial-balance tool exists; its real figures depend on your accepted entries."),
  },
  {
    id: "bank-reconciliation", title: t("التسوية البنكية", "Bank Reconciliation"),
    subtitle: t("طابق كشف البنك مع رصيد الدفاتر", "Match the bank statement to the book balance"),
    description: t("تدرب على المطابقة وتصنيف الفروق وإجراء تصحيحات دفترية داخل ورقة عمل مستقلة؛ لا تُرحّل الورقة تعديلًا إلى الأستاذ تلقائيًا.", "Practice matching, classifying differences and book corrections in a separate workpaper; it does not automatically post into the ledger."),
    points: [t("مطابقة الحركات.", "Match transactions."), t("تمييز فروق التوقيت.", "Distinguish timing differences."), t("فحص تصحيحات الدفتر.", "Review book corrections."), t("رفض الموازنة القسرية.", "Reject forced balancing.")],
    availability: "interactive", route: "/game/bank-reconciliation",
    routeNote: t("ورقة التسوية البنكية التفاعلية متاحة كسيناريو تدريبي مستقل.", "The bank reconciliation workpaper is available as a separate training scenario."),
  },
  {
    id: "period-adjustments", title: t("تسويات نهاية الفترة", "Period-End Adjustments"),
    subtitle: t("راجع الاستحقاقات والمقدمات والإهلاك", "Review accruals, prepayments and depreciation"),
    description: t("توضح هذه المعاينة فكرة قيود التسوية قبل الإقفال. سير العمل المتكامل لتسويات نهاية الفترة لم يُفتح كلعبة بعد.", "This preview explains adjusting-entry concepts before close. An integrated period-end adjustment case is not yet playable."),
    points: [t("مصروفات مستحقة.", "Accrued expenses."), t("مصروفات وإيرادات مقدمة.", "Prepayments and deferrals."), t("إهلاك الأصول.", "Depreciation."), t("قيد التسوية بعد المراجعة.", "Reviewed adjusting entry.")],
    availability: "preview", routeNote: t("معاينة تعليمية فقط؛ لا توجد مهمة قابلة للعب لهذه المرحلة.", "Informational preview only; no playable mission for this stage."),
  },
  {
    id: "adjusted-trial", title: t("الميزان المعدل", "Adjusted Trial Balance"),
    subtitle: t("راجع الأرصدة بعد التسويات", "Review balances after adjustments"),
    description: t("يعرض المثال مفهوم الميزان بعد التسوية وعلاقته بالقوائم. لا تدّعي المنصة حاليًا امتلاك سير عمل مكتمل للميزان المعدل.", "The example explains a post-adjustment trial balance and its link to statements. A complete adjusted-trial workflow is not currently available."),
    points: [t("ترحيل أثر التسويات نظريًا.", "Consider adjustment effects."), t("مراجعة أرصدة الحسابات.", "Review account balances."), t("تساوي المدين والدائن.", "Compare debit and credit totals."), t("التهيئة للقوائم المالية.", "Prepare conceptually for statements.")],
    availability: "preview", routeNote: t("معاينة تعليمية؛ التطبيق المتكامل مقفول حاليًا.", "Educational preview; the integrated workflow is locked."),
  },
  {
    id: "financial-statements", title: t("القوائم المالية", "Financial Statements"),
    subtitle: t("اقرأ نتيجة النشاط والمركز المالي المتاح", "Read the available result and financial position"),
    description: t("تعرض الأداة الحالية لقطة تعليمية من القيود المقبولة. القوائم الكاملة بعد الإقفال مقفولة إلى حين اكتمال فصل التسويات.", "The current tool shows an educational snapshot from accepted entries. Full post-close statements remain locked until the adjustment chapter exists."),
    points: [t("التمييز بين الإيراد والمصروف.", "Distinguish income and expenses."), t("فهم صافي الأصول والالتزامات.", "Understand net assets and liabilities."), t("ربط الأرصدة بالقائمة.", "Link balances to statements."), t("عدم الخلط مع قوائم معتمدة.", "Do not confuse this with certified statements.")],
    availability: "tool", route: "/financial-statements",
    routeNote: t("أداة لقطة القوائم متاحة؛ القوائم الكاملة بعد الإقفال ليست متاحة.", "A statement snapshot tool is available; full post-close statements are not."),
  },
  {
    id: "year-closing", title: t("إقفال السنة", "Year-End Closing"),
    subtitle: t("افهم حسابات الإقفال وما يبقى بعده", "Understand closing entries and post-close balances"),
    description: t("تعرض المعاينة الفرق بين الحسابات المؤقتة والدائمة ومبدأ ترحيل النتيجة. فصل الإقفال السنوي الكامل غير منفذ حاليًا.", "The preview distinguishes temporary and permanent accounts and the closing concept. The full year-end closing chapter is not implemented."),
    points: [t("تحديد الحسابات المؤقتة.", "Identify temporary accounts."), t("فهم قيد الإقفال.", "Understand a closing entry."), t("الحفاظ على الحسابات الدائمة.", "Keep permanent accounts."), t("مراجعة ميزان ما بعد الإقفال.", "Review a post-closing trial concept.")],
    availability: "preview", routeNote: t("مرحلة مفاهيمية مقفولة؛ لا توجد مهمة إقفال سنوي قابلة للعب.", "Conceptual locked stage; no playable year-end close mission."),
  },
  {
    id: "passport-cv", title: t("جواز المهارات والـCV", "Skill Passport & CV"),
    subtitle: t("حوّل الأدلة المؤهلة إلى ملف مهني صادق", "Turn eligible evidence into a truthful professional profile"),
    description: t("يعرض جواز المهارات أدلة التدريب المقبولة، وتُشتق السيرة من بياناتك المحفوظة دون اختراع خبرة عمل أو شهادات.", "The Skill Passport shows eligible practice evidence, while the CV derives from your saved facts without invented employment or certificates."),
    points: [t("أدلة تدريب مقبولة فقط.", "Eligible training evidence only."), t("فصل المحاكاة عن العمل الحقيقي.", "Separate simulation from employment."), t("كورسات وشهادات محفوظة ذاتيًا.", "Saved self-reported courses and certificates."), t("CV نصي بلا صورة في نسخة ATS.", "Text-based ATS CV without a photo.")],
    availability: "tool", route: "/career-profile/cv",
    routeNote: t("الملف المهني ونسخة الـCV متاحان بعد تسجيل الدخول.", "The professional profile and CV are available after sign-in."),
  },
] as const;

export function cycleStageFromProgress(progress: number, total = accountingCycleStages.length) {
  if (!Number.isFinite(progress) || total <= 0) return 0;
  return Math.min(total - 1, Math.max(0, Math.floor(Math.min(1, Math.max(0, progress)) * total)));
}
