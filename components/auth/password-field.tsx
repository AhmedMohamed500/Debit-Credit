"use client";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import type { Locale } from "@/types";

export function PasswordField({
  locale,
  confirm = false,
  signup,
  disabled = false,
}: {
  locale: Locale;
  confirm?: boolean;
  signup: boolean;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const ar = locale === "ar",
    id = confirm ? "auth-confirm" : "auth-password",
    helper = !confirm && signup;
  const reveal = ar
    ? visible
      ? "إخفاء كلمة المرور"
      : "إظهار كلمة المرور"
    : visible
      ? "Hide password"
      : "Show password";
  return (
    <div className="auth-field">
      <label htmlFor={id}>
        {confirm
          ? ar
            ? "تأكيد كلمة المرور"
            : "Confirm password"
          : ar
            ? "كلمة المرور"
            : "Password"}
      </label>
      <div className="auth-input-wrap">
        <LockKeyhole className="auth-input-icon" aria-hidden="true" />
        <input
          id={id}
          name={confirm ? "confirm" : "password"}
          type={visible ? "text" : "password"}
          autoComplete={signup ? "new-password" : "current-password"}
          minLength={signup ? 12 : 1}
          maxLength={128}
          required
          disabled={disabled}
          aria-describedby={helper ? "auth-password-help" : undefined}
          placeholder={
            confirm
              ? ar
                ? "أعد إدخال كلمة المرور"
                : "Enter your password again"
              : ar
                ? "أدخل كلمة مرورك"
                : "Enter your password"
          }
        />
        <button
          type="button"
          className="auth-password-reveal"
          onClick={() => setVisible(!visible)}
          aria-label={`${reveal}${confirm ? (ar ? " المؤكدة" : " confirmation") : ""}`}
          aria-pressed={visible}
          aria-controls={id}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
      {helper && (
        <small id="auth-password-help">
          {ar
            ? "12 حرفًا على الأقل. لا تشارك كلمة المرور."
            : "At least 12 characters. Never share your password."}
        </small>
      )}
    </div>
  );
}
