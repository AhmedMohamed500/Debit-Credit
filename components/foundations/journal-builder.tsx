"use client";
import { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/types";
import {
  accountLabel,
  foundationAccounts,
  foundationEntries,
} from "@/lib/bootcamp/catalog";
import { validateFoundationJournal } from "@/lib/bootcamp/engine";
import type { FoundationLine, FoundationResponse } from "@/lib/bootcamp/model";
import { FoundationIcon, formatMoney } from "./visuals";
export function BeginnerJournalBuilder({
  locale,
  entryId,
  draft,
  onDraft,
  onSubmit,
}: {
  locale: Locale;
  entryId: string;
  draft?: FoundationResponse;
  onDraft: (value: FoundationResponse) => void;
  onSubmit: (value: FoundationResponse) => void;
}) {
  const ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en),
    entry = foundationEntries.find((e) => e.id === entryId)!;
  const blank = () => ({ account: "", debit: 0, credit: 0 });
  const [lines, setLines] = useState<FoundationLine[]>(
      draft && typeof draft[0] === "object"
        ? (draft as FoundationLine[])
        : [blank(), blank()],
    ),
    [block, setBlock] = useState("");
  const change = (value: FoundationLine[]) => {
    setLines(value);
    onDraft(value);
  };
  const update = (index: number, patch: Partial<FoundationLine>) =>
    change(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const debit = lines.reduce((s, l) => s + l.debit, 0),
    credit = lines.reduce((s, l) => s + l.credit, 0),
    balanced = debit > 0 && debit === credit,
    valid = validateFoundationJournal(lines, entry);
  const place = (
    i: number,
    key: "account" | "debit" | "credit",
    value: string,
  ) => {
    if (key === "account" && foundationAccounts.some((a) => a.id === value))
      update(i, { account: value });
    else if (key !== "account" && value.startsWith("amount:"))
      update(i, {
        [key]: Number(value.split(":")[1]),
        [key === "debit" ? "credit" : "debit"]: 0,
      });
  };
  return (
    <section
      className="fdn-journal"
      aria-label={say("Journal builder", "منشئ القيد")}
    >
      <div className="fdn-piece-tray">
        <small>
          {say(
            "DRAG A PIECE OR TAP IT, THEN PLACE IT IN A CELL",
            "اسحب قطعة أو اخترها ثم ضعها في الخانة",
          )}
        </small>
        <div>
          {foundationAccounts.slice(0, 10).map((a) => (
            <button
              type="button"
              aria-pressed={block === a.id}
              key={a.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", a.id)}
              onClick={() => setBlock(a.id)}
            >
              <FoundationIcon kind={a.icon} />
              {a.label[locale]}
            </button>
          ))}
          {[
            ...new Set(entry.lines.map((l) => Math.max(l.debit, l.credit))),
          ].map((amount) => (
            <button
              key={amount}
              className="fdn-amount-piece"
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData("text/plain", `amount:${amount}`)
              }
              onClick={() => setBlock(`amount:${amount}`)}
            >
              {formatMoney(amount)} EGP
            </button>
          ))}
        </div>
      </div>
      <div className="fdn-entry-heading">
        <b>{entry.reference}</b>
        <span>
          {say(
            "Practice date: 01 Jan 2026 · EGP",
            "تاريخ التدريب: 1 يناير 2026 · جنيه مصري",
          )}
        </span>
      </div>
      <div className="fdn-journal-lines">
        <div className="fdn-journal-columns">
          <b>{say("Account", "الحساب")}</b>
          <b>Debit · {say("Dr", "مدين")}</b>
          <b>Credit · {say("Cr", "دائن")}</b>
        </div>
        {lines.map((line, i) => (
          <div className="fdn-journal-row" key={i}>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                place(i, "account", e.dataTransfer.getData("text/plain"));
              }}
            >
              <select
                aria-label={`${say("Account line", "حساب السطر")} ${i + 1}`}
                value={line.account}
                onChange={(e) => update(i, { account: e.target.value })}
              >
                <option value="">{say("Choose account", "اختر الحساب")}</option>
                {foundationAccounts.slice(0, 10).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label[locale]}
                  </option>
                ))}
              </select>
              <button
                className="fdn-place"
                disabled={!block || block.startsWith("amount:")}
                onClick={() => place(i, "account", block)}
                aria-label={`${say("Place account", "ضع الحساب")} ${i + 1}`}
              >
                +
              </button>
            </div>
            {(["debit", "credit"] as const).map((side) => (
              <div
                key={side}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  place(i, side, e.dataTransfer.getData("text/plain"));
                }}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  aria-label={`${side === "debit" ? say("Debit line", "مدين السطر") : say("Credit line", "دائن السطر")} ${i + 1}`}
                  value={line[side] || ""}
                  placeholder="0"
                  onChange={(e) =>
                    update(i, { [side]: Number(e.target.value) })
                  }
                />
                <button
                  className="fdn-place"
                  disabled={!block.startsWith("amount:")}
                  onClick={() => place(i, side, block)}
                  aria-label={`${say("Place amount", "ضع المبلغ")} ${side} ${i + 1}`}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        className="fdn-add-row"
        disabled={lines.length >= 8}
        onClick={() => change([...lines, blank()])}
      >
        <Plus />
        {say("Add row", "أضف سطرًا")}
      </button>
      <div className={`fdn-entry-totals ${balanced ? "balanced" : ""}`}>
        <span>
          {say("Total debit", "إجمالي المدين")}
          <b>{formatMoney(debit)}</b>
        </span>
        <span>
          {say("Total credit", "إجمالي الدائن")}
          <b>{formatMoney(credit)}</b>
        </span>
        <span>
          {say("Difference", "الفرق")}
          <b>{formatMoney(Math.abs(debit - credit))}</b>
        </span>
      </div>
      {balanced && (
        <p className="fdn-balanced">
          <CheckCircle2 />
          {say(
            "Balanced amounts — now verify the economic meaning.",
            "المبالغ متوازنة؛ تأكد الآن من المعنى الاقتصادي.",
          )}
        </p>
      )}
      <button className="fdn-primary" onClick={() => onSubmit(lines)}>
        {say("Check entry", "تحقق من القيد")}
      </button>
      <p className="fdn-small">
        {valid.valid
          ? say(
              "Correct account movements. Ready to accept.",
              "حركات الحسابات صحيحة. جاهز للاعتماد.",
            )
          : say(
              "A balanced entry must also use the correct accounts, sides and amounts.",
              "القيد المتوازن يجب أيضًا أن يستخدم الحسابات والاتجاهات والمبالغ الصحيحة.",
            )}
      </p>
      <div className="fdn-economic">
        <FoundationIcon kind="equipment" />
        <span>{accountLabel(entry.lines[0].account)[locale]}</span>
        <span>
          {say(
            "The entry changes the company, not just a table.",
            "القيد يغيّر الشركة، وليس مجرد جدول.",
          )}
        </span>
      </div>
    </section>
  );
}
