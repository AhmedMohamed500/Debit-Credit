import { z } from "zod";
import { roleIds, roleCatalog } from "@/lib/career/catalog";
import type { SkillEvidence, SkillId } from "@/lib/career/model";
import { normalizeSheetFormula } from "./worksheet";

export const studentAccounts = {
  cash: { en: "Cash", ar: "النقدية" },
  capital: { en: "Capital", ar: "رأس المال" },
  equipment: { en: "Equipment", ar: "المعدات" },
  inventory: { en: "Inventory", ar: "المخزون" },
  payable: { en: "Accounts Payable", ar: "الموردون" },
  receivable: { en: "Accounts Receivable", ar: "العملاء" },
  revenue: { en: "Service Revenue", ar: "إيراد الخدمات" },
  rent: { en: "Rent Expense", ar: "مصروف الإيجار" },
} as const;
export type StudentAccount = keyof typeof studentAccounts;
export const transactions: {
  id: string;
  reference: string;
  title: { ar: string; en: string };
  evidence: { ar: string; en: string };
  amount: number;
  debit: StudentAccount;
  credit: StudentAccount;
}[] = [
  {
    id: "capital",
    reference: "RC-001 / CAP-01",
    title: { en: "Owner contribution", ar: "استثمار المالك" },
    evidence: {
      en: "2 October: Signed capital contribution agreement and cash receipt RC-001: owner contributes EGP 100,000 to the company, not a repayable loan.",
      ar: "٢ أكتوبر: عقد مساهمة موقع وسند قبض RC-001 يؤكد استثمار المالك 100,000 جنيه في الشركة، وليس قرضًا واجب السداد.",
    },
    amount: 100000,
    debit: "cash",
    credit: "capital",
  },
  {
    id: "equipment",
    reference: "INV-020 / PV-020",
    title: { en: "Equipment purchase", ar: "شراء معدات" },
    evidence: {
      en: "3 October: Supplier invoice INV-020 and payment voucher PV-020 confirm equipment received for EGP 20,000, paid in cash. Expected use exceeds one year.",
      ar: "٣ أكتوبر: فاتورة INV-020 وسند صرف PV-020 يؤكدان استلام معدات بـ20,000 جنيه مدفوعة نقدًا. الاستخدام المتوقع أكثر من سنة.",
    },
    amount: 20000,
    debit: "equipment",
    credit: "cash",
  },
  {
    id: "inventory",
    reference: "INV-031 / PO-031 / GRN-031",
    title: { en: "Credit inventory purchase", ar: "شراء مخزون آجل" },
    evidence: {
      en: "4 October: Invoice INV-031, purchase order PO-031 and signed goods received note GRN-031 match: resale supplies EGP 15,000, due in 30 days. No payment made.",
      ar: "٤ أكتوبر: فاتورة INV-031 وأمر شراء PO-031 وإذن استلام موقع GRN-031 متطابقة: بضائع لإعادة البيع بـ15,000 جنيه، مستحقة خلال 30 يومًا، ولم تُدفع.",
    },
    amount: 15000,
    debit: "inventory",
    credit: "payable",
  },
  {
    id: "service",
    reference: "SI-041 / SR-041",
    title: { en: "Service invoiced on credit", ar: "خدمة مقدمة بالأجل" },
    evidence: {
      en: "5 October: Customer-signed service completion report SR-041 and invoice SI-041 confirm EGP 12,000 consultancy service delivered on credit. No inventory was sold or consumed.",
      ar: "٥ أكتوبر: تقرير إتمام خدمة موقع من العميل SR-041 وفاتورة SI-041 يؤكدان تقديم استشارات بـ12,000 جنيه بالأجل. لم يُبع أو يُستهلك مخزون.",
    },
    amount: 12000,
    debit: "receivable",
    credit: "revenue",
  },
  {
    id: "receipt",
    reference: "RC-050 / SI-041",
    title: { en: "Partial customer settlement", ar: "تحصيل جزئي من العميل" },
    evidence: {
      en: "6 October: Signed cash receipt RC-050 explicitly allocates EGP 7,000 to invoice SI-041. This settles an existing receivable; it is not new revenue.",
      ar: "٦ أكتوبر: سند قبض موقع RC-050 يخصص 7,000 جنيه للفاتورة SI-041. تسوية لمديونية قائمة وليست إيرادًا جديدًا.",
    },
    amount: 7000,
    debit: "cash",
    credit: "receivable",
  },
  {
    id: "rent",
    reference: "RENT-10 / PV-060",
    title: { en: "Current-month office rent", ar: "إيجار مكتب الشهر الحالي" },
    evidence: {
      en: "7 October: October office rent invoice RENT-10 and cash voucher PV-060: EGP 3,000 paid, relates only to this month, no deposit or advance.",
      ar: "٧ أكتوبر: فاتورة إيجار أكتوبر RENT-10 وسند نقدي PV-060: دفع 3,000 جنيه تخص هذا الشهر فقط، دون تأمين أو دفعة مقدمة.",
    },
    amount: 3000,
    debit: "rent",
    credit: "cash",
  },
];
export const stepIds = [
  "document-control",
  ...transactions.map((row) => `journal-${row.id}`),
  "ledger-cash",
  "trial-balance",
  "classification-error",
  "worksheet",
];
export const studentCommand = z
  .object({
    revision: z.number().int().nonnegative(),
    step: z.enum(stepIds as [string, ...string[]]),
    answer: z
      .object({
        action: z.string().max(60).optional(),
        debit: z.string().max(40).optional(),
        credit: z.string().max(40).optional(),
        amount: z.number().finite().nonnegative().max(10000000).optional(),
        debitTotal: z.number().finite().nonnegative().max(10000000).optional(),
        creditTotal: z.number().finite().nonnegative().max(10000000).optional(),
        formula: z.string().trim().max(80).optional(),
        differenceFormula: z.string().trim().max(80).optional(),
      })
      .strict(),
  })
  .strict();
