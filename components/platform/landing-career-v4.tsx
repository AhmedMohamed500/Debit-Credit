import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, BarChart3, BriefcaseBusiness, Building2, CheckCircle2, ClipboardCheck, GraduationCap, LockKeyhole, Target, TriangleAlert} from 'lucide-react';
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
    how: {
      eyebrow: 'كيف تعمل اللعبة؟',
      title: 'من أول خطوة إلى مستقبلك المهني',
      description: 'رحلة عملية وتفاعلية تحاكي بيئة العمل الحقيقية في عالم المحاسبة والمال والأعمال.',
      steps: [
        {title: 'اختر نقطة بدايتك', description: 'ابدأ من مستواك الحالي، سواء كنت تبدأ من الصفر أو لديك دراسة أو خبرة سابقة.', details: ['طالب محاسبة', 'خريج جديد', 'محاسب يعمل'], alt: 'متعلم يبدأ رحلته المهنية من المستوى المناسب'},
        {title: 'ادخل شركة مناسبة', description: 'انتقل بين شركات محاكاة لها بيئات عمل ومسؤوليات وتحديات مختلفة.', details: ['ميزان للتجارة · متاحة', 'شركات منظمة · بالتقدم', 'مستويات متقدمة · ضمن الخطة'], alt: 'عالم شركات محاسبية متدرج داخل المحاكاة'},
        {title: 'حل حالات ومهام', description: 'تعامل مع مستندات وحالات، واتخذ قراراتك وسجّل القيود خطوة بخطوة.', details: ['مراجعة فاتورة · متاحة', 'تسوية بنكية · متاحة', 'الإقفال الشهري · قيد التطوير'], alt: 'أدوات محاسبية تدعم حل الحالات والمهام'},
        {title: 'ابنِ ملفك المهني وATS CV', description: 'الإنجازات المؤهلة تحدّث Skill Passport والسيرة الذاتية مع فصل المحاكاة عن الخبرة الحقيقية.', details: ['مهارة أضيفت', 'دليل محاكاة أضيف', 'السيرة اتحدثت'], alt: 'مسار مهني وأدوات لبناء ملف قائم على الأدلة'},
      ],
    },
    audience: {
      eyebrow: 'لمن هذه المنصة؟',
      title: 'مناسبة في كل مرحلة من رحلتك المهنية',
      description: 'سواء كنت طالبًا، خريجًا جديدًا، أو محاسبًا تعمل حاليًا — ستجد مسارًا يناسب المرحلة التي أنت فيها.',
      labels: ['مشكلتك الآن', 'ستتعلم', 'ستصل إلى'],
      personas: [
        {title: 'طالب محاسبة', rows: ['المفاهيم أحيانًا تتحول إلى حفظ من غير فهم عملي كافٍ.', 'من الأساسيات إلى فهم الحركة المحاسبية وتطبيقها عمليًا.', 'فهم أقوى واستعداد أفضل لأول تجربة عمل.'], cta: 'ابدأ كطالب', alt: 'طالبة محاسبة في بداية رحلتها المهنية'},
        {title: 'خريج جديد', rows: ['درست النظرية، لكن خبرتك العملية ما زالت محدودة.', 'التعامل مع المستندات والحالات والقيود ومسارات العمل داخل المحاكاة.', 'ملف مهني أقوى وSkill Passport وATS CV مبني على الأدلة المؤهلة.'], cta: 'ابدأ كخريج', alt: 'خريج محاسبة جديد يستعد للعمل'},
        {title: 'محاسب في شركة صغيرة', rows: ['لديك خبرة في العمل اليومي، لكنك تحتاج مسؤوليات أوسع للانتقال إلى بيئة منظمة.', 'التسويات والتحليل والمراجعة والرقابة ومسارات الشركات المتاحة أو المخطط لها بوضوح.', 'معرفة فجواتك وتطوير مهاراتك للمسار الوظيفي التالي.'], cta: 'طوّر مسارك', alt: 'محاسب يعمل ويخطط لمسؤولية مهنية أكبر'},
      ],
    },
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
    how: {
      eyebrow: 'HOW DOES IT WORK?',
      title: 'From Your First Step to Your Professional Future',
      description: 'A practical, interactive journey built around realistic accounting work.',
      steps: [
        {title: 'Choose your starting point', description: 'Start from where you are today, whether you are new, have studied accounting, or already work in it.', details: ['Accounting student', 'Fresh graduate', 'Working accountant'], alt: 'A learner beginning from an appropriate career level'},
        {title: 'Enter the right company', description: 'Move through simulated companies with different work environments and responsibilities.', details: ['Mizan Trading · Available', 'Structured companies · Unlock', 'Advanced tiers · Planned'], alt: 'A progressive world of simulated accounting companies'},
        {title: 'Solve cases and tasks', description: 'Work with documents and cases, make decisions, and record entries step by step.', details: ['Invoice review · Available', 'Bank reconciliation · Available', 'Month-end · In development'], alt: 'Accounting tools supporting realistic cases and tasks'},
        {title: 'Build your profile and ATS CV', description: 'Qualified achievements update your Skill Passport and CV while simulation stays separate from employment.', details: ['Skill added', 'Simulation evidence added', 'CV updated'], alt: 'Career path and tools for an evidence-based profile'},
      ],
    },
    audience: {
      eyebrow: 'WHO IS THIS PLATFORM FOR?',
      title: 'Built for every stage of your career journey',
      description: 'Whether you are a student, a fresh graduate, or a working accountant, there is a starting path that fits your current stage.',
      labels: ['Your challenge now', 'You will learn', 'You can build toward'],
      personas: [
        {title: 'Accounting student', rows: ['Concepts can become memorisation without enough practical understanding.', 'Move from foundations to understanding accounting movement and applying it.', 'Stronger understanding and better preparation for a first work experience.'], cta: 'Start as a student', alt: 'An accounting student at the beginning of her career journey'},
        {title: 'Fresh graduate', rows: ['You studied the theory, but your practical experience is still limited.', 'Handle documents, cases, entries, reviews, and simulated workflows.', 'A stronger profile, Skill Passport, and ATS CV built from qualifying evidence.'], cta: 'Start as a graduate', alt: 'A fresh accounting graduate preparing for work'},
        {title: 'Working accountant', rows: ['You know daily work but need broader responsibilities for a structured corporate environment.', 'Develop reconciliation, analysis, review, controls, and clearly labelled available or planned workflows.', 'Understand your gaps and develop skills for the next career path.'], cta: 'Develop your path', alt: 'A working accountant planning broader professional responsibility'},
      ],
    },
  },
} as const;

