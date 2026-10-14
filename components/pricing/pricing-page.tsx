"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookOpenText,
  BriefcaseBusiness,
  Check,
  CircleCheck,
  Crown,
  GraduationCap,
  Laptop,
  Search,
  Settings2,
  Globe2,
  Menu,
  Plane,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { AuthCTA } from "@/components/cloud/auth-cta";
import { ThemeToggle } from "@/components/platform/theme-provider";
import {
  ANNUAL_PRICE_EGP,
  ANNUAL_SAVING_EGP,
  MONTHLY_PRICE_EGP,
  pricingContent,
  type BillingSelection,
  type PricingAudience,
} from "@/lib/pricing/content";
import type { Locale } from "@/types";

const navRoutes = [
  "",
  "#journey",
  "/game/first-shift",
  "/account-guide",
  "/pricing",
  "/employers",
  "#how",
] as const;
const audienceIcons = {
  student: GraduationCap,
  accountant: BriefcaseBusiness,
  company: Laptop,
};
const journeyIcons = [Sparkles, Laptop, Settings2, BriefcaseBusiness];

function Nav({ locale }: { locale: Locale }) {
  const t = pricingContent(locale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ar = locale === "ar";
  return (
    <header className="pricing-nav">
      <Link
        className="pricing-brand"
        href={`/${locale}`}
        aria-label="Debit & Credit"
      >
        <BookOpen size={37} strokeWidth={1.8} />
        <span>
          <strong>Debit &amp; Credit</strong>
          <small>
            {ar ? "تعلم المحاسبة بالممارسة" : "Learn accounting by doing"}
          </small>
        </span>
      </Link>
      <nav
        className={
          mobileOpen ? "pricing-nav__links is-open" : "pricing-nav__links"
        }
        aria-label={ar ? "التنقل الرئيسي" : "Main navigation"}
      >
        {navRoutes.map((route, i) => (
          <Link
            key={i}
            aria-current={i === 4 ? "page" : undefined}
            href={
              route.startsWith("#")
                ? `/${locale}/${route}`
                : `/${locale}${route}`
            }
            onClick={() => setMobileOpen(false)}
          >
            {t.nav[i]}
          </Link>
        ))}
      </nav>
      <div className="pricing-nav__actions">
        <Link
          className="pricing-nav__search"
          href={`/${locale}/employers`}
          title={t.search}
          aria-label={t.search}
        >
          <Search size={19} />
        </Link>
        <Link
          className="pricing-nav__language"
          href={`/${ar ? "en" : "ar"}/pricing`}
          title={t.language}
        >
          <Globe2 size={18} />
          <span>{t.language}</span>
          <span className="pricing-chevron">⌄</span>
        </Link>
        <details className="pricing-nav__theme">
          <summary aria-label={ar ? "إعدادات المظهر" : "Appearance settings"}>
            ⋯
          </summary>
          <ThemeToggle compact />
        </details>
        <Link className="pricing-nav__login" href={`/${locale}/login`}>
          {t.login}
        </Link>
        <AuthCTA className="pricing-nav__start" href={`/${locale}/onboarding`}>
          {t.start}
          <span aria-hidden="true">♙</span>
        </AuthCTA>
      </div>
      <button
        className="pricing-nav__menu"
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
        aria-label={ar ? "فتح القائمة" : "Open menu"}
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}

function Price({
  amount,
  unit,
  locale,
}: {
  amount: number;
  unit: string;
  locale: Locale;
}) {
  const t = pricingContent(locale);
  return (
    <div className="pricing-price">
      <strong>{amount}</strong>
      <span>{t.currency}</span>
      <small>{unit}</small>
    </div>
  );
}

function Feature({
  children,
  unavailable = false,
}: {
  children: React.ReactNode;
  unavailable?: boolean;
}) {
  return (
    <li className={unavailable ? "is-unavailable" : ""}>
      <span className="pricing-feature__check">
        {unavailable ? <X size={11} /> : <Check size={11} />}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function PricingPage({ locale }: { locale: Locale }) {
  const t = pricingContent(locale);
  const ar = locale === "ar";
  const [audience, setAudience] = useState<PricingAudience>("student");
  const [billing, setBilling] = useState<BillingSelection>("annual");
  const [showNotice, setShowNotice] = useState(false);
  const [comparison, setComparison] = useState(false);
  const Forward = ar ? ArrowLeft : ArrowRight;
  const currentAudience = t.audiences[audience];

  return (
    <main className="pricing-page" dir={ar ? "rtl" : "ltr"}>
      <Nav locale={locale} />
      <section className="pricing-hero" aria-labelledby="pricing-heading">
        <div className="pricing-hero__art" aria-hidden="true" />
        <div className="pricing-hero__milestones" aria-hidden="true">
          {t.milestones.map((label, index) => (
            <span
              key={label}
              className={`pricing-milestone pricing-milestone--${index}`}
            >
              {index === 0 ? (
                <BookOpenText />
              ) : index === 1 ? (
                <Sparkles />
              ) : index === 2 ? (
                <BriefcaseBusiness />
              ) : (
                <Crown />
              )}
              <b>{label}</b>
            </span>
          ))}
        </div>
        <div className="pricing-hero__copy">
          <h1 id="pricing-heading">
            {t.headline.split("\n").map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </h1>
          <p>
            {t.subtitle.split("\n").map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </p>
          <small className="pricing-hero__audience-line">
            {currentAudience.hero}
          </small>
        </div>
        <aside className="pricing-benefits">
          <h2>{t.benefitsTitle}</h2>
          {t.benefits.map((benefit, i) => (
            <div key={benefit}>
              <span>
                {
                  [
                    <SearchCheck key="a" />,
                    <BookOpenText key="b" />,
                    <CircleCheck key="c" />,
                    <Settings2 key="d" />,
                  ][i]
                }
              </span>
              <b>{benefit}</b>
            </div>
          ))}
        </aside>
        <div
          className="pricing-audience"
          role="tablist"
          aria-label={t.audienceLabel}
        >
          {(["student", "accountant", "company"] as const).map((key) => {
            const Icon = audienceIcons[key];
            return (
              <button
                key={key}
                role="tab"
                aria-selected={audience === key}
                data-audience={key}
                className={audience === key ? "is-selected" : ""}
                onClick={() => setAudience(key)}
              >
                <Icon />
                <span>
                  <strong>{t.audiences[key].name}</strong>
                  <small>{t.audiences[key].line}</small>
                </span>
              </button>
            );
          })}
        </div>
        <svg
          className="pricing-hero__wave"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 32 C260 126 338 2 580 39 C800 72 914 51 1100 46 C1280 38 1340 21 1440 6 L1440 80 L0 80 Z" />
        </svg>
      </section>

      <section className="pricing-content" aria-label={ar ? "الخطط" : "Plans"}>
        <div
          className="pricing-billing"
          role="group"
          aria-label={t.billingLabel}
        >
          <span
            className="pricing-saving"
            title={
              ar
                ? `التوفير ${ANNUAL_SAVING_EGP} جنيه مقابل 12 شهرًا`
                : `Save EGP ${ANNUAL_SAVING_EGP} versus 12 monthly payments`
            }
          >
            {t.save}
          </span>
          <div className="pricing-billing__segments">
            <button
              type="button"
              data-billing="annual"
              aria-pressed={billing === "annual"}
              onClick={() => setBilling("annual")}
            >
              {t.annual}
            </button>
            <button
              type="button"
              data-billing="monthly"
              aria-pressed={billing === "monthly"}
              onClick={() => setBilling("monthly")}
            >
              {t.monthly}
            </button>
          </div>
        </div>

        <div className="pricing-grid" dir="ltr">
          <article
            className="pricing-card pricing-card--free"
            data-card="free"
            dir={ar ? "rtl" : "ltr"}
          >
            <header className="pricing-card__header">
              <div>
                <h2>{t.free}</h2>
                <p>{t.freeSubtitle}</p>
              </div>
              <span className="pricing-card__icon">
                <Plane />
              </span>
            </header>
            <Price amount={0} unit={t.always} locale={locale} />
            <ul>
              {t.freeFeatures.map((x) => (
                <Feature key={x}>{x}</Feature>
              ))}
              {t.unavailableFeatures.map((x) => (
                <Feature key={x} unavailable>
                  {x}
                </Feature>
              ))}
            </ul>
            <AuthCTA
              className="pricing-card__action"
              href={`/${locale}/onboarding`}
            >
              <span>＋</span>
              {t.freeAction}
            </AuthCTA>
          </article>

          <article
            className={`pricing-card pricing-card--monthly ${billing === "monthly" ? "is-emphasized" : ""}`}
            data-card="monthly"
            dir={ar ? "rtl" : "ltr"}
          >
            <header className="pricing-card__header">
              <div>
                <h2>{t.monthlyTitle}</h2>
                <p>{t.monthlySubtitle}</p>
              </div>
              <span className="pricing-card__icon">
                <GraduationCap />
              </span>
            </header>
            <Price
              amount={MONTHLY_PRICE_EGP}
              unit={t.perMonth}
              locale={locale}
            />
            <small className="pricing-card__status">{t.proposed}</small>
            <ul>
              {t.proFeatures.map((x) => (
                <Feature key={x}>{x}</Feature>
              ))}
            </ul>
            <button
              className="pricing-card__action"
              type="button"
              onClick={() => setShowNotice(true)}
            >
              <Forward />
              {t.paidAction}
            </button>
          </article>

          <article
            className={`pricing-card pricing-card--annual ${billing === "annual" ? "is-emphasized" : ""}`}
            data-card="annual"
            dir={ar ? "rtl" : "ltr"}
          >
            <span className="pricing-card__ribbon">{t.bestValue} ★</span>
            <header className="pricing-card__header">
              <div>
                <h2>{t.annualTitle}</h2>
                <p>{t.annualSubtitle}</p>
              </div>
              <span className="pricing-card__icon">
                <Crown />
              </span>
            </header>
            <Price amount={ANNUAL_PRICE_EGP} unit={t.perYear} locale={locale} />
            <small className="pricing-card__status">{t.proposed}</small>
            <ul>
              {t.proFeatures.map((x) => (
                <Feature key={x}>{x}</Feature>
              ))}
            </ul>
            <button
              className="pricing-card__action"
              type="button"
              onClick={() => setShowNotice(true)}
            >
              <Forward />
              {t.paidAction}
            </button>
          </article>

          <article
            className="pricing-card pricing-card--journey"
            data-card="journey"
            dir={ar ? "rtl" : "ltr"}
          >
            <h2>{t.journeyTitle}</h2>
            <ol>
              {t.journey.map((step, i) => {
                const Icon = journeyIcons[i];
                return (
                  <li key={step.title}>
                    <span className="pricing-journey__icon">
                      <Icon />
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <small>{step.detail}</small>
                    </div>
                  </li>
                );
              })}
            </ol>
            {audience === "company" ? (
              <Link
                className="pricing-card__action"
                href={`/${locale}/employers`}
              >
                <Forward />
                {t.learnMore}
              </Link>
            ) : (
              <AuthCTA
                className="pricing-card__action"
                href={`/${locale}/onboarding`}
              >
                <Forward />
                {t.journeyAction}
              </AuthCTA>
            )}
          </article>
        </div>

        <div className="pricing-lower" dir="ltr">
          <aside className="pricing-quote" dir={ar ? "rtl" : "ltr"}>
            <span>“</span>
            <strong>
              {t.quote.split("\n").map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </strong>
            <div>
              <BookOpen />
              <b>Debit &amp; Credit</b>
            </div>
          </aside>
          <section className="pricing-comparison" dir={ar ? "rtl" : "ltr"}>
            <h2>
              <span className="pricing-bars">▂▄▇</span>
              {t.comparisonTitle}
            </h2>
            <div
              className="pricing-comparison__table"
              role="table"
              aria-label={t.comparisonTitle}
            >
              <div role="row" className="pricing-comparison__head">
                <b role="columnheader">{t.featuresLabel}</b>
                <b role="columnheader">{t.free}</b>
                <b role="columnheader">Pro {t.monthly}</b>
                <b role="columnheader">Pro {t.annual}</b>
              </div>
              {t.tableFeatures.map((feature) => (
                <div role="row" key={feature}>
                  <span role="cell">{feature}</span>
                  {[0, 1, 2].map((column) => (
                    <span role="cell" key={column} className="yes">
                      ✓
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="pricing-comparison__note"
              onClick={() => setComparison(!comparison)}
              aria-expanded={comparison}
            >
              {comparison
                ? ar
                  ? "إخفاء تفاصيل الأسعار"
                  : "Hide price details"
                : ar
                  ? "تفاصيل حساب التوفير"
                  : "Savings calculation"}
            </button>
            {comparison && (
              <p className="pricing-comparison__calculation" dir="ltr">
                {MONTHLY_PRICE_EGP} × 12 = {MONTHLY_PRICE_EGP * 12} EGP ·{" "}
                {MONTHLY_PRICE_EGP * 12} − {ANNUAL_PRICE_EGP} ={" "}
                {ANNUAL_SAVING_EGP} EGP
              </p>
            )}
          </section>
          <aside className="pricing-experience" dir={ar ? "rtl" : "ltr"}>
            <h2>{t.experienceTitle}</h2>
            {t.experience.map((line, i) => (
              <div key={line}>
                <span className="pricing-experience__avatar">
                  {i === 0 ? <BookOpenText /> : <ShieldCheck />}
                </span>
                <p>{line}</p>
                <strong>“</strong>
              </div>
            ))}
          </aside>
        </div>
      </section>

      {showNotice && (
        <div
          className="pricing-dialog-backdrop"
          role="presentation"
          onMouseDown={() => setShowNotice(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-dialog-title"
            className="pricing-dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="pricing-dialog__close"
              onClick={() => setShowNotice(false)}
              aria-label={t.close}
            >
              <X />
            </button>
            <h2 id="pricing-dialog-title">
              {audience === "company" ? t.audiences.company.name : t.paidAction}
            </h2>
            <p>{t.paidNotice}</p>
            {audience === "company" && <p>{t.companyNotice}</p>}
            <AuthCTA
              href={`/${locale}/onboarding`}
              onClick={() => setShowNotice(false)}
            >
              {t.freeAction}
            </AuthCTA>
          </div>
        </div>
      )}
    </main>
  );
}
