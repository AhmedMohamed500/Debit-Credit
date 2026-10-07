"use client";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import type { Locale } from "@/types";
export function ResetForm({
  locale,
  token,
  enabled,
}: {
  locale: Locale;
  token: string;
  enabled: boolean;
}) {
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState(false);
  return (
    <main className="cloud-page">
      <section className="cloud-card">
        <h1>{say("Reset password", "تغيير كلمة المرور")}</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (f.get("password") !== f.get("confirm")) {
              setMessage(
                say("Passwords do not match.", "كلمتا المرور مختلفتان."),
              );
              return;
            }
            setPending(true);
            try {
              const r = await authClient.resetPassword({
                newPassword: String(f.get("password")),
                token,
              });
              setMessage(
                r.error
                  ? say(
                      "Invalid or expired link. Request another.",
                      "الرابط غير صالح أو انتهى. اطلب رابطًا جديدًا.",
                    )
                  : say(
                      "Password updated. You can sign in.",
                      "تم تغيير كلمة المرور. يمكنك تسجيل الدخول.",
                    ),
              );
            } catch {
              setMessage(
                say(
                  "Service unavailable. Retry.",
                  "الخدمة غير متاحة. حاول ثانية.",
                ),
              );
            } finally {
              setPending(false);
            }
          }}
        >
          <label>
            {say("New password", "كلمة المرور الجديدة")}
            <input
              name="password"
              type="password"
              minLength={12}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </label>
          <label>
            {say("Confirm", "التأكيد")}
            <input
              name="confirm"
              type="password"
              minLength={12}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </label>
          <button disabled={pending || !enabled || !token}>
            {say("Update password", "حفظ كلمة المرور")}
          </button>
        </form>
        {!enabled && (
          <p>
            {say(
              "Email delivery is not configured.",
              "إرسال البريد غير مُجهّز.",
            )}
          </p>
        )}
        <p role="status">{message}</p>
        <Link href={`/${locale}/login`}>{say("Sign in", "الدخول")}</Link>
      </section>
    </main>
  );
}
