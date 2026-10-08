import type { ReactNode } from "react";
import type { Locale } from "@/types";
import { AuthBrand } from "./auth-brand";

export function AuthFormCard({
  locale,
  signup,
  enabled,
  children,
}: {
  locale: Locale;
  signup: boolean;
  enabled: boolean;
  children: ReactNode;
}) {
  const ar = locale === "ar";
  return (
    <section className="auth-form-card" aria-labelledby="auth-form-title">
      <header>
        <AuthBrand locale={locale} />
        <p className="auth-eyebrow">
          {ar ? "رحلتك المحاسبية" : "YOUR ACCOUNTING JOURNEY"}
        </p>
        <h1 id="auth-form-title">
          {signup
            ? ar
              ? "أنشئ حسابك المجاني"
              : "Create your free account"
            : ar
              ? "أهلًا بعودتك"
              : "Welcome back"}
        </h1>
        <p className="auth-form-subtitle">
          {enabled
            ? ar
              ? "حساب واحد. وتقدمك المدعوم معك على أجهزتك."
              : "One account. Your progress across supported devices."
            : ar
              ? "خطوتك الأولى نحو تعلّم المحاسبة بالممارسة."
              : "Your next step towards learning accounting by doing."}
        </p>
      </header>
      {children}
    </section>
  );
}
