import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import type { Locale } from "@/types";

export function GoogleAuthButton({
  locale,
  available,
  pending,
  busy = false,
  onClick,
}: {
  locale: Locale;
  available: boolean;
  pending: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  const ar = locale === "ar";
  return (
    <button
      type="button"
      className="auth-google"
      disabled={!available || pending || busy}
      onClick={onClick}
      aria-describedby={!available ? "auth-google-notice" : undefined}
    >
      <svg aria-hidden="true" viewBox="0 0 48 48">
        <path
          fill="#4285f4"
          d="M43.6 24.5c0-1.4-.1-2.8-.4-4.2H24v7.9h11c-.5 2.5-1.9 4.6-4 6v5h6.5c3.9-3.6 6.1-8.8 6.1-14.7Z"
        />
        <path
          fill="#34a853"
          d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.5-5c-1.8 1.2-4.1 1.9-7 1.9-5.3 0-9.8-3.6-11.4-8.4H5.9v5.2C9.3 39.5 16.1 44 24 44Z"
        />
        <path
          fill="#fbbc05"
          d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.9a20 20 0 0 0 0 17.8l6.7-5.2Z"
        />
        <path
          fill="#ea4335"
          d="M24 11.9c3 0 5.7 1 7.8 3l5.9-5.9A19.4 19.4 0 0 0 24 4C16.1 4 9.3 8.5 5.9 15.1l6.7 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z"
        />
      </svg>
      <span>
        {pending
          ? ar
            ? "جارٍ فتح Google…"
            : "Opening Google…"
          : ar
            ? "المتابعة باستخدام Google"
            : "Continue with Google"}
      </span>
      {pending ? (
        <LoaderCircle className="auth-spinner" aria-hidden="true" />
      ) : ar ? (
        <ArrowLeft aria-hidden="true" />
      ) : (
        <ArrowRight aria-hidden="true" />
      )}
    </button>
  );
}
