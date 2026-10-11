import Link from "next/link";
import { BriefcaseBusiness, FileText, Shield, Users } from "lucide-react";
import type { Locale } from "@/types";
import "@/app/talent-platform.css";
import "@/app/employer-talent.css";
export function CompaniesLanding({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  return (
    <main className="talent-platform" dir={ar ? "rtl" : "ltr"}>
      <header className="talent-nav">
        <Link className="talent-brand" href={`/${locale}`}>
          <BriefcaseBusiness />
          Debit & Credit
        </Link>
        <nav>
          <Link href={`/${locale}/career-profile`}>
            {ar ? "الملف المهني" : "Career portfolio"}
          </Link>
          <Link href={`/${locale}/employer/candidates`}>
            {ar ? "اكتشاف المرشحين" : "Discover candidates"}
          </Link>
        </nav>
      </header>
      <section className="talent-hero">
        <h1>
          {ar ? "اكتشف المواهب المحاسبية المناسبة" : "Find Accounting Talent"}
        </h1>
        <p>
          {ar
            ? "ملفات مهنية حقيقية من أصحابها، ومهارات مدعومة بأدلة ممارسة. يظهر فقط من وافق على الاكتشاف، ولا تُكشف بيانات الاتصال الخاصة."
            : "Real owner-managed portfolios and practice-supported skill evidence. Only candidates who opted in appear, without exposing private contact information."}
        </p>
        <Link
          className="talent-primary"
          href={`/${locale}/employer/candidates`}
        >
          {ar ? "ابدأ اكتشاف المرشحين" : "Open talent discovery"}
        </Link>
      </section>
      <section className="company-editor">
        <h2>
          {ar
            ? "توظيف مبني على معلومات واضحة"
            : "Review transparent professional information"}
        </h2>
        <p>
          <Shield size={18} />{" "}
          {ar
            ? "موافقة مستقلة من المرشح، وحساب شركة معلن ذاتيًا دون شارة توثيق وهمية."
            : "Explicit candidate consent and a self-reported company identity, without invented verification."}
        </p>
        <p>
          <FileText size={18} />{" "}
          {ar
            ? "المحاكاة تدريب وليست خبرة توظيف، والشهادات المضافة ليست معتمدة تلقائيًا."
            : "Simulation is training, not employment. Uploaded certificates are not automatically accredited."}
        </p>
        <p>
          <Users size={18} />{" "}
          {ar
            ? "بحث على السيرفر وقائمة مختصرة محفوظة للشركة وطلبات تواصل داخلية آمنة."
            : "Server-side search, a persistent company shortlist and safe internal contact requests."}
        </p>
      </section>
    </main>
  );
}
