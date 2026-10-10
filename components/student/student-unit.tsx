"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import { StudentCity, studentStops } from "./student-city";
import { StudentSourceFile } from "./student-source-file";
import { StudentWorksheet } from "./student-worksheet";
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
    [busy, setBusy] = useState(false),
    [workspaceOpen, setWorkspaceOpen] = useState(false);
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!workspaceOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("button")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setWorkspaceOpen(false);
      if (event.key !== "Tab") return;
      const controls = Array.from(
        dialog.current?.querySelectorAll<HTMLElement>(
          "a,button,input,select",
        ) ?? [],
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getClientRects().length > 0,
      );
      const first = controls[0],
        last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [workspaceOpen, busy]);
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
    <div
      className="student-game shift-scene fsh-active"
      dir={ar ? "rtl" : "ltr"}
    >
      <StudentCity
        locale={locale}
        completed={accepted.length}
        inactive={workspaceOpen}
        ready={Boolean(progress)}
        onOpen={() => {
          if (progress) setWorkspaceOpen(true);
        }}
      />
      {!progress && (
        <p role={error ? "alert" : "status"}>
          {error ||
            say(
              "Preparing your saved training desk…",
              "بنجهّز مكتب التدريب المحفوظ…",
            )}
          {error && (
            <button onClick={() => void load()}>
              {say("Retry", "حاول ثانية")}
            </button>
          )}
        </p>
      )}
      {
        <section
          ref={dialog}
          hidden={!workspaceOpen}
          inert={!workspaceOpen}
          className={`student-workbench ${step === "worksheet" ? "student-computer-desk" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={say(
            "Mizan student accounting workbench",
            "مكتب تدريب الطالب في ميزان",
          )}
        >
          <header className="student-workbench-header">
            <div>
              <b>Mizan Trading &amp; Services</b>
              <small>
                {say(
                  "Student training file · Accepted work saved to your account",
                  "ملف تدريب الطالب · العمل المقبول محفوظ بحسابك",
                )}
              </small>
            </div>
            <nav>
              <Link
                href={`/${locale}/account-guide`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {say("Account guide", "دليل الحسابات")}
              </Link>
              <Link href={`/${locale}/career-profile/cv`}>English CV</Link>
              <button
                type="button"
                disabled={busy}
                onClick={() => setWorkspaceOpen(false)}
                aria-label={say("Close training desk", "إغلاق مكتب التدريب")}
              >
                <X size={20} />
                {say("Return to city", "ارجع للمدينة")}
              </button>
            </nav>
          </header>
          <div className="student-workbench-body">
            <aside className="student-work-inbox">
              <h2>{say("Work inbox", "صندوق العمل")}</h2>
              <ol>
                {studentStops.map((stop, index) => (
                  <li
                    key={stop.start}
                    data-state={
                      accepted.length >= stop.end
                        ? "done"
                        : accepted.length < stop.start
                          ? "locked"
                          : "active"
                    }
                  >
                    <span>
                      {accepted.length >= stop.end ? (
                        <Check size={16} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    {stop.title[locale]}
                  </li>
                ))}
              </ol>
              <Image
                src="/arena/cfo-mentor.png"
                alt=""
                width={80}
                height={80}
              />
              <p>
                {say(
                  "Kareem · Accounting Manager. Inspect the supporting file, choose the treatment, then submit your work. No unsupported entry reaches the accepted books.",
                  "كريم · مدير الحسابات. افحص الملف المؤيد، حدّد المعالجة، ثم سلّم شغلك. لا يدخل قيد غير مقبول إلى الدفاتر.",
                )}
              </p>
            </aside>
            <div className="student-work-content">
              <main className="student-page" dir={ar ? "rtl" : "ltr"}>
                <section className="student-card">
                  <h1>
                    {step === "worksheet"
                      ? say(
                          "Office computer · Trial balance workbook",
                          "كمبيوتر المكتب · ملف ميزان المراجعة",
                        )
                      : say(
                          "Unit 1: Source documents to books",
                          "الوحدة الأولى: من المستند إلى الدفاتر",
                        )}
                  </h1>
                  <details className="student-assumptions">
                    <summary>
                      {say(
                        "Training file scope and assumptions",
                        "نطاق ملف التدريب وافتراضاته",
                      )}
                    </summary>
                    <p>
                      {say(
                        "Mizan Trading & Services — introductory simulation. EGP, no opening balances. All amounts exclude tax; VAT, depreciation and full closing are outside this unit. These assumptions are not tax advice.",
                        "ميزان للتجارة والخدمات — محاكاة تمهيدية بالجنيه المصري دون أرصدة افتتاحية. المبالغ لا تشمل ضريبة؛ ضريبة القيمة المضافة والإهلاك والإقفال الشامل خارج نطاق هذه الوحدة. هذه افتراضات تعليمية وليست إرشادات ضريبية.",
                      )}
                    </p>
                  </details>
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
                      <Link className="student-start-mission" href={`/${locale}/game/first-shift`}>
                        {say("Next: apply your foundations in the first shift", "التالي: طبّق الأساس في أول وردية")}
                      </Link>
                    </>
                  ) : (
                    progress &&
                    step && (
                      <form
                        key={step}
                        className={
                          transaction || step === "document-control"
                            ? "student-active-file"
                            : undefined
                        }
                        onSubmit={async (event) => {
                          event.preventDefault();
                          if (busy) return;
                          const fields = new FormData(event.currentTarget),
                            answer: StudentCommand["answer"] = {};
                          for (const [name, value] of fields) {
                            if (
                              ["amount", "debitTotal", "creditTotal"].includes(
                                name,
                              )
                            )
                              Object.assign(answer, { [name]: Number(value) });
                            else
                              Object.assign(answer, { [name]: String(value) });
                          }
                          setBusy(true);
                          setError("");
                          setNotice("");
                          try {
                            const result = await requestJSON<
                              Progress & {
                                correct: boolean;
                                evidence: SkillEvidence[];
                              }
                            >("me/student-unit", "POST", {
                              revision: progress.revision,
                              step,
                              answer,
                            });
                            new BrowserSkillEvidenceRepository().merge(
                              result.evidence,
                            );
                            setProgress(result);
                            window.dispatchEvent(new Event("student-progress-changed"));
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
                              failure instanceof CloudFailure &&
                                failure.status === 409
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
                            <StudentSourceFile locale={locale} />
                            <p>
                              {say(
                                "What should you do with the second copy before posting?",
                                "ماذا تفعل بالنسخة الثانية قبل تسجيل العملية؟",
                              )}
                            </p>
                            <fieldset className="student-decision-cards">
                              <legend>
                                {say(
                                  "Choose a control action",
                                  "اختر إجراء المراجعة",
                                )}
                              </legend>
                              <label>
                                <input
                                  type="radio"
                                  required
                                  name="action"
                                  value="post-both"
                                />
                                {say("Post both copies", "رحّل النسختين")}
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  required
                                  name="action"
                                  value="hold-duplicate"
                                />
                                {say(
                                  "Hold duplicate; retain one original with PO and receipt",
                                  "أوقف النسخة المكررة واحتفظ بالأصل مع أمر الشراء والاستلام",
                                )}
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  required
                                  name="action"
                                  value="delete-pack"
                                />
                                {say(
                                  "Discard all documents",
                                  "تجاهل جميع المستندات",
                                )}
                              </label>
                            </fieldset>
                          </>
                        )}
                        {transaction && (
                          <>
                            <h2>{transaction.title[locale]}</h2>
                            <StudentSourceFile
                              key={transaction.id}
                              locale={locale}
                              transaction={transaction}
                            />
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
                            <h2>
                              {say("Post the cash ledger", "رحّل دفتر النقدية")}
                            </h2>
                            <p>
                              {say(
                                "Use the six accepted entries below. Start from zero. What is the closing debit balance of Cash?",
                                "استخدم القيود الستة المقبولة أدناه. ابدأ من صفر. ما رصيد النقدية المدين الختامي؟",
                              )}
                            </p>
                            <label>
                              {say(
                                "Cash closing balance",
                                "رصيد النقدية الختامي",
                              )}
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
                              {say(
                                "Prepare the trial balance",
                                "أعد ميزان المراجعة",
                              )}
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
                            <fieldset className="student-decision-cards">
                              <legend>{say("Correction", "التصحيح")}</legend>
                              <label>
                                <input
                                  type="radio"
                                  name="action"
                                  value="none"
                                  required
                                />
                                {say(
                                  "No change because it balances",
                                  "لا تغيير لأنه متوازن",
                                )}
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="action"
                                  value="reclassify-equipment"
                                  required
                                />
                                {say(
                                  "Debit Equipment / Credit Rent Expense, EGP 20,000",
                                  "مدين المعدات / دائن مصروف الإيجار، 20,000 جنيه",
                                )}
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="action"
                                  value="new-revenue"
                                  required
                                />
                                {say(
                                  "Credit revenue instead",
                                  "اجعل الدائن إيرادًا",
                                )}
                              </label>
                            </fieldset>
                          </>
                        )}
                        {step === "worksheet" && (
                          <StudentWorksheet
                            locale={locale}
                            balances={balances}
                            busy={busy}
                          />
                        )}
                        {step !== "worksheet" && (
                          <button type="submit" disabled={busy}>
                            {busy
                              ? say("Checking…", "جارٍ الفحص…")
                              : say(
                                  "Submit accounting work",
                                  "سلّم الشغل للمراجعة",
                                )}
                          </button>
                        )}
                      </form>
                    )
                  )}
                </section>
                {step !== "worksheet" &&
                  accepted.some((id) => id.startsWith("journal-")) && (
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
                              .filter((row) =>
                                accepted.includes(`journal-${row.id}`),
                              )
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
                {step !== "worksheet" && accepted.includes("ledger-cash") && (
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
                              <td>
                                {Math.max(-value, 0).toLocaleString("en")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </main>
            </div>
          </div>
        </section>
      }
    </div>
  );
}
