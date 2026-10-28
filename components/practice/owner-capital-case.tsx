"use client";

import { useEffect, useState } from "react";
import { Check, FileText, RotateCcw, X } from "lucide-react";
import { usePlayer } from "@/components/game/use-player";
import { recordGameActivity } from "@/lib/game/progress";
import type { Locale } from "@/types";

export const OWNER_CAPITAL_ACTIVITY_ID = "beginner-owner-capital";

const questions = [
  {
    ar: "استلمت ميزان للتجارة ١٠٬٠٠٠ جنيه من المالك لبدء العمل. ماذا حدث؟",
    en: "Mizan Trading received EGP 10,000 from its owner to start operations. What happened?",
    options: [
      { ar: "دخل رأس مال إلى الشركة", en: "The owner invested capital" },
      { ar: "حققت الشركة إيراد بيع", en: "The company earned sales revenue" },
      { ar: "دفعت الشركة مصروفًا", en: "The company paid an expense" },
    ],
    correct: 0,
  },
  {
    ar: "أي حسابين تأثرا؟",
    en: "Which two accounts changed?",
    options: [
      { ar: "النقدية ورأس المال", en: "Cash and Owner Capital" },
      { ar: "المبيعات والموردون", en: "Sales and Payables" },
      { ar: "المصروفات والبنك", en: "Expenses and Bank" },
    ],
    correct: 0,
  },
  {
    ar: "ما أثر العملية على المعادلة المحاسبية؟",
    en: "What is the effect on the accounting equation?",
    options: [
      { ar: "تزيد النقدية ويزيد حق الملكية", en: "Cash and equity both increase" },
      { ar: "تزيد النقدية وينخفض حق الملكية", en: "Cash increases and equity decreases" },
      { ar: "لا شيء يتغير", en: "Nothing changes" },
    ],
    correct: 0,
  },
  {
    ar: "هل انخفض حساب في هذه العملية؟",
    en: "Did any account decrease in this transaction?",
    options: [
      { ar: "لا، الحسابان زادا", en: "No, both accounts increased" },
      { ar: "نعم، النقدية انخفضت", en: "Yes, cash decreased" },
      { ar: "نعم، رأس المال انخفض", en: "Yes, capital decreased" },
    ],
    correct: 0,
  },
] as const;

export function OwnerCapitalCase({ locale }: { locale: Locale }) {
  const player = usePlayer();
  const ar = locale === "ar";
  const say = (en: string, value: string) => (ar ? value : en);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [error, setError] = useState(false);
  const completed = Boolean(player.activities[`practice:${OWNER_CAPITAL_ACTIVITY_ID}`]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const start = () => {
    setStep(0);
    setMistakes(0);
    setError(false);
    setOpen(true);
  };

  const answer = (choice: number) => {
    if (step >= questions.length) return;
    if (choice !== questions[step].correct) {
      setMistakes((value) => value + 1);
      setError(true);
      return;
    }
    setError(false);
    if (step === questions.length - 1) {
      if (!completed) {
        recordGameActivity(
          "practice",
          OWNER_CAPITAL_ACTIVITY_ID,
          Math.round((questions.length / (questions.length + mistakes)) * 100),
          ["fundamentals", "transaction-analysis", "account-classification"],
          undefined,
          mistakes + 1,
        );
      }
      setStep(questions.length);
      return;
    }
    setStep((value) => value + 1);
  };

  return (
    <article className="phase3-owner-capital">
      <header>
        <span><FileText />{say("Foundation practice", "تدريب تأسيسي")}</span>
        {completed ? <em><Check />{say("Completed", "مكتمل")}</em> : null}
      </header>
      <h2>{say("Understand owner capital", "افهم رأس مال المالك")}</h2>
      <p>{say("A short four-question case using a real source-document pattern. Practice only; it does not create professional evidence.", "حالة قصيرة من أربعة أسئلة بنمط مستند مصدر حقيقي. تدريب فقط ولا ينشئ دليلاً مهنياً.")}</p>
      <button type="button" onClick={start}>
        {completed ? <RotateCcw /> : <FileText />}
        {completed ? say("Practice again", "تدرّب مرة أخرى") : say("Start practice", "ابدأ التدريب")}
      </button>

      {open ? (
        <div className="phase3-modal-backdrop" onClick={() => setOpen(false)}>
          <section className="phase3-modal" role="dialog" aria-modal="true" aria-label={say("Understand the Transaction", "افهم العملية")} onClick={(event) => event.stopPropagation()}>
            <button className="phase3-modal-close" type="button" aria-label={say("Close", "إغلاق")} onClick={() => setOpen(false)}><X /></button>
            <small>{say("MIZAN TRADING · FOUNDATION PRACTICE", "ميزان للتجارة · تدريب تأسيسي")}</small>
            <h2>{say("Understand the Transaction", "افهم العملية")}</h2>
            {step < questions.length ? (
              <>
                <p>{say("Owner Capital Receipt · EGP 10,000", "إيصال رأس مال المالك · ١٠٬٠٠٠ جنيه")}</p>
                <div className="phase3-case-progress" aria-label={say("Question progress", "تقدم الأسئلة")}><i style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
                <strong>{step + 1}/{questions.length}</strong>
                <h3>{questions[step][locale]}</h3>
                <div className="phase3-case-options">
                  {questions[step].options.map((option, index) => <button type="button" key={index} onClick={() => answer(index)}>{option[locale]}</button>)}
                </div>
                {error ? <p role="alert">{say("Look at the source document and try again.", "راجع المستند وحاول مرة أخرى.")}</p> : null}
              </>
            ) : (
              <div className="phase3-case-success">
                <Check />
                <h3>{say("Transaction understood", "فهمت العملية")}</h3>
                <p>{say("Cash and owner equity increased. No account decreased. This is game practice, not professional Skill Passport evidence.", "زادت النقدية وحقوق المالك. لم ينخفض أي حساب. هذه ممارسة داخل اللعبة وليست دليلًا مهنيًا في جواز المهارات.")}</p>
                <button type="button" onClick={() => setOpen(false)}>{say("Back to Game Hub", "العودة لمركز اللعبة")}</button>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </article>
  );
}