export type StudentCommand = z.infer<typeof studentCommand>;
export type StudentState = {
  version: 1;
  accepted: string[];
  attempts: Record<string, number>;
  completedAt: string | null;
};
export const emptyStudentState = (): StudentState => ({
  version: 1,
  accepted: [],
  attempts: {},
  completedAt: null,
});
export function studentLedger(accepted: string[]) {
  const balances = Object.fromEntries(
    Object.keys(studentAccounts).map((key) => [key, 0]),
  ) as Record<StudentAccount, number>;
  for (const row of transactions.filter((row) =>
    accepted.includes(`journal-${row.id}`),
  )) {
    balances[row.debit] += row.amount;
    balances[row.credit] -= row.amount;
  }
  return balances;
}
export function trialTotals(balances: Record<StudentAccount, number>) {
  return {
    debit: Object.values(balances).reduce(
      (sum, value) => sum + Math.max(value, 0),
      0,
    ),
    credit: Object.values(balances).reduce(
      (sum, value) => sum + Math.max(-value, 0),
      0,
    ),
  };
}
export function gradeStudent(
  state: StudentState,
  command: StudentCommand,
  now: string,
) {
  if (state.accepted.includes(command.step))
    return { state, correct: true, replayed: true };
  if (stepIds[state.accepted.length] !== command.step)
    throw new Error("STEP_LOCKED");
  const answer = command.answer,
    transaction = transactions.find(
      (row) => `journal-${row.id}` === command.step,
    ),
    balances = studentLedger(state.accepted),
    totals = trialTotals(balances);
  let correct = false;
  if (command.step === "document-control")
    correct = answer.action === "hold-duplicate";
  else if (transaction)
    correct =
      answer.debit === transaction.debit &&
      answer.credit === transaction.credit &&
      answer.amount === transaction.amount;
  else if (command.step === "ledger-cash")
    correct = answer.amount === balances.cash;
  else if (command.step === "trial-balance")
    correct =
      answer.debitTotal === totals.debit &&
      answer.creditTotal === totals.credit;
  else if (command.step === "classification-error")
    correct = answer.action === "reclassify-equipment";
  else if (command.step === "worksheet")
    correct =
      normalizeSheetFormula(answer.formula ?? "") ===
        "=SUM(C2:C9)" &&
      normalizeSheetFormula(answer.differenceFormula ?? "") ===
        "=C10-D10";
  const accepted = correct ? [...state.accepted, command.step] : state.accepted;
  return {
    correct,
    replayed: false,
    state: {
      ...state,
      accepted,
      attempts: {
        ...state.attempts,
        [command.step]: (state.attempts[command.step] ?? 0) + 1,
      },
      completedAt: accepted.length === stepIds.length ? now : null,
    },
  };
}
export function studentEvidence(
  owner: string,
  state: StudentState,
  step: string,
  now: string,
): SkillEvidence[] {
  const transaction = transactions.find((row) => `journal-${row.id}` === step);
  const skills: SkillId[] = transaction
    ? [
        "document-analysis",
        "account-classification",
        "debit-credit",
        "journal-entries",
        ...(transaction.id === "inventory"
          ? ["accounts-payable" as const]
          : transaction.id === "service" || transaction.id === "receipt"
            ? ["accounts-receivable" as const]
            : []),
      ]
    : step === "document-control"
      ? ["document-analysis", "error-detection"]
      : step === "ledger-cash"
        ? ["ledger-posting", "cash-treasury", "accounting-fundamentals"]
        : step === "trial-balance" || step === "worksheet"
          ? ["trial-balance"]
          : ["error-detection", "account-classification"];
  if (!state.accepted.includes(step)) return [];
  return skills.map((skillId) => ({
    version: 1,
    projectionVersion: 1,
    evidenceId: `student-unit1/${step}/${skillId}`,
    localCandidateId: owner,
    activityId: `student-unit1/${step}`,
    activityType: "mission",
    chapterId: 0,
    missionId: "student-unit1",
    skillId,
    roleRelevance: roleIds.filter(
      (role) => (roleCatalog[role].skills[skillId] ?? 0) > 0,
    ),
    difficulty: 1,
    score: 100,
    accuracy: 100,
    firstAttemptCorrect: state.attempts[step] === 1,
    attempts: state.attempts[step],
    hintsUsed: 0,
    independentCompletion: state.attempts[step] === 1,
    criticalErrors: 0,
    completedAt: now,
    source: "mission",
    assessmentIntegrity: "practice",
    titleAr: transaction?.title.ar ?? "من المستند إلى الدفاتر",
    titleEn: transaction?.title.en ?? "Source documents to books",
    caseId: `student-unit1/${step}`,
    inspectedEvidence: transaction ? [transaction.reference] : [],
    rationaleEn:
      "Server-graded introductory simulation. Accepted result only; not employment or professional verification.",
    rationaleAr:
      "محاكاة تمهيدية مقيمة بالخادم. نتيجة مقبولة فقط، وليست خبرة توظيف أو توثيقًا مهنيًا.",
  }));
}
