"use client";
import { useEffect, useState } from "react";
import { requestJSON, cloudUser } from "@/lib/cloud/runtime";
import {
  discoveryDefaults,
  type DiscoveryPreferences,
  type DiscoveryRecord,
} from "@/lib/talent/model";
import type { Locale } from "@/types";

export function DiscoverySettings({
  owner,
  locale,
}: {
  owner?: string;
  locale: Locale;
}) {
  const [saved, setSaved] = useState<{
      owner: string;
      data: DiscoveryRecord;
    } | null>(null),
    [draft, setDraft] = useState({ ...discoveryDefaults }),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [inbox, setInbox] = useState<{
    owner: string;
    items: {
      company: string;
      recruiter: string;
      message: string;
      sentAt: string;
    }[];
  } | null>(null);
  const ar = locale === "ar",
    record = saved && saved.owner === owner ? saved.data : null;
  useEffect(() => {
    let alive = true;
    setSaved(null);
    setInbox(null);
    setDraft({ ...discoveryDefaults });
    setMessage("");
    if (owner) {
      void requestJSON<DiscoveryRecord>("me/discovery")
        .then((data) => {
          if (alive && data?.preferences) {
            setSaved({ owner, data });
            setDraft(data.preferences);
          }
        })
        .catch(() => {
          if (alive)
            setMessage(
              ar
                ? "تعذر قراءة اختياراتك؛ لم يتم نشر شيء."
                : "Could not load consent; nothing was published.",
            );
        });
      void requestJSON<{
        items: {
          company: string;
          recruiter: string;
          message: string;
          sentAt: string;
        }[];
      }>("me/contact-requests")
        .then((data) => {
          if (alive) setInbox({ owner, items: data.items ?? [] });
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [owner, ar]);
  async function save() {
    if (!record || !owner) return;
    setBusy(true);
    setMessage("");
    try {
      const data = await requestJSON<DiscoveryRecord>("me/discovery", "PUT", {
        revision: record.revision,
        preferences: draft,
      });
      if (cloudUser() === owner) {
        setSaved({ owner, data });
        setMessage(
          ar
            ? "تم حفظ موافقتك؛ يمكنك إيقاف الاكتشاف في أي وقت."
            : "Consent saved. You can disable discovery at any time.",
        );
      }
    } catch {
      if (cloudUser() === owner)
        setMessage(
          ar
            ? "لم يتم الحفظ. راجع اكتمال البروفايل أو أعد تحميل الصفحة عند تعارض التعديلات."
            : "Not saved. Complete your career profile or reload if another tab changed your consent.",
        );
    } finally {
      setBusy(false);
    }
  }
  const labels: Record<keyof DiscoveryPreferences, [string, string]> = {
    enabled: [
      "Allow employer discovery of my name, role, evidence summary and simulation work",
      "أوافق على اكتشاف الشركات لاسمي ودوري وملخص أدلتي وأعمال المحاكاة",
    ],
    photo: ["Share my photo with recruiters", "مشاركة صورتي مع مسؤولي التوظيف"],
    location: ["Share location", "مشاركة المكان"],
    education: ["Share education", "مشاركة التعليم"],
    languages: ["Share languages", "مشاركة اللغات"],
    socials: ["Share professional links", "مشاركة الروابط المهنية"],
    courses: [
      "Share started/completed course metadata",
      "مشاركة بيانات الكورسات الجارية والمكتملة",
    ],
    certificates: [
      "Share certificate metadata only, never images or private IDs",
      "مشاركة بيانات الشهادات فقط، دون الصور أو أرقامها الخاصة",
    ],
    cv: [
      "Allow a text CV preview with account email/phone removed",
      "إتاحة معاينة نصية للـCV دون بريد الحساب أو التليفون",
    ],
    contactRequests: [
      "Allow internal recruiter contact requests",
      "السماح بطلبات تواصل داخل الموقع من الشركات",
    ],
  };
  return (
    <section className="member-card discovery-settings">
      <h2>
        {ar
          ? "الظهور للشركات وطلبات التواصل"
          : "Employer discovery & contact requests"}
      </h2>
      <p>
        {ar
          ? "موافقة مستقلة عن الرابط العام. خاص افتراضيًا؛ لا يكفي التسجيل أو اختيار متاح للعمل لنشرك. الشركات ذات حساب معلن ذاتيًا وليست موثقة تلقائيًا."
          : "Separate consent from the public share page. Private by default; signup and availability do not publish you. Employer identities are self-reported, not verified."}
      </p>
      <div className="discovery-choices">
        {(Object.keys(labels) as (keyof DiscoveryPreferences)[]).map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={draft[key]}
              disabled={!record || busy}
              onChange={(event) =>
                setDraft((value) => ({ ...value, [key]: event.target.checked }))
              }
            />
            {labels[key][ar ? 1 : 0]}
          </label>
        ))}
      </div>
      <button
        className="member-primary"
        disabled={!record || busy}
        onClick={() => void save()}
      >
        {ar ? "احفظ اختيارات الاكتشاف" : "Save discovery choices"}
      </button>
      <p role="status">{message}</p>
      <h3>{ar ? "طلبات تواصل خاصة" : "Private contact requests"}</h3>
      {inbox &&
        inbox.owner === owner &&
        inbox.items.map((item, index) => (
          <article className="member-record" key={index}>
            <div>
              <b>
                {item.company} · {item.recruiter}
              </b>
              <p>{item.message}</p>
              <small>
                {item.sentAt.slice(0, 10)} ·{" "}
                {ar
                  ? "هوية شركة معلنة ذاتيًا"
                  : "Self-reported company identity"}
              </small>
            </div>
          </article>
        ))}
      {!inbox?.items.length && (
        <p>
          {ar
            ? "لا توجد طلبات تواصل؛ لن يظهر بريدك أو هاتفك للشركات."
            : "No contact requests. Recruiters do not see your account email or phone."}
        </p>
      )}
    </section>
  );
}