const stageRoutes = ['/bootcamp', '/game', '/career-league/companies', '/game/month-end', '/career-league/promotion'];
const featureRoutes = ['/leaderboard', '/career-profile/cv', '/career-profile/skills'];
const landingImageQuality = process.env.NODE_ENV === 'test' ? undefined : 100;
const howImages = ['/landing/career-league-hero-v2.png', '/landing/career-journey-world-v2.webp', '/landing/skills-world-v2.webp', '/landing/career-future-v2.webp'];
const howIcons = [Target, Building2, ClipboardCheck, BriefcaseBusiness];
const personaIcons = [GraduationCap, BriefcaseBusiness, BarChart3];

function href(locale: Locale, route: string) { return `/${locale}${route}`; }

export function CareerLandingV4({locale}: Props) {
  return <div className="cl4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <CareerLeagueHero locale={locale}/>
    <HowGameWorks locale={locale}/>
    <WhoPlatformFor locale={locale}/>
    <CareerJourneyWorld locale={locale}/>
    <LandingFeatureWorlds locale={locale}/>
    <PlayerJourneyStories locale={locale}/>
    <CareerFutureCta locale={locale}/>
  </div>;
}

function HowGameWorks({locale}: Props) {
  const t = language[locale].how;
  const ar = locale === 'ar';
  const Connector = ar ? ArrowLeft : ArrowRight;
  return <section className="cl4-how" id="how" aria-labelledby="cl4-how-title">
    <header className="cl4-new-heading"><span>{t.eyebrow}</span><h2 id="cl4-how-title">{t.title}</h2><p>{t.description}</p></header>
    <div className="cl4-how-flow">
      {t.steps.map((step, index) => {
        const Icon = howIcons[index];
        return <article className={`cl4-how-step step-${index + 1}`} key={step.title}>
          <div className="cl4-how-visual"><Image src={howImages[index]} alt={step.alt} fill quality={landingImageQuality} sizes="(max-width: 700px) 92vw, (max-width: 1200px) 46vw, 340px"/><b>{index + 1}</b><span><Icon aria-hidden/></span></div>
          <div className="cl4-how-copy"><h3>{step.title}</h3><p>{step.description}</p><ul>{step.details.map((detail, detailIndex) => <li className={(index === 1 || index === 2) && detailIndex === 2 ? 'planned' : ''} key={detail}>{(index === 1 || index === 2) && detailIndex === 2 ? <LockKeyhole aria-hidden/> : <CheckCircle2 aria-hidden/>}{detail}</li>)}</ul></div>
          {index < t.steps.length - 1 ? <i className="cl4-how-connector" aria-hidden><Connector/></i> : null}
        </article>;
      })}
    </div>
  </section>;
}

