import {
  BarChart3,
  BriefcaseBusiness,
  Gamepad2,
  TrendingUp,
} from "lucide-react";
import type { Locale } from "@/types";

export function AuthBenefits({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const benefits = [
    {
      icon: Gamepad2,
      tone: "blue",
      title: ar ? "تعلّم بأسلوب ممتع" : "Learn through play",
      description: ar
        ? "دروس تفاعلية وتحديات ومكافآت"
        : "Interactive lessons, challenges and rewards",
    },
    {
      icon: BarChart3,
      tone: "mint",
      title: ar ? "اكتسب مهارات عملية" : "Build practical skills",
      description: ar
        ? "من أساسيات المحاسبة إلى التقارير المالية الواقعية"
        : "From accounting fundamentals to real financial work",
    },
    {
      icon: BriefcaseBusiness,
      tone: "violet",
      title: ar ? "جهّز نفسك لسوق العمل" : "Prepare for your career",
      description: ar
        ? "مشاريع عملية وتجارب تحاكي الشغل الحقيقي"
        : "Hands-on projects and workplace simulations",
    },
    {
      icon: TrendingUp,
      tone: "gold",
      title: ar ? "تابع تقدمك وحقق أهدافك" : "Grow at your own pace",
      description: ar
        ? "مسار تعلّم وتطور مهني يناسب مستواك"
        : "A career learning path built around your goals",
    },
  ];
  return (
    <ul className="auth-benefits">
      {benefits.map(({ icon: Icon, tone, title, description }) => (
        <li key={tone}>
          <span className={`auth-benefit-icon ${tone}`}>
            <Icon aria-hidden="true" />
          </span>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
