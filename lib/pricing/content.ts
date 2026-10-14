import type { Locale } from "@/types";

export const MONTHLY_PRICE_EGP = 129;
export const ANNUAL_PRICE_EGP = 899;
export const ANNUAL_SAVING_EGP = MONTHLY_PRICE_EGP * 12 - ANNUAL_PRICE_EGP;
export const ANNUAL_SAVING_PERCENT = Math.round(
  (ANNUAL_SAVING_EGP / (MONTHLY_PRICE_EGP * 12)) * 100,
);

export type PricingAudience = "student" | "accountant" | "company";
export type BillingSelection = "monthly" | "annual";

const ar = {
  nav: [
    "الرئيسية",
    "المسارات التعليمية",
    "المحاكاة العملية",
    "المكتبة المحاسبية",
    "التسعير",
    "للشركات",
    "من نحن",
  ],
  search: "بحث",
  language: "العربية",
  login: "تسجيل الدخول",
  start: "ابدأ مجانًا",
  headline: "من أول خطوة\nإلى فرصة حقيقية..",
  subtitle:
    "خطط مرنة تناسب رحلتك في المحاسبة\nمع محاكاة عملية وتجربة تفاعلية قريبة من سوق العمل",
  benefitsTitle: "مميزات المنصة",
  benefits: [
    "محاكاة واقعية لبيئة العمل",
    "مسارات تعليمية عملية",
    "مهمات وتقييمات تفاعلية",
    "ملف مهني وسيرة ذاتية",
  ],
  audiences: {
    student: {
      name: "طالب",
      line: "ابدأ من الصفر وتعلم بالممارسة",
      hero: "من أول مهمة إلى ملف مهني يوثق تدريبك",
    },
    accountant: {
      name: "محاسب",
      line: "طوّر مهاراتك وخبراتك",
      hero: "تدرّب على مواقف محاسبية واقعية وراجع أدلتك",
    },
    company: {
      name: "شركة/مؤسسة",
      line: "اكتشف نسخة أصحاب العمل التجريبية",
      hero: "اطّلع على الملفات المهنية التي وافق أصحابها على مشاركتها",
    },
  },
  milestones: [
    "ابدأ رحلتك",
    "تعلّم بالممارسة",
    "ابنِ ملفك المهني",
    "فرصة أفضل",
  ],
  monthly: "شهري",
  annual: "سنوي",
  save: `وفّر نحو ${ANNUAL_SAVING_PERCENT}%`,
  monthlyFlexibility: "مرونة الدفع الشهري",
  selectedPlan: "الخطة المحددة",
  free: "مجاني",
  monthlyTitle: "خطة Pro الشهرية",
  annualTitle: "خطة Pro السنوية",
  journeyTitle: "رحلتك بعد الاشتراك",
  freeSubtitle: "ابدأ رحلتك الآن",
  monthlySubtitle: "تعلّم وتطوّر بمرونة شهرية",
  annualSubtitle: "تعلّم أكثر مع تكلفة سنوية أقل",
  always: "دائمًا",
  perMonth: "شهريًا",
  perYear: "سنويًا",
  currency: "جنيه",
  proposed: "أسعار مقترحة · الاشتراك المدفوع غير متاح حاليًا",
  bestValue: "الأكثر قيمة",
  recommended: "مقترح للمقارنة",
  freeFeatures: ["أساسيات المحاسبة", "محاكاة أول وردية", "الملف المهني وCV"],
  unavailableFeatures: [
    "اشتراك Pro مدفوع",
    "مزايا حصرية مدفوعة",
    "شهادات مهنية معتمدة",
  ],
  proFeatures: [
    "المسارات التعليمية المتاحة",
    "محاكاة محاسبية عملية",
    "تتبع تقدمك ومهاراتك",
    "ملف مهني وسيرة ذاتية إنجليزية",
    "تسجيل أدلة التدريب المقبولة",
    "الوصول حسب الإتاحة الحالية",
  ],
  freeAction: "ابدأ مجانًا",
  paidAction: "الاشتراك قريبًا",
  journeyAction: "ابدأ الآن وطور مستقبلك",
  journey: [
    { title: "المهام الأولى", detail: "ابدأ بمهمات تدريبية عملية" },
    { title: "تطبيق عملي", detail: "حالات تحاكي بيئة العمل" },
    { title: "مهارات وملف مهني", detail: "وثّق تقدمك بالأدلة" },
    { title: "استعداد لفرص أفضل", detail: "قدّم ملفك بموافقتك" },
  ],
  quote: "استثمار اليوم\nهو فرصتك غدًا",
  comparisonTitle: "مقارنة سريعة بين الخطط",
  featuresLabel: "المميزات",
  tableFeatures: [
    "الأساسيات",
    "مهمات المحاكاة",
    "تتبّع التقدم",
    "الملف المهني وCV",
    "أدلة التدريب",
  ],
  experienceTitle: "ما الذي تجده في المنصة؟",
  experience: [
    "تتدرب على القيود والدفاتر ومهام محاسبية تحاكي العمل.",
    "أعمالك التدريبية المقبولة تظهر كأدلة داخل ملفك المهني.",
  ],
  paidNotice:
    "الأسعار المعروضة مقترحة. الدفع والاشتراك المدفوع غير متاحين الآن.",
  companyNotice:
    "خدمات أصحاب العمل حاليًا في مرحلة تجريبية. يمكنك استكشاف الملفات المهنية المشتركة بموافقة أصحابها.",
  close: "إغلاق",
  learnMore: "استكشف أصحاب العمل",
  audienceLabel: "اختر مسارك",
  billingLabel: "اختيار مدة الخطة",
} as const;

