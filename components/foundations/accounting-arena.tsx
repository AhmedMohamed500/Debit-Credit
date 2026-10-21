"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Medal, ShieldCheck, Trophy } from "lucide-react";
import type { Locale } from "@/types";
import type { ExcelProgress } from "@/lib/excel-foundations/engine";

type Scope = "overall" | "stage" | "weekly";
type Entry = { rank: number; nickname: string; score: number; xp: number; completedStages: number; completedAt: string };
type Board = { scope: Scope; participants: number; entries: Entry[]; ownRank: number | null; privacy: string };
const copy = {
  ar: { title: "ساحة المحاسبة", description: "ترتيب قائم على إكمال التحدي النهائي والتحقق على الخادم. المشاركة اختيارية، ولا تظهر بياناتك الخاصة أو تقدمك للآخرين بدون موافقتك.", overall: "الترتيب العام", stage: "مرحلة Excel", weekly: "هذا الأسبوع", nickname: "اسم الظهور", optIn: "أوافق على عرض اسمي المختار ونتيجتي في لوحة الترتيب", save: "حفظ التفضيل", noResults: "لا يوجد مشاركون مؤهلون بعد. لا نعرض حسابات أو نتائج افتراضية.", login: "سجّل الدخول لعرض ترتيبك وإعداد الخصوصية.", qualification: "يتطلب الظهور إكمال تحدي Excel النهائي واختيار المشاركة.", own: "ترتيبك", rank: "الترتيب", player: "المشارك", score: "التقييم", xp: "نقاط التعلم", stageCount: "مراحل مكتملة", back: "العودة إلى Excel Foundations", noEmployment: "هذه إنجازات تدريبية داخل المنصة، وليست خبرة عمل أو اعتمادًا مهنيًا.", saved: "تم الحفظ", failure: "تعذر حفظ التفضيل. حاول لاحقًا." },
  en: { title: "Accounting Arena", description: "Server-verified final-challenge rankings. Participation is optional; no private account information or progress is shown to others without your consent.", overall: "Overall", stage: "Excel stage", weekly: "This week", nickname: "Display name", optIn: "I agree to show my chosen name and score on the leaderboard", save: "Save preference", noResults: "No eligible participants yet. We do not show fictional accounts or scores.", login: "Sign in to view your rank and privacy preference.", qualification: "Complete the final Excel challenge and opt in to appear.", own: "Your rank", rank: "Rank", player: "Participant", score: "Score", xp: "Learning XP", stageCount: "Stages complete", back: "Back to Excel Foundations", noEmployment: "These are in-platform training achievements, not work experience or professional accreditation.", saved: "Saved", failure: "Could not save preference. Try again later." },
};
export function AccountingArena({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [scope, setScope] = useState<Scope>("overall");
  const [board, setBoard] = useState<Board | null>(null);
  const [state, setState] = useState<{ data: ExcelProgress; revision: number } | null>(null);
  const [nickname, setNickname] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const [ownResponse, boardResponse] = await Promise.all([
        fetch("/api/v1/me/excel-foundations", { cache: "no-store" }),
        fetch(`/api/v1/competition/excel-foundations?scope=${scope}`, { cache: "no-store" }),
      ]);
      if (ownResponse.ok) {
        const own = await ownResponse.json() as { data: ExcelProgress; revision: number };
        setState(own); setNickname(own.data.nickname); setOptIn(own.data.publicOptIn);
      }
      if (boardResponse.ok) setBoard(await boardResponse.json() as Board);
    } catch { setMessage(t.failure); }
  }, [scope, t.failure]);
  useEffect(() => { void refresh(); }, [refresh]);
  const save = async () => {
    if (!state) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/v1/me/excel-foundations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commandId: crypto.randomUUID(), revision: state.revision, type: "privacy", publicOptIn: optIn, nickname }) });
      if (!response.ok) throw Error("save");
      setMessage(t.saved); await refresh();
    } catch { setMessage(t.failure); }
    finally { setBusy(false); }
  };
  return <main className="xf-shell" dir={locale === "ar" ? "rtl" : "ltr"}><div className="xf-arena-main"><div className="xf-arena-head"><Trophy size={34}/><h1>{t.title}</h1><p>{t.description}</p><Link className="xf-outline" href={`/${locale}/bootcamp/excel-foundations`} style={{ display: "inline-flex" }}><ArrowLeft size={17}/>{t.back}</Link></div><div className="xf-arena-layout"><section className="xf-arena-card"><div className="xf-arena-tabs">{(["overall", "stage", "weekly"] as Scope[]).map((item) => <button key={item} className={scope === item ? "active" : ""} onClick={() => setScope(item)}>{t[item]}</button>)}</div>{board?.entries.length ? <table><thead><tr><th>{t.rank}</th><th>{t.player}</th><th>{t.stageCount}</th><th>{t.xp}</th><th>{t.score}</th></tr></thead><tbody>{board.entries.map((entry, index) => <tr key={`${entry.nickname}-${index}`}><td><Medal size={16}/> {entry.rank}</td><td>{entry.nickname}</td><td>{entry.completedStages}</td><td>{entry.xp}</td><td>{entry.score}%</td></tr>)}</tbody></table> : <div className="xf-arena-empty"><Trophy size={32}/><p>{t.noResults}</p></div>}<p>{t.own}: {board?.ownRank ?? "—"}</p></section><aside className="xf-arena-card"><ShieldCheck size={24}/><h2>{locale === "ar" ? "خصوصية المشاركة" : "Participation privacy"}</h2><p>{state ? t.qualification : t.login}</p>{state && <><label>{t.nickname}<input maxLength={40} value={nickname} onChange={(event) => setNickname(event.target.value)}/></label><label><input type="checkbox" checked={optIn} onChange={(event) => setOptIn(event.target.checked)} style={{ width: "auto", marginInlineEnd: 8 }}/>{t.optIn}</label><button className="xf-primary" disabled={busy || (optIn && !nickname.trim())} onClick={() => void save()}>{t.save}</button></>}{message && <p role="status">{message}</p>}<hr/><small>{t.noEmployment}</small></aside></div></div></main>;
}
