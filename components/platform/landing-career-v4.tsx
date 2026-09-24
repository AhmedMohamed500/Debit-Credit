import Image from 'next/image';
import Link from 'next/link';
import type {Locale} from '@/types';

type Props = {locale: Locale};

const language = {
  ar: {
    hero: 'منافسة محاسبية تجريبية تبني مهاراتك المهنية',
    heroDescription: 'تعلّم وطبّق وتنافس محليًا داخل محاكاة مهنية. المشهد الفني توضيحي، وليس عددًا فعليًا للاعبين أو شراكة مع جهات توظيف.',
    start: 'ابدأ مجانًا', explore: 'اكتشف رحلتك المهنية',
    journey: 'خريطة رحلتك المهنية',
    journeyDescription: 'خمس مراحل من أساسيات المحاسبة إلى القيادة المالية داخل المحاكاة. المراحل المتقدمة قد تتطلب التقدم في اللعبة.',
    stages: ['معسكر البداية', 'ميزان للتجارة', 'شركات أكبر', 'الإقفال الشهري', 'القيادة المالية'],
    features: 'المنافسة والسيرة الذاتية والمهارات',
    featuresDescription: 'منافسة تجريبية محلية، وسيرة ذاتية مرتبطة بإنجازاتك، وخريطة مهارات توضّح المتاح وما يزال قيد التطوير.',
    featureLinks: ['ابدأ المنافسة التجريبية', 'شاهد سيرتك الذاتية', 'تصفح المهارات'],
    statusTitle: 'حالة المهارات الحالية',
    statuses: ['Excel — متاح', 'Financial Analysis — قيد التطوير', 'Risk & Controls — قيد التطوير', 'IFRS — ضمن الخطة', 'Power BI — ضمن الخطة', 'ERP — ضمن الخطة'],
    stories: 'نماذج رحلات توضيحية', storiesIntro: 'شخصيات افتراضية لشرح مسارات استخدام مختلفة، وليست شهادات أو تقييمات عملاء.',
    personas: [
      ['طالب محاسبة', 'من فهم القيود إلى تطبيقها داخل مواقف عملية.'],
      ['خريج جديد', 'من الدراسة النظرية إلى ممارسة خطوات العمل.'],
      ['محاسب', 'من الخبرة الحالية إلى تحديد المهارات التالية.'],
    ],
    final: 'مستقبلك المهني يبدأ الآن',
    finalDescription: 'ابدأ من مستواك الحالي وتدرّج عبر تجربة محاسبية محاكية للعمل.',
    finalStart: 'ابدأ رحلتك المهنية', finalExplore: 'اكتشف المسارات',
    artworkNote: 'الصور تصور توضيحي للمنتج؛ ليست إحصاءات استخدام أو شهادات فعلية.',
  },
  en: {
    hero: 'A local accounting competition that builds career skills',
    heroDescription: 'Learn, practise and compete in a local career simulation. The artwork is illustrative, not a live player count or employer partnership.',
    start: 'Start for free', explore: 'Explore your career journey',
    journey: 'Your career journey map',
    journeyDescription: 'Five stages from accounting foundations to finance leadership within the simulation. Advanced stages may require progress.',
    stages: ['Accounting Bootcamp', 'Mizan Trading', 'Bigger Companies', 'Month-End', 'Finance Leadership'],
    features: 'Competition, CV and skills',
    featuresDescription: 'A local demo competition, an achievement-linked CV, and a skill map showing what is available and what is still in development.',
    featureLinks: ['Try the demo competition', 'View your CV', 'Browse skills'],
    statusTitle: 'Current skill status',
    statuses: ['Excel — Available', 'Financial Analysis — In development', 'Risk & Controls — In development', 'IFRS — Roadmap', 'Power BI — Roadmap', 'ERP — Roadmap'],
    stories: 'Example player journeys', storiesIntro: 'Fictional personas illustrating different ways to use the experience. These are not customer reviews or testimonials.',
    personas: [
      ['Accounting student', 'Move from journal-entry concepts to practical scenarios.'],
      ['New graduate', 'Turn classroom theory into a clearer workflow.'],
      ['Working accountant', 'Find the next skill to develop from your current experience.'],
    ],
    final: 'Your career journey starts now',
    finalDescription: 'Start at your level and progress through an accounting work simulation.',
    finalStart: 'Start your career journey', finalExplore: 'Explore career paths',
    artworkNote: 'Artwork is illustrative; embedded figures and stories are not real usage statistics or testimonials.',
  },
} as const;

const stageRoutes = ['/bootcamp', '/game', '/career-league/companies', '/game/month-end', '/career-league/promotion'];
const featureRoutes = ['/leaderboard', '/career-profile/cv', '/career-profile/skills'];

