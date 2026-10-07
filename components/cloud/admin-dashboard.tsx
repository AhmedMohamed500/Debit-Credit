"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { requestJSON, CloudFailure } from "@/lib/cloud/runtime";
import type { Locale } from "@/types";
type Row = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  profile: { displayName: string; persona: string | null } | null;
  activity: { lastActiveAt: string } | null;
  competition: { activeMatchId: string | null } | null;
  accounts: { providerId: string }[];
  queue: {id:string}[];
};
type Metrics = {
  total: number;
  newToday: number;
  newWeek: number;
  active24h: number;
  activeNow: number;
  google: number;
  email: number;
  waiting: number;
  playing: number;
  completed: number;
  asOf: string;
};
export function AdminDashboard({ locale }: { locale: Locale }) {
  const [competition, setCompetition] = useState<{
    matches: {
      id: string;
      status: string;
      league: string;
      winnerUserId: string | null;
      players: {
        userId: string;
        submittedAt: string | null;
        user: { profile: { displayName: string } };
      }[];
    }[];
    waiting: {
      id: string;
      league: string;
      user: { profile: { displayName: string } };
    }[];
  } | null>(null);
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    [metrics, setMetrics] = useState<Metrics | null>(null),
    [rows, setRows] = useState<Row[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [search, setSearch] = useState(""),
    [provider, setProvider] = useState(""),
    [persona, setPersona] = useState(""),
    [active, setActive] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const load = useCallback(
    async (
      next?: string,
      filters = { search: "", provider: "", persona: "", active: "" },
    ) => {
      setLoading(true);
      setError("");
      try {
        const q = new URLSearchParams({ search: filters.search, take: "20" });
        if (next) q.set("cursor", next);
        if (filters.provider) q.set("provider", filters.provider);
        if (filters.persona) q.set("persona", filters.persona);
        if (filters.active) q.set("active", filters.active);
        const [m, result, online] = await Promise.all([
          requestJSON<Metrics>("admin/overview"),
          requestJSON<{ rows: Row[]; nextCursor: string | null }>(
            "admin/users?" + q,
          ),
          requestJSON<NonNullable<typeof competition>>("admin/competition"),
        ]);
        setMetrics(m);
        setCompetition(online);
        setRows(result.rows);
        setCursor(result.nextCursor);
      } catch (e) {
        setError(
          e instanceof CloudFailure && [401, 403].includes(e.status)
            ? ar
              ? "غير مصرح لك."
              : "You are not authorized."
            : ar
              ? "قاعدة البيانات أو الاتصال غير متاح. حاول ثانية."
              : "Database unavailable or offline. Retry.",
        );
      } finally {
        setLoading(false);
      }
    },
    [ar],
  );
  useEffect(() => {
    void load();
  }, [load]); // Filters are applied explicitly; no request on every keystroke.
  const labels = [
    ["total", "Total users", "إجمالي المستخدمين"],
    ["newToday", "Registered today (UTC)", "المسجلون اليوم (UTC)"],
    ["newWeek", "Last 7 days", "آخر 7 أيام"],
    ["active24h", "Active in 24 hours", "نشطون خلال 24 ساعة"],
    ["activeNow", "Active in last 2 minutes", "نشطون آخر دقيقتين"],
    ["google", "Google accounts", "حسابات Google"],
    ["email", "Email accounts", "حسابات البريد"],
    ["waiting", "Waiting players", "لاعبون منتظرون"],
    ["playing", "Playing matches", "مباريات جارية"],
    ["completed", "Completed matches", "مباريات مكتملة"],
  ] as const;
  return (
    <main className="cloud-page" dir={ar ? "rtl" : "ltr"}>
      <div className="cloud-dashboard">
        <header>
          <Link href={`/${locale}/account`}>{say("My account", "حسابي")}</Link>
          <h1>{say("Owner dashboard", "لوحة الإدارة")}</h1>
          <p>
            {say(
              "Real database values. Activity is a recent heartbeat, not live WebSocket presence.",
              "قيم فعلية من قاعدة البيانات. النشاط مبني على آخر اتصال، وليس حضور WebSocket لحظيًا.",
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
        {loading && !metrics && (
          <p role="status">{say("Loading…", "جارٍ التحميل…")}</p>
        )}
        {metrics && (
          <section className="cloud-metrics">
            {labels.map(([key, en, a]) => (
              <article className="cloud-metric" key={key}>
                <span>{say(en, a)}</span>
                <b>{metrics[key]}</b>
              </article>
            ))}
          </section>
        )}
        <section className="cloud-card">
          <h2>
            {say(
              "Registered accounts — admin only",
              "الحسابات المسجلة — للإدارة فقط",
            )}
          </h2>
          <form
            className="cloud-filter-row"
            onSubmit={(e) => {
              e.preventDefault();
              void load(undefined, { search, provider, persona, active });
            }}
          >
            <input
              aria-label={say("Search name or email", "بحث بالاسم أو البريد")}
              placeholder={say("Name or email", "الاسم أو البريد")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={100}
            />
            <select
              aria-label={say("Provider", "مقدم الدخول")}
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="">{say("All providers", "الكل")}</option>
              <option value="google">Google</option>
              <option value="credential">Email</option>
            </select>
            <select
              aria-label={say("Persona", "المسار")}
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            >
              <option value="">{say("All paths", "كل المسارات")}</option>
              {[
                "student",
                "graduate",
                "working-accountant",
                "experienced-accountant",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select
              aria-label={say("Activity", "النشاط")}
              value={active}
              onChange={(e) => setActive(e.target.value)}
            >
              <option value="">{say("All activity", "كل الحالات")}</option>
              <option value="now">{say("Active now", "نشط الآن")}</option>
              <option value="24h">{say("Last 24 hours", "آخر 24 ساعة")}</option>
              <option value="inactive">{say("Inactive", "غير نشط")}</option>
            </select>
            <button disabled={loading}>{say("Search", "بحث")}</button>
          </form>
          <div className="cloud-table-wrap">
            <table className="cloud-table">
              <thead>
                <tr>
                  {[
                    say("Name", "الاسم"),
                    say("Private email", "البريد الخاص"),
                    say("Provider", "مقدم الدخول"),
                    say("Persona", "المسار"),
                    say("Joined", "التسجيل"),
                    say("Last active", "آخر نشاط"),
                    say("Competition", "المنافسة"),
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.profile?.displayName ?? row.name}</td>
                    <td dir="ltr">{row.email}</td>
                    <td>{row.accounts.map((x) => x.providerId).join(", ")}</td>
                    <td>{row.profile?.persona ?? "—"}</td>
                    <td>
                      {new Date(row.createdAt).toLocaleDateString(locale)}
                    </td>
                    <td>
                      {row.activity
                        ? new Date(row.activity.lastActiveAt).toLocaleString(
                            locale,
                          )
                        : "—"}
                    </td>
                    <td>
                      {row.competition?.activeMatchId
                        ? say("Playing", "يلعب")
                        : row.queue.length ? say("Waiting", "منتظر") : say("No active match", "لا مباراة جارية")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && !rows.length && (
            <p>
              {say(
                "No accounts match these filters.",
                "لا حسابات تطابق البحث.",
              )}
            </p>
          )}
          <div className="cloud-filter-row">
            <button
              disabled={loading}
              onClick={() =>
                void load(undefined, { search, provider, persona, active })
              }
            >
              {say("First page", "الصفحة الأولى")}
            </button>
            {cursor && (
              <button
                disabled={loading}
                onClick={() =>
                  void load(cursor, { search, provider, persona, active })
                }
              >
                {say("Next page", "التالي")}
              </button>
            )}
          </div>
        </section>
      </div>
      <section className="cloud-card cloud-dashboard">
        <h2>{say("Real-account competition", "منافسات الحسابات الحقيقية")}</h2>
        <p>
          {say(
            "Latest 50 matches; scores remain sealed until both finish.",
            "آخر 50 مباراة؛ تظل الدرجات مخفية حتى ينتهي الطرفان.",
          )}
        </p>
        {competition?.matches.map((m) => (
          <article key={m.id} className="cloud-metric">
            <b style={{ fontSize: 18 }}>
              {m.players.map((p) => p.user.profile.displayName).join(" VS ")}
            </b>
            <p>
              {m.league} · {m.status}
            </p>
            <p>
              {m.players
                .map(
                  (p) =>
                    p.user.profile.displayName +
                    ": " +
                    (p.submittedAt
                      ? say("Finished", "انتهى")
                      : say("Playing", "يلعب")),
                )
                .join(" · ")}
            </p>
            {m.status === "COMPLETED" && (
              <p>
                {m.winnerUserId
                  ? say("Winner: ", "الفائز: ") +
                    m.players.find((p) => p.userId === m.winnerUserId)?.user
                      .profile.displayName
                  : say("Tie", "تعادل")}
              </p>
            )}
          </article>
        ))}
        {!competition?.matches.length && (
          <p>{say("No matches yet.", "لا توجد مباريات بعد.")}</p>
        )}
        <h3>{say("Waiting players", "اللاعبون المنتظرون")}</h3>
        {competition?.waiting.map((q) => (
          <p key={q.id}>
            {q.user.profile.displayName} · {q.league}
          </p>
        ))}
        {!competition?.waiting.length && (
          <p>{say("No waiting players.", "لا يوجد لاعبون منتظرون.")}</p>
        )}
      </section>
    </main>
  );
}
