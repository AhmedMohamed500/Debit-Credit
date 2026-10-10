"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { requestJSON, CloudFailure } from "@/lib/cloud/runtime";
import { BrowserSkillEvidenceRepository } from "@/lib/career/repository";
import type { SkillEvidence } from "@/lib/career/model";
import {
  stepIds,
  transactions,
  studentAccounts,
  studentLedger,
  type StudentState,
  type StudentCommand,
} from "@/lib/student/unit";
import "@/app/student.css";
type Progress = { data: StudentState; revision: number };
export function StudentUnit({ locale }: { locale: "ar" | "en" }) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en);
  const [progress, setProgress] = useState<Progress | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      setProgress(await requestJSON<Progress>("me/student-unit"));
      setError("");
    } catch {
      setError(
        say(
          "Could not load your saved progress. Retry.",
          "تعذّر تحميل تقدمك المحفوظ. حاول ثانية.",
        ),
      );
    }
  }
  useEffect(() => {
    let alive = true;
    void requestJSON<Progress>("me/student-unit")
      .then((result) => {
        if (alive) setProgress(result);
      })
      .catch(() => {
        if (alive)
          setError(
            ar
              ? "تعذّر تحميل تقدمك. حاول ثانية."
              : "Could not load progress. Retry.",
          );
      });
    return () => {
      alive = false;
    };
  }, [ar]);
  const step = progress ? stepIds[progress.data.accepted.length] : undefined;
  const transaction = transactions.find((row) => `journal-${row.id}` === step);
  const accepted = progress?.data.accepted ?? [],
    balances = studentLedger(accepted);
  function downloadWorksheet() {
    // Export only the learner's accepted postings. No personal data in this file.
    const lines = [
      "Account,Reference,Debit,Credit",
      ...Object.entries(balances).map(
        ([account, value]) =>
          `${studentAccounts[account as keyof typeof studentAccounts].en},Unit1,${Math.max(value, 0)},${Math.max(-value, 0)}`,
      ),
      "Total,,=SUM(C2:C9),=SUM(D2:D9)",
      "Difference,,=C10-D10,",
    ];
    const url = URL.createObjectURL(
      new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "accounting-unit1-workpaper.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="student-page" dir={ar ? "rtl" : "ltr"}>
      <Link href={`/${locale}`}>{say("Home", "الرئيسية")}</Link>
      <section className="student-card">
        <h1>
          {say(
            "Unit 1: Source documents to books",
            "الوحدة الأولى: من المستند إلى الدفاتر",
          )}
        </h1>
        <p>
          {say(
            "Mizan Trading & Services — introductory simulation. EGP, no opening balances. All amounts exclude tax; VAT, depreciation and full closing are outside this unit. These assumptions are not tax advice.",
            "ميزان للتجارة والخدمات — محاكاة تمهيدية بالجنيه المصري دون أرصدة افتتاحية. المبالغ لا تشمل ضريبة؛ ضريبة القيمة المضافة والإهلاك والإقفال الشامل خارج نطاق هذه الوحدة. هذه افتراضات تعليمية وليست إرشادات ضريبية.",
          )}
        </p>
        <div className="student-progress">
          <span>
            {accepted.length} / {stepIds.length}{" "}
            {say("accepted tasks", "تاسك مقبول")}
          </span>
          <Link href={`/${locale}/career-profile/cv`}>
            {say("CV updates automatically", "الـCV يتحدّث تلقائيًا")}
          </Link>
          <Link href={`/${locale}/career-profile/skills`}>
            {say("Skill evidence", "أدلة المهارات")}
          </Link>
        </div>
        {error && (
          <p role="alert">
            {error}{" "}
            <button onClick={() => void load()}>
              {say("Reload progress", "تحميل التقدم")}
            </button>
          </p>
        )}
        {!progress && !error && (
          <p role="status">{say("Loading…", "جارٍ التحميل…")}</p>
        )}
        {notice && <p role="status">{notice}</p>}
        {progress && !step ? (
          <>
            <h2>{say("Unit completed", "أنهيت الوحدة")}</h2>
            <p>
              {say(
                "Your accepted tasks are saved to your account and translated into simulation achievements on your CV. This is not a professional certification.",
                "تاسكاتك المقبولة محفوظة بحسابك واتحولت لإنجازات محاكاة في سيرتك تلقائيًا. هذا ليس شهادة مهنية.",
              )}
            </p>
            <button onClick={downloadWorksheet}>
              {say(
                "Download Excel-compatible workpaper (CSV)",
                "تحميل ورقة العمل المتوافقة مع Excel بصيغة CSV",
              )}
            </button>
          </>
        ) : (
          progress &&
          step && (
            <form
              key={step}
              onSubmit={async (event) => {
                event.preventDefault();
                if (busy) return;
                const fields = new FormData(event.currentTarget),
                  answer: StudentCommand["answer"] = {};
                for (const [name, value] of fields) {
                  if (["amount", "debitTotal", "creditTotal"].includes(name))
                    Object.assign(answer, { [name]: Number(value) });
                  else Object.assign(answer, { [name]: String(value) });
                }
                setBusy(true);
                setError("");
                setNotice("");
                try {
                  const result = await requestJSON<
                    Progress & { correct: boolean; evidence: SkillEvidence[] }
                  >("me/student-unit", "POST", {
                    revision: progress.revision,
                    step,
                    answer,
                  });
                  new BrowserSkillEvidenceRepository().merge(result.evidence);
                  setProgress(result);
                  setNotice(
                    result.correct
                      ? say(
                          "Accepted and saved. Your accounting CV has updated automatically.",
                          "إجابة مقبولة ومحفوظة. سيرتك المحاسبية اتحدّثت تلقائيًا.",
                        )
                      : say(
                          "Not accepted yet. Recheck the source documents, account classification and totals; no achievement was added to the CV.",
                          "الإجابة غير مقبولة بعد. راجع المستندات والتصنيف والإجماليات؛ لم يُضف إنجاز للـCV.",
                        ),
                  );
                } catch (failure) {
                  setError(
                    failure instanceof CloudFailure && failure.status === 409
                      ? say(
                          "Progress changed or this step is locked. Reload progress before retrying.",
                          "التقدم اتغير أو الخطوة مقفولة. حمّل التقدم قبل إعادة المحاولة.",
                        )
                      : say(
                          "Save not confirmed. Retry; no completion is claimed.",
                          "لم يتأكد الحفظ. أعد المحاولة؛ لم نعتبر الخطوة مكتملة.",
                        ),
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {step === "document-control" && (
                <>
                  <h2>
                    {say(
                      "Control duplicate source documents",
                      "مراجعة تكرار المستندات",
                    )}
                  </h2>
                  <div className="student-document">
                    {say(
                      "The document pack contains two identical copies of supplier invoice INV-031, EGP 15,000. Only one original matches PO-031 and GRN-031. No entries have been posted yet. What should you do with the second copy?",
                      "ملف المستندات به نسختان متطابقتان لفاتورة المورد INV-031 بمبلغ 15,000 جنيه. أصل واحد فقط مطابق لـPO-031 وGRN-031. لم تُرحّل أي قيود بعد. ماذا تفعل بالنسخة الثانية؟",
                    )}
                  </div>
                  <label>
                    {say("Choose a control action", "اختر إجراء المراجعة")}
                    <select required name="action" defaultValue="">
                      <option value="" disabled>
                        {say("Select", "اختر")}
                      </option>
                      <option value="post-both">
                        {say("Post both copies", "رحّل النسختين")}
                      </option>
                      <option value="hold-duplicate">
                        {say(
                          "Hold duplicate; retain one original with PO and receipt",
                          "أوقف النسخة المكررة واحتفظ بالأصل مع أمر الشراء والاستلام",
                        )}
                      </option>
                      <option value="delete-pack">
                        {say("Discard all documents", "تجاهل جميع المستندات")}
                      </option>
                    </select>
                  </label>
                </>
              )}
              {transaction && (
                <>
                  <h2>{transaction.title[locale]}</h2>
                  <div className="student-document">
                    <b>{transaction.reference}</b>
                    <p>{transaction.evidence[locale]}</p>
                  </div>
                  <div className="student-fields">
                    {(["debit", "credit"] as const).map((side) => (
                      <label key={side}>
                        {side === "debit"
                          ? say("Debit account", "الحساب المدين")
                          : say("Credit account", "الحساب الدائن")}
                        <select name={side} required defaultValue="">
                          <option value="" disabled>
                            {say("Select account", "اختر الحساب")}
                          </option>
                          {Object.entries(studentAccounts).map(
                            ([key, label]) => (
                              <option key={key} value={key}>
                                {label[locale]}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                    ))}
                    <label>
                      {say("Amount (EGP)", "المبلغ بالجنيه")}
                      <input
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        max="10000000"
                        required
                      />
                    </label>
                  </div>
                </>
              )}
              {step === "ledger-cash" && (
                <>
                  <h2>{say("Post the cash ledger", "رحّل دفتر النقدية")}</h2>
                  <p>
                    {say(
                      "Use the six accepted entries below. Start from zero. What is the closing debit balance of Cash?",
                      "استخدم القيود الستة المقبولة أدناه. ابدأ من صفر. ما رصيد النقدية المدين الختامي؟",
                    )}
                  </p>
                  <label>
                    {say("Cash closing balance", "رصيد النقدية الختامي")}
                    <input
                      name="amount"
                      required
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </label>
                </>
              )}
              {step === "trial-balance" && (
                <>
                  <h2>
                    {say("Prepare the trial balance", "أعد ميزان المراجعة")}
                  </h2>
                  <p>
                    {say(
                      "Sum debit and credit account balances below, not journal turnover. Equality alone does not prove correct classification.",
                      "اجمع أرصدة الحسابات المدينة والدائنة أدناه، وليس حركة اليومية. التوازن وحده لا يثبت صحة التصنيف.",
                    )}
                  </p>
                  <div className="student-fields">
                    <label>
                      {say("Debit total", "إجمالي المدين")}
                      <input
                        required
                        name="debitTotal"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </label>
                    <label>
                      {say("Credit total", "إجمالي الدائن")}
                      <input
                        required
                        name="creditTotal"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </label>
                  </div>
                </>
              )}
              {step === "classification-error" && (
                <>
                  <h2>
                    {say(
                      "Detect a balanced classification error",
                      "اكتشف خطأ تصنيف في قيد متوازن",
                    )}
                  </h2>
                  <p>
                    {say(
                      "A draft entry records the EGP 20,000 equipment purchase as Debit Rent Expense / Credit Cash. It balances. Which correction is required? (This draft is not in your accepted ledger.)",
                      "قيد مسودة سجل شراء المعدات بـ20,000 جنيه: مدين مصروف الإيجار / دائن النقدية. القيد متوازن. ما التصحيح المطلوب؟ هذه المسودة ليست ضمن أستاذك المقبول.",
                    )}
                  </p>
                  <label>
                    {say("Correction", "التصحيح")}
                    <select required name="action" defaultValue="">
                      <option value="" disabled>
                        {say("Select", "اختر")}
                      </option>
                      <option value="none">
                        {say(
                          "No change because it balances",
                          "لا تغيير لأنه متوازن",
                        )}
                      </option>
                      <option value="reclassify-equipment">
                        {say(
                          "Debit Equipment / Credit Rent Expense, EGP 20,000",
                          "مدين المعدات / دائن مصروف الإيجار، 20,000 جنيه",
                        )}
                      </option>
                      <option value="new-revenue">
                        {say("Credit revenue instead", "اجعل الدائن إيرادًا")}
                      </option>
                    </select>
                  </label>
                </>
              )}
              {step === "worksheet" && (
                <>
                  <h2>
                    {say(
                      "Basic spreadsheet workpaper",
                      "ورقة العمل الأساسية للجداول",
                    )}
                  </h2>
                  <p>
                    {say(
                      "Rows 2–9 contain eight account balances. Column C is debit; D is credit. Row 10 is totals. Write a SUM formula for C10, then a debit-minus-credit formula for C11. This checks basic formula knowledge, not Excel proficiency certification.",
                      "الصفوف 2–9 بها أرصدة الحسابات الثمانية. العمود C مدين وD دائن. الصف 10 للإجماليات. اكتب صيغة SUM للخلية C10 ثم فرق المدين ناقص الدائن في C11. هذا فحص معرفة صيغ أساسية وليس توثيقًا لإتقان Excel.",
                    )}
                  </p>
                  <div className="student-fields">
                    <label>
                      C10
                      <input dir="ltr" name="formula" required maxLength={80} />
                    </label>
                    <label>
                      C11
                      <input
                        dir="ltr"
                        name="differenceFormula"
                        required
                        maxLength={80}
                      />
                    </label>
                  </div>
                </>
              )}
              <button disabled={busy}>
                {busy
                  ? say("Checking…", "جارٍ الفحص…")
                  : say("Check and save task", "تحقق واحفظ التاسك")}
              </button>
            </form>
          )
        )}
      </section>
      {accepted.some((id) => id.startsWith("journal-")) && (
        <section className="student-card">
          <h2>
            {say(
              "Accepted journal — source trail",
              "اليومية المقبولة — تتبّع المصدر",
            )}
          </h2>
          <div className="student-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{say("Reference", "المرجع")}</th>
                  <th>{say("Debit", "مدين")}</th>
                  <th>{say("Credit", "دائن")}</th>
                  <th>EGP</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter((row) => accepted.includes(`journal-${row.id}`))
                  .map((row) => (
                    <tr key={row.id}>
                      <td>{row.reference}</td>
                      <td>{studentAccounts[row.debit][locale]}</td>
                      <td>{studentAccounts[row.credit][locale]}</td>
                      <td>{row.amount.toLocaleString("en")}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {accepted.includes("ledger-cash") && (
        <section className="student-card">
          <h2>{say("Ledger balances", "أرصدة الأستاذ")}</h2>
          <div className="student-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{say("Account", "الحساب")}</th>
                  <th>{say("Debit balance", "رصيد مدين")}</th>
                  <th>{say("Credit balance", "رصيد دائن")}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(balances).map(([account, value]) => (
                  <tr key={account}>
                    <td>
                      {
                        studentAccounts[
                          account as keyof typeof studentAccounts
                        ][locale]
                      }
                    </td>
                    <td>{Math.max(value, 0).toLocaleString("en")}</td>
                    <td>{Math.max(-value, 0).toLocaleString("en")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
