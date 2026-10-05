"use client";
import { useState } from "react";
import Link from "next/link";
import { Scale, CheckCircle2, ArrowUp, ArrowDown } from "lucide-react";
import type { Locale } from "@/types";
import { foundationEntries } from "@/lib/bootcamp/catalog";
import type {
  BootcampMission,
  FoundationResponse,
  FoundationTask,
} from "@/lib/bootcamp/model";
import { FoundationIcon, MoneyFlow, formatMoney } from "./visuals";
import { BeginnerJournalBuilder } from "./journal-builder";
import { AccountingCycleJourney, SourceDocument } from "./accounting-journey";
type Props = {
  locale: Locale;
  mission: BootcampMission;
  task: FoundationTask;
  draft?: FoundationResponse;
  onDraft: (value: FoundationResponse) => void;
  onSubmit: (value: FoundationResponse) => void;
};
export function FoundationMissionGameplay(props: Props) {
  const { locale, mission, task, draft, onDraft, onSubmit } = props,
    ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en),
    [values, setValues] = useState<string[]>(
      draft && typeof draft[0] === "string" ? (draft as string[]) : [],
    ),
    [moved, setMoved] = useState(false);
  const set = (value: string[]) => {
    setValues(value);
    onDraft(value);
  };
  if (task.kind === "journal")
    return <BeginnerJournalBuilder {...props} entryId={task.entryId!} />;
  if (task.kind === "station" && mission.mechanic === "cycle")
    return (
      <AccountingCycleJourney
        locale={locale}
        current={task.id}
        onVisit={() => onSubmit(["visit"])}
      />
    );
  if (task.kind === "station") {
    const entry = foundationEntries.find((e) => e.id === task.entryId)!;
    return (
      <div className="fdn-document-inspect">
        <SourceDocument locale={locale} entry={entry} />
        <button className="fdn-primary" onClick={() => onSubmit(["visit"])}>
          {say("Evidence inspected · continue", "فحصت الدليل · تابع")}
        </button>
      </div>
    );
  }
  if (task.kind === "transfer")
    return (
      <div className="fdn-transfer-game">
        <MoneyFlow
          locale={locale}
          investment={mission.id === "business-world"}
          moved={moved}
          onMove={() => {
            setMoved(true);
          }}
        />
        {moved && (
          <div className="fdn-observed">
            <CheckCircle2 />
            <p>
              {mission.id === "business-world"
                ? say(
                    "Mizan now owns EGP 100,000 cash. What other claim changed?",
                    "ميزان تمتلك الآن 100,000 جنيه نقدًا. ما الحق الآخر الذي تغير؟",
                  )
                : say(
                    "EGP 20,000 moved from cash into equipment. Total assets stayed unchanged.",
                    "20,000 جنيه تحولت من نقدية إلى معدات. إجمالي الأصول لم يتغير.",
                  )}
            </p>
          </div>
        )}
        <button
          className="fdn-primary"
          disabled={!moved}
          onClick={() => onSubmit(["move"])}
        >
          {say("I saw the movement · continue", "شاهدت الحركة · تابع")}
        </button>
      </div>
    );
  if (task.kind === "equation") {
    const contra = mission.mechanic === "contra",
      a = Number(values[0] || 0),
      l = Number(values[1] || 0),
      e = Number(values[2] || 0),
      difference = a - l - e;
    return (
      <div className="fdn-equation">
        <div className="fdn-equation-blocks" dir="ltr">
          {(contra
            ? [say("Carrying amount", "القيمة الدفترية")]
            : [
                say("Assets", "الأصول"),
                say("Liabilities", "الالتزامات"),
                say("Equity", "حقوق الملكية"),
              ]
          ).map((label, i) => (
            <div className={`fdn-equation-block block-${i}`} key={label}>
              <b>{label}</b>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                aria-label={label}
                placeholder="0"
                value={values[i] ?? ""}
                onChange={(event) => {
                  const next = [...values];
                  next[i] = event.target.value;
                  set(next);
                }}
              />
              {i === 0 && !contra && <span>=</span>}
              {i === 1 && !contra && <span>+</span>}
            </div>
          ))}
        </div>
        {!contra && (
          <>
            <div
              className="fdn-scale"
              aria-label={say("Company balance scale", "ميزان الشركة")}
            >
              <div
                className="fdn-scale-beam"
                style={{
                  transform: `rotate(${Math.max(-12, Math.min(12, difference / 10000))}deg)`,
                }}
              >
                <div>
                  <FoundationIcon kind="cash" />
                  <b>{formatMoney(a)}</b>
                </div>
                <div>
                  <FoundationIcon kind="capital" />
                  <b>{formatMoney(l + e)}</b>
                </div>
              </div>
              <Scale />
            </div>
            <p>
              {difference === 0 && a > 0
                ? say(
                    "The scale balances. Does it match the story?",
                    "الميزان متوازن. هل يطابق القصة؟",
                  )
                : say(
                    "Move the values until both sides reflect the story.",
                    "غيّر القيم حتى يمثل الطرفان القصة.",
                  )}
            </p>
          </>
        )}
        <button
          className="fdn-primary"
          onClick={() =>
            onSubmit(
              Array.from({ length: contra ? 1 : 3 }, (_, i) => values[i] ?? ""),
            )
          }
        >
          {say("Check balance", "تحقق من التوازن")}
        </button>
      </div>
    );
  }
  if (task.kind === "movement")
    return (
      <div className="fdn-movement-game">
        {task.rows!.map((row, i) => (
          <div className="fdn-movement-row" key={row.id}>
            <strong>{row.label[locale]}</strong>
            <div>
              {row.options.map((option) => (
                <button
                  key={option.id}
                  aria-label={`${row.label[locale]} · ${option.label[locale]}`}
                  aria-pressed={values[i] === option.id}
                  onClick={() => {
                    const next = [...values];
                    next[i] = option.id;
                    set(next);
                  }}
                >
                  {option.id === "up" ? (
                    <ArrowUp />
                  ) : option.id === "down" ? (
                    <ArrowDown />
                  ) : null}
                  {option.label[locale]}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          className="fdn-primary"
          disabled={!task.rows!.every((_, i) => values[i])}
          onClick={() => onSubmit(values)}
        >
          {say("Check movements", "تحقق من الحركات")}
        </button>
      </div>
    );
  if (task.kind === "multiple")
    return (
      <div className="fdn-account-matcher">
        <div className="fdn-account-pieces">
          {task.choices!.map((choice) => (
            <button
              key={choice.id}
              draggable
              onDragStart={(event) =>
                event.dataTransfer.setData("text/plain", choice.id)
              }
              aria-pressed={values.includes(choice.id)}
              onClick={() =>
                set(
                  values.includes(choice.id)
                    ? values.filter((v) => v !== choice.id)
                    : [...values, choice.id],
                )
              }
            >
              <FoundationIcon kind={choice.icon} />
              <b>{choice.label[locale]}</b>
            </button>
          ))}
        </div>
        <div
          className="fdn-account-drop"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const id = event.dataTransfer.getData("text/plain");
            if (task.choices!.some((c) => c.id === id) && !values.includes(id))
              set([...values, id]);
          }}
        >
          <b>Mizan Trading</b>
          <p>
            {say(
              "Drag accounts here, or tap them above. Tap again to remove.",
              "اسحب الحسابات هنا أو اخترها بالأعلى. اضغط مرة أخرى لإزالتها.",
            )}
          </p>
          <div>
            {values.map((v) => (
              <span key={v}>
                {task.choices!.find((c) => c.id === v)?.label[locale]}
              </span>
            ))}
          </div>
        </div>
        <button
          className="fdn-primary"
          disabled={!values.length}
          onClick={() => onSubmit(values)}
        >
          {say("Check affected accounts", "تحقق من الحسابات المتأثرة")}
        </button>
      </div>
    );
  const draggable = ["classify", "districts", "lanes", "documents"].includes(
    mission.mechanic,
  );
  return (
    <div className={`fdn-choice-game fdn-choice-${mission.mechanic}`}>
      <div
        className="fdn-event-token"
        draggable={draggable}
        onDragStart={(event) =>
          event.dataTransfer.setData("text/plain", task.id)
        }
      >
        <FoundationIcon
          kind={
            mission.mechanic === "documents"
              ? "invoice"
              : mission.mechanic === "districts"
                ? task.id === "equipment"
                  ? "equipment"
                  : task.id === "inventory"
                    ? "box"
                    : "cash"
                : undefined
          }
        />
        <strong>{task.prompt[locale]}</strong>
        {draggable && (
          <small>
            {say(
              "Drag into a destination, or tap the correct destination.",
              "اسحب إلى المكان المناسب أو اضغط المكان الصحيح.",
            )}
          </small>
        )}
      </div>
      <div className="fdn-destinations">
        {task.choices!.map((choice) => (
          <button
            key={choice.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (event.dataTransfer.getData("text/plain") === task.id)
                onSubmit([choice.id]);
            }}
            onClick={() => onSubmit([choice.id])}
          >
            <FoundationIcon
              kind={
                choice.icon ??
                (mission.mechanic === "districts" ? "bank" : undefined)
              }
            />
            <b>{choice.label[locale]}</b>
            {mission.mechanic === "documents" && (
              <small>{say("Source evidence", "مستند مؤيد")}</small>
            )}
          </button>
        ))}
      </div>
      {mission.mechanic === "districts" && (
        <Link
          className="fdn-small"
          href={`/${locale}/account-guide?return=bootcamp&account=${({ cash: "1100", bank: "1110", inventory: "1200", equipment: "1300", receivable: "1120", payable: "2100", capital: "3100" } as Record<string, string>)[task.id]}`}
        >
          {say(
            "Inspect this account in Account City",
            "افحص هذا الحساب في مدينة الحسابات",
          )}
        </Link>
      )}
    </div>
  );
}
