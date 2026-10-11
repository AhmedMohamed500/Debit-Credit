"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Printer, FileText, RefreshCw } from "lucide-react";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { cloudUser, requestJSON } from "@/lib/cloud/runtime";
import { roleCatalog, roleIds } from "@/lib/career/catalog";
import { buildCv } from "@/lib/career/cv";
import {
  compactCv,
  blocksText,
  paginateCv,
  type CompactCv,
  type CvBlock,
} from "@/lib/career/compact-cv";
import { BrowserCvVersionRepository } from "@/lib/career/cv-history";
import type {
  CareerProfile,
  CvDocument,
  CvPreferences,
  RoleId,
  SkillEvidence,
  SkillResult,
} from "@/lib/career/model";
import type { Locale } from "@/types";

type Snapshot = { profile: CareerProfile; cv: CvDocument; compact: CompactCv };
function Block({ block }: { block: CvBlock }) {
  if (block.header)
    return (
      <header>
        <h1>{block.lines[0]}</h1>
        <p>{block.lines[1]}</p>
        <address>{block.lines[2]}</address>
      </header>
    );
  return (
    <section>
      {block.heading && <h2>{block.heading}</h2>}
      {block.lines.map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </section>
  );
}
export function CvView({
  locale,
  profile,
  passport,
  evidence,
  prefs,
  updatePrefs,
}: {
  locale: Locale;
  profile: CareerProfile;
  passport: SkillResult[];
  evidence: SkillEvidence[];
  prefs: CvPreferences;
  updatePrefs: (p: Partial<CvPreferences>) => void;
}) {
  const owner = useCloudIdentity()?.user.id;
  const say = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [saved, setSaved] = useState<{
    owner: string;
    role: RoleId;
    data: Snapshot;
  } | null>(null);
  const [error, setError] = useState(false),
    [refresh, setRefresh] = useState(0);
  const [layout, setLayout] = useState<{
    key: string;
    pages: CvBlock[][];
    omitted: number;
  } | null>(null);
  const measure = useRef<HTMLDivElement>(null);
  const local = useMemo(() => {
    const cv = buildCv(profile, passport, evidence, prefs.targetRoleId);
    return { profile, cv, compact: compactCv(profile, cv) };
  }, [profile, passport, evidence, prefs.targetRoleId]);
  useEffect(() => {
    let alive = true;
    setError(false);
    if (owner)
      void requestJSON<{ data: Snapshot } | null>(
        `me/cv?role=${encodeURIComponent(prefs.targetRoleId)}`,
      )
        .then((result) => {
          if (!result?.data?.compact?.blocks) throw new Error("CV_UNAVAILABLE");
          if (alive && cloudUser() === owner)
            setSaved({ owner, role: prefs.targetRoleId, data: result.data });
        })
        .catch(() => {
          if (alive) setError(true);
        });
    return () => {
      alive = false;
    };
  }, [owner, prefs.targetRoleId, refresh]);
  useEffect(() => {
    const reload = () => setRefresh((value) => value + 1);
    const synced = (event: Event) => {
      if ((event as CustomEvent).detail === "saved") reload();
    };
    window.addEventListener("focus", reload);
    window.addEventListener("app-sync-status", synced);
    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("app-sync-status", synced);
    };
  }, []);
  const data = owner
    ? saved?.owner === owner && saved.role === prefs.targetRoleId
      ? saved.data
      : null
    : local;
  const key = JSON.stringify(data?.compact.blocks ?? []);
  useEffect(() => {
    let alive = true;
    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!alive || !measure.current || !data) return;
      const elements = Array.from(measure.current.children) as HTMLElement[];
      // Reserve 8mm for the page counter and print rounding.
      const maxHeight = (265 * 96) / 25.4;
      const result = paginateCv(
        data.compact.blocks,
        elements.map((element) => element.getBoundingClientRect().height),
        maxHeight,
      );
      setLayout({ key, ...result });
    });
    return () => {
      alive = false;
    };
  }, [key, data]);
  const ready = layout?.key === key;
  const pages = ready ? layout.pages : [];
  const text = blocksText(pages.flat());
  useEffect(() => {
    if (data && ready) new BrowserCvVersionRepository().save(data.cv, text);
  }, [data, ready, text]);
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "accounting-ats-cv.txt";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  return (
    <div className="career-shell cv-shell compact-cv-shell">
      <section className="cv-controls">
        <div>
          <small>AUTO CV · ENGLISH · ATS</small>
          <h1>
            {say("Your concise professional CV", "سيرتك المهنية المختصرة")}
          </h1>
          <p>
            {say(
              "Profile details, courses, certificates and accepted accounting tasks stay connected. One reading column; maximum two A4 pages. No photo, QR, scores or task transcript in the CV.",
              "البيانات والكورسات والشهادات والتاسكات المقبولة مرتبطة بالبروفايل. عمود واحد وصفحتان A4 كحد أقصى، من غير صورة أو QR أو درجات أو قائمة تاسكات طويلة.",
            )}
          </p>
          {ready && (
            <p role="status">
              {pages.length}/2 {say("pages", "صفحات")}
              {data!.compact.omitted + layout.omitted > 0 &&
                ` · ${data!.compact.omitted + layout.omitted} ${say("additional records remain on your profile; the CV shows a concise selection.", "سجلات إضافية محفوظة في البروفايل؛ السيرة تعرض اختيارًا مختصرًا.")}`}
            </p>
          )}
          {data &&
            (data.compact.needsEnglish > 0 ||
              /[\u0600-\u06ff]/u.test(
                JSON.stringify([
                  data.profile.fullName,
                  data.profile.location,
                  data.profile.country,
                ]),
              )) && (
              <p role="note">
                {say(
                  "Some profile records need English names/titles. They are preserved on your profile; untranslated course/experience records are not included. Edit them in English; we do not invent translations.",
                  "بعض البيانات تحتاج أسماء وعناوين بالإنجليزي. محفوظة بالبروفايل؛ الكورسات والخبرات غير المترجمة لا تدخل السيرة. عدّلها بالإنجليزي؛ لا نختلق ترجمة.",
                )}
              </p>
            )}
          <p>
            <Link
              href={`/${locale}/student-profile?next=${encodeURIComponent(`/${locale}/career-profile/cv`)}`}
            >
              {say("Edit account CV details", "تعديل بيانات CV بالحساب")}
            </Link>
            {" · "}
            <Link href={`/${locale}/career-profile#courses`}>
              {say("Edit profile courses", "تعديل كورسات البروفايل")}
            </Link>
          </p>
        </div>
        <label>
          {say("CV target role", "الدور المستهدف")}
          <select
            value={prefs.targetRoleId}
            onChange={(event) =>
              updatePrefs({ targetRoleId: event.target.value as RoleId })
            }
          >
            {roleIds.map((role) => (
              <option key={role} value={role}>
                {roleCatalog[role].label[locale]}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={!ready || !pages.length || error}
          onClick={() => window.print()}
        >
          <Printer />
          {say("Print / Save PDF", "طباعة / حفظ PDF")}
        </button>
        <button disabled={!ready || error} onClick={download}>
          <FileText />
          {say("Plain Text CV", "سيرة نصية")}
        </button>
        {owner && (
          <button
            onClick={() => {
              setSaved(null);
              setRefresh((value) => value + 1);
            }}
          >
            <RefreshCw />
            {say("Refresh from profile", "تحديث من البروفايل")}
          </button>
        )}
      </section>
      {data && error && (
        <p role="alert">
          {say(
            "Could not refresh your account CV. Export is disabled until refresh succeeds.",
            "تعذّر تحديث CV الحساب. التنزيل متوقف لحد ما ينجح التحديث.",
          )}
        </p>
      )}
      {!data && (
        <p role="status">
          {error
            ? say(
                "Could not load your account CV. Retry; no private data was replaced.",
                "تعذّر تحميل CV الحساب. حاول ثانية؛ لم نستبدل بياناتك.",
              )
            : say(
                "Loading current profile and courses…",
                "جارٍ تحميل البروفايل والكورسات الحالية…",
              )}
        </p>
      )}
      {data && (
        <>
          <div
            ref={measure}
            className="cv-measure cv-typeset"
            aria-hidden="true"
          >
            {data.compact.blocks.map((block) => (
              <Block key={block.id} block={block} />
            ))}
          </div>
          {ready && (
            <article
              className="professional-cv cv-typeset"
              lang="en"
              dir="ltr"
              data-pages={pages.length}
            >
              {pages.map((page, index) => (
                <div className="cv-page" key={index}>
                  {page.map((block) => (
                    <Block key={block.id} block={block} />
                  ))}
                  <footer>
                    Page {index + 1} of {pages.length}
                  </footer>
                </div>
              ))}
            </article>
          )}
        </>
      )}
    </div>
  );
}