const en = {
  nav: [
    "Home",
    "Learning paths",
    "Practical simulations",
    "Accounting library",
    "Pricing",
    "For employers",
    "About",
  ],
  search: "Search",
  language: "English",
  login: "Sign in",
  start: "Start free",
  headline: "From your first step\nto a real opportunity.",
  subtitle:
    "Flexible plans for your accounting journey\nwith practical simulations inspired by real work",
  benefitsTitle: "Platform benefits",
  benefits: [
    "Realistic work simulations",
    "Practical learning paths",
    "Interactive tasks and assessments",
    "Professional profile and CV",
  ],
  audiences: {
    student: {
      name: "Student",
      line: "Learn accounting from the start",
      hero: "From your first task to a portfolio of training evidence",
    },
    accountant: {
      name: "Accountant",
      line: "Develop your practical skills",
      hero: "Practice realistic cases and review your evidence",
    },
    company: {
      name: "Company",
      line: "Explore the employer beta",
      hero: "View profiles their owners have consented to share",
    },
  },
  milestones: [
    "Start your journey",
    "Learn by doing",
    "Build your profile",
    "Better opportunities",
  ],
  monthly: "Monthly",
  annual: "Annual",
  save: `Save about ${ANNUAL_SAVING_PERCENT}%`,
  monthlyFlexibility: "Flexible monthly billing",
  selectedPlan: "Selected plan",
  free: "Free",
  monthlyTitle: "Monthly Pro",
  annualTitle: "Annual Pro",
  journeyTitle: "Your journey after joining",
  freeSubtitle: "Start your journey today",
  monthlySubtitle: "Learn flexibly each month",
  annualSubtitle: "Learn more for less each year",
  always: "forever",
  perMonth: "per month",
  perYear: "per year",
  currency: "EGP",
  proposed: "Proposed prices · paid subscriptions are not available yet",
  bestValue: "Best value",
  recommended: "Comparison option",
  freeFeatures: [
    "Accounting fundamentals",
    "First Shift simulation",
    "Professional profile and CV",
  ],
  unavailableFeatures: [
    "Paid Pro subscription",
    "Exclusive paid benefits",
    "Accredited certificates",
  ],
  proFeatures: [
    "Available learning paths",
    "Practical accounting simulations",
    "Progress and skill tracking",
    "Professional profile and English CV",
    "Accepted training evidence",
    "Access subject to current availability",
  ],
  freeAction: "Start free",
  paidAction: "Subscriptions coming soon",
  journeyAction: "Start building your future",
  journey: [
    { title: "First tasks", detail: "Start with practical training" },
    { title: "Applied practice", detail: "Cases inspired by real work" },
    { title: "Skills and profile", detail: "Document progress with evidence" },
    { title: "Prepare to apply", detail: "Share your profile with consent" },
  ],
  quote: "Today's investment\nopens tomorrow's door",
  comparisonTitle: "Quick plan comparison",
  featuresLabel: "Features",
  tableFeatures: [
    "Fundamentals",
    "Simulation tasks",
    "Progress tracking",
    "Professional profile and CV",
    "Training evidence",
  ],
  experienceTitle: "What can you do here?",
  experience: [
    "Practice journal entries, ledgers, and accounting tasks inspired by work.",
    "Accepted training work becomes evidence in your professional profile.",
  ],
  paidNotice:
    "These are proposed prices. Payment and paid subscriptions are not available yet.",
  companyNotice:
    "Employer tools are in beta. You can explore profiles that their owners chose to share.",
  close: "Close",
  learnMore: "Explore employer beta",
  audienceLabel: "Choose your path",
  billingLabel: "Billing period",
};

export function pricingContent(locale: Locale) {
  return locale === "ar" ? ar : en;
}
