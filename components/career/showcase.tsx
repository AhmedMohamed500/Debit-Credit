"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Award,
  ExternalLink,
  Link2,
  Pin,
  Download,
  BriefcaseBusiness,
} from "lucide-react";
import { requestJSON, cloudUser, CloudFailure } from "@/lib/cloud/runtime";
import { roleCatalog, roleIds } from "@/lib/career/catalog";
import {
  socialKeys,
  socialLabels,
  showcaseSettings,
  type Showcase,
  type ShowcaseSettings,
  type SocialKey,
  type Work,
  type PublicShowcase,
} from "@/lib/career/showcase";
import type { Locale } from "@/types";
import "@/app/career-showcase.css";

export function useShowcase(owner: string | undefined) {
  const [saved, setSaved] = useState<{ owner: string; data: Showcase } | null>(
    null,
  );
  const [refresh, setRefresh] = useState(0),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    setSaved(null);
    setError(false);
    if (owner)
      void requestJSON<Showcase>("me/showcase")
        .then((data) => {
          if (!data?.settings || !Array.isArray(data.works))
            throw new Error("INVALID_SHOWCASE");
          if (alive) setSaved({ owner, data });
        })
        .catch(() => {
          if (alive) setError(true);
        });
    return () => {
      alive = false;
    };
  }, [owner, refresh]);
  const data = saved && saved.owner === owner ? saved.data : null;
  async function save(
    action: "save" | "publish" | "revoke",
    settings: ShowcaseSettings,
  ) {
    if (!owner || !data || busy) return;
    setBusy(true);
    try {
      const next = await requestJSON<Showcase>("me/showcase", "PUT", {
        action,
        settings,
        revision: data.revision,
      });
      if (cloudUser() === owner) setSaved({ owner, data: next });
      return cloudUser() === owner;
    } catch (failure) {
      if (failure instanceof CloudFailure && failure.status === 409)
        setRefresh((value) => value + 1);
      throw failure;
    } finally {
      setBusy(false);
    }
  }
  return {
    data,
    busy,
    error,
    save,
    reload: () => setRefresh((value) => value + 1),
  };
}
type Controller = ReturnType<typeof useShowcase>;
export function SocialLinks({
  socials,
}: {
  socials: ShowcaseSettings["socials"];
}) {
  return (
    <div className="showcase-socials">
      {socialKeys
        .filter((key) => socials[key])
        .map((key) => (
          <a
            key={key}
            href={socials[key]}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
          >
            <ExternalLink size={15} />
            {socialLabels[key]}
          </a>
        ))}
    </div>
  );
}
export function Availability({
  value,
  locale,
}: {
  value: ShowcaseSettings["availability"];
  locale: Locale;
}) {
  if (value.status === "not-looking") return null;
  return (
    <span className="showcase-availability">
      <BriefcaseBusiness size={16} />
      {value.status === "internship"
        ? locale === "ar"
          ? "متاح لتدريب"
          : "Available for an internship"
        : locale === "ar"
          ? "متاح للعمل"
          : "Open to work"}{" "}
      · {roleCatalog[value.role].label[locale]}
    </span>
  );
}
export function ShowcaseIdentity({
  data,
  locale,
}: {
  data: Showcase | null;
  locale: Locale;
}) {
  return (
    data && (
      <div className="showcase-identity">
        <Availability value={data.settings.availability} locale={locale} />
        <SocialLinks socials={data.settings.socials} />
      </div>
    )
  );
}
export function WorkPreview({ work }: { work: Work }) {
  return (
    <div className="showcase-table" dir="ltr">
      <table>
        <caption>
          Reconstructed training workpaper · EGP · accepted simulation tasks,
          not employment experience
        </caption>
        <thead>
          <tr>
            {work.headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {work.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, column) => (
                <td key={column}>
                  {typeof cell === "number"
                    ? cell.toLocaleString("en-US")
                    : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>Evidence: {work.steps.join(" · ")}</p>
    </div>
  );
}
function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  line: number,
) {
  let buffer = "";
  for (const word of text.split(/\s+/)) {
    const next = buffer ? `${buffer} ${word}` : word;
    if (buffer && context.measureText(next).width > width) {
      context.fillText(buffer, x, y);
      y += line;
      buffer = word;
    } else buffer = next;
  }
  if (buffer) context.fillText(buffer, x, y);
  return y + line;
}
export async function achievementCard(name: string, work: Work) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 900;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("CANVAS_UNAVAILABLE");
  const gradient = context.createLinearGradient(0, 0, 1200, 300);
  gradient.addColorStop(0, "#143c47");
  gradient.addColorStop(0.7, "#1e6267");
  gradient.addColorStop(1, "#c4b16d");
  context.fillStyle = "#eaf6fa";
  context.fillRect(0, 0, 1200, 900);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1200, 285);
  context.fillStyle = "#fff";
  context.font = "bold 26px Arial";
  context.fillText("Debit & Credit  /  ACCOUNTING ACHIEVEMENT", 64, 66);
  context.font = "bold 38px Arial";
  wrap(context, name, 64, 140, 1072, 47);
  context.fillStyle = "#e7d798";
  context.font = "22px Arial";
  context.fillText("Training simulation · server-accepted tasks", 64, 258);
  context.fillStyle = "#143c47";
  context.font = "bold 42px Arial";
  let y = wrap(context, work.skill.en, 64, 366, 1072, 52);
  context.font = "bold 26px Arial";
  y = wrap(context, `Proved by: ${work.title.en}`, 64, y + 24, 1072, 34);
  context.font = "28px Arial";
  wrap(context, work.summary.en, 64, y + 34, 1072, 40);
  context.fillStyle = "#1e6267";
  context.font = "22px Arial";
  context.fillText(
    "Practice evidence, not a professional certification or job-readiness score.",
    64,
    810,
  );
  context.font = "19px Arial";
  context.fillText(
    "No endorsement, accredited credential or real employment experience is implied.",
    64,
    849,
  );
  const bytes = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("EXPORT_FAILED"))),
      "image/png",
    ),
  );
  const url = URL.createObjectURL(bytes),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `accounting-achievement-${work.id}.png`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function ShowcasePanel({
  controller,
  locale,
  owner,
}: {
  controller: Controller;
  locale: Locale;
  owner: string | undefined;
}) {
  const { data, busy, error } = controller,
    ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en);
  const [draft, setDraft] = useState<ShowcaseSettings | null>(null),
    [message, setMessage] = useState(""),
    [qr, setQr] = useState("");
  useEffect(() => {
    setDraft(data ? structuredClone(data.settings) : null);
  }, [data, owner]);
  useEffect(() => {
    setMessage("");
  }, [owner]);
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const url =
    data?.token && origin ? `${origin}/${locale}/portfolio/${data.token}` : "";
  useEffect(() => {
    let alive = true;
    setQr("");
    if (url)
      void QRCode.toDataURL(url, {
        errorCorrectionLevel: "M",
        margin: 4,
        width: 256,
        color: { dark: "#143c47", light: "#ffffff" },
      })
        .then((value) => {
          if (alive) setQr(value);
        })
        .catch(() => {
          if (alive)
            setMessage(
              say(
                "QR unavailable. The link still works.",
                "تعذّر إنشاء QR. الرابط متاح.",
              ),
            );
        });
    return () => {
      alive = false;
    };
    // The QR encodes only the explicitly enabled public link, never a private API URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  if (!owner)
    return (
      <section className="member-card showcase">
        <h2>{say("Your professional showcase", "معرض أعمالك المهني")}</h2>
        <Link href={`/${locale}/login`}>
          {say("Sign in to manage your showcase", "سجل الدخول لإدارة معرضك")}
        </Link>
      </section>
    );
  if (!data || !draft)
    return (
      <section className="member-card showcase" aria-busy={!error}>
        <h2>{say("Your professional showcase", "معرض أعمالك المهني")}</h2>
        <p role="status">
          {error
            ? say(
                "Could not load your showcase. Nothing was replaced.",
                "تعذّر تحميل معرضك. لم يتم استبدال شيء.",
              )
            : say("Loading accepted works…", "جارٍ تحميل الأعمال المقبولة…")}
        </p>
        {error && (
          <button onClick={controller.reload}>
            {say("Retry", "حاول ثانية")}
          </button>
        )}
      </section>
    );
  const patch = (next: ShowcaseSettings) => setDraft(next);
  const pinned = data.works.filter((work) =>
    data.settings.pinned.includes(work.id),
  );
  async function save(action: "save" | "publish" | "revoke") {
    const parsed = showcaseSettings.safeParse(
      action === "revoke" ? data!.settings : draft,
    );
    if (!parsed.success) {
      setMessage(
        say(
          "Check HTTPS profile links, the three-work limit and sharing choices.",
          "راجع روابط HTTPS وحدّ الثلاثة أعمال واختيارات المشاركة.",
        ),
      );
      return;
    }
    try {
      if (await controller.save(action, parsed.data))
        setMessage(
          say(
            action === "revoke"
              ? "Link revoked. Previous QR no longer opens the profile."
              : "Saved to your account.",
            action === "revoke"
              ? "اتلغى الرابط. الـQR السابق لم يعد يعرض البروفايل."
              : "اتحفظت بحسابك.",
          ),
        );
    } catch {
      setMessage(
        say(
          "Save was not confirmed. Reload and retry; no changes are assumed saved.",
          "لم يتأكد الحفظ. أعد التحميل وحاول ثانية؛ لم نعتبر التغييرات محفوظة.",
        ),
      );
    }
  }
  async function card(work: Work) {
    try {
      await achievementCard(data!.name, work);
      setMessage(
        say(
          "PNG downloaded. Attach it to your LinkedIn post; nothing is posted automatically.",
          "تم تنزيل PNG. أرفقها بمنشور LinkedIn؛ لم ننشر شيئًا تلقائيًا.",
        ),
      );
    } catch {
      setMessage(
        say(
          "Card export failed. Try again.",
          "تعذّر تنزيل البطاقة. حاول ثانية.",
        ),
      );
    }
  }
  return (
    <section className="member-card showcase" data-testid="career-showcase">
      <header>
        <h2>
          <Award size={22} />
          {say("Your professional showcase", "معرض أعمالك المهني")}
        </h2>
        <span className="member-pill">
          {data.token
            ? say("Only selected fields shared", "مشاركة الحقول المختارة فقط")
            : say(
                "Private until you choose to share",
                "خاص لحد ما تختار المشاركة",
              )}
        </span>
      </header>
      <h3>{say("What can I do?", "أنا أقدر أعمل إيه؟")}</h3>
      {data.works.length ? (
        <ul className="showcase-summary">
          {data.works.map((work) => (
            <li key={work.id}>{work.summary[locale]}</li>
          ))}
        </ul>
      ) : (
        <p>
          {say(
            "Complete accepted accounting tasks to build this summary automatically.",
            "كمّل تاسكات محاسبية مقبولة علشان الملخص يتكوّن تلقائيًا.",
          )}
        </p>
      )}
      <p className="showcase-note">
        {say(
          "Training simulation, not real employment. Personal-data completeness and availability are not skill assessments.",
          "محاكاة تدريبية وليست خبرة عمل فعلية. اكتمال البيانات وحالة البحث عن عمل ليسا تقييم مهارات.",
        )}
      </p>
      <h3>
        <Pin size={18} />
        {say("Best 3 works", "أفضل ٣ أعمال")}
      </h3>
      {!pinned.length && (
        <p>
          {say(
            "Choose up to three accepted works below. No placeholders or unearned achievements.",
            "اختار لحد ثلاثة أعمال مقبولة من الإعدادات. مفيش إنجازات وهمية أو غير مكتسبة.",
          )}
        </p>
      )}
      <div className="showcase-works">
        {pinned.map((work) => (
          <article key={work.id}>
            <small>
              {say(
                "Training simulation · accepted tasks",
                "محاكاة تدريبية · تاسكات مقبولة",
              )}
            </small>
            <h4>{work.title[locale]}</h4>
            <p>{work.summary[locale]}</p>
            <details>
              <summary>
                {say("Preview accounting work", "معاينة الشغل المحاسبي")}
              </summary>
              <WorkPreview work={work} />
            </details>
            <button onClick={() => void card(work)}>
              <Download size={16} />
              {say("Download achievement card", "تنزيل بطاقة الإنجاز")}
            </button>
          </article>
        ))}
      </div>
      <details className="showcase-settings">
        <summary>
          {say(
            "Edit social links, works & sharing",
            "تعديل السوشيال والأعمال والمشاركة",
          )}
        </summary>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save("save");
          }}
        >
          <fieldset disabled={busy}>
            <legend>{say("Social profiles", "روابط السوشيال")}</legend>
            <p>
              {say(
                "Clean HTTPS links only, without tracking parameters. Links open without sending a referrer.",
                "روابط HTTPS مباشرة فقط بدون معاملات تتبع. الروابط لا ترسل عنوان صفحتك للموقع الآخر.",
              )}
            </p>
            <div className="showcase-fields">
              {socialKeys.map((key: SocialKey) => (
                <label key={key}>
                  {socialLabels[key]}
                  <input
                    name={`social-${key}`}
                    dir="ltr"
                    type="url"
                    maxLength={300}
                    value={draft.socials[key]}
                    placeholder={`https://${key === "website" ? "example.com" : key + ".com"}/`}
                    onChange={(event) =>
                      patch({
                        ...draft,
                        socials: {
                          ...draft.socials,
                          [key]: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <h4>
              {say(
                "Availability · self-reported preference",
                "التوفر · رغبة يحددها صاحب الحساب",
              )}
            </h4>
            <div className="showcase-fields">
              <label>
                {say("Looking for", "أبحث عن")}
                <select
                  name="availability"
                  value={draft.availability.status}
                  onChange={(event) =>
                    patch({
                      ...draft,
                      availability: {
                        ...draft.availability,
                        status: event.target
                          .value as ShowcaseSettings["availability"]["status"],
                      },
                    })
                  }
                >
                  <option value="not-looking">
                    {say("Do not show availability", "لا تعرض التوفر")}
                  </option>
                  <option value="internship">
                    {say("Internship", "تدريب")}
                  </option>
                  <option value="work">{say("Work", "عمل")}</option>
                </select>
              </label>
              <label>
                {say("Target specialty", "التخصص المطلوب")}
                <select
                  name="specialty"
                  value={draft.availability.role}
                  onChange={(event) =>
                    patch({
                      ...draft,
                      availability: {
                        ...draft.availability,
                        role: event.target
                          .value as ShowcaseSettings["availability"]["role"],
                      },
                    })
                  }
                >
                  {roleIds.map((id) => (
                    <option key={id} value={id}>
                      {roleCatalog[id].label[locale]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="showcase-options">
              <h4>
                {say(
                  "Pin accepted works (maximum 3)",
                  "تثبيت الأعمال المقبولة (٣ كحد أقصى)",
                )}
              </h4>
              {data.works.map((work) => (
                <label key={work.id}>
                  <input
                    type="checkbox"
                    name={`pin-${work.id}`}
                    checked={draft.pinned.includes(work.id)}
                    disabled={
                      !draft.pinned.includes(work.id) &&
                      draft.pinned.length >= 3
                    }
                    onChange={(event) =>
                      patch({
                        ...draft,
                        pinned: event.target.checked
                          ? [...draft.pinned, work.id]
                          : draft.pinned.filter((id) => id !== work.id),
                        public: {
                          ...draft.public,
                          works: draft.public.works.filter(
                            (id) => id !== work.id,
                          ),
                        },
                      })
                    }
                  />
                  {work.title[locale]}
                </label>
              ))}
            </div>
            <div className="showcase-options">
              <h4>
                {say(
                  "Exactly what appears on your public link",
                  "حدد بالضبط ما يظهر في الرابط العام",
                )}
              </h4>
              {(["name", "socials", "availability", "summary"] as const).map(
                (key) => (
                  <label key={key}>
                    <input
                      name={`share-${key}`}
                      type="checkbox"
                      checked={draft.public[key]}
                      onChange={(event) =>
                        patch({
                          ...draft,
                          public: {
                            ...draft.public,
                            [key]: event.target.checked,
                          },
                        })
                      }
                    />
                    {
                      {
                        name: say("Full name", "الاسم الكامل"),
                        socials: say("Social links", "السوشيال"),
                        availability: say(
                          "Availability and specialty",
                          "التوفر والتخصص",
                        ),
                        summary: say(
                          "Automatic task-based summary",
                          "الملخص التلقائي من التاسكات",
                        ),
                      }[key]
                    }
                  </label>
                ),
              )}
              {data.works
                .filter((work) => draft.pinned.includes(work.id))
                .map((work) => (
                  <label key={work.id}>
                    <input
                      name={`share-work-${work.id}`}
                      type="checkbox"
                      checked={draft.public.works.includes(work.id)}
                      onChange={(event) =>
                        patch({
                          ...draft,
                          public: {
                            ...draft.public,
                            works: event.target.checked
                              ? [...draft.public.works, work.id]
                              : draft.public.works.filter(
                                  (id) => id !== work.id,
                                ),
                          },
                        })
                      }
                    />
                    {say("Share work", "مشاركة عمل")}: {work.title[locale]}
                  </label>
                ))}
            </div>
            <p className="showcase-note">
              {say(
                "Email, phone, photo, certificates and private courses are never included. Anyone with an enabled link can see selected fields. Selected summaries update as tasks are accepted; saving changes updates an active link. Revoking cannot erase copies already downloaded by others.",
                "الإيميل والتليفون والصورة والشهادات والكورسات الخاصة لا تُنشر. أي شخص معه الرابط المفعّل يرى ما اخترته. الملخص المختار يتحدث مع قبول التاسكات، وحفظ التغييرات يحدّث الرابط النشط. إلغاء الرابط لا يمسح نسخًا نزّلها آخرون سابقًا.",
              )}
            </p>
            <div className="showcase-actions">
              <button type="submit">
                {say("Save showcase", "حفظ المعرض")}
              </button>
              <button type="button" onClick={() => void save("publish")}>
                <Link2 size={16} />
                {say(
                  data.token ? "Update shared profile" : "Enable public link",
                  data.token ? "تحديث البروفايل المشترك" : "تفعيل رابط عام",
                )}
              </button>
              {data.token && (
                <button type="button" onClick={() => void save("revoke")}>
                  {say("Revoke public link", "إلغاء الرابط العام")}
                </button>
              )}
            </div>
          </fieldset>
        </form>
      </details>
      {url && (
        <div className="showcase-share">
          {qr && (
            <Image
              src={qr}
              alt={say("Public profile QR code", "QR البروفايل العام")}
              width={128}
              height={128}
              unoptimized
            />
          )}
          <div>
            <h3>
              {say(
                "Your selected professional profile",
                "بروفايلك المهني المختار",
              )}
            </h3>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
            >
              {say("Preview public profile", "معاينة البروفايل العام")}
            </a>
            <div className="showcase-actions">
              <button
                onClick={() => {
                  if (!navigator.clipboard) {
                    setMessage(url);
                    return;
                  }
                  void navigator.clipboard
                    .writeText(url)
                    .then(() =>
                      setMessage(
                        say("Public link copied.", "اتنسخ الرابط العام."),
                      ),
                    )
                    .catch(() => setMessage(url));
                }}
              >
                {say("Copy public link", "نسخ الرابط العام")}
              </button>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
              >
                {say("Share link on LinkedIn", "مشاركة الرابط على LinkedIn")}
              </a>
              {qr && (
                <a href={qr} download="accounting-profile-qr.png">
                  {say("Download QR", "تنزيل QR")}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      <p role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
export function SharedProfile({
  data,
  locale,
}: {
  data: PublicShowcase;
  locale: Locale;
}) {
  const ar = locale === "ar";
  return (
    <main className="showcase-public showcase" dir={ar ? "rtl" : "ltr"}>
      <section className="showcase-public-hero">
        <small>
          Debit & Credit ·{" "}
          {ar
            ? "بروفايل مهني بموافقة صاحبه"
            : "Owner-selected professional profile"}
        </small>
        <h1>{data.name || (ar ? "متعلّم محاسبة" : "Accounting learner")}</h1>
        {data.availability && (
          <Availability value={data.availability} locale={locale} />
        )}
        {data.socials && <SocialLinks socials={data.socials} />}
      </section>
      <section className="member-card">
        <h2>{ar ? "أنا أقدر أعمل إيه؟" : "What can I do?"}</h2>
        {data.summary.length ? (
          <ul>
            {data.summary.map((summary, index) => (
              <li key={index}>{summary[locale]}</li>
            ))}
          </ul>
        ) : (
          <p>
            {ar
              ? "لم يشارك صاحب الحساب ملخصًا."
              : "No summary shared by the owner."}
          </p>
        )}
        <p>
          {ar
            ? "الأعمال التالية محاكاة تدريبية، وليست خبرة عمل أو شهادات اعتماد."
            : "The works below are training simulations, not employment experience or accredited certifications."}
        </p>
      </section>
      <div className="showcase-works">
        {data.works.map((work) => (
          <article key={work.id}>
            <small>
              {ar
                ? "محاكاة تدريبية · تاسكات مقبولة"
                : "Training simulation · accepted tasks"}
            </small>
            <h2>{work.title[locale]}</h2>
            <p>{work.summary[locale]}</p>
            <WorkPreview work={work} />
          </article>
        ))}
      </div>
      <Link href={`/${locale}`}>
        {ar ? "اكتشف Debit & Credit" : "Explore Debit & Credit"}
      </Link>
    </main>
  );
}
