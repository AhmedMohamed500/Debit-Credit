import type { GameSkillId, LearningLevel } from "@/types/game";

export const skillLabels: Record<GameSkillId, { ar: string; en: string }> = {
  fundamentals:{ar:"أساسيات المحاسبة",en:"Accounting Fundamentals"},
  "account-classification":{ar:"تصنيف الحسابات",en:"Account Classification"},
  "debit-credit":{ar:"المدين والدائن",en:"Debit & Credit"},
  "transaction-analysis":{ar:"تحليل العمليات",en:"Transaction Analysis"},
  "journal-entries":{ar:"القيود اليومية",en:"Journal Entries"},
  "ledger-posting":{ar:"الترحيل والأستاذ",en:"Ledger Posting"},
  "trial-balance":{ar:"ميزان المراجعة",en:"Trial Balance"},
  adjustments:{ar:"قيود التسوية",en:"Adjusting Entries"},
  "financial-statements":{ar:"القوائم المالية",en:"Financial Statements"},
  "error-detection":{ar:"اكتشاف الأخطاء",en:"Error Detection"},
  "business-cases":{ar:"الحالات العملية",en:"Business Cases"},
  accuracy:{ar:"الدقة المحاسبية",en:"Accounting Accuracy"},
  speed:{ar:"سرعة الإنجاز",en:"Accounting Speed"},
};

