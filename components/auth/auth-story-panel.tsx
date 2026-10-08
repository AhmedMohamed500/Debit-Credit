import Image from "next/image";
import { ArrowUpRight, Rocket, Trophy } from "lucide-react";
import { AuthBrand } from "./auth-brand";
import { AuthBenefits } from "./auth-benefits";
import { AuthProgressPreview } from "./auth-progress-preview";
import type { Locale } from "@/types";

export function AuthStoryPanel({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  return (
    <section
      className="auth-story"
      dir={ar ? "rtl" : "ltr"}
      aria-labelledby="auth-story-title"
    >
      <div className="auth-story-brand">
        <AuthBrand locale={locale} />
      </div>
      <div className="auth-art">
        <Image
          className="auth-art-desktop"
          src="/auth/career-workspace-v1.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 1px, 62vw"
        />
        <Image
          className="auth-art-mobile"
          src="/auth/career-workspace-mobile-v1.webp"
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 1px"
        />
      </div>
      <div className="auth-story-copy">
        <h2 id="auth-story-title">
          {ar ? (
            <>
              تعلّم بالممارسة <em>والتسلية</em>
            </>
          ) : (
            <>
              Learn by doing.
              <br />
              <em>Enjoy every step.</em>
            </>
          )}
        </h2>
        <p className="auth-story-subtitle">
          {ar
            ? "بعيد عن الملل والمحاضرات الأكاديمية"
            : "Not by sitting through boring lectures."}
        </p>
        <div className="auth-play-pill">
          <Trophy aria-hidden="true" />
          <span>
            {ar
              ? "حوّل التعلّم إلى تجربة ممتعة"
              : "Turn learning into an experience"}
          </span>
          <Rocket aria-hidden="true" />
        </div>
        <p className="auth-story-intro">
          {ar
            ? "من التعلّم التفاعلي إلى المهارات العملية، كل ما تحتاجه لتبني خبرتك وتستعد لسوق العمل."
            : "Practice real accounting decisions. Build your skills through challenges, simulations and a career journey made for you."}
        </p>
      </div>
      <AuthBenefits locale={locale} />
      <div className="auth-career-note">
        <span>
          {ar ? (
            <>
              خطوة أقرب
              <br />
              لمستقبل أفضل
            </>
          ) : (
            <>
              Small steps.
              <br />
              Bigger possibilities.
            </>
          )}
        </span>
        <ArrowUpRight aria-hidden="true" />
      </div>
      <AuthProgressPreview locale={locale} />
    </section>
  );
}
