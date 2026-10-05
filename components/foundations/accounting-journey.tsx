"use client";
import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  BookOpen,
  Library,
  Scale,
  ChartNoAxesCombined,
} from "lucide-react";
import type { Locale } from "@/types";
import { accountLabel, foundationEntries } from "@/lib/bootcamp/catalog";
import { foundationBooks } from "@/lib/bootcamp/engine";
import type { BootcampState, FoundationEntry } from "@/lib/bootcamp/model";
import { formatMoney } from "./visuals";
export function SourceDocument({
  locale,
  entry,
}: {
  locale: Locale;
  entry: FoundationEntry;
}) {
  return (
    <article className="fdn-source-document">
      <FileText aria-hidden="true" />
      <header>
        <b>MIZAN TRADING</b>
        <span>{entry.document[locale]}</span>
      </header>
      <dl>
        <div>
          <dt>{locale === "ar" ? "المرجع" : "Reference"}</dt>
          <dd>{entry.reference}</dd>
        </div>
        <div>
          <dt>{locale === "ar" ? "التاريخ" : "Date"}</dt>
          <dd>01 / 01 / 2026</dd>
        </div>
        <div>
          <dt>{locale === "ar" ? "المبلغ" : "Amount"}</dt>
          <dd>{formatMoney(entry.amount)} EGP</dd>
        </div>
      </dl>
      <p>{entry.story[locale]}</p>
      <small>
        {locale === "ar"
          ? "مستند تدريب محلي · ليس مستند عمل حقيقي"
          : "Local practice document · not real business evidence"}
      </small>
    </article>
  );
}
const stations = ["source", "journal", "ledger", "trial", "statements"];
export function AccountingCycleJourney({
  locale,
  current,
  onVisit,
}: {
  locale: Locale;
  current: string;
  onVisit: () => void;
}) {
  const ar = locale === "ar",
    names = ar
      ? ["المستند", "اليومية", "الأستاذ", "ميزان المراجعة", "القوائم"]
      : ["Source", "Journal", "Ledger", "Trial balance", "Statements"],
    icons = [FileText, BookOpen, Library, Scale, ChartNoAxesCombined],
    [opened, setOpened] = useState(false),
    index = stations.indexOf(current),
    entry = foundationEntries[1];
  return (
    <div className="fdn-cycle">
      <nav aria-label={ar ? "محطات رحلة القيد" : "Entry journey stations"}>
        {stations.map((id, i) => {
          const Icon = icons[i];
          return (
            <button
              key={id}
              disabled={i > index}
              aria-current={i === index ? "step" : undefined}
              onClick={() => {
                if (i === index) setOpened(true);
              }}
            >
              <Icon />
              {names[i]}
              {i < index && <CheckCircle2 />}
            </button>
          );
        })}
      </nav>
      <div className="fdn-cycle-view">
        {!opened ? (
          <>
            <p>
              {ar
                ? "اضغط المحطة الحالية لترى مكان العملية."
                : "Click the current station to see where the transaction appears."}
            </p>
            <button className="fdn-primary" onClick={() => setOpened(true)}>
              {names[index]}
            </button>
          </>
        ) : (
          <>
            <h3>{names[index]} · EQ-002</h3>
            {index === 0 ? (
              <SourceDocument locale={locale} entry={entry} />
            ) : index === 1 ? (
              <EntryLines locale={locale} entry={entry} />
            ) : index === 2 ? (
              <div className="fdn-ledger-pair">
                <article>
                  <h4>{ar ? "أستاذ المعدات" : "Equipment ledger"}</h4>
                  <b>Debit +20,000</b>
                  <span>EQ-002</span>
                </article>
                <article>
                  <h4>{ar ? "أستاذ النقدية" : "Cash ledger"}</h4>
                  <b>Credit −20,000</b>
                  <span>EQ-002</span>
                </article>
              </div>
            ) : index === 3 ? (
              <>
                <EntryLines locale={locale} entry={entry} />
                <p>
                  {ar
                    ? "هذه حركة العملية وحدها، وليست أرصدة الشركة الختامية. المدين = الدائن = 20,000."
                    : "These are transaction movements, not closing company balances. Debit = credit = 20,000."}
                </p>
              </>
            ) : (
              <div className="fdn-statement-preview">
                <b>{ar ? "تأثير المركز المالي" : "Balance sheet effect"}</b>
                <p>
                  {ar
                    ? "معدات +20,000 · نقدية −20,000"
                    : "Equipment +20,000 · Cash −20,000"}
                </p>
                <strong>
                  {ar ? "إجمالي الأصول: لا تغيير" : "Total assets: unchanged"}
                </strong>
                <p>
                  {ar
                    ? "شراء أصل ليس مصروفًا فوريًا."
                    : "Buying an asset is not an immediate expense."}
                </p>
              </div>
            )}
            <button className="fdn-primary" onClick={onVisit}>
              {ar ? "تابع الرحلة" : "Continue journey"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
export function EntryLines({
  locale,
  entry,
}: {
  locale: Locale;
  entry: FoundationEntry;
}) {
  return (
    <div className="fdn-book-table">
      <div>
        <b>{locale === "ar" ? "الحساب" : "Account"}</b>
        <b>Debit</b>
        <b>Credit</b>
      </div>
      {entry.lines.map((l, i) => (
        <div key={i}>
          <span>{accountLabel(l.account)[locale]}</span>
          <span>{l.debit ? formatMoney(l.debit) : "—"}</span>
          <span>{l.credit ? formatMoney(l.credit) : "—"}</span>
        </div>
      ))}
    </div>
  );
}
export function FoundationBooks({
  locale,
  state,
}: {
  locale: Locale;
  state: BootcampState;
}) {
  const ar = locale === "ar",
    books = foundationBooks(state),
    [view, setView] = useState("journal");
  return (
    <section className="fdn-books">
      <h2>
        {ar
          ? "دفاتر شركتك من العمليات المقبولة"
          : "Your books from accepted transactions"}
      </h2>
      <nav aria-label={ar ? "دفاتر المهمة النهائية" : "Boss accounting books"}>
        {["journal", "ledger", "trial", "statements"].map((id, i) => (
          <button
            key={id}
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            {
              (ar
                ? ["اليومية", "الأستاذ", "ميزان المراجعة", "القوائم"]
                : ["Journal", "Ledger", "Trial balance", "Statements"])[i]
            }
          </button>
        ))}
      </nav>
      {view === "journal" ? (
        books.entries.map((entry) => (
          <details key={entry.id}>
            <summary>
              {entry.reference} · {entry.story[locale]}
            </summary>
            <EntryLines locale={locale} entry={entry} />
          </details>
        ))
      ) : view === "ledger" ? (
        books.ledger.map((account) => (
          <details key={account.id}>
            <summary>
              {account.label[locale]} · {formatMoney(Math.abs(account.balance))}{" "}
              {account.balance >= 0 ? "Dr" : "Cr"}
            </summary>
            <div className="fdn-book-table">
              {account.movements.map((m) => (
                <div key={m.reference}>
                  <span>{m.reference}</span>
                  <span>{formatMoney(m.debit)}</span>
                  <span>{formatMoney(m.credit)}</span>
                </div>
              ))}
            </div>
          </details>
        ))
      ) : view === "trial" ? (
        <>
          <div className="fdn-book-table">
            <div>
              <b>{ar ? "الحساب" : "Account"}</b>
              <b>Debit</b>
              <b>Credit</b>
            </div>
            {books.trial.map((a) => (
              <div key={a.id}>
                <span>{a.label[locale]}</span>
                <span>{formatMoney(a.debitBalance)}</span>
                <span>{formatMoney(a.creditBalance)}</span>
              </div>
            ))}
            <div>
              <b>{ar ? "الإجمالي" : "Total"}</b>
              <b>{formatMoney(books.totalDebit)}</b>
              <b>{formatMoney(books.totalCredit)}</b>
            </div>
          </div>
          <p className="fdn-balanced">
            {ar ? "الفرق" : "Difference"}:{" "}
            {formatMoney(books.totalDebit - books.totalCredit)}
          </p>
        </>
      ) : (
        <div className="fdn-statement-preview">
          <h3>{ar ? "معاينة المركز المالي" : "Initial balance sheet"}</h3>
          <p>
            {ar ? "الأصول" : "Assets"}: {formatMoney(books.assets)}
          </p>
          <p>
            {ar ? "الالتزامات" : "Liabilities"}:{" "}
            {formatMoney(books.liabilities)}
          </p>
          <p>
            {ar ? "حقوق الملكية" : "Equity"}: {formatMoney(books.equity)}
          </p>
          <h3>{ar ? "نتيجة الفترة" : "Period result"}</h3>
          <p>
            {ar ? "الإيرادات" : "Revenue"}: {formatMoney(books.revenue)} ·{" "}
            {ar ? "المصروفات" : "Expenses"}: {formatMoney(books.expenses)}
          </p>
          <strong>
            {ar ? "الربح" : "Profit"}: {formatMoney(books.profit)}
          </strong>
        </div>
      )}
    </section>
  );
}
