import Link from "next/link";
import type { Locale } from "@/types";

export function AuthBrand({ locale }: { locale: Locale }) {
  return (
    <Link
      className="auth-brand"
      href={`/${locale}`}
      aria-label="Debit & Credit"
    >
      <span dir="ltr">Debit &amp; Credit</span>
      <span className="auth-brand-mark" aria-hidden="true" />
    </Link>
  );
}
