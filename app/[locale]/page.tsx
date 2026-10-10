import { MarketingLanding } from "@/components/platform/marketing-landing";
import type { Locale } from "@/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { backendConfigured } from "@/lib/server/security/env";
import { requireUser } from "@/lib/server/auth/guards";
import { HttpError } from "@/lib/server/security/http";
import { personalFor } from "@/lib/server/profiles/personal";
import "@/app/student.css";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  let user = null;
  if (backendConfigured()) {
    try {
      user = await requireUser(await headers());
    } catch (error) {
      if (!(error instanceof HttpError && error.status === 401)) throw error;
    }
  }
  if (!user) return <MarketingLanding locale={locale} />;
  const personal = await personalFor(user.id);
  if (!personal.data)
    redirect(
      `/${locale}/student-profile?next=${encodeURIComponent(`/${locale}`)}`,
    );
  const ar = locale === "ar";
  return (
    <main className="student-page" dir={ar ? "rtl" : "ltr"}>
      <section className="student-card">
        <p>Debit & Credit</p>
        <h1>
          {ar
            ? `أهلًا ${personal.data.details.fullName}، ابدأ تدريبك المحاسبي`
            : `Welcome ${personal.data.details.fullName}, start your accounting training`}
        </h1>
        <p>
          {ar
            ? "بيانات سيرتك جاهزة. إنجازات التدريب المقبولة تُضاف تلقائيًا بصياغة محاسبية، بدون اعتبارها خبرة توظيف فعلية."
            : "Your CV details are ready. Accepted training achievements are added automatically as accounting simulation experience, not employment."}
        </p>
        <Link className="student-primary" href={`/${locale}/student`}>
          {ar
            ? "ابدأ: من المستند إلى الدفاتر"
            : "Start: Source documents to books"}
        </Link>
        <div className="student-links">
          <Link href={`/${locale}/career-profile/cv`}>
            {ar ? "السيرة الذاتية التلقائية" : "Automatic CV"}
          </Link>
          <Link href={`/${locale}/student-profile`}>
            {ar ? "تعديل بياناتي" : "Edit personal details"}
          </Link>
          <Link href={`/${locale}/game`}>{ar ? "مركز اللعب" : "Game hub"}</Link>
          <Link href={`/${locale}/career-league/map`}>
            {ar ? "المسار المهني" : "Career path"}
          </Link>
        </div>
      </section>
      <section className="student-card">
        <h2>{ar ? "الوحدة الأولى" : "Unit one"}</h2>
        <p>
          {ar
            ? "ملف شركة خدمات وتجارة تدريبي بمستندات مؤيدة: افحص المستند، حدّد الحسابات، سجّل القيد، تتبّع الأستاذ، ثم راجع ميزان المراجعة وأخطاء التصنيف وورقة العمل."
            : "A training services and trading company file: inspect supporting documents, select accounts, record entries, trace the ledger, then review the trial balance, classification errors and worksheet."}
        </p>
        <p>
          {ar
            ? "وحدات الموردين والعملاء والمخزون والرواتب والضرائب والإقفال الشامل تُضاف لاحقًا؛ لا نعرضها كمهارات مكتسبة الآن."
            : "Dedicated AP, AR, inventory, payroll, tax and full-closing units are future curriculum; they are not claimed as earned skills."}
        </p>
      </section>
    </main>
  );
}
