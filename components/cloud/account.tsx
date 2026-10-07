"use client";
import { useState } from "react";
import Link from "next/link";
import { useCloudIdentity } from "./session-boundary";
import {
  requestJSON,
  CloudFailure,
  type CloudIdentity,
} from "@/lib/cloud/runtime";
import { authClient } from "@/lib/auth/client";
import type { Locale } from "@/types";
export function CloudAccount({ locale }: { locale: Locale }) {
  const identity = useCloudIdentity(),
    ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState(false),
    [savedProfile, setSavedProfile] = useState<CloudIdentity["profile"] | null>(
      null,
    );
  if (!identity)
    return (
      <main className="cloud-page">
        <p>{say("Loading account…", "جارٍ تحميل الحساب…")}</p>
      </main>
    );
  const profile = savedProfile ?? identity.profile;
  return (
    <main className="cloud-page" dir={ar ? "rtl" : "ltr"}>
      <section className="cloud-card cloud-state">
        <h1>{say("My cloud account", "حسابي السحابي")}</h1>
        <p>
          {say(
            "Your email is private. Your public competition identity uses only your name, handle and avatar.",
            "بريدك خاص. تظهر في المنافسة بالاسم والمعرّف والصورة الرمزية فقط.",
          )}
        </p>
        <p dir="ltr">{identity.user.email}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (pending) return;
            setPending(true);
            const f = new FormData(e.currentTarget);
            try {
              const saved = await requestJSON<CloudIdentity["profile"]>(
                "me/profile",
                "PUT",
                {
                  displayName: String(f.get("displayName")),
                  handle: String(f.get("handle")),
                  avatar: String(f.get("avatar")),
                  locale: profile.locale,
                  persona: profile.persona,
                  targetRoleId: profile.targetRoleId,
                  revision: profile.updatedAt,
                },
              );
              setSavedProfile(saved);
              setMessage(say("Saved to cloud.", "تم الحفظ في السحابة."));
            } catch (error) {
              setMessage(
                error instanceof CloudFailure && error.status === 409
                  ? say(
                      "Profile changed or handle taken. Reload and retry.",
                      "تغير الملف أو المعرّف مستخدم. أعد التحميل وحاول ثانية.",
                    )
                  : say(
                      "Not saved. Check connection and retry.",
                      "لم يتم الحفظ. راجع الاتصال وحاول ثانية.",
                    ),
              );
            } finally {
              setPending(false);
            }
          }}
        >
          <label>
            {say("Display name", "الاسم المعروض")}
            <input
              name="displayName"
              defaultValue={profile.displayName}
              minLength={2}
              maxLength={60}
              required
            />
          </label>
          <label>
            {say("Public handle", "المعرّف العام")}
            <input
              name="handle"
              dir="ltr"
              defaultValue={profile.handle}
              pattern="[a-z0-9][a-z0-9-]{2,29}"
              required
            />
          </label>
          <label>
            {say("Avatar", "الصورة الرمزية")}
            <select name="avatar" defaultValue={profile.avatar}>
              {["blue", "green", "gold", "purple"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <button disabled={pending}>
            {say("Save cloud profile", "حفظ الملف السحابي")}
          </button>
        </form>
        <p role="status">{message}</p>
        {identity.capabilities.email && !identity.user.emailVerified && (
          <button
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                const r = await authClient.sendVerificationEmail({
                  email: identity.user.email,
                  callbackURL: `/${locale}/account`,
                });
                setMessage(
                  r.error
                    ? say("Request failed.", "تعذّر الطلب.")
                    : say(
                        "Verification request accepted; check your inbox.",
                        "تم قبول طلب التحقق؛ راجع الوارد.",
                      ),
                );
              } catch {
                setMessage(
                  say("Email service unavailable.", "خدمة البريد غير متاحة."),
                );
              } finally {
                setPending(false);
              }
            }}
          >
            {say("Verify my email", "تأكيد بريدي")}
          </button>
        )}
        <p>
          <Link href={`/${locale}/onboarding`}>
            {say("Career entry / change target", "بداية المسار / تغيير الهدف")}
          </Link>
        </p>
        <Link href={`/${locale}/career-profile`}>
          {say("Career profile and CV", "الملف المهني والسيرة الذاتية")}
        </Link>
      </section>
    </main>
  );
}
