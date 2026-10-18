"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileDown, FileText, Minus, Plus, Printer, RefreshCw } from "lucide-react";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { cloudUser, requestJSON } from "@/lib/cloud/runtime";
import { roleCatalog, roleIds } from "@/lib/career/catalog";
import { buildCv } from "@/lib/career/cv";
import { compactCv, blocksText, paginateCv, type CompactCv, type CvBlock } from "@/lib/career/compact-cv";
import { evaluateAtsCv, scoreCvReadiness, type AtsCvCheck, type CvReadiness } from "@/lib/career/ats";
import { BrowserCvVersionRepository } from "@/lib/career/cv-history";
import { ProfilePhoto } from "./profile-photo";
import type { CareerProfile, CvDocument, CvPreferences, RoleId, SkillEvidence, SkillResult } from "@/lib/career/model";
import type { Locale } from "@/types";

type Snapshot = { profile: CareerProfile; cv: CvDocument; compact: CompactCv; readiness: CvReadiness; fingerprint?: string };
type Format = "pdf" | "docx" | "txt";
const arabicDimension: Record<CvReadiness["dimensions"][number]["id"], string> = {
  format: "تنسيق قابل للقراءة",
  contact: "بيانات التواصل",
  english: "اكتمال المحتوى الإنجليزي",
  summary: "الملخص المهني",
  education: "التعليم",
  skills: "مهارات مدعومة بأدلة",
  "practical-work": "خبرة فعلية أو محاكاة واضحة",
  learning: "تعلم محفوظ ذو صلة",
};
const atsLabels: Record<AtsCvCheck["id"], { en: string; ar: string; fixEn: string; fixAr: string }> = {
  "single-column": { en: "Single reading column", ar: "هيكل أحادي العمود", fixEn: "Use the platform's standard CV export.", fixAr: "استخدم تصدير السيرة القياسي من المنصة." },
  "no-photo": { en: "No photo in ATS document", ar: "بدون صورة في نسخة ATS", fixEn: "Use the standard PDF or Word export.", fixAr: "استخدم تصدير PDF أو Word القياسي." },
  headings: { en: "Clear section headings", ar: "عناوين أقسام واضحة", fixEn: "Add a professional summary to the profile.", fixAr: "أضف ملخصًا مهنيًا إلى البروفايل." },
  "readable-text": { en: "Readable English text and contact", ar: "نص إنجليزي مقروء وبيانات تواصل", fixEn: "Add an English name and email; translate saved Arabic CV fields yourself.", fixAr: "أضف اسمًا وبريدًا بالإنجليزية، واكتب بنفسك مقابلات الحقول العربية." },
  "available-keywords": { en: "Keywords from supported skills", ar: "كلمات مفتاحية من مهارات مدعومة", fixEn: "Complete eligible practice to demonstrate relevant skills; a manually entered course is not skill evidence.", fixAr: "أكمل تدريبًا مؤهلًا لإظهار مهارات ذات صلة؛ الكورس المُدخل يدويًا ليس دليل مهارة." },
  "simple-format": { en: "Simple system-friendly formatting", ar: "تنسيق بسيط للأنظمة", fixEn: "Remove unusual markup or duplicate sections from saved content.", fixAr: "احذف التنسيق غير المعتاد أو الأقسام المكررة من البيانات المحفوظة." },
};

export function CvBlockView({ block }: { block: CvBlock }) {
  if (block.header)
    return <header><h1>{block.lines[0]}</h1><p>{block.lines[1]}</p><address>{block.lines[2]}</address></header>;
  return <section>{block.heading && <h2>{block.heading}</h2>}{block.lines.map((line, index) => <p key={index}>{line}</p>)}</section>;
}

