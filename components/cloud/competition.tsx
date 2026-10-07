"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useCloudIdentity } from "./session-boundary";
import { requestJSON, CloudFailure } from "@/lib/cloud/runtime";
import type { Locale } from "@/types";
type Identity = { displayName: string; handle: string; avatar: string };
type Challenge = {
  id: string;
  version: number;
  league: string;
  title: Record<Locale, string>;
  context: Record<Locale, string>;
  documents: {
    id: string;
    title: Record<Locale, string>;
    summary: Record<Locale, string>;
  }[];
  accountOptions: string[];
};
type Match = {
  id: string;
  status: string;
  challenge: Challenge;
  players: {
    userId: string;
    profile: Identity;
    submitted: boolean;
    score: number | null;
  }[];
  winnerUserId: string | null;
  inspected: string[];
};
type Lobby = {
  challenge: Challenge;
  queueId: string | null;
  activeMatchId: string | null;
  practiceOnly: boolean;
  waiting: { id: string; profile: Identity }[];
  recent: { id: string; status: string }[];
};
type Standings = {
  rows: { profile: Identity; points: number; challenges: number }[];
};
export function CloudCompetition({ locale }: { locale: Locale }) {
  const identity = useCloudIdentity();
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    [lobby, setLobby] = useState<Lobby | null>(null),
    [match, setMatch] = useState<Match | null>(null),
    [standings, setStandings] = useState<Standings | null>(null),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  const load = useCallback(async () => {
    try {
      const l = await requestJSON<Lobby>("competition/lobby");
      setLobby(l);
      const visibleMatchId = l.activeMatchId ?? l.recent[0]?.id;
      const [m, s] = await Promise.all([
        visibleMatchId
          ? requestJSON<Match>("competition/matches/" + visibleMatchId)
          : Promise.resolve(null),
        requestJSON<Standings>(
          "competition/leaderboard?league=" + l.challenge.league,
        ),
      ]);
      if (m) setMatch(m);
      setStandings(s);
      setError("");
    } catch (e) {
      setError(
        e instanceof CloudFailure && e.status === 401
          ? ar
            ? "سجّل الدخول للوصول للمنافسة."
            : "Sign in to compete."
          : ar
            ? "الاتصال غير متاح. المنافسة الرسمية لا تعمل دون اتصال."
            : "Connection unavailable. Official competition requires the server.",
      );
    }
  }, [ar]);
  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      if (!document.hidden) void load();
    }, 20000);
    return () => clearInterval(interval);
  }, [load]);
  async function action(path: string, data: unknown) {
    if (pending) return;
    setPending(true);
    try {
      const result = await requestJSON<{ matchId?: string } & Match>(
        path,
        "POST",
        data,
      );
      if (result.matchId)
        setMatch(
          await requestJSON<Match>("competition/matches/" + result.matchId),
        );
      else if (result.id) setMatch(result);
      await load();
    } catch {
      setError(
        say(
          "Action was not confirmed. Retry without changing the answer.",
          "لم يتم تأكيد العملية. حاول ثانية دون تغيير الإجابة.",
        ),
      );
    } finally {
      setPending(false);
    }
  }
  const challenge = match?.challenge ?? lobby?.challenge;
  return (
    <main className="cloud-page" dir={ar ? "rtl" : "ltr"}>
      <div className="cloud-dashboard">
        <header>
          <Link href={`/${locale}/game`}>{say("Game hub", "مركز اللعب")}</Link>
          <h1>
            {say("Real-account competition", "المنافسة بين حسابات حقيقية")}
          </h1>
          <p>
            {say(
              "Server-scored game points — never Verified professional evidence. Polls every 20 seconds while visible.",
              "نقاط لعب يقيّمها السيرفر — وليست مهارات مهنية موثقة. تحديث كل 20 ثانية أثناء عرض الصفحة.",
            )}
          </p>
        </header>
        {error && (
          <div className="cloud-warning" role="alert">
            {error}
            <button onClick={() => void load()}>
              {say("Retry", "حاول ثانية")}
            </button>
          </div>
        )}
        {!lobby && !error && (
          <p role="status">{say("Loading lobby…", "جارٍ تحميل الساحة…")}</p>
        )}
        {challenge && (
          <section className="cloud-card">
            <small>
              {say("MY LEAGUE", "دوري")}: {challenge.league}
            </small>
            <h2>{challenge.title[locale]}</h2>
            <p>{challenge.context[locale]}</p>
            {!match && (
              <button
                disabled={pending || !!lobby?.queueId || lobby?.practiceOnly}
                onClick={() => void action("competition/matchmake", {})}
              >
                {lobby?.practiceOnly
                  ? say(
                      "Official attempt recorded — practise locally",
                      "تم حفظ المحاولة الرسمية — تدرب محليًا",
                    )
                  : lobby?.queueId
                    ? say("Waiting for opponent…", "في انتظار منافس…")
                    : say("Find opponent", "ابحث عن منافس")}
              </button>
            )}
            {lobby?.practiceOnly && (
              <p>
                <Link href={`/${locale}/game`}>
                  {say(
                    "Practice simulations — no extra official points",
                    "محاكاة للتدريب — دون نقاط رسمية إضافية",
                  )}
                </Link>
              </p>
            )}
            {match && (
              <>
                <div className="cloud-versus">
                  {match.players.map((player, i) => (
                    <div
                      key={player.userId}
                      style={i ? { gridColumn: 3 } : { gridColumn: 1 }}
                      className="cloud-player"
                    >
                      <b>{player.profile.displayName}</b>
                      <i
                        className={`cloud-avatar cloud-avatar-${player.profile.avatar}`}
                        aria-label={say("Avatar", "الصورة الرمزية")}
                      >
                        {player.profile.displayName.slice(0, 1)}
                      </i>
                      <p dir="ltr">@{player.profile.handle}</p>
                      <span>
                        {player.submitted
                          ? say("Finished", "انتهى")
                          : say("Playing", "يلعب")}
                      </span>
                      {player.score !== null && (
                        <strong> · {player.score}</strong>
                      )}
                    </div>
                  ))}
                  <b style={{ gridColumn: 2, gridRow: 1 }}>VS</b>
                </div>
                <p role="status">
                  {match.status === "COMPLETED"
                    ? match.winnerUserId
                      ? say("Winner: ", "الفائز: ") +
                        match.players.find(
                          (p) => p.userId === match.winnerUserId,
                        )?.profile.displayName
                      : say("Draw", "تعادل")
                    : say(
                        "Scores stay hidden until both finish.",
                        "الدرجات مخفية حتى ينهي الطرفان.",
                      )}
                </p>
                {match.status === "PLAYING" &&
                  !match.players.find((p) => p.userId === identity?.user.id)
                    ?.submitted && (
                    <>
                      <div className="cloud-documents">
                        {challenge.documents.map((doc) => (
                          <article className="cloud-card" key={doc.id}>
                            <h3>{doc.title[locale]}</h3>
                            <p>{doc.summary[locale]}</p>
                            <button
                              disabled={
                                pending || match.inspected.includes(doc.id)
                              }
                              onClick={() =>
                                void action(
                                  "competition/matches/" + match.id + "/submit",
                                  { kind: "inspect", documentId: doc.id },
                                )
                              }
                            >
                              {match.inspected.includes(doc.id)
                                ? say("Inspected", "تم الفحص")
                                : say("Inspect evidence", "افحص المستند")}
                            </button>
                          </article>
                        ))}
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          void action(
                            "competition/matches/" + match.id + "/submit",
                            {
                              kind: "submit",
                              action: String(f.get("action")),
                              debit: String(f.get("debit")),
                              credit: String(f.get("credit")),
                              amount: Number(f.get("amount")),
                            },
                          );
                        }}
                      >
                        <label>
                          {say("Decision", "القرار")}
                          <select name="action">
                            <option value="post">{say("Post", "تسجيل")}</option>
                            <option value="hold">{say("Hold", "تعليق")}</option>
                            <option value="investigate">
                              {say("Investigate", "تحقيق")}
                            </option>
                          </select>
                        </label>
                        {["debit", "credit"].map((side) => (
                          <label key={side}>
                            {side === "debit"
                              ? say("Debit", "مدين")
                              : say("Credit", "دائن")}
                            <select name={side} required>
                              <option value="">—</option>
                              {challenge.accountOptions.map((a) => (
                                <option key={a}>{a}</option>
                              ))}
                            </select>
                          </label>
                        ))}
                        <label>
                          {say("Amount EGP", "المبلغ جنيه")}
                          <input
                            name="amount"
                            type="number"
                            required
                            min={0}
                            max={1e9}
                          />
                        </label>
                        <button disabled={pending}>
                          {say(
                            "Seal my official answer",
                            "إرسال إجابتي الرسمية",
                          )}
                        </button>
                      </form>
                    </>
                  )}
              </>
            )}
          </section>
        )}
        <section className="cloud-card">
          <h2>{say("Waiting players", "اللاعبون المنتظرون")}</h2>
          {lobby?.waiting.length ? (
            lobby.waiting.map((p) => (
              <p key={p.id}>
                {p.profile.displayName} · @{p.profile.handle}
              </p>
            ))
          ) : (
            <p>{say("No waiting players.", "لا يوجد لاعبون منتظرون.")}</p>
          )}
        </section>
        <section className="cloud-card">
          <h2>{say("Weekly standings", "الترتيب الأسبوعي")}</h2>
          <ol>
            {standings?.rows.map((row) => (
              <li key={row.profile.handle}>
                {row.profile.displayName} · {row.points}{" "}
                {say("official points", "نقطة رسمية")}
              </li>
            ))}
          </ol>
          {!standings?.rows.length && (
            <p>
              {say(
                "No recorded official results yet.",
                "لا توجد نتائج رسمية محفوظة بعد.",
              )}
            </p>
          )}
        </section>
        <section className="cloud-card">
          <h2>{say("Recent matches", "آخر المباريات")}</h2>
          {lobby?.recent.map((m) => (
            <button
              key={m.id}
              onClick={async () => {
                try {
                  setMatch(
                    await requestJSON<Match>("competition/matches/" + m.id),
                  );
                } catch {
                  setError(say("Match unavailable.", "المباراة غير متاحة."));
                }
              }}
            >
              {m.status} · {m.id.slice(0, 8)}
            </button>
          ))}
          {!lobby?.recent.length && (
            <p>{say("No matches yet.", "لا مباريات بعد.")}</p>
          )}
        </section>
      </div>
    </main>
  );
}
