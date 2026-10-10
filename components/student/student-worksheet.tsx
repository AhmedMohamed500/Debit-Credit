"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Monitor,
  Sheet,
  LockKeyhole,
} from "lucide-react";
import { studentAccounts, type StudentAccount } from "@/lib/student/unit";
import { calculateSheetCell } from "@/lib/student/worksheet";
import "@/app/student-worksheet.css";

export function StudentWorksheet({
  locale,
  balances,
  busy,
}: {
  locale: "ar" | "en";
  balances: Record<StudentAccount, number>;
  busy: boolean;
}) {
  const ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en);
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState("C10"),
    [formulas, setFormulas] = useState({ C10: "", C11: "" });
  const bar = useRef<HTMLInputElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const application = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const header = application.current
      ?.closest(".student-workbench")
      ?.querySelector(".student-workbench-header");
    if (!header) return;
    const measure = () =>
      application.current?.style.setProperty(
        "--student-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, [open]);
  useEffect(() => {
    if (!open || !viewport.current) return;
    const container = viewport.current;
    const cell = container.querySelector<HTMLElement>('[data-selected="true"]');
    if (!cell) return;
    const bounds = container.getBoundingClientRect(),
      position = cell.getBoundingClientRect();
    if (position.right > bounds.right)
      container.scrollLeft += position.right - bounds.right + 8;
    else if (position.left < bounds.left)
      container.scrollLeft -= bounds.left - position.left + 8;
  }, [open, selected]);
  const accounts = Object.entries(balances) as [StudentAccount, number][];
  const cells: Record<string, number | string> = {
    ...formulas,
    D10: "=SUM(D2:D9)",
    D11: "",
  };
  accounts.forEach(([, value], index) => {
    cells[`C${index + 2}`] = Math.max(value, 0);
    cells[`D${index + 2}`] = Math.max(-value, 0);
  });
  const editable = selected === "C10" || selected === "C11";
  const value = cells[selected] ?? "";
  const result = (address: string) => {
    const calculated = calculateSheetCell(cells, address);
    return typeof calculated === "number"
      ? calculated.toLocaleString("en", { maximumFractionDigits: 2 })
      : calculated;
  };
  function select(address: string, edit = false) {
    setSelected(address);
    if (edit) requestAnimationFrame(() => bar.current?.focus());
  }
  const Return = ar ? ArrowRight : ArrowLeft;
  if (!open)
    return (
      <section className="student-computer-launch">
        <div className="student-monitor-preview">
          <Monitor size={64} />
          <Sheet size={28} />
        </div>
        <div>
          <small>MIZAN OS / {say("Office computer", "كمبيوتر المكتب")}</small>
          <h2>
            {say("Open the trial balance workbook", "افتح ملف ميزان المراجعة")}
          </h2>
          <p>
            {say(
              "Your accepted ledger is already on the office computer. Open the workbook to calculate totals and reconcile debit against credit in the cells.",
              "أرصدة الأستاذ المقبولة جاهزة على كمبيوتر المكتب. افتح الملف واجمع الأرصدة وافحص فرق المدين والدائن داخل الخلايا.",
            )}
          </p>
          <button type="button" disabled={busy} onClick={() => setOpen(true)}>
            <Monitor size={18} />{" "}
            {say("Open office computer", "افتح كمبيوتر المكتب")}
          </button>
        </div>
      </section>
    );
  return (
    <section
      ref={application}
      className="student-computer"
      aria-label={say(
        "Office spreadsheet application",
        "تطبيق الجداول على كمبيوتر المكتب",
      )}
    >
      <input type="hidden" name="formula" value={formulas.C10} />
      <input type="hidden" name="differenceFormula" value={formulas.C11} />
      <div className="student-computer-top">
        <span>
          <Sheet size={20} /> Mizan Sheets <small>Trial Balance · EGP</small>
        </span>
        <button type="button" disabled={busy} onClick={() => setOpen(false)}>
          <Return size={16} />
          {say("Back to desk", "ارجع للمكتب")}
        </button>
      </div>
      <div className="student-sheet-assignment" dir={ar ? "rtl" : "ltr"}>
        <b>{say("Kareem's work request", "طلب الشغل من كريم")}</b>
        <p>
          {say(
            "Use SUM in C10 to total debit balances in C2:C9. In C11, subtract credit total D10 from debit total C10. D10 is prepared. Select a cell and type in the formula bar; Enter moves to the next task cell.",
            "استخدم SUM في C10 لجمع أرصدة المدين من C2 إلى C9. في C11 اطرح إجمالي الدائن D10 من إجمالي المدين C10. D10 مجهّزة. اختار الخلية واكتب في شريط الصيغ؛ Enter ينقلك لخلية العمل التالية.",
          )}
        </p>
      </div>
      <div className="student-formula-bar" dir="ltr">
        <output aria-label={say("Selected cell", "الخلية المحددة")}>
          {selected}
        </output>
        <label htmlFor="student-sheet-formula">fx</label>
        <input
          ref={bar}
          id="student-sheet-formula"
          aria-label={say("Formula bar", "شريط الصيغ")}
          value={String(value)}
          maxLength={80}
          readOnly={!editable}
          disabled={busy}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => {
            if (editable)
              setFormulas((current) => ({
                ...current,
                [selected]: event.target.value,
              }));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              select(selected === "C10" ? "C11" : "C10", true);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              bar.current?.blur();
            }
          }}
        />
        {!editable && (
          <LockKeyhole
            size={15}
            aria-label={say("Source cell is locked", "خلية المصدر محمية")}
          />
        )}
      </div>
      <div
        ref={viewport}
        className="student-sheet-scroll"
        dir="ltr"
        role="region"
        aria-label={say("Trial balance worksheet", "ورقة ميزان المراجعة")}
        tabIndex={0}
      >
        <table className="student-sheet-grid" aria-label="Trial Balance">
          <colgroup>
            <col className="sheet-row-number" />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th aria-label="Row" />
              <th scope="col">A</th>
              <th scope="col">B</th>
              <th scope="col">C</th>
              <th scope="col">D</th>
            </tr>
          </thead>
          <tbody>
            <tr className="sheet-data-header">
              <th scope="row">1</th>
              <td>Account</td>
              <td>Source</td>
              <td>Debit (EGP)</td>
              <td>Credit (EGP)</td>
            </tr>
            {accounts.map(([account], index) => (
              <tr key={account}>
                <th scope="row">{index + 2}</th>
                <td>{studentAccounts[account].en}</td>
                <td>Ledger · Unit 1</td>
                {["C", "D"].map((column) => {
                  const address = `${column}${index + 2}`;
                  return (
                    <td key={column}>
                      <button
                        type="button"
                        className="sheet-cell"
                        data-selected={selected === address}
                        aria-label={`${address}: ${result(address)}`}
                        onClick={() => select(address)}
                        disabled={busy}
                      >
                        {result(address)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            {[10, 11].map((row) => (
              <tr
                key={row}
                className={row === 10 ? "sheet-total-row" : "sheet-check-row"}
              >
                <th scope="row">{row}</th>
                <td>{row === 10 ? "Total" : "Debit minus credit"}</td>
                <td />
                {["C", "D"].map((column) => {
                  const address = `${column}${row}`,
                    canEdit = column === "C";
                  return (
                    <td key={column}>
                      <button
                        type="button"
                        className={`sheet-cell ${canEdit ? "sheet-editable" : ""}`}
                        data-selected={selected === address}
                        aria-label={`${address}${canEdit ? " editable" : ""}: ${result(address) || (canEdit ? "empty" : "blank")}`}
                        onClick={() => select(address, canEdit)}
                        disabled={busy}
                      >
                        {result(address) ||
                          (canEdit ? say("Enter formula", "اكتب الصيغة") : "")}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="student-sheet-tabs" dir="ltr">
        <span>Trial Balance</span>
        <small>
          {say(
            "Editable: C10, C11 · Source balances protected",
            "للتعديل: C10 وC11 · أرصدة المصدر محمية",
          )}
        </small>
      </div>
      <p className="student-sheet-mobile-hint">
        {say(
          "Swipe the table sideways to see account names and debit/credit columns. Select a cell to inspect its formula.",
          "اسحب الجدول يمين وشمال لعرض أسماء الحسابات وأعمدة المدين والدائن. اختار أي خلية لعرض صيغتها.",
        )}
      </p>
      <footer className="student-sheet-footer">
        <div>
          <b>
            {say("Cell result", "نتيجة الخلية")}:{" "}
            <output aria-live="polite">{result(selected) || "—"}</output>
          </b>
          <small>
            {say(
              "In-game spreadsheet practice. Draft formulas stay on this page until you submit; only accepted work is saved to your account. Not Microsoft Excel or an Excel certificate.",
              "تدريب جداول داخل اللعبة. مسودة الصيغ تبقى في الصفحة حتى التسليم؛ العمل المقبول فقط يُحفظ بحسابك. ليس برنامج Microsoft Excel أو شهادة إتقان له.",
            )}
          </small>
        </div>
        <button
          type="submit"
          disabled={busy || !formulas.C10.trim() || !formulas.C11.trim()}
        >
          {busy
            ? say("Checking…", "جارٍ الفحص…")
            : say("Submit workbook for review", "سلّم ملف الجداول للمراجعة")}
        </button>
      </footer>
    </section>
  );
}