export function CvView({ locale, profile, passport, evidence, prefs, updatePrefs }: {
  locale: Locale;
  profile: CareerProfile;
  passport: SkillResult[];
  evidence: SkillEvidence[];
  prefs: CvPreferences;
  updatePrefs: (p: Partial<CvPreferences>) => void;
}) {
  const owner = useCloudIdentity()?.user.id;
  const say = (en: string, ar: string) => locale === "ar" ? ar : en;
  const [saved, setSaved] = useState<{ owner: string; role: RoleId; data: Snapshot } | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState(false);
  const [layout, setLayout] = useState<{ key: string; pages: CvBlock[][]; omitted: number } | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  // Fit the physical A4 sheet on first display; manual zoom may then scroll.
  const [zoom, setZoom] = useState<number | null>(null);
  const [fitZoom, setFitZoom] = useState(70);
  const [busy, setBusy] = useState<Format | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const measure = useRef<HTMLDivElement>(null);
  const previewScroll = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const local = useMemo<Snapshot>(() => {
    const cv = buildCv(profile, passport, evidence, prefs.targetRoleId);
    const compact = compactCv(profile, cv);
    return { profile, cv, compact, readiness: scoreCvReadiness(profile, cv, compact) };
  }, [profile, passport, evidence, prefs.targetRoleId]);

  useEffect(() => {
    let alive = true;
    setError(false);
    setDownloadError("");
    setSaved(null);
    if (owner) void requestJSON<{ data: Snapshot } | null>(`me/cv?role=${encodeURIComponent(prefs.targetRoleId)}`)
      .then((result) => {
        if (!result?.data?.compact?.blocks || !result.data.readiness) throw new Error("CV_UNAVAILABLE");
        if (alive && cloudUser() === owner) setSaved({ owner, role: prefs.targetRoleId, data: result.data });
      })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [owner, prefs.targetRoleId, refresh]);
  useEffect(() => {
    const reload = () => setRefresh((value) => value + 1);
    const synced = (event: Event) => { if ((event as CustomEvent).detail === "saved") reload(); };
    window.addEventListener("focus", reload);
    window.addEventListener("app-sync-status", synced);
    return () => { window.removeEventListener("focus", reload); window.removeEventListener("app-sync-status", synced); };
  }, []);

  const data = owner ? saved?.owner === owner && saved.role === prefs.targetRoleId ? saved.data : null : local;
  const ats = data ? evaluateAtsCv(data.compact) : null;
  const key = JSON.stringify(data?.compact.blocks ?? []);
  useEffect(() => {
    let alive = true;
    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!alive || !measure.current || !data) return;
      const nodes = Array.from(measure.current.children) as HTMLElement[];
      const result = paginateCv(data.compact.blocks, nodes.map((node) => node.getBoundingClientRect().height), (265 * 96) / 25.4);
      setLayout({ key, ...result });
      setPageIndex(0);
    });
    return () => { alive = false; };
  }, [key, data]);
  const ready = layout?.key === key;
  const pages = ready ? layout.pages : [];
  useEffect(() => {
    const container = previewScroll.current;
    if (!ready || !container) return;
    const updateFit = () => {
      const style = getComputedStyle(container);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      // CSS A4 width: 210 mm at 96 px/in. Leave breathing room for borders.
      const pageWidth = (210 * 96) / 25.4;
      const available = container.clientWidth - padding - 4;
      setFitZoom(Math.max(20, Math.min(100, Math.floor((available / pageWidth) * 100))));
    };
    updateFit();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateFit);
      return () => window.removeEventListener("resize", updateFit);
    }
    const observer = new ResizeObserver(updateFit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [ready]);
  const displayZoom = zoom ?? fitZoom;
  const text = blocksText(pages.flat());
  useEffect(() => {
    // Signed-in CV history is owned by the server, not global browser storage.
    if (!owner && data && ready) new BrowserCvVersionRepository().save(data.cv, text);
  }, [owner, data, ready, text]);
  const needsEnglish = Boolean(data && (data.compact.needsEnglish || /[\u0600-\u06ff]/u.test(data.compact.plainText)));
  // Never offer a server download containing blocks that this browser omitted
  // from the two-page preview. Normal compact selection is shared by both.
  const exportReady = Boolean(ready && pages.length && layout?.omitted === 0 && data?.profile.fullName.trim() && data?.profile.email.trim() && !needsEnglish && !error);
  const personalHref = `/${locale}/student-profile?next=${encodeURIComponent(`/${locale}/career-profile/cv`)}`;

  async function download(format: Format) {
    if (!exportReady || busy) return;
    setBusy(format);
    setDownloadError("");
    try {
      let blob: Blob;
      let filename = `accounting-ats-cv.${format}`;
      if (owner) {
        const response = await fetch(`/api/v1/me/cv/export?format=${format}&role=${encodeURIComponent(prefs.targetRoleId)}`, {
          credentials: "same-origin",
          cache: "no-store",
          headers: { "X-Account-Context": owner, ...(data?.fingerprint ? { "X-CV-Version": data.fingerprint } : {}) },
        });
        if (!response.ok || cloudUser() !== owner) throw new Error("EXPORT_FAILED");
        blob = await response.blob();
        if (cloudUser() !== owner) throw new Error("ACCOUNT_CHANGED");
        filename = response.headers.get("content-disposition")?.match(/filename="([a-z0-9-]+\.(?:pdf|docx|txt))"/i)?.[1] ?? filename;
      } else {
        if (format !== "txt") throw new Error("ACCOUNT_REQUIRED");
        blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      setDownloadError(say("Download failed. Refresh the saved profile and retry.", "تعذّر التنزيل. حدّث بيانات البروفايل المحفوظة وحاول ثانية."));
    } finally { setBusy(null); }
  }
  useEffect(() => {
    if (!owner || !exportReady || busy) return;
    const url = new URL(window.location.href);
    const requested = url.searchParams.get("download");
    if (requested !== "pdf" && requested !== "docx") return;
    url.searchParams.delete("download");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    void download(requested);
    // The URL parameter is consumed once; later refreshes cannot re-download.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, exportReady, busy]);
  function selectPage(index: number) {
    const next = Math.min(Math.max(index, 0), pages.length - 1);
    setPageIndex(next);
    pageRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return <main className="career-shell cv-shell compact-cv-shell ats-studio" dir={locale === "ar" ? "rtl" : "ltr"}>
    <section className="cv-controls ats-studio-intro">
      <div><small>ENGLISH CV · ATS-FRIENDLY FORMAT</small><h1>{say("Your connected professional CV", "سيرتك المهنية المرتبطة ببروفايلك")}</h1>
        <p>{say("Saved profile details, courses, certificates and accepted practice feed this CV automatically. Readiness is our transparent checklist, not an employer ATS score.", "بياناتك والكورسات والشهادات والتدريب المقبول تغذي السيرة تلقائيًا. الجاهزية قائمة فحص واضحة، وليست درجة من نظام توظيف.")}</p>
        {ready && <p role="status">{pages.length} {say("A4 pages", "صفحة A4")}{data!.compact.omitted + layout.omitted > 0 && ` · ${data!.compact.omitted + layout.omitted} ${say("saved records are outside this concise CV", "سجل محفوظ خارج السيرة المختصرة")}`}</p>}
      </div>
      <label>{say("Target accounting role", "الدور المحاسبي المستهدف")}<select value={prefs.targetRoleId} onChange={(event) => updatePrefs({ targetRoleId: event.target.value as RoleId })}>{roleIds.map((role) => <option key={role} value={role}>{roleCatalog[role].label[locale]}</option>)}</select></label>
    </section>
    {needsEnglish && <p className="ats-studio-warning" role="note">{say("Some records need English names or titles. Edit them; no translation is invented.", "بعض البيانات تحتاج أسماء أو عناوين إنجليزية. عدّلها؛ مش هنخترع ترجمة.")} <Link href={personalHref}>{say("Edit CV details", "تعديل بيانات السيرة")}</Link></p>}
    {ready && layout.omitted > 0 && <p className="ats-studio-warning" role="alert">{say("The two-page preview cannot fit every selected CV item. Downloads are paused until you shorten long profile entries and refresh.", "المعاينة من صفحتين مش قادرة تعرض كل العناصر المختارة. التنزيل متوقف لحد ما تختصر البيانات الطويلة وتحدّث السيرة.")} <Link href={personalHref}>{say("Edit profile", "تعديل البروفايل")}</Link></p>}
    {error && <p className="ats-studio-warning" role="alert">{say("Could not confirm the latest saved CV. Downloads are paused until refresh succeeds.", "تعذّر التأكد من آخر نسخة محفوظة. التنزيل متوقف لحد ما ينجح التحديث.")}</p>}
    {!data ? <section className="ats-studio-empty" role="status"><h2>{error ? say("Saved CV unavailable", "السيرة المحفوظة غير متاحة الآن") : say("Loading saved CV…", "جارٍ تحميل السيرة المحفوظة…")}</h2><p>{say("No sample achievements are shown.", "لا نعرض إنجازات تجريبية.")}</p><Link href={personalHref}>{say("Complete profile", "أكمل البروفايل")}</Link></section> : <>
      <div ref={measure} className="cv-measure cv-typeset" aria-hidden="true">{data.compact.blocks.map((block) => <CvBlockView key={block.id} block={block} />)}</div>
      <div className="ats-studio-grid">
        <aside className="ats-studio-profile">
          <div className="ats-studio-photo"><ProfilePhoto locale={locale} name={data.profile.fullName} /></div>
          <small>{say("Professional profile", "البروفايل المهني")}</small>
          <h2>{data.profile.fullName || say("Name not added", "لم تضف الاسم")}</h2>
          <p>{roleCatalog[data.cv.targetRoleId].label[locale]}</p>
          <p>{[data.profile.location, data.profile.country].filter(Boolean).join(" · ")}</p>
          <dl>
            <div><dt>{say("Supported skills", "مهارات مدعومة")}</dt><dd>{data.cv.skills.length}</dd></div>
            <div><dt>{say("Simulation outcomes in CV", "نتائج محاكاة في السيرة")}</dt><dd>{data.compact.blocks.filter((b) => b.id.startsWith("simulation-")).length}</dd></div>
            <div><dt>{say("Courses in CV", "كورسات في السيرة")}</dt><dd>{data.compact.blocks.filter((b) => b.id.startsWith("course-")).length}</dd></div>
          </dl>
          <p className="ats-studio-disclaimer">{say("Training simulations are not employment. Your photo stays on the website, not in the CV.", "المحاكاة التدريبية ليست خبرة عمل. صورتك تظهر هنا فقط، مش داخل الـCV.")}</p>
          <Link href={personalHref}>{say("Edit personal details", "تعديل البيانات الشخصية")}</Link>
          <Link href={`/${locale}/career-profile#courses`}>{say("Manage courses and certificates", "إدارة الكورسات والشهادات")}</Link>
          <Link href={`/${locale}/career-profile/skills`}>{say("View Skill Passport", "عرض جواز المهارات")}</Link>
        </aside>
        <section className="ats-studio-preview" aria-label={say("CV preview", "معاينة السيرة")}>
          <div className="ats-studio-preview-toolbar cv-controls">
            <div><small>ATS CV · ENGLISH · A4</small><h2>{say("Document preview", "معاينة المستند")}</h2></div>
            <div className="ats-studio-page-controls"><button type="button" disabled={pageIndex === 0} onClick={() => selectPage(pageIndex - 1)} aria-label={say("Previous page", "الصفحة السابقة")}>−</button><span>{ready ? `${pageIndex + 1} / ${pages.length}` : "…"}</span><button type="button" disabled={pageIndex >= pages.length - 1} onClick={() => selectPage(pageIndex + 1)} aria-label={say("Next page", "الصفحة التالية")}>+</button></div>
            <div className="ats-studio-zoom-controls"><button type="button" disabled={displayZoom <= 20} onClick={() => setZoom(Math.max(20, displayZoom - 10))} aria-label={say("Zoom out", "تصغير")}><Minus size={16} /></button><output>{displayZoom}%</output><button type="button" disabled={displayZoom >= 110} onClick={() => setZoom(Math.min(110, displayZoom + 10))} aria-label={say("Zoom in", "تكبير")}><Plus size={16} /></button></div>
          </div>
          {ready && <div ref={previewScroll} className="ats-studio-preview-scroll" dir="ltr"><article className="professional-cv cv-typeset" lang="en" dir="ltr" data-pages={pages.length} style={{ "--ats-zoom": displayZoom / 100 } as React.CSSProperties}>{pages.map((page, index) => <div className="cv-page" key={index} ref={(node) => { pageRefs.current[index] = node; }}>{page.map((block) => <CvBlockView key={block.id} block={block} />)}<footer>Page {index + 1} of {pages.length}</footer></div>)}</article></div>}
        </section>
        <aside className="ats-studio-readiness">
          <small>{say("CV READINESS · NOT HIRING ODDS", "جاهزية السيرة · ليست فرصة توظيف")}</small>
          <h2>{say("CV readiness", "جاهزية السيرة")}</h2>
          <div className="ats-studio-score" role="status" style={{ "--ats-score": data.readiness.score } as React.CSSProperties}><strong>{data.readiness.score}%</strong><meter min={0} max={100} value={data.readiness.score} /></div>
          <p>{say("A deterministic checklist of document structure and factual completeness. No external ATS or employer has scored it.", "قائمة فحص ثابتة للتنسيق واكتمال المحتوى الحقيقي. لم يقيّمها نظام توظيف أو شركة خارجية.")}</p>
          <p className="ats-studio-format-status">{data.readiness.formatChecksPassed}/{data.readiness.formatChecksTotal} {say("format checks passed", "فحوص تنسيق مستوفاة")}</p>
          {ats && <section className="ats-studio-defined-checks" aria-label={say("Defined ATS checks", "فحوص ATS المحددة")}>
            <h3>{say("Defined ATS checks", "فحوص ATS المحددة")} · {ats.score}% ({ats.passed}/{ats.total})</h3>
            <p>{say("Platform checks only. Not a universal ATS compatibility or hiring score.", "فحوص المنصة فقط؛ ليست درجة توافق شاملة مع ATS أو فرصة توظيف.")}</p>
            <ul>{ats.checks.map((check) => <li key={check.id}><strong>{check.passed ? "✓" : "×"} {say(atsLabels[check.id].en, atsLabels[check.id].ar)}</strong>{!check.passed && <span>{say(atsLabels[check.id].fixEn, atsLabels[check.id].fixAr)}</span>}</li>)}</ul>
          </section>}
          <div className="ats-studio-breakdown">{data.readiness.dimensions.map((dimension) => <div key={dimension.id}><div><b>{locale === "ar" ? arabicDimension[dimension.id] : dimension.label}</b><span>{dimension.points}/{dimension.max}</span></div><meter min={0} max={dimension.max} value={dimension.points} />{dimension.points < dimension.max && dimension.fixHref && <Link href={`/${locale}${dimension.fixHref}`}>{say("Improve this", "حسّن النقطة دي")}</Link>}</div>)}</div>
          <div className="ats-studio-download cv-controls">
            <button type="button" disabled={!owner || !exportReady || Boolean(busy)} onClick={() => void download("pdf")}><FileDown size={18} />{busy === "pdf" ? say("Preparing…", "جارٍ التجهيز…") : say("Download PDF", "تحميل PDF")}</button>
            <button type="button" disabled={!owner || !exportReady || Boolean(busy)} onClick={() => void download("docx")}><FileText size={18} />{busy === "docx" ? say("Preparing…", "جارٍ التجهيز…") : say("Download Word", "تحميل Word")}</button>
            <button type="button" disabled={!exportReady || Boolean(busy)} onClick={() => void download("txt")}><FileText size={16} />{say("Download plain text", "تحميل نسخة نصية")}</button>
            <button type="button" disabled={!exportReady} onClick={() => window.print()}><Printer size={16} />{say("Print / Save as PDF", "طباعة / حفظ كـPDF")}</button>
            {owner && <button type="button" onClick={() => { setSaved(null); setRefresh((value) => value + 1); }}><RefreshCw size={16} />{say("Refresh saved sources", "تحديث البيانات المحفوظة")}</button>}
          </div>
          {downloadError && <p role="alert">{downloadError}</p>}
          {!owner && <p>{say("Sign in to download private PDF and Word files.", "سجّل دخولك لتنزيل PDF وWord من بيانات حسابك.")}</p>}
        </aside>
      </div>
    </>}
  </main>;
}
