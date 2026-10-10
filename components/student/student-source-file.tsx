"use client";
import { useState } from "react";
import { FileText, Check, Copy } from "lucide-react";
import { transactions } from "@/lib/student/unit";
import type { Locale } from "@/types";

export function StudentSourceFile({
  locale,
  transaction,
}: {
  locale: Locale;
  transaction?: (typeof transactions)[number];
}) {
  const refs = transaction
    ? transaction.reference.split(" / ")
    : ["INV-031 · ORIGINAL", "INV-031 · COPY", "PO-031 / GRN-031"];
  const [selected, setSelected] = useState(refs[0]);
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en);
  return (
    <section
      className="student-source-file"
      aria-label={say("Supporting document pack", "ملف المستندات المؤيدة")}
    >
      <nav aria-label={say("Source documents", "المستندات")}>
        {refs.map((ref) => (
          <button
            type="button"
            key={ref}
            aria-pressed={selected === ref}
            onClick={() => setSelected(ref)}
          >
            <FileText size={18} />
            {ref}
          </button>
        ))}
      </nav>
      <article className="student-source-paper">
        <header>
          <span>▂▅▇</span>
          <div>
            <b>MIZAN TRADING &amp; SERVICES</b>
            <small>
              {say(
                "Training source reconstruction · EGP",
                "نموذج مستند تدريبي · بالجنيه المصري",
              )}
            </small>
          </div>
          <code>{selected}</code>
        </header>
        <h3>
          {transaction?.title[locale] ??
            say(
              "Supplier invoice — duplicate check",
              "فاتورة مورد — فحص التكرار",
            )}
        </h3>
        <dl>
          <div>
            <dt>{say("Reference trail", "مسار المراجع")}</dt>
            <dd>{transaction?.reference ?? "INV-031 / PO-031 / GRN-031"}</dd>
          </div>
          <div>
            <dt>{say("Document amount", "مبلغ المستند")}</dt>
            <dd>{(transaction?.amount ?? 15000).toLocaleString("en")} EGP</dd>
          </div>
          <div>
            <dt>{say("Supporting file", "مستندات التأييد")}</dt>
            <dd>
              {transaction?.evidence[locale] ??
                say(
                  "One original invoice matches the purchase order and signed receiving note. The second invoice has the same number, supplier, items and EGP 15,000 amount. No entry has been posted.",
                  "أصل فاتورة واحد يطابق أمر الشراء وإذن الاستلام الموقع. النسخة الثانية تحمل نفس الرقم والمورد والأصناف ومبلغ 15,000 جنيه. لم يُسجّل أي قيد.",
                )}
            </dd>
          </div>
        </dl>
        <footer>
          {selected.includes("COPY") ? <Copy size={18} /> : <Check size={18} />}
          <span>
            {say(
              "Read the source file before deciding. A balanced entry alone is not sufficient.",
              "راجع الملف قبل القرار. القيد المتوازن وحده ليس كافيًا.",
            )}
          </span>
        </footer>
      </article>
    </section>
  );
}
