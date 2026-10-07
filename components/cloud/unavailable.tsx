import Link from "next/link";
import type { Locale } from "@/types";
export function CloudUnavailable({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  return (
    <main className="cloud-page">
      <section className="cloud-card cloud-state">
        <h1>
          {ar
            ? "الخدمة السحابية غير متاحة حاليًا"
            : "Cloud service currently unavailable"}
        </h1>
        <p>
          {ar
            ? "الإعدادات غير مكتملة أو الاتصال بقاعدة البيانات غير متاح. لا نعرض بيانات أو نتائج وهمية."
            : "Setup is incomplete or the database is unavailable. No fabricated data or results are displayed."}
        </p>
        <Link href={`/${locale}`}>
          {ar ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <p>
          <Link href={`/${locale}/bootcamp`}>
            {ar ? "التعلم المحلي" : "Local learning"}
          </Link>
        </p>
      </section>
    </main>
  );
}
