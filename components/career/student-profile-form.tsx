"use client";
import Link from "next/link";
import { useState } from "react";
import { requestJSON, CloudFailure } from "@/lib/cloud/runtime";
import {
  personalSchema,
  type PersonalRecord,
  type PersonalDetails,
} from "@/lib/career/personal";
import type { Locale } from "@/types";
import "@/app/student.css";

export function StudentProfileForm({
  locale,
  next,
  email,
  saved,
}: {
  locale: Locale;
  next: string;
  email: string;
  saved: { revision: number; data: PersonalRecord | null };
}) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const details = saved.data?.details;
  const fields = [
    ["fullName", "Full name for your CV", "الاسم الكامل للسيرة الذاتية", 120],
    ["phone", "Phone (with country code)", "رقم الهاتف مع كود الدولة", 25],
    ["country", "Country", "الدولة", 80],
    ["location", "City", "المدينة", 100],
    [
      "institution",
      "University / institution",
      "الجامعة أو المؤسسة التعليمية",
      160,
    ],
    [
      "degree",
      "Degree (current or completed)",
      "المؤهل الحالي أو المكتمل",
      120,
    ],
    ["field", "Field of study", "التخصص", 120],
    [
      "graduationYear",
      "Graduation / expected graduation year",
      "سنة التخرج أو التخرج المتوقع",
      4,
    ],
  ] as const;
  return (
    <main className="student-page" dir={ar ? "rtl" : "ltr"}>
      <Link href={`/${locale}`}>Debit & Credit</Link>
      <section className="student-card">
        <h1>
          {say(
            "Set up your automatic accounting CV",
            "جهّز سيرتك المحاسبية التلقائية",
          )}
        </h1>
        <p>
          {say(
            "Enter your personal details once. Completed accounting tasks will automatically add evidence-backed simulation achievements. You can update these details later.",
            "اكتب بياناتك مرة واحدة. التاسكات المحاسبية المقبولة هتضيف إنجازات تدريبية للـCV تلقائيًا، وتقدر تعدّل البيانات بعد كده.",
          )}
        </p>
        <p>
          {say(
            "Private to your account. No national ID, date of birth, photo or street address required. Simulation is not employment; ATS compatibility is not a hiring guarantee.",
            "البيانات خاصة بحسابك. لا نطلب رقمًا قوميًّا أو تاريخ ميلاد أو صورة أو عنوانًا تفصيليًّا. المحاكاة ليست وظيفة فعلية، وتوافق ATS لا يضمن القبول.",
          )}
        </p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            const values = Object.fromEntries(
              new FormData(event.currentTarget),
            );
            const actualExperience = values.actualCompany
              ? [
                  {
                    id: "personal-experience",
                    company: values.actualCompany,
                    title: values.actualTitle,
                    startDate: values.actualStart,
                    endDate: values.actualEnd,
                    current: values.actualCurrent === "on",
                    description: values.actualDescription,
                  },
                  ...(details?.actualExperience?.slice(1) ?? []),
                ]
              : details?.actualExperience
                ? []
                : undefined;
            const clean = Object.fromEntries(
              Object.entries(values).filter(
                ([key]) => !key.startsWith("actual"),
              ),
            );
            const result = personalSchema.safeParse({
              ...clean,
              languages: String(values.languages ?? "")
                .split(/[,،]/)
                .map((x) => x.trim())
                .filter(Boolean),
              ...(actualExperience ? { actualExperience } : {}),
            });
            if (!result.success) {
              setError(
                say(
                  "Check the required fields, phone number, year and links.",
                  "راجع الحقول المطلوبة ورقم الهاتف والسنة والروابط.",
                ),
              );
              return;
            }
            setBusy(true);
            setError("");
            try {
              await requestJSON("me/personal", "PUT", {
                revision: saved.revision,
                details: result.data,
              });
              window.location.assign(next);
            } catch (failure) {
              setError(
                failure instanceof CloudFailure && failure.status === 409
                  ? say(
                      "Your account changed in another tab. Reload before saving.",
                      "البيانات اتغيرت في تبويب آخر. حدّث الصفحة قبل الحفظ.",
                    )
                  : say(
                      "Save was not confirmed. Your entries are still here; retry.",
                      "لم يتأكد الحفظ. بياناتك ما زالت هنا؛ حاول ثانية.",
                    ),
              );
              setBusy(false);
            }
          }}
        >
          <div className="student-fields">
            {fields.map(([name, en, a, max]) => (
              <label key={name}>
                {say(en, a)} *
                <input
                  name={name}
                  required
                  minLength={
                    name === "phone" ? 7 : name === "graduationYear" ? 4 : 2
                  }
                  maxLength={max}
                  type={name === "phone" ? "tel" : "text"}
                  inputMode={name === "graduationYear" ? "numeric" : undefined}
                  autoComplete={
                    name === "fullName"
                      ? "name"
                      : name === "phone"
                        ? "tel"
                        : name === "location"
                          ? "address-level2"
                          : name === "country"
                            ? "country-name"
                            : "off"
                  }
                  defaultValue={details?.[name] ?? ""}
                />
              </label>
            ))}
            <label>
              {say("Account email", "إيميل الحساب")}
              <input type="email" value={email} disabled readOnly />
              <small>
                {say(
                  "Taken from your signed-in account, not published.",
                  "من حسابك المسجل، ولا يُنشر للآخرين.",
                )}
              </small>
            </label>
            <label>
              {say("Career stage", "مرحلتك المهنية")}
              <select
                name="experienceLevel"
                defaultValue={details?.experienceLevel ?? "student"}
              >
                {(
                  [
                    "student",
                    "fresh-graduate",
                    "junior",
                    "mid",
                    "senior",
                  ] as PersonalDetails["experienceLevel"][]
                ).map((value, i) => (
                  <option key={value} value={value}>
                    {say(
                      [
                        "Student",
                        "Fresh graduate",
                        "Junior",
                        "Mid-level",
                        "Senior",
                      ][i],
                      [
                        "طالب",
                        "حديث التخرج",
                        "مبتدئ",
                        "خبرة متوسطة",
                        "خبرة متقدمة",
                      ][i],
                    )}
                  </option>
                ))}
              </select>
            </label>
            <label>
              LinkedIn ({say("optional", "اختياري")})
              <input
                name="linkedIn"
                type="url"
                maxLength={300}
                defaultValue={details?.linkedIn ?? ""}
              />
            </label>
            <label>
              {say("Portfolio (optional)", "رابط أعمالك (اختياري)")}
              <input
                name="portfolio"
                type="url"
                maxLength={300}
                defaultValue={details?.portfolio ?? ""}
              />
            </label>
            <label>
              {say(
                "Languages, comma-separated (optional)",
                "اللغات، افصل بينها بفاصلة (اختياري)",
              )}
              <input
                name="languages"
                maxLength={480}
                defaultValue={details?.languages.join(", ") ?? ""}
              />
            </label>
          </div>
          <details>
            <summary>
              {say(
                "Actual work or internship experience (optional)",
                "خبرة عمل أو تدريب حقيقية سابقة (اختياري)",
              )}
            </summary>
            <p>
              {say(
                "Only add experience you actually completed. Training simulations are added automatically in a separate section.",
                "أضف فقط خبرة حقيقية قمت بها. المحاكاة التعليمية تُضاف تلقائيًا في قسم منفصل.",
              )}
            </p>
            <div className="student-fields">
              <label>
                {say("Employer", "جهة العمل")}
                <input
                  name="actualCompany"
                  maxLength={160}
                  defaultValue={details?.actualExperience?.[0]?.company ?? ""}
                />
              </label>
              <label>
                {say("Actual role title", "المسمى الحقيقي")}
                <input
                  name="actualTitle"
                  maxLength={120}
                  defaultValue={details?.actualExperience?.[0]?.title ?? ""}
                />
              </label>
              <label>
                {say("Start date", "تاريخ البداية")}
                <input
                  name="actualStart"
                  maxLength={30}
                  defaultValue={details?.actualExperience?.[0]?.startDate ?? ""}
                />
              </label>
              <label>
                {say("End date", "تاريخ النهاية")}
                <input
                  name="actualEnd"
                  maxLength={30}
                  defaultValue={details?.actualExperience?.[0]?.endDate ?? ""}
                />
              </label>
              <label>
                {say(
                  "Responsibilities you actually performed",
                  "مهام قمت بها فعليًا",
                )}
                <input
                  name="actualDescription"
                  maxLength={1500}
                  defaultValue={
                    details?.actualExperience?.[0]?.description ?? ""
                  }
                />
              </label>
              <label>
                {say("Still in this role", "ما زلت في هذا الدور")}
                <input
                  type="checkbox"
                  name="actualCurrent"
                  defaultChecked={
                    details?.actualExperience?.[0]?.current ?? false
                  }
                />
              </label>
            </div>
          </details>
          {error && <p role="alert">{error}</p>}
          <button disabled={busy}>
            {busy
              ? say("Saving…", "جارٍ الحفظ…")
              : say("Save and start learning", "احفظ وابدأ التعلم")}
          </button>
        </form>
      </section>
    </main>
  );
}