function WhoPlatformFor({locale}: Props) {
  const t = language[locale].audience;
  return <section className="cl4-audience" id="audience" aria-labelledby="cl4-audience-title">
    <header className="cl4-new-heading"><span>{t.eyebrow}</span><h2 id="cl4-audience-title">{t.title}</h2><p>{t.description}</p></header>
    <div className="cl4-audience-grid">
      {t.personas.map((persona, index) => {
        const Icon = personaIcons[index];
        return <article className={`cl4-audience-card persona-${index + 1}`} key={persona.title}>
          <div className="cl4-audience-photo"><Image src="/landing/player-journeys-v2.png" alt={persona.alt} fill quality={landingImageQuality} sizes="(max-width: 700px) 92vw, 180px"/></div>
          <div className="cl4-audience-copy"><header><span><Icon aria-hidden/></span><h3>{persona.title}</h3></header><div className="cl4-audience-rows">{persona.rows.map((row, rowIndex) => <div key={t.labels[rowIndex]}><i>{rowIndex === 0 ? <TriangleAlert aria-hidden/> : rowIndex === 1 ? <Target aria-hidden/> : <BarChart3 aria-hidden/>}</i><span><b>{t.labels[rowIndex]}</b><p>{row}</p></span></div>)}</div><Link href={href(locale, '/onboarding')}>{persona.cta}{locale === 'ar' ? <ArrowLeft aria-hidden/> : <ArrowRight aria-hidden/>}</Link></div>
        </article>;
      })}
    </div>
  </section>;
}

function CareerLeagueHero({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-hero" id="home" aria-labelledby="cl4-title">
    <Image src="/landing/approved-hero-clean.png" alt="" fill priority quality={landingImageQuality} sizes="100vw" className="cl4-hero-image"/>
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
      <Image src="/landing/approved-journey.png" alt="" fill quality={landingImageQuality} sizes="100vw" className="cl4-art-image"/>
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
      <Image src="/landing/approved-features.png" alt="" fill quality={landingImageQuality} sizes="100vw" className="cl4-art-image"/>
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
    <Image src="/landing/approved-final.png" alt="" fill quality={landingImageQuality} sizes="100vw" className="cl4-final-image"/>
    <div className="cl4-final-copy"><h2 id="cl4-final-title">{t.final}</h2><p>{t.finalDescription}</p><div className="cl4-final-actions"><Link href={href(locale, '/onboarding')}>{t.finalStart}</Link><Link href={href(locale, '/career-league/companies')}>{t.finalExplore}</Link></div></div>
  </section>;
}
