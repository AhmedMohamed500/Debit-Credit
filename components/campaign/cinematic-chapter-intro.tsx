"use client";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  FileSearch,
  FileText,
  Pause,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useGame } from "@/lib/campaign/store";
import { firstDayDocuments } from "@/lib/campaign/first-day";
import { firstShiftMissionProgress } from "@/lib/campaign/first-shift-hub";
import type { CinematicChapter } from "@/lib/campaign/first-day-story";
import type { Locale } from "@/types";

type Props = {
  chapter: CinematicChapter;
  locale: Locale;
  variant: "intro" | "outro";
  onComplete: () => void;
  onSkip?: () => void;
};
export function CinematicChapterIntro({ chapter, locale, onComplete }: Props) {
  const ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en);
  const { state } = useGame(),
    progress = firstShiftMissionProgress(state);
  const video =
    chapter.mode === "video"
      ? chapter.video.mp4 || chapter.video.webm
      : undefined;
  const player = useRef<HTMLVideoElement>(null);
  const [watching, setWatching] = useState(false),
    [paused, setPaused] = useState(false);
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const methods = [
    {
      Icon: FileSearch,
      title: say("Inspect", "افحص"),
      detail: say("Check source evidence", "راجع المستندات المؤيدة"),
    },
    {
      Icon: ShieldCheck,
      title: say("Decide", "قرّر"),
      detail: say("Post, hold or escalate", "رحّل، علّق أو صعّد"),
    },
    {
      Icon: BookOpen,
      title: say("Record", "سجّل"),
      detail: say("Follow the impact in the books", "تابع الأثر في الدفاتر"),
    },
  ];
  const stages = [
    ...firstDayDocuments.map((doc, index) => ({
      title: doc.title[locale],
      done: progress.cases[index].done,
    })),
    {
      title: say("Review the journal", "مراجعة اليومية"),
      done: progress.journalComplete,
    },
    {
      title: say("Review the ledger", "مراجعة الأستاذ"),
      done: progress.ledgerComplete,
    },
  ];
  return (
    <section
      className="shift-briefing"
      dir={ar ? "rtl" : "ltr"}
      aria-label={say("First Shift briefing", "خطة أول وردية")}
    >
      <div className="shift-briefing-heading">
        <small>
          MIZAN TRADING <span> / </span>
          {say("WORKSPACE 01", "مساحة العمل ٠١")}
        </small>
        <h1>{say("Your first shift", "أول وردية لك")}</h1>
        <p>
          {say(
            "From a source document to a professional record. One connected workflow, at your own pace.",
            "من المستند إلى سجلّك المهني. خطوات مرتبطة، تمشي فيها على مهلك.",
          )}
        </p>
      </div>
      <div className="shift-briefing-grid">
        <div className="shift-assignment">
          <header>
            <span className="shift-assignment-icon">
              <ClipboardCheck />
            </span>
            <div>
              <small>{say("YOUR ASSIGNMENT", "مهمتك")}</small>
              <h2>
                {say(
                  "Take ownership of the finance desk",
                  "استلم مكتب الحسابات",
                )}
              </h2>
            </div>
          </header>
          <p>
            {say(
              "Kareem, your finance manager, has assigned three files. Inspect their supporting documents, make an accounting decision, then post only a valid balanced entry.",
              "كريم، مديرك المالي، سلّمك ٣ ملفات. راجع مستنداتها المؤيدة، خد قرارك المحاسبي، ورحّل القيد الصحيح المتوازن فقط.",
            )}
          </p>
          <div className="shift-briefing-action">
            <button type="button" onClick={onComplete}>
              {say("Open my desk", "افتح مكتبي")}
              <Arrow aria-hidden="true" />
            </button>
            <small>
              {state.storageWarning
                ? say(
                    "Storage is unavailable. Keep this tab open to retain your work.",
                    "التخزين غير متاح. اترك الصفحة مفتوحة للحفاظ على شغلك.",
                  )
                : say(
                    "Your draft and completed files stay saved. You can return at any time.",
                    "مسوداتك والملفات المنجزة محفوظة. تقدر ترجع وتكمّل في أي وقت.",
                  )}
            </small>
          </div>
          <ol
            className="shift-work-method"
            aria-label={say("How to work", "طريقة الشغل")}
          >
            {methods.map(({ Icon, title, detail }) => (
              <li key={title}>
                <Icon aria-hidden="true" />
                <b>{title}</b>
                <small>{detail}</small>
              </li>
            ))}
          </ol>
          <div className="shift-inbox-preview">
            <h3>{say("Your work inbox", "ملفات على مكتبك")}</h3>
            {firstDayDocuments.map((doc) => (
              <div key={doc.id}>
                <FileText aria-hidden="true" />
                <span>
                  <b>{doc.title[locale]}</b>
                  <small>
                    {doc.number} · {doc.party[locale]}
                  </small>
                </span>
                <strong dir="ltr">
                  {doc.amount.toLocaleString("en")} <small>EGP</small>
                </strong>
              </div>
            ))}
          </div>
          {video && (
            <div className="shift-optional-video">
              {!watching ? (
                <button type="button" onClick={() => setWatching(true)}>
                  <Play size={18} />
                  {say(
                    "Watch the optional briefing",
                    "شاهد المقدمة الاختيارية",
                  )}
                </button>
              ) : (
                <>
                  <video
                    ref={player}
                    controls
                    autoPlay
                    playsInline
                    poster={
                      chapter.mode === "video" ? chapter.poster : undefined
                    }
                    onEnded={() => setPaused(true)}
                  >
                    <source src={video} />
                  </video>
                  <button
                    type="button"
                    onClick={() => {
                      const el = player.current;
                      if (!el) return;
                      if (el.paused) {
                        void el.play();
                        setPaused(false);
                      } else {
                        el.pause();
                        setPaused(true);
                      }
                    }}
                  >
                    {paused ? <Play /> : <Pause />}
                    {paused ? say("Play", "تشغيل") : say("Pause", "إيقاف")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <aside
          className="shift-plan"
          aria-label={say("Shift plan", "خطة الوردية")}
        >
          <small>{say("A CLEAR PATH", "طريق واضح")}</small>
          <h2>{say("Five stages. One shift.", "٥ مراحل. وردية واحدة.")}</h2>
          <p>
            {say(
              "Complete each file, then check the journal and ledger. Only accepted work counts.",
              "خلّص كل ملف، وبعده راجع اليومية والأستاذ. التقدم محسوب من الشغل المقبول فقط.",
            )}
          </p>
          <ol>
            {stages.map((stage, index) => (
              <li key={index} data-done={stage.done}>
                <span>{stage.done ? <Check size={17} /> : index + 1}</span>
                <b>{stage.title}</b>
              </li>
            ))}
          </ol>
          <div className="shift-plan-result">
            <FileText />
            <h3>
              {say("Your work becomes career evidence", "شغلك يبقى دليل مهني")}
            </h3>
            <p>
              {say(
                "Accepted tasks build accounting skill evidence and update your English CV automatically. No invented employment or qualifications.",
                "المهام المقبولة تبني أدلة مهارات محاسبية وتحدّث الـCV الإنجليزي تلقائيًا، من غير خبرات أو شهادات وهمية.",
              )}
            </p>
            <small>
              {say(
                "Find your profile, skills and CV in My career file above.",
                "البروفايل والمهارات والـCV في «ملفي المهني» فوق.",
              )}
            </small>
          </div>
        </aside>
      </div>
    </section>
  );
}
