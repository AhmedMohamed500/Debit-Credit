import { roleCatalog, skillCatalog } from "./catalog";
import type {
  CareerProfile,
  CvBullet,
  CvDocument,
  RoleId,
  SkillEvidence,
  SkillResult,
} from "./model";
function bulletForEvidence(item: SkillEvidence): CvBullet | null {
  const inspected = item.inspectedEvidence ?? [],
    safe = (item.decisionTrace ?? []).some(
      (value) => value === "hold" || value === "request_information",
    );
  let copy: { text: string; textAr: string } | null = null;
  const unitCopy: Record<string, { text: string; textAr: string }> = {
    "document-control": {
      text: "Applied source-document controls in a simulation by identifying a duplicate supplier invoice and retaining the purchase order and receiving trail.",
      textAr:
        "طبّقت ضوابط مستندات في محاكاة بتحديد فاتورة مورد مكررة والحفاظ على مسار أمر الشراء والاستلام.",
    },
    "journal-capital": {
      text: "Recorded a simulated owner capital contribution using the contribution agreement and cash receipt, distinguishing equity from a loan.",
      textAr:
        "سجّلت مساهمة رأس مال في محاكاة من عقد المساهمة وسند القبض، مع التمييز بين حقوق الملكية والقرض.",
    },
    "journal-equipment": {
      text: "Prepared a simulated equipment purchase journal entry, classifying the asset and tracing the cash payment to supporting documents.",
      textAr:
        "أعددت قيد شراء معدات في محاكاة، وصنّفت الأصل وتتبعّت الدفع النقدي للمستندات المؤيدة.",
    },
    "journal-inventory": {
      text: "Recorded an inventory purchase on credit in a simulation, linking the accounts payable entry to the invoice, purchase order and goods received note.",
      textAr:
        "سجّلت شراء مخزون آجل في محاكاة وربطت قيد المورد بالفاتورة وأمر الشراء وإذن الاستلام.",
    },
    "journal-service": {
      text: "Recorded simulated service revenue and accounts receivable from an invoice and signed service-completion report, without inventing inventory movements.",
      textAr:
        "سجّلت إيراد خدمة وحساب العميل في محاكاة من فاتورة وتقرير إتمام موقع، دون إضافة حركة مخزون غير موجودة.",
    },
    "journal-receipt": {
      text: "Allocated a simulated customer cash receipt against an existing invoice, reducing accounts receivable without double-counting revenue.",
      textAr:
        "خصصت تحصيلًا نقديًا في محاكاة لفاتورة قائمة، وخفضت العملاء دون تكرار تسجيل الإيراد.",
    },
    "journal-rent": {
      text: "Recorded a simulated current-period rent expense from the rent invoice and cash payment voucher, distinguishing expense from prepayment.",
      textAr:
        "سجّلت مصروف إيجار الفترة في محاكاة من الفاتورة وسند الصرف، مع تمييز المصروف عن الدفعة المقدمة.",
    },
    "ledger-cash": {
      text: "Calculated the closing cash ledger balance in a simulation by tracing debit and credit movements from six accepted source-linked journal entries.",
      textAr:
        "حسبت رصيد أستاذ النقدية الختامي في محاكاة بتتبع الحركات المدينة والدائنة من ستة قيود مقبولة مرتبطة بالمصدر.",
    },
    "trial-balance": {
      text: "Prepared simulated trial balance totals from account balances, distinguishing closing balances from journal turnover.",
      textAr:
        "أعددت إجماليات ميزان مراجعة في محاكاة من أرصدة الحسابات، مع التمييز بين الأرصدة وحركة اليومية.",
    },
    "classification-error": {
      text: "Identified a balanced account-classification error in a simulation and selected a reclassification entry from rent expense to equipment.",
      textAr:
        "اكتشفت خطأ تصنيف في قيد متوازن داخل محاكاة واخترت قيد إعادة التصنيف من مصروف الإيجار إلى المعدات.",
    },
    worksheet: {
      text: "Completed a basic spreadsheet formula exercise using SUM and a debit-minus-credit check for an Excel-compatible trial balance workpaper.",
      textAr:
        "أنجزت تمرين صيغ جداول أساسيًا باستخدام SUM وفحص فرق المدين والدائن لورقة ميزان مراجعة متوافقة مع Excel.",
    },
  };
  if (
    item.caseId?.startsWith("student-unit1/") &&
    item.missionId === "student-unit1"
  )
    copy = unitCopy[item.caseId.slice("student-unit1/".length)] ?? null;
  else if (
    item.caseId === "mizan-bank-recon-v1" &&
    inspected.includes("bank-statement") &&
    inspected.includes("cash-book")
  )
    copy = {
      text: "Performed a bank reconciliation simulation by matching statement and ledger transactions, identifying timing differences, and preparing book adjustments.",
      textAr:
        "أجريت محاكاة تسوية بنكية بمطابقة حركات الكشف والدفتر، وتحديد فروق التوقيت، وإعداد قيود التعديل.",
    };
  else if (item.caseId === "supplier-invoice" && inspected.length >= 2)
    copy = {
      text: "Reviewed supplier invoice evidence against purchase order and receiving documentation before preparing the accounts payable posting.",
      textAr:
        "راجعت أدلة فاتورة المورد مقابل أمر الشراء ومستند الاستلام قبل إعداد قيد المورد.",
    };
  else if (item.caseId === "customer-receipt" && inspected.length >= 1)
    copy = {
      text: "Investigated customer receipt evidence before reducing the accounts receivable balance.",
      textAr: "تحققت من أدلة تحصيل العميل قبل تخفيض رصيد العملاء.",
    };
  else if (item.caseId === "office-expense" && inspected.length >= 1)
    copy = {
      text: "Reviewed office expense documentation before preparing the expense posting.",
      textAr: "راجعت مستندات المصروف المكتبي قبل إعداد قيد المصروف.",
    };
  else if (safe)
    copy = {
      text: "Selected a protective action when supporting evidence was insufficient for safe posting.",
      textAr: "اخترت إجراءً وقائيًا عندما لم تكن الأدلة كافية للترحيل الآمن.",
    };
  return copy ? { ...copy, evidenceId: item.evidenceId } : null;
}
export function buildCv(
  profile: CareerProfile,
  passport: SkillResult[],
  evidence: SkillEvidence[],
  targetRoleId: RoleId,
): CvDocument {
  const weights = roleCatalog[targetRoleId].skills,
    skills = passport
      .filter((s) => s.status !== "unassessed" && (weights[s.skillId] ?? 0) > 0)
      .sort(
        (a, b) =>
          (weights[b.skillId] ?? 0) - (weights[a.skillId] ?? 0) ||
          (b.score ?? 0) - (a.score ?? 0),
      ),
    coreSkills = skills.filter(
      (s) => s.status === "demonstrated" || s.status === "verified",
    ),
    practiceSkills = skills.filter((s) => s.status === "practiced"),
    relevant = evidence
      .filter(
        (e) =>
          e.accuracy >= 70 &&
          e.criticalErrors === 0 &&
          e.roleRelevance.includes(targetRoleId),
      )
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    simulationBullets = [
      ...new Map(
        relevant
          .map(bulletForEvidence)
          .filter((row): row is CvBullet => row !== null)
          .map((row) => [row.text, row]),
      ).values(),
    ],
    role = roleCatalog[targetRoleId].label;
  return {
    targetRoleId,
    headline: profile.headline || `Accounting candidate — ${role.en}`,
    summary:
      profile.summary ||
      (skills.length
        ? `Accounting candidate targeting ${role.en}, with introductory accounting practice in ${
            skills
              .slice(0, 3)
              .map((s) => skillCatalog[s.skillId].label.en)
              .join(", ") || "developing accounting skills"
          }. Experience shown below is training simulation, not employment.`
        : `Accounting candidate targeting ${role.en}. Building foundational skills; no completed accounting simulation evidence yet.`),
    skills,
    coreSkills,
    practiceSkills,
    simulationBullets,
    evidence: relevant,
    sections: [
      "contact",
      "summary",
      "target-role",
      "education",
      "experience",
      "skills",
      "simulations",
      "evidence",
      "languages",
      "links",
    ],
  };
}
export function exportCareerData(
  profile: CareerProfile,
  cv: CvDocument,
  evidence: SkillEvidence[],
) {
  return JSON.stringify(
    {
      schema: "debit-credit-career-export-v1",
      exportedAt: new Date().toISOString(),
      profile,
      cv,
      evidence,
    },
    null,
    2,
  );
}