export const learningLevels: LearningLevel[] = [
  {id:1,titleAr:"أساسيات المحاسبة",titleEn:"Accounting Foundations",descriptionAr:"افهم المعادلة وتصنيف الحسابات وحركة المدين والدائن.",descriptionEn:"Understand the equation, account classification, debit and credit movement.",rewardAr:"شارة بداية المحاسب",rewardEn:"Accountant Starter badge",steps:[
    {id:"foundation-equation",kind:"lesson",titleAr:"المعادلة المحاسبية",titleEn:"Accounting equation",route:"/academy/accounting-foundations/accounting-equation",skillIds:["fundamentals"]},
    {id:"classic-account-nature",kind:"classic",titleAr:"طبيعة الحسابات · وحدة كلاسيكية",titleEn:"Nature of Accounts · Classic module",route:"/account-guide",skillIds:["account-classification","debit-credit"]},
    {id:"foundation-money-flow",kind:"money-flow",titleAr:"حركة الأموال",titleEn:"Money flow",route:"/money-flow",skillIds:["transaction-analysis","debit-credit"]},
    {id:"foundation-mission",kind:"mission",titleAr:"مهمة الأصل أم المصروف",titleEn:"Asset or expense mission",route:"/missions/asset-or-expense",skillIds:["account-classification","business-cases"]},
  ]},
  {id:2,titleAr:"القيود اليومية",titleEn:"Journal Entries",descriptionAr:"حلل العملية واختر الحساب والطرف والمبلغ الصحيح.",descriptionEn:"Analyze transactions and choose the correct account, side, and amount.",rewardAr:"شهادة مهارة القيود",rewardEn:"Journal skill certificate",steps:[
    {id:"journal-learn",kind:"lesson",titleAr:"المدين والدائن بدون حفظ",titleEn:"Debit and credit without memorization",route:"/academy/accounting-foundations/debit-credit",skillIds:["debit-credit"]},
    {id:"journal-practice",kind:"practice",titleAr:"تحديات القيود",titleEn:"Journal challenges",route:"/practice",skillIds:["journal-entries","accuracy"]},
    {id:"journal-mission",kind:"mission",titleAr:"إصلاح قيد غير متوازن",titleEn:"Fix an unbalanced entry",route:"/missions/fix-unbalanced-entry",skillIds:["journal-entries","accuracy"]},
  ]},
  {id:3,titleAr:"الأستاذ والترحيل",titleEn:"Ledger & Posting",descriptionAr:"تتبع أثر القيد داخل حسابات الأستاذ والأرصدة الجارية.",descriptionEn:"Track entries through ledgers and running balances.",rewardAr:"شارة أخصائي الأستاذ",rewardEn:"Ledger Specialist badge",steps:[
    {id:"ledger-learn",kind:"lesson",titleAr:"من اليومية إلى الأستاذ",titleEn:"From journal to ledger",route:"/academy/reports-close/journal-ledger",skillIds:["ledger-posting"]},
    {id:"ledger-practice",kind:"practice",titleAr:"تحدي الترحيل",titleEn:"Posting challenge",route:"/practice?track=ledger",skillIds:["ledger-posting","accuracy"]},
  ]},
  {id:4,titleAr:"ميزان المراجعة",titleEn:"Trial Balance",descriptionAr:"راجع التوازن واكتشف الفروق وأخطاء الترحيل.",descriptionEn:"Check balances and detect posting differences.",rewardAr:"شارة محلل الميزان",rewardEn:"Trial Balance Solver badge",steps:[
    {id:"trial-learn",kind:"lesson",titleAr:"ميزان المراجعة",titleEn:"Trial balance",route:"/academy/reports-close/trial-balance",skillIds:["trial-balance"]},
    {id:"trial-detective",kind:"detective",titleAr:"قضية فرق بنكي",titleEn:"Bank difference case",route:"/detective/missing-7500",skillIds:["trial-balance","error-detection"]},
  ]},
  {id:5,titleAr:"قيود التسوية",titleEn:"Adjusting Entries",descriptionAr:"أتقن المستحقات والمقدمات والإهلاك وتسويات نهاية الفترة.",descriptionEn:"Master accruals, prepayments, depreciation, and period-end adjustments.",rewardAr:"شارة أخصائي التسويات",rewardEn:"Adjustments Specialist badge",steps:[
    {id:"adjust-learn",kind:"lesson",titleAr:"قيود التسوية",titleEn:"Adjusting entries",route:"/academy/journal-entry-masterclass/adjusting-entries",skillIds:["adjustments"]},
    {id:"adjust-practice",kind:"practice",titleAr:"تدريب التسويات",titleEn:"Adjustments practice",route:"/practice?track=adjustments",skillIds:["adjustments","journal-entries"]},
  ]},
  {id:6,titleAr:"القوائم المالية",titleEn:"Financial Statements",descriptionAr:"اربط نتائج القيود بقائمة الدخل والمركز المالي والتدفقات.",descriptionEn:"Connect accounting results to income, position, and cash flow statements.",rewardAr:"شهادة القوائم المالية",rewardEn:"Financial Statements certificate",steps:[
    {id:"statements-income",kind:"lesson",titleAr:"قائمة الدخل",titleEn:"Income statement",route:"/academy/reports-close/income-statement",skillIds:["financial-statements"]},
    {id:"statements-position",kind:"lesson",titleAr:"قائمة المركز المالي",titleEn:"Statement of financial position",route:"/academy/reports-close/balance-sheet",skillIds:["financial-statements"]},
  ]},
  {id:7,titleAr:"محاسبة العالم الحقيقي",titleEn:"Real-World Accounting",descriptionAr:"نفذ مهامًا وحالات مختلطة مبنية على مواقف العمل.",descriptionEn:"Complete mixed missions and cases based on real work situations.",rewardAr:"شارة أخصائي المهمات",rewardEn:"Mission Specialist badge",steps:[
    {id:"real-missions",kind:"mission",titleAr:"المهام العملية",titleEn:"Real accounting jobs",route:"/missions",skillIds:["business-cases"]},
    {id:"real-detective",kind:"detective",titleAr:"المحقق المحاسبي",titleEn:"Accounting Detective",route:"/detective",skillIds:["error-detection"]},
  ]},
  {id:8,titleAr:"الوضع الاحترافي",titleEn:"Professional Mode",descriptionAr:"اختبر جاهزيتك داخل الساحة ومحاكاة بيئة العمل.",descriptionEn:"Prove job readiness in the Arena and professional simulations.",rewardAr:"شهادة دورة محاسبية كاملة",rewardEn:"Full Accounting Cycle certificate",steps:[
    {id:"pro-arena",kind:"arena",titleAr:"الساحة التنافسية",titleEn:"Competitive Arena",route:"/arena",skillIds:["accuracy","speed"]},
    {id:"pro-career",kind:"assessment",titleAr:"المسار المهني",titleEn:"Career readiness",route:"/career",skillIds:["business-cases","accuracy"]},
  ]},
];

export const levelThresholds = [0,180,500,900,1450,2150,3000,4000] as const;

