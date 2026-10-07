"use client";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { safeNext } from "@/lib/auth/safe-next";
import type { Locale } from "@/types";
export function AuthForm({
  locale,
  signup,
  next,
  enabled,
  google,
  email,
}: {
  locale: Locale;
  signup: boolean;
  next: string;
  enabled: boolean;
  google: boolean;
  email: boolean;
}) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    destination = safeNext(next, locale);
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !enabled) return;
    const data = new FormData(event.currentTarget),
      password = String(data.get("password") ?? "");
    if (signup && password !== data.get("confirm")) {
      setError(say("Passwords do not match.", "كلمتا المرور غير متطابقتين."));
      return;
    }
    setPending(true);
    setError("");
    try {
      const fields = {
        email: String(data.get("email")),
        password,
        callbackURL: destination,
      };
      const result = signup
        ? await authClient.signUp.email({
            ...fields,
            name: String(data.get("name")),
          })
        : await authClient.signIn.email(fields);
      if (result.error) {
        setError(
          say(
            "Unable to sign in or create this account. Check your details and try again.",
            "تعذّر الدخول أو إنشاء الحساب. راجع البيانات وحاول مرة أخرى.",
          ),
        );
        return;
      }
      window.location.assign(destination);
    } catch {
      setError(
        say(
          "Offline or service unavailable. Your account was not confirmed. Retry.",
          "الاتصال أو الخدمة غير متاحة. لم يتم تأكيد العملية. حاول مرة أخرى.",
        ),
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="cloud-page auth-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="cloud-brand" href={`/${locale}`}>
        ▟ Debit &amp; Credit
      </Link>
      <section className="cloud-card auth-card">
        <small>{say("YOUR ACCOUNTING JOURNEY", "رحلتك المحاسبية")}</small>
        <h1>
          {signup
            ? say("Create your free account", "أنشئ حسابك المجاني")
            : say("Welcome back", "أهلًا بعودتك")}
        </h1>
        <p>
          {say(
            "One account. Your supported progress across devices.",
            "حساب واحد وتقدمك المدعوم معك على أجهزتك.",
          )}
        </p>
        {!enabled && (
          <p className="cloud-warning" role="status">
            {say(
              "Cloud accounts are not configured on this installation yet. Local learning remains available.",
              "الحسابات السحابية لم تُجهّز في هذه النسخة بعد. التعلم المحلي ما زال متاحًا.",
            )}
          </p>
        )}
        {google && (
          <button
            className="cloud-secondary"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                const r = await authClient.signIn.social({
                  provider: "google",
                  callbackURL: destination,
                });
                if (r.error)
                  setError(
                    say(
                      "Google login unavailable. Retry.",
                      "تعذّر تسجيل الدخول عبر Google.",
                    ),
                  );
              } catch {
                setError(say("Connection failed.", "تعذّر الاتصال."));
              } finally {
                setPending(false);
              }
            }}
          >
            {say("Continue with Google", "تابع باستخدام Google")}
          </button>
        )}
        <form onSubmit={submit}>
          {signup && (
            <label>
              {say("Display name", "الاسم المعروض")}
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={60}
              />
            </label>
          )}
          <label>
            {say("Email", "البريد الإلكتروني")}
            <input
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
          <label>
            {say("Password", "كلمة المرور")}
            <input
              name="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              minLength={signup ? 12 : 1}
              maxLength={128}
              required
            />
          </label>
          {signup && (
            <>
              <small>
                {say(
                  "At least 12 characters. Never share your password.",
                  "12 حرفًا على الأقل. لا تشارك كلمة المرور.",
                )}
              </small>
              <label>
                {say("Confirm password", "تأكيد كلمة المرور")}
                <input
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  required
                />
              </label>
            </>
          )}
          {error && (
            <p role="alert" className="cloud-warning">
              {error}
            </p>
          )}
          <button className="cloud-primary" disabled={pending || !enabled}>
            {pending
              ? say("Working…", "جارٍ التنفيذ…")
              : signup
                ? say("Create free account", "إنشاء حساب مجاني")
                : say("Sign in", "تسجيل الدخول")}
          </button>
        </form>
        {!signup && email && (
          <button
            className="cloud-text"
            disabled={pending}
            onClick={async () => {
              const value = window.prompt(
                say("Your account email", "بريد حسابك"),
              );
              if (!value) return;
              setPending(true);
              try {
                const r = await authClient.requestPasswordReset({
                  email: value,
                  redirectTo: `/${locale}/reset-password`,
                });
                setMessage(
                  r.error
                    ? say("Request failed. Retry.", "تعذّر الطلب. حاول ثانية.")
                    : say(
                        "Request accepted. If this address has an account, check its inbox.",
                        "تم قبول الطلب. إذا كان البريد مسجلًا فراجع الوارد.",
                      ),
                );
              } catch {
                setError(say("Service unavailable.", "الخدمة غير متاحة."));
              } finally {
                setPending(false);
              }
            }}
          >
            {say("Forgot password?", "نسيت كلمة المرور؟")}
          </button>
        )}
        {message && <p role="status">{message}</p>}
        <p>
          <Link
            href={`/${locale}/${signup ? "login" : "signup"}?next=${encodeURIComponent(destination)}`}
          >
            {signup
              ? say(
                  "Already have an account? Sign in",
                  "لديك حساب؟ سجّل الدخول",
                )
              : say("Create an account", "إنشاء حساب جديد")}
          </Link>
        </p>
        <Link className="cloud-text" href={`/${locale}/bootcamp`}>
          {say("Explore local learning", "استكشف التعلم المحلي")}
        </Link>
      </section>
    </main>
  );
}
