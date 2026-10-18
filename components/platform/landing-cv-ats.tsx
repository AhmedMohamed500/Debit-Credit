import Image from "next/image";
import { AuthCTA } from "@/components/cloud/auth-cta";
import {
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  FileDown,
  FileText,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { Locale } from "@/types";
import { evaluateAtsCv } from "@/lib/career/ats";
import { blocksText } from "@/lib/career/compact-cv";
import "@/app/landing-cv-ats.css";

const copy = {
  ar: {
    eyebrow: "من التدريب إلى فرصة حقيقية",
    title: "كل إنجازاتك تصنع سيرة ذاتية",
    titleAccent: "واحدة احترافية",
    description: "تجمع دوراتك وشهاداتك ومشاريعك العملية ومهاراتك في سيرة ذاتية احترافية تبرز بياناتك وإنجازاتك الحقيقية.",
    sources: ["الدورات التدريبية", "الشهادات المهنية", "المشاريع العملية", "التدريب والمحاكاة", "المهارات التقنية"],
    sourceDetails: ["المكتملة والمسجلة", "التي أضفتها إلى ملفك", "الأعمال المؤهلة", "النتائج المقبولة", "المدعومة بأدلة"],
    ats: "مبنية على فحوصات ATS المحددة",
    sample: "مثال توضيحي: اجتاز 6 من 6 فحوصات",
    checks: ["هيكل أحادي العمود", "بدون صورة في نسخة ATS", "عناوين أقسام واضحة", "قابلية قراءة النص", "كلمات مفتاحية من البيانات المتوفرة", "تنسيق بسيط للأنظمة"],
    disclaimer: "نتيجة مبنية على الفحوصات المحددة داخل المنصة، وليست ضمانًا للتوافق أو القبول لدى كل الشركات.",
    pdf: "تحميل PDF",
    word: "تحميل Word",
    updateTitle: "تتحدث السيرة الذاتية تلقائيًا من بياناتك وإنجازاتك المؤهلة فقط.",
    updateDescription: "يتم تحديث النسخة تلقائيًا عند إضافة بيانات أو إنجازات مؤهلة داخل المنصة.",
    sampleResume: "نموذج بصري توضيحي — ليس سيرة مستخدم",
    sampleName: "الاسم المهني",
    sampleRole: "محاسب مبتدئ",
    sampleSummary: "الملخص المهني",
    sampleSummaryText: "تظهر هنا نبذة صاحب الحساب من بياناته المحفوظة، دون إضافة خبرة أو مؤهلات غير موثقة.",
    sampleSections: ["التعليم", "المهارات", "التدريب العملي"],
    profileLabel: "ملفك الشخصي على المنصة",
    profileSample: "صورة توضيحية — بياناتك تظهر بعد تسجيل الدخول",
    details: "كيف تُحسب الفحوصات؟",
    detailsText: "المثال البصري مستوفٍ للشروط الستة المعروضة. تُحسب نتيجة سيرتك الفعلية من محتواها المحفوظ؛ وقد تختلف، ولا تقيس فرص التوظيف.",
    actionNote: "سجّل الدخول أو أنشئ حسابًا للوصول إلى تنزيل سيرتك الشخصية.",
  },
  en: {
    eyebrow: "From practice to real opportunity",
    title: "Your achievements build one",
    titleAccent: "professional CV",
    description: "Your saved courses, certificates, practical work and supported skills come together in a CV that reflects your real information and eligible achievements.",
    sources: ["Training courses", "Professional certificates", "Practical projects", "Training and simulation", "Technical skills"],
    sourceDetails: ["Completed and saved", "Added to your profile", "Eligible work only", "Accepted outcomes", "Supported by evidence"],
    ats: "Built around defined ATS checks",
    sample: "Illustrative example: 6 of 6 checks pass",
    checks: ["Single-column structure", "No photo in ATS version", "Clear section headings", "Readable text", "Keywords from available data", "Simple system-friendly layout"],
    disclaimer: "The result covers only the checks defined on this platform; it does not guarantee compatibility or acceptance by every employer.",
    pdf: "Download PDF",
    word: "Download Word",
    updateTitle: "Your CV updates from your data and eligible achievements only.",
    updateDescription: "The document refreshes when you save eligible details or achievements on the platform.",
    sampleResume: "Illustrative visual — not a user's CV",
    sampleName: "Candidate Name",
    sampleRole: "Junior Accountant",
    sampleSummary: "Professional Summary",
    sampleSummaryText: "Your saved profile summary appears here. Work experience and qualifications are never invented.",
    sampleSections: ["Education", "Skills", "Practical Training"],
    profileLabel: "Your platform profile",
    profileSample: "Illustrative image — your details appear after sign-in",
    details: "How are checks calculated?",
    detailsText: "This visual sample passes the six displayed structural checks. Your real score is calculated from your saved CV and may differ; it is not a hiring probability.",
    actionNote: "Sign in or create an account to download your private CV.",
  },
} as const;

const sourceIcons = [BookOpen, Award, BarChart3, BriefcaseBusiness, GraduationCap];
const illustrativeBlocks = [
  { id: "contact", header: true, lines: ["Candidate Name", "Junior Accountant", "candidate@example.test"] },
  { id: "summary", heading: "Professional Summary", lines: ["Illustrative factual summary."] },
  { id: "skills", heading: "Relevant Skills", lines: ["Accounting Competencies"] },
];
const illustrativeAts = evaluateAtsCv({ blocks: illustrativeBlocks, plainText: blocksText(illustrativeBlocks), omitted: 0, needsEnglish: 0 });

export function LandingCvAts({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section id="cv-ats" className="landing-cv-ats" dir={locale === "ar" ? "rtl" : "ltr"} aria-labelledby="landing-cv-ats-title">
      <div className="landing-cv-ats-inner">
        <div className="landing-cv-ats-art" aria-label={t.sampleResume}>
          <div className="landing-cv-ats-lightpath" aria-hidden="true" />
          <div className="landing-cv-ats-paper-stack" aria-hidden="true" />
          <article className="landing-cv-ats-paper" lang="en" dir="ltr">
            <span className="landing-cv-ats-example">ILLUSTRATIVE SAMPLE · NO PERSONAL DATA</span>
            <header><strong>Candidate Name</strong><span>Junior Accountant</span><small>City, Country · candidate@example.test</small></header>
            <h3>PROFESSIONAL SUMMARY</h3>
            <p>Your saved profile summary appears here. No work experience or qualification is invented.</p>
            <h3>EDUCATION</h3><p>Only education supplied by the account holder.</p>
            <h3>SKILLS</h3><p>Only supported accounting competencies.</p>
            <h3>PRACTICAL TRAINING</h3><p>Accepted simulation work is labelled as training, not employment.</p>
          </article>
          <div className="landing-cv-ats-profile-card">
            <Image src="/platform/beginner-student-avatar.png" width={74} height={74} alt="" />
            <strong>{t.profileLabel}</strong><small>{t.profileSample}</small>
          </div>
          <div className="landing-cv-ats-source-list">
            {t.sources.map((source, index) => {
              const Icon = sourceIcons[index];
              return <div className={`landing-cv-ats-source source-${index + 1}`} key={source}>
                <span className="landing-cv-ats-source-icon"><Icon aria-hidden="true" /></span>
                <span><strong>{source}</strong><small>{t.sourceDetails[index]}</small></span>
                <Check className="landing-cv-ats-source-check" aria-hidden="true" />
              </div>;
            })}
          </div>
          <p className="landing-cv-ats-art-note">{t.sampleResume}</p>
        </div>
        <div className="landing-cv-ats-content">
          <span className="landing-cv-ats-eyebrow">{t.eyebrow}</span>
          <h2 id="landing-cv-ats-title">{t.title}<br /><em>{t.titleAccent}</em></h2>
          <p className="landing-cv-ats-description">{t.description}</p>
          <div className="landing-cv-ats-panel">
            <div className="landing-cv-ats-panel-head"><ShieldCheck aria-hidden="true" /><h3>{t.ats}</h3></div>
            <div className="landing-cv-ats-panel-body">
              <ul>{t.checks.map((check) => <li key={check}><Check aria-hidden="true" /><span>{check}</span></li>)}</ul>
              <div className="landing-cv-ats-gauge" role="img" aria-label={t.sample}><span><strong>{illustrativeAts.score}%</strong><small>{t.sample}</small></span></div>
            </div>
            <details className="landing-cv-ats-explainer"><summary>{t.details}</summary><p>{t.detailsText}</p></details>
            <p className="landing-cv-ats-disclaimer">{t.disclaimer}</p>
          </div>
          <div className="landing-cv-ats-actions">
            <AuthCTA href={`/${locale}/career-profile/cv?download=pdf`}><FileDown aria-hidden="true" />{t.pdf}</AuthCTA>
            <AuthCTA href={`/${locale}/career-profile/cv?download=docx`}><FileText aria-hidden="true" />{t.word}</AuthCTA>
          </div>
          <p className="landing-cv-ats-action-note">{t.actionNote}</p>
          <div className="landing-cv-ats-sync"><RefreshCw aria-hidden="true" /><div><strong>{t.updateTitle}</strong><p>{t.updateDescription}</p></div></div>
        </div>
      </div>
    </section>
  );
}
