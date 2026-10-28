"use client";

import { useEffect, useState } from "react";
import { Calculator, X } from "lucide-react";
import type { Locale } from "@/types";

export function AccountingCalculator({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const say = (en: string, value: string) => (ar ? value : en);
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const calculate = () => {
    if (!/^\s*[\d.]+\s*[+*/-]\s*[\d.]+\s*$/.test(expression)) {
      setResult(say("Enter two numbers and an operator.", "أدخل رقمين وعلامة عملية."));
      return;
    }
    const parts = expression.match(/([\d.]+)\s*([+*/-])\s*([\d.]+)/);
    if (!parts) return;
    const first = Number(parts[1]);
    const second = Number(parts[3]);
    const value = parts[2] === "+" ? first + second : parts[2] === "-" ? first - second : parts[2] === "*" ? first * second : second === 0 ? Number.NaN : first / second;
    setResult(Number.isFinite(value) ? String(value) : say("Invalid calculation", "عملية غير صالحة"));
  };

  return (
    <article className="phase3-calculator">
      <Calculator />
      <div><h2>{say("Quick calculator", "حاسبة سريعة")}</h2><p>{say("Open a focused utility without leaving your current work.", "افتح أداة سريعة دون مغادرة عملك الحالي.")}</p></div>
      <button type="button" onClick={() => setOpen(true)}>{say("Open calculator", "افتح الحاسبة")}</button>
      {open ? (
        <div className="phase3-modal-backdrop" onClick={() => setOpen(false)}>
          <section className="phase3-modal phase3-calculator-modal" role="dialog" aria-modal="true" aria-label={say("Calculator", "الحاسبة")} onClick={(event) => event.stopPropagation()}>
            <button className="phase3-modal-close" type="button" onClick={() => setOpen(false)} aria-label={say("Close", "إغلاق")}><X /></button>
            <Calculator />
            <h2>{say("Calculator", "الحاسبة")}</h2>
            <label htmlFor="phase3-calculation">{say("Calculation", "العملية الحسابية")}</label>
            <input id="phase3-calculation" value={expression} onChange={(event) => setExpression(event.target.value)} onKeyDown={(event) => event.key === "Enter" && calculate()} placeholder="10000 + 2500" autoFocus />
            <button type="button" onClick={calculate}>{say("Calculate", "احسب")}</button>
            <output aria-live="polite">{result}</output>
          </section>
        </div>
      ) : null}
    </article>
  );
}
