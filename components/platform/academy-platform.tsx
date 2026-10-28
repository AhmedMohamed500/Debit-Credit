import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, Calculator, CheckCircle2, FileText, GraduationCap } from "lucide-react";
import type { Locale } from "@/types";
import { PlatformNav } from "./platform-nav";

export function AcademyPlatform({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const say = (en: string, arabic: string) => (ar ? arabic : en);
  const catalog = [
    {
      icon: BookOpenCheck,
      title: say("Accounting Foundations", "أساسيات المحاسبة"),
      description: say("Accounting equation, account nature, debit and credit with interactive lessons.", "المعادلة المحاسبية وطبيعة الحسابات والمدين والدائن في دروس تفاعلية."),
      href: `/${locale}/academy/accounting-foundations`,
    },
    {
      icon: FileText,
      title: say("Journal Practice", "تدريب القيود اليومية"),
      description: say("Practice supported entries without claiming professional verification.", "تدرّب على القيود المؤيدة دون ادعاء توثيق مهني."),
      href: `/${locale}/practice`,
    },
    {
      icon: Calculator,
      title: say("Nature of Accounts", "طبيعة الحسابات"),
      description: say("Use the shared account catalog as a learning and workplace reference.", "استخدم دليل الحسابات المشترك كمرجع للتعلم والعمل."),
      href: `/${locale}/account-guide`,
    },
  ];
  return (
    <main className="platform-page academy-platform">
      <PlatformNav locale={locale} />
      <header className="academy-platform-hero">
        <span><GraduationCap />{say("ACCOUNTING ACADEMY", "أكاديمية المحاسبة")}</span>
        <h1>{say("Learn it. Practice it. Use it at work.", "اتعلّمها. تدرّب عليها. استخدمها في الشغل.")}</h1>
        <p>{say("A focused catalog of learning content that is available now. Your saved journey remains the single place that decides the next step.", "مكتبة مركزة للمحتوى التعليمي المتاح الآن. تظل رحلتك المحفوظة هي المكان الوحيد الذي يحدد الخطوة التالية.")}</p>
      </header>
      <section className="academy-catalog" aria-label={say("Available learning catalog", "مكتبة التعلم المتاحة")}>
        <header>
          <span>{say("AVAILABLE NOW", "متاح الآن")}</span>
          <h2>{say("Choose a lesson or reference", "اختر درسًا أو مرجعًا")}</h2>
          <p>{say("Only working destinations appear here; planned material is not advertised as playable.", "تظهر هنا الوجهات التي تعمل فعليًا فقط؛ ولا يُعرض المحتوى المخطط كأنه قابل للعب.")}</p>
        </header>
        <div>
          {catalog.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.href}>
                <Icon />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link href={item.href} aria-label={item.title}>{say("Open", "افتح")}<Arrow /></Link>
              </article>
            );
          })}
        </div>
      </section>
      <section className="academy-foundation">
        <div>
          <span>{say("FOUNDATION RULE", "قاعدة الأساس")}</span>
          <h2>{say("Professional cases come after correct fundamentals.", "الحالات المهنية تأتي بعد فهم الأساسيات.")}</h2>
          <p>{say("The same 197-account catalog powers learning and workplace reference. No duplicate account catalog was created.", "دليل الحسابات نفسه الذي يضم 197 حسابًا يخدم التعلم ومرجع العمل. لم يُنشأ دليل حسابات مكرر.")}</p>
        </div>
        <div>
          <CheckCircle2 /><b>{say("Accounting equation", "المعادلة المحاسبية")}</b>
          <CheckCircle2 /><b>{say("Nature of accounts", "طبيعة الحسابات")}</b>
          <CheckCircle2 /><b>{say("Debit and credit", "المدين والدائن")}</b>
          <CheckCircle2 /><b>{say("Source documents", "المستندات")}</b>
        </div>
      </section>
    </main>
  );
}
