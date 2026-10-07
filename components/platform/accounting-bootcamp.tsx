"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  Map,
  Star,
  Trophy,
} from "lucide-react";
import type { Locale } from "@/types";
import { foundationEntries, getBootcampMission } from "@/lib/bootcamp/catalog";
import {
  bootcampMissionReady,
  completeBootcampMission,
  createBootcampState,
  currentFoundationTask,
  foundationXp,
  isBootcampMissionUnlocked,
  submitFoundationTask,
} from "@/lib/bootcamp/engine";
import {
  BrowserBootcampRepository,
  syncFoundationRewards,
} from "@/lib/bootcamp/repository";
import type {
  BootcampMissionId,
  FoundationResponse,
} from "@/lib/bootcamp/model";
import { FoundationWorldMap } from "@/components/foundations/world-map";
import { FoundationMissionGameplay } from "@/components/foundations/mission-gameplay";
import { GuideCharacter } from "@/components/foundations/visuals";
import { FoundationBooks } from "@/components/foundations/accounting-journey";
import { cloudUser, submitCloudFoundation } from "@/lib/cloud/runtime";
const serverState = createBootcampState();
export function AccountingBootcamp({ locale }: { locale: Locale }) {
  const ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en),
    Arrow = ar ? ArrowLeft : ArrowRight,
    repo = useMemo(() => new BrowserBootcampRepository(), []),
    state = useSyncExternalStore(
      repo.subscribe,
      repo.snapshot,
      () => serverState,
    );
  const [screen, setScreen] = useState<"map" | "mission" | "result">("map"),
    [feedback, setFeedback] = useState<{
      correct: boolean;
      text: string;
    } | null>(null),
    [hint, setHint] = useState(false);
  const mission = getBootcampMission(state.currentMissionId)!,
    task = currentFoundationTask(state),
    ready = bootcampMissionReady(state, mission.id),
    done = state.interactionProgress[mission.id] ?? [],
    completed = state.completedMissionIds.includes(mission.id),
    entry = task?.entryId
      ? foundationEntries.find((e) => e.id === task.entryId)
      : null;
  useEffect(() => {
    syncFoundationRewards(state);
  }, [state]);
  const open = (id: BootcampMissionId) => {
    if (!isBootcampMissionUnlocked(state, id)) return;
    repo.save({ ...state, currentMissionId: id });
    setScreen("mission");
    setFeedback(null);
    setHint(false);
    window.scrollTo(0, 0);
  };
  const submit = async (response: FoundationResponse) => {
    if (!task) return;
    let result;
    try {
      if (cloudUser()) {
        const online = await submitCloudFoundation(
          mission.id,
          task.id,
          response,
        );
        result = { state: online.data, correct: online.correct };
      } else
        result = submitFoundationTask(state, mission.id, task.id, response);
      repo.save(result.state);
    } catch {
      setFeedback({
        correct: false,
        text: say(
          "Not saved to cloud. Your draft is still on this device; check the connection and retry.",
          "لم يتم الحفظ سحابيًا. مسودتك ما زالت على الجهاز؛ راجع الاتصال وحاول ثانية.",
        ),
      });
      return;
    }
    setFeedback({
      correct: result.correct,
      text: result.correct
        ? task.explanation[locale]
        : say(
            "Not quite. Follow the business change and check your choice. Balance alone is not enough.",
            "لسه مش صحيح. تتبع التغير في الشركة وراجع اختيارك. تساوي المبالغ وحده لا يكفي.",
          ),
    });
    setHint(false);
  };
  const finish = async () => {
    let next;
    try {
      next = cloudUser()
        ? (await submitCloudFoundation(mission.id, "@complete", [])).data
        : completeBootcampMission(state, mission.id);
    } catch {
      setFeedback({
        correct: false,
        text: say(
          "Completion not confirmed. Retry when online.",
          "لم يتم تأكيد الإكمال. حاول عند عودة الاتصال.",
        ),
      });
      return;
    }
    if (next === state) return;
    repo.save(next);
    syncFoundationRewards(next);
    setFeedback(null);
    setScreen(mission.id === "mizan-boss" ? "result" : "map");
    window.scrollTo(0, 0);
  };
  const continueTask = () => {
    setFeedback(null);
    setHint(false);
  };
  return (
    <main className="fdn-page" dir={ar ? "rtl" : "ltr"}>
      <aside className="fdn-sidebar">
        <Link href={`/${locale}`} className="fdn-brand">
          <span className="fdn-brand-mark">▟</span>
          <b>Debit &amp; Credit</b>
          <small>by Money Coder</small>
        </Link>
        <nav aria-label={say("Foundation navigation", "تنقل الأساسيات")}>
          <Link href={`/${locale}`}>
            <Home />
            {say("Home", "الرئيسية")}
          </Link>
          <button
            aria-pressed={screen === "map"}
            onClick={() => setScreen("map")}
          >
            <Map />
            {say("Missions", "المراحل")}
          </button>
          <button
            onClick={() => {
              setScreen("map");
              document.querySelector(".fdn-map-bottom")?.scrollIntoView();
            }}
          >
            <Star />
            {say("Progress", "تقدمي")}
          </button>
          {state.mizanUnlocked && (
            <Link href={`/${locale}/game/first-shift`}>
              <Trophy />
              {say("First shift", "أول وردية")}
            </Link>
          )}
        </nav>
        <div className="fdn-sidebar-profile">
          <b>{say("Foundation learner", "متعلم الأساسيات")}</b>
          <span>{foundationXp(state)} XP</span>
          <small>
            {say("Learning, not employment experience", "تعلم وليس خبرة عمل")}
          </small>
        </div>
      </aside>
      <div className="fdn-main">
        <header className="fdn-topbar">
          <button onClick={() => setScreen("map")}>
            <span className="fdn-brand-mark">▟</span>Debit &amp; Credit
          </button>
          <span dir={ar ? "rtl" : "ltr"}>
            {say("Stage 0", "المرحلة 0")} ·{" "}
            {screen === "mission" ? (
              <>
                {say("Mission", "المهمة")}{" "}
                {mission.order === 13 ? (
                  say("Boss", "النهائية")
                ) : (
                  <bdi>{mission.order}</bdi>
                )}
              </>
            ) : (
              <bdi dir="ltr">
                {
                  state.completedMissionIds.filter((id) => id !== "mizan-boss")
                    .length
                }{" "}
                / 12
              </bdi>
            )}
          </span>
          <progress
            aria-label={say("Stage progress", "تقدم المرحلة")}
            value={
              state.completedMissionIds.filter((id) => id !== "mizan-boss")
                .length
            }
            max={12}
          />
          <span className="fdn-xp">
            <Star />
            {foundationXp(state)} XP
          </span>
          <Link href={`/${ar ? "en" : "ar"}/bootcamp`}>{ar ? "EN" : "AR"}</Link>
        </header>
        {screen === "map" ? (
          <FoundationWorldMap locale={locale} state={state} onOpen={open} />
        ) : screen === "result" ? (
          <section className="fdn-result">
            <div className="fdn-result-celebration">
              <GuideCharacter
                locale={locale}
                dialogue={say(
                  "Congratulations! You ran your first company. Now you are ready for your first accounting shift.",
                  "مبروك! شغّلت شركتك الأولى. أنت الآن جاهز لأول وردية محاسبية.",
                )}
              />
              <div>
                <Trophy />
                <h1>{say("MIZAN TRADING UNLOCKED", "تم فتح MIZAN TRADING")}</h1>
                <p>
                  {say(
                    "12 missions + 7 connected transactions completed.",
                    "أكملت 12 مهمة و7 عمليات مترابطة.",
                  )}
                </p>
                <strong>+500 XP · ★★★</strong>
                <p>
                  {say(
                    "Foundation learning badge · no verified skills or employment history awarded.",
                    "شارة تعلم الأساسيات · لا تمنح مهارات موثقة أو تاريخ توظيف.",
                  )}
                </p>
                <Link
                  className="fdn-primary"
                  href={`/${locale}/game/first-shift`}
                >
                  {say("Start your first shift", "ابدأ أول وردية")}
                  <Arrow />
                </Link>
              </div>
            </div>
            <FoundationBooks locale={locale} state={state} />
          </section>
        ) : (
          <section
            className={`fdn-mission fdn-mechanic-${mission.mechanic}`}
            aria-labelledby="foundation-title"
          >
            <header className="fdn-mission-heading">
              <button className="fdn-back" onClick={() => setScreen("map")}>
                <Map />
                {say("World map", "خريطة الرحلة")}
              </button>
              <span>
                {mission.order === 13 ? (
                  say("FINAL BOSS", "المهمة النهائية")
                ) : (
                  <>
                    {say("MISSION", "المهمة")}{" "}
                    <bdi dir="ltr">{mission.order} / 12</bdi>
                  </>
                )}
              </span>
              <h1 id="foundation-title">{mission.title[locale]}</h1>
              <p>{mission.brief[locale]}</p>
              <div className="fdn-mission-meter">
                <progress
                  max={mission.tasks.length}
                  value={done.length}
                  aria-label={say("Mission progress", "تقدم المهمة")}
                />
                <b>
                  {done.length} / {mission.tasks.length}
                </b>
                <span>
                  <Star />
                  {mission.xp} XP
                </span>
              </div>
            </header>
            <div className="fdn-mission-layout">
              <GuideCharacter
                locale={locale}
                dialogue={
                  feedback?.text ??
                  (hint
                    ? say(
                        "Look for what the company controls, owes or earns. Use the evidence; do not guess.",
                        "اسأل: ماذا تملك الشركة؟ ماذا عليها؟ وماذا كسبت؟ استخدم الدليل، لا التخمين.",
                      )
                    : (entry?.story[locale] ??
                      task?.prompt[locale] ??
                      say(
                        "Great work. You made the financial story clear.",
                        "شغل ممتاز. القصة المالية أصبحت واضحة.",
                      )))
                }
              />
              <div className="fdn-interaction-area">
                {mission.mechanic === "boss" && (
                  <ol
                    className="fdn-boss-queue"
                    aria-label={say(
                      "Boss transaction queue",
                      "طابور عمليات المهمة النهائية",
                    )}
                  >
                    {foundationEntries.map((e, i) => (
                      <li
                        key={e.id}
                        data-state={
                          done.includes(`${e.id}:journal`)
                            ? "done"
                            : task?.entryId === e.id
                              ? "current"
                              : "locked"
                        }
                      >
                        {done.includes(`${e.id}:journal`) ? (
                          <CheckCircle2 />
                        ) : (
                          i + 1
                        )}
                        <span>{e.reference}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {feedback?.correct ? (
                  <div className="fdn-task-success" role="status">
                    <CheckCircle2 />
                    <h2>{say("You saw the effect!", "شفت التأثير!")}</h2>
                    <p>{feedback.text}</p>
                    <button className="fdn-primary" onClick={continueTask}>
                      {say("Next", "التالي")}
                      <Arrow />
                    </button>
                  </div>
                ) : task ? (
                  <>
                    <h2 className="fdn-task-prompt">{task.prompt[locale]}</h2>
                    <FoundationMissionGameplay
                      key={`${mission.id}/${task.id}`}
                      locale={locale}
                      mission={mission}
                      task={task}
                      draft={state.drafts[`${mission.id}/${task.id}`]}
                      onDraft={(value) =>
                        repo.save({
                          ...state,
                          drafts: {
                            ...state.drafts,
                            [`${mission.id}/${task.id}`]: value,
                          },
                        })
                      }
                      onSubmit={submit}
                    />
                    {feedback && !feedback.correct && (
                      <p className="fdn-error" role="alert">
                        {feedback.text}
                      </p>
                    )}
                    <button className="fdn-hint" onClick={() => setHint(!hint)}>
                      {say("A small hint", "تلميح صغير")}
                    </button>
                  </>
                ) : (
                  <div className="fdn-mission-done">
                    <CheckCircle2 />
                    <h2>{say("Mission complete!", "المهمة اكتملت!")}</h2>
                    <p>
                      {say(
                        "You learned by making the company’s story visible.",
                        "اتعلمت وأنت بتوضح قصة الشركة المالية.",
                      )}
                    </p>
                    <strong>★★★ · +{mission.xp} XP</strong>
                    {ready && !completed ? (
                      <button className="fdn-primary" onClick={finish}>
                        {mission.id === "mizan-boss"
                          ? say("Unlock Mizan Trading", "افتح Mizan Trading")
                          : say(
                              "Collect reward · next mission",
                              "استلم المكافأة · المهمة التالية",
                            )}
                        <Arrow />
                      </button>
                    ) : (
                      <button
                        className="fdn-primary"
                        onClick={() =>
                          setScreen(
                            mission.id === "mizan-boss" ? "result" : "map",
                          )
                        }
                      >
                        {say("Back to your journey", "ارجع لرحلتك")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {mission.mechanic === "boss" &&
              done.some((id) => id.endsWith(":journal")) && (
                <FoundationBooks locale={locale} state={state} />
              )}
          </section>
        )}
        {state.storageWarning && (
          <p role="alert" className="fdn-storage-warning">
            {say(
              "Local storage is unavailable. Keep this tab open; progress is temporary.",
              "التخزين المحلي غير متاح. اترك الصفحة مفتوحة؛ التقدم مؤقت.",
            )}
          </p>
        )}
        <footer className="fdn-footer">
          {say(
            "Local-first foundation practice · No backend · No professional evidence",
            "تدريب أساسيات محفوظ محليًا · بلا خادم · بلا أدلة مهنية",
          )}
        </footer>
      </div>
    </main>
  );
}
