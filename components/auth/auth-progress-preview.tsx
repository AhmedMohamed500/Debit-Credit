import { Award, Check, Circle, Sparkles, Trophy } from "lucide-react";
import type { Locale } from "@/types";

export function AuthProgressPreview({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  return (
    <aside
      className="auth-preview"
      aria-label={
        ar ? "مثال توضيحي للتقدم داخل المنصة" : "Illustrative platform progress"
      }
    >
      <div className="auth-preview-board">
        <div className="auth-preview-score">
          <span className="auth-progress-ring">
            <b dir="ltr">78%</b>
          </span>
          <strong>{ar ? "مستوى التقدم" : "Your progress"}</strong>
          <span className="auth-preview-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="auth-preview-skills">
          <h3>{ar ? "رحلتك المهنية" : "Your career journey"}</h3>
          {[
            ar ? "أساسيات المحاسبة" : "Accounting fundamentals",
            ar ? "إعداد القوائم المالية" : "Financial statements",
            ar ? "التحليل المالي" : "Financial analysis",
            ar ? "جاهز لسوق العمل" : "Career readiness",
          ].map((skill, index) => (
            <p key={skill}>
              {index < 3 ? (
                <Check aria-hidden="true" />
              ) : (
                <Circle aria-hidden="true" />
              )}
              <span>{skill}</span>
            </p>
          ))}
        </div>
      </div>
      <div className="auth-achievement">
        <span>
          <Trophy aria-hidden="true" />
        </span>
        <div>
          <strong>{ar ? "رائع!" : "Nicely done!"}</strong>
          <p>
            {ar
              ? "أكملت تحدّي القوائم المالية"
              : "Financial statements challenge complete"}
          </p>
        </div>
        <Sparkles className="auth-sparkle" aria-hidden="true" />
      </div>
      <div className="auth-skill-badge">
        <Award aria-hidden="true" />
        <div>
          <strong>{ar ? "إنجاز جديد" : "A new achievement"}</strong>
          <p>
            {ar
              ? "مهارة جديدة داخل المنصة"
              : "Another skill, another step forward"}
          </p>
          <span className="auth-preview-meter" aria-hidden="true" />
        </div>
      </div>
      <small className="auth-preview-caption">
        {ar
          ? "مثال توضيحي من تجربة التعلّم"
          : "A preview of your learning experience"}
      </small>
    </aside>
  );
}