function href(locale: Locale, route: string) { return `/${locale}${route}`; }

export function CareerLandingV4({locale}: Props) {
  return <div className="cl4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <CareerLeagueHero locale={locale}/>
    <CareerJourneyWorld locale={locale}/>
    <LandingFeatureWorlds locale={locale}/>
    <PlayerJourneyStories locale={locale}/>
    <CareerFutureCta locale={locale}/>
  </div>;
}

function CareerLeagueHero({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-hero" id="home" aria-labelledby="cl4-title">
    <Image src="/landing/approved-hero-clean.png" alt="" fill priority unoptimized sizes="100vw" className="cl4-hero-image"/>
    <h1 id="cl4-title" className="cl4-hero-title">{t.hero}</h1>
    <p className="sr-only">{t.heroDescription}</p>
    <Link className="cl4-hero-hotspot cl4-hero-start" href={href(locale, '/onboarding')} aria-label={t.start}><span className="sr-only">{t.start}</span></Link>
    <Link className="cl4-hero-hotspot cl4-hero-explore" href="#journey" aria-label={t.explore}><span className="sr-only">{t.explore}</span></Link>
    {locale === 'en' && <div className="cl4-english-caption"><strong>{t.hero}</strong><span>{t.heroDescription}</span></div>}
    <p className="cl4-art-disclaimer">{t.artworkNote}</p>
  </section>;
}

function CareerJourneyWorld({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-journey" id="journey" aria-labelledby="cl4-journey-title">
    <h2 id="cl4-journey-title" className="sr-only">{t.journey}</h2>
    <p className="sr-only">{t.journeyDescription}</p>
    <div className="cl4-journey-art" id="companies">
      <Image src="/landing/approved-journey.png" alt="" fill unoptimized sizes="100vw" className="cl4-art-image"/>
      <div className="cl4-stage-hotspots">
        {stageRoutes.map((route, index) => <Link key={route} className={`cl4-stage-hotspot cl4-stage-${index + 1}`} href={href(locale, route)} aria-label={t.stages[index]}><span className="sr-only">{t.stages[index]}</span></Link>)}
      </div>
    </div>
    {locale === 'en' && <div className="cl4-section-caption"><strong>{t.journey}</strong><span>{t.journeyDescription}</span></div>}
  </section>;
}

function LandingFeatureWorlds({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-features" id="competition" aria-labelledby="cl4-features-title">
    <h2 id="cl4-features-title" className="sr-only">{t.features}</h2>
    <p className="sr-only">{t.featuresDescription}</p>
    <div className="cl4-feature-art">
      <Image src="/landing/approved-features.png" alt="" fill unoptimized sizes="100vw" className="cl4-art-image"/>
      {featureRoutes.map((route, index) => <Link key={route} className={`cl4-feature-hotspot cl4-feature-${index + 1}`} href={href(locale, route)} aria-label={t.featureLinks[index]}><span className="sr-only">{t.featureLinks[index]}</span></Link>)}
    </div>
    {locale === 'en' && <div className="cl4-section-caption"><strong>{t.features}</strong><span>{t.featuresDescription}</span></div>}
    <div className="cl4-skill-status" id="tools" aria-label={t.statusTitle}>
      <strong>{t.statusTitle}</strong>
      <ul>{t.statuses.map((status) => <li key={status}>{status}</li>)}</ul>
    </div>
  </section>;
}

function PlayerJourneyStories({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-stories" aria-labelledby="cl4-stories-title">
    <div className="cl4-stories-heading"><span>{locale === 'ar' ? 'نماذج توضيحية' : 'ILLUSTRATIVE EXAMPLES'}</span><h2 id="cl4-stories-title">{t.stories}</h2><p>{t.storiesIntro}</p></div>
    <div className="cl4-personas">{t.personas.map(([role, description], index) => <article key={role}><span className="cl4-persona-number">0{index + 1}</span><div><h3>{role}</h3><p>{description}</p></div></article>)}</div>
  </section>;
}

function CareerFutureCta({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-final" id="about" aria-labelledby="cl4-final-title">
    <Image src="/landing/approved-final.png" alt="" fill unoptimized sizes="100vw" className="cl4-final-image"/>
    <div className="cl4-final-copy"><h2 id="cl4-final-title">{t.final}</h2><p>{t.finalDescription}</p><div className="cl4-final-actions"><Link href={href(locale, '/onboarding')}>{t.finalStart}</Link><Link href={href(locale, '/career-league/companies')}>{t.finalExplore}</Link></div></div>
  </section>;
}
