import type { ReactNode } from "react";
import type { Locale } from "@/types";
import { AuthStoryPanel } from "./auth-story-panel";

export function AuthShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <main className={`auth-experience auth-experience-${locale}`}>
      <AuthStoryPanel locale={locale} />
      <div className="auth-form-side" dir={locale === "ar" ? "rtl" : "ltr"}>
        {children}
      </div>
    </main>
  );
}
