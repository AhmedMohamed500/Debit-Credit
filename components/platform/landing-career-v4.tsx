import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, Building2, CheckCircle2, ClipboardCheck, FileCheck2, GraduationCap, LockKeyhole, Target, TriangleAlert} from 'lucide-react';
import type {Locale} from '@/types';

type Props = {locale: Locale};

const language = {
  ar: {
    hero: 'منافسة محاسبية تجريبية تبني مهاراتك المهنية',
    heroDescription: 'تعلّم وطبّق وتنافس محليًا داخل محاكاة مهنية. المشهد الفني توضيحي، وليس عددًا فعليًا للاعبين أو شراكة مع جهات توظيف.',
    start: 'ابدأ مجانًا', explore: 'اكتشف رحلتك المهنية',
    journey: 'خريطة رحلتك المهنية',
    journeyDescription: 'خمس مراحل من أساسيات المحاسبة إلى القيادة المالية داخل المحاكاة. المراحل المتقدمة قد تتطلب التقدم في اللعبة.',
    journeyScrollHint: 'اسحب أفقيًا لاستكشاف المراحل الخمس',
    stages: ['معسكر البداية', 'ميزان للتجارة', 'شركات أكبر', 'الإقفال الشهري', 'القيادة المالية'],
    stageStatuses: ['متاح الآن', 'متاح الآن', 'بالتقدم', 'قيد التطوير', 'مسار متقدم'],
    features: 'المنافسة والسيرة الذاتية والمهارات',
    featuresDescription: 'منافسة تجريبية محلية، وسيرة ذاتية مرتبطة بإنجازاتك، وخريطة مهارات توضّح المتاح وما يزال قيد التطوير.',
    featureLinks: ['ابدأ المنافسة التجريبية', 'شاهد سيرتك الذاتية', 'تصفح المهارات'],
    featureTitles: ['تنافس مع زملائك', 'سيرة ذاتية تنمو معك', 'اكتسب مهارات مطلوبة'],
    featureDescriptions: ['تحديات محلية تجريبية لقياس تقدمك.', 'إنجازات محاكاة مؤهلة مرتبطة بملفك المهني.', 'تعلّم المهارات المتاحة وتابع ما هو قيد التطوير.'],
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
      title: 'من أول خطوة إلى مستقبل مهني حقيقي',
      description: 'رحلة عملية وتفاعلية تحاكي بيئة العمل الحقيقية في عالم المحاسبة والمال والأعمال.',
      steps: [
        {title: 'اختر مستواك', description: 'ابدأ من الأساسيات أو اختر مستواك الحالي، مع مسار تعليمي يناسبك.', details: ['مبتدئ', 'متوسط', 'متقدم'], alt: 'لاعب يبدأ رحلته المهنية'},
        {title: 'ادخل شركة مناسبة', description: 'انتقل بين شركات محاكاة لها بيئات عمل ومسؤوليات وتحديات مختلفة.', details: ['ميزان للتجارة · متاحة', 'شركات منظمة · بالتقدم', 'مستويات متقدمة · ضمن الخطة'], alt: 'عالم شركات محاسبية متدرج داخل المحاكاة'},
        {title: 'حل حالات ومهام', description: 'تعامل مع مستندات وحالات، واتخذ قراراتك وسجّل القيود خطوة بخطوة.', details: ['مراجعة فاتورة · متاحة', 'تسوية بنكية · متاحة', 'الإقفال الشهري · قيد التطوير'], alt: 'محاسب يحل حالات مهنية'},
        {title: 'ابنِ CV وسجّل مهاراتك', description: 'الإنجازات المؤهلة تحدّث ملفك وATS CV مع فصل المحاكاة عن الخبرة الحقيقية.', details: ['Skill Passport', 'دليل محاكاة مؤهل', 'ATS CV'], alt: 'صورة رمزية لمسار مهني متدرج'},
      ],
    },
    audience: {
      eyebrow: 'من أنت في رحلتك المهنية؟',
      title: 'مناسبة في كل مرحلة من رحلتك المهنية',
      description: 'سواء كنت طالبًا، خريجًا جديدًا، محاسبًا تعمل حاليًا، أو صاحب خبرة تستعد لمسؤولية أكبر — ابدأ من مستواك الحقيقي.',
      labels: ['تحديك الآن', 'هتمارس إيه؟', 'الخطوة التالية'],
      personas: [
        {id: 'student', title: 'طالب محاسبة', stage: 'بناء الأساس', promise: 'حوّل المفاهيم إلى فهم عملي.', rows: ['النظرية مشتتة والتطبيق محدود.', 'أساسيات المحاسبة وAccount City وBootcamp وأول قيد.', 'استعداد أقوى للتدريب والعمل.'], cta: 'ابدأ كطالب', alt: 'طالبة محاسبة تدرس في مساحة عمل مضيئة'},
        {id: 'graduate', title: 'خريج جديد', stage: 'بداية المسيرة', promise: 'ابدأ أول يوم شغل بثقة أكبر.', rows: ['درست النظرية لكن خبرتك بالمستندات محدودة.', 'Mizan Trading وFirst Shift والقيود وحالات العملاء والموردين.', 'ملف محاكاة مهني أقوى، لا خبرة عمل مزعومة.'], cta: 'ابدأ كخريج جديد', alt: 'خريج محاسبة في مكتب حديث'},
        {id: 'working-accountant', title: 'محاسب شغال', stage: 'تطوير المسار', promise: 'وسّع مسؤولياتك خارج روتينك.', rows: ['قد لا تتعرض لكل المهارات المطلوبة في شركة أكبر.', 'تشخيص الفجوة والتسوية البنكية وحالات العمل المتاحة.', 'استعداد لمسار أكبر بخطوات قابلة للقياس.'], cta: 'ابدأ كمحاسب شغال', alt: 'محاسب يراجع مستندات مالية في العمل'},
        {id: 'experienced-accountant', title: 'محاسب بخبرة', stage: 'المستوى التالي', promise: 'انتقل من التنفيذ إلى المراجعة.', rows: ['تبحث عن مسؤوليات أوسع في التحليل والرقابة.', 'تقييم المسار وما يتاح الآن من حالات ومراجعة؛ الإقفال والقيادة قيد التطوير.', 'خطة واضحة نحو أدوار أعلى دون وعود وظيفية.'], cta: 'ابدأ كمحاسب بخبرة', alt: 'محاسب خبير في مكتب مالي'},
      ],
    },
    work: {eyebrow: 'شغل محاسبي مش أسئلة وبس', title: 'هتشتغل على حالات محاسبية', description: 'ابدأ بمستندات وقرارات حقيقية داخل المحاكاة. نوضّح المتاح الآن وما يزال ضمن الخطة.', statuses: ['متاح', 'متاح', 'قابل للعب', 'قيد التطوير', 'مقفول · قيد التطوير'], items: ['مراجعة فاتورة مورد', 'إيصال عميل', 'تسوية بنكية', 'تسويات الاستحقاق', 'الإقفال الشهري'], action: 'افتح الحالة'},
  },
  en: {
    hero: 'A local accounting competition that builds career skills',
    heroDescription: 'Learn, practise and compete in a local career simulation. The artwork is illustrative, not a live player count or employer partnership.',
    start: 'Start for free', explore: 'Explore your career journey',
    journey: 'Your career journey map',
    journeyDescription: 'Five stages from accounting foundations to finance leadership within the simulation. Advanced stages may require progress.',
    journeyScrollHint: 'Swipe sideways to explore all five stages',
    stages: ['Accounting Bootcamp', 'Mizan Trading', 'Bigger Companies', 'Month-End', 'Finance Leadership'],
    stageStatuses: ['Available', 'Available', 'Unlock with progress', 'In development', 'Advanced path'],
    features: 'Competition, CV and skills',
    featuresDescription: 'A local demo competition, an achievement-linked CV, and a skill map showing what is available and what is still in development.',
    featureLinks: ['Try the demo competition', 'View your CV', 'Browse skills'],
    featureTitles: ['Compete with peers', 'A CV that grows with you', 'Build in-demand skills'],
    featureDescriptions: ['A local demo challenge to track your progress.', 'Qualified simulation achievements connected to your career profile.', 'Practise available skills and see what remains in development.'],
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
        {title: 'Choose your level', description: 'Begin with the foundations or choose your current level and follow a suitable learning path.', details: ['Beginner', 'Intermediate', 'Advanced'], alt: 'A learner beginning a career journey'},
        {title: 'Enter the right company', description: 'Move through simulated companies with different work environments and responsibilities.', details: ['Mizan Trading · Available', 'Structured companies · Unlock', 'Advanced tiers · Planned'], alt: 'A progressive world of simulated accounting companies'},
        {title: 'Solve cases and tasks', description: 'Work with documents and cases, make decisions, and record entries step by step.', details: ['Invoice review · Available', 'Bank reconciliation · Available', 'Month-end · In development'], alt: 'Accountant solving career cases'},
        {title: 'Build your CV and skills', description: 'Qualified achievements update your profile and ATS CV while simulation stays separate from employment.', details: ['Skill Passport', 'Qualified simulation evidence', 'ATS CV'], alt: 'Illustration of a progressive career path'},
      ],
    },
    audience: {
      eyebrow: 'WHO IS THIS PLATFORM FOR?',
      title: 'Built for every stage of your career journey',
      description: 'Student, new graduate, working or experienced accountant: begin from your real starting point and grow toward wider responsibility.',
      labels: ['Your challenge', 'What you will practise', 'Where it leads'],
      personas: [
        {id: 'student', title: 'Accounting student', stage: 'Build foundations', promise: 'Turn concepts into practical understanding.', rows: ['Theory feels scattered; practice is limited.', 'Accounting foundations, Account City, Bootcamp and first entries.', 'Stronger preparation for training and work.'], cta: 'Start as a student', alt: 'Accounting student studying in a bright workspace'},
        {id: 'graduate', title: 'Fresh graduate', stage: 'Begin your career', promise: 'Face your first shift with confidence.', rows: ['You studied theory, but have handled few real documents.', 'Mizan Trading, First Shift, journals, customer and supplier cases.', 'A stronger simulation record, not claimed employment.'], cta: 'Start as a graduate', alt: 'Fresh accounting graduate in a modern office'},
        {id: 'working-accountant', title: 'Working accountant', stage: 'Grow your path', promise: 'Practise beyond your daily routine.', rows: ['Your current role may not expose you to broader work.', 'Career gap diagnosis, bank reconciliation and available cases.', 'Evidence-led preparation for wider responsibilities.'], cta: 'Start as a working accountant', alt: 'Accountant reviewing financial documents at work'},
        {id: 'experienced-accountant', title: 'Experienced accountant', stage: 'Next responsibility', promise: 'Move from doing to reviewing.', rows: ['You need broader analysis and control responsibility.', 'Career assessment and available review cases; closing and leadership are planned.', 'A clear route toward senior roles without hiring promises.'], cta: 'Start as an experienced accountant', alt: 'Experienced accountant in a finance office'},
      ],
    },
    work: {eyebrow: 'MORE THAN ANSWERING QUESTIONS', title: 'Work through accounting cases', description: 'Inspect documents and make decisions inside the simulation. Current and planned activities are clearly labelled.', statuses: ['Available', 'Available', 'Playable', 'In development', 'Locked · in development'], items: ['Supplier invoice review', 'Customer receipt', 'Bank reconciliation', 'Accrual adjustment', 'Month-end close'], action: 'Open case'},
  },
} as const;

const stageRoutes = ['/bootcamp', '/game', '/career-league/companies', '/game/month-end', '/career-league/promotion'];
const featureRoutes = ['/leaderboard', '/career-profile/cv', '/career-profile/skills'];
const featureImages = ['/landing/competition-world-v2.webp', '/landing/career-future-v2.webp', '/landing/skills-world-v2.webp'];
const landingImageQuality = process.env.NODE_ENV === 'test' ? undefined : 100;
const howImages = ['/landing/career-league-hero-v2.png', '/landing/career-journey-world-v2.webp', '/landing/player-journeys-v2.png', '/landing/career-future-v2.webp'];
const howIcons = [Target, Building2, ClipboardCheck, BriefcaseBusiness];
const personaIcons = [BookOpen, GraduationCap, BriefcaseBusiness, BarChart3];
const personaImages = ['/landing/persona-student-v1.webp', '/landing/persona-graduate-v1.webp', '/landing/persona-working-v1.webp', '/landing/persona-experienced-v1.webp'];
const workRoutes = ['/game/suppliers', '/game/customers', '/game/bank-reconciliation', null, null] as const;

function href(locale: Locale, route: string) { return `/${locale}${route}`; }

export function CareerLandingV4({locale}: Props) {
  return <div className="cl4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <CareerLeagueHero locale={locale}/>
    <HowGameWorks locale={locale}/>
    <WhoPlatformFor locale={locale}/>
    <CareerJourneyWorld locale={locale}/>
    <AccountingWorkSection locale={locale}/>
    <LandingFeatureWorlds locale={locale}/>
    <CareerFutureCta locale={locale}/>
  </div>;
}

function HowGameWorks({locale}: Props) {
  const t = language[locale].how;
  const ar = locale === 'ar';
  const Connector = ar ? ArrowLeft : ArrowRight;
  const visualLabels = ar ? [
    ['اختر مستواك', 'مبتدئ', 'متوسط', 'متقدم'],
    ['شركة محاكاة', 'ميزان للتجارة', 'شركات منظمة', 'مستويات متقدمة'],
    ['مهام اليوم', 'مراجعة فاتورة', 'تسوية بنكية', 'الإقفال الشهري'],
    ['ملفك المهني', 'Skill Passport', 'دليل محاكاة', 'ATS CV'],
  ] : [
    ['Choose your level', 'Beginner', 'Intermediate', 'Advanced'],
    ['Simulation company', 'Mizan Trading', 'Structured companies', 'Advanced levels'],
    ['Today’s tasks', 'Review an invoice', 'Bank reconciliation', 'Month-end'],
    ['Your career profile', 'Skill Passport', 'Simulation evidence', 'ATS CV'],
  ];
  return <section className="cl4-how" id="how" aria-labelledby="cl4-how-title">
    <header className="cl4-new-heading"><span>{t.eyebrow}</span><h2 id="cl4-how-title">{t.title}</h2><p>{t.description}</p></header>
    <div className="cl4-how-flow">
      {t.steps.map((step, index) => {
        const Icon = howIcons[index];
        return <article className={`cl4-how-step step-${index + 1}`} key={step.title}>
          <div className="cl4-how-visual">
            <Image src={howImages[index]} alt="" fill quality={75} sizes={index === 2 ? '(max-width: 600px) 1200px, (max-width: 1200px) 1170px, 1200px' : '(max-width: 600px) 420px, (max-width: 1200px) 420px, 440px'}/>
            <b className="cl4-how-number">{index + 1}</b>
            <div className="cl4-how-mock" aria-hidden="true"><strong><Icon/>{visualLabels[index][0]}</strong>{visualLabels[index].slice(1).map((label, row) => {const planned=row === 2 && (index === 1 || index === 2);return <span className={planned ? 'is-planned' : ''} key={label}>{planned ? <LockKeyhole/> : <CheckCircle2/>}{label}</span>;})}</div>
          </div>
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
          <div className="cl4-audience-photo"><Image src={personaImages[index]} alt={persona.alt} fill quality={75} sizes="(max-width: 600px) 92vw, (max-width: 1200px) 45vw, 400px"/><span className="cl4-audience-stage"><Icon aria-hidden/>{persona.stage}</span><div className="cl4-audience-identity"><h3>{persona.title}</h3><p>{persona.promise}</p></div></div>
          <div className="cl4-audience-copy"><div className="cl4-audience-rows">{persona.rows.map((row, rowIndex) => <div key={t.labels[rowIndex]}><i>{rowIndex === 0 ? <TriangleAlert aria-hidden/> : rowIndex === 1 ? <Target aria-hidden/> : <BarChart3 aria-hidden/>}</i><span><b>{t.labels[rowIndex]}</b><p>{row}</p></span></div>)}</div><Link href={href(locale, `/onboarding?persona=${persona.id}`)}>{persona.cta}{locale === 'ar' ? <ArrowLeft aria-hidden/> : <ArrowRight aria-hidden/>}</Link></div>
        </article>;
      })}
    </div>
  </section>;
}

function AccountingWorkSection({locale}: Props) {
  const t = language[locale].work;
  return <section className="cl4-work" id="accounting-work" aria-labelledby="cl4-work-title">
    <header className="cl4-new-heading"><span>{t.eyebrow}</span><h2 id="cl4-work-title">{t.title}</h2><p>{t.description}</p></header>
    <div className="cl4-work-grid">{t.items.map((item, index) => <article key={item} className={workRoutes[index] ? 'available' : 'planned'}><span className="cl4-work-icon">{index < 2 ? <FileCheck2 aria-hidden/> : index === 2 ? <Building2 aria-hidden/> : <LockKeyhole aria-hidden/>}</span><h3>{item}</h3><small>{t.statuses[index]}</small>{workRoutes[index] ? <Link href={href(locale, workRoutes[index])}>{t.action}{locale === 'ar' ? <ArrowLeft aria-hidden/> : <ArrowRight aria-hidden/>}</Link> : null}</article>)}</div>
  </section>;
}

function CareerLeagueHero({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-hero" id="home" aria-labelledby="cl4-title">
    <Image src="/landing/career-league-hero-v2.png" alt="" fill priority quality={75} sizes="(max-width: 1672px) 100vw, 1672px" className="cl4-hero-image"/>
    <div className="cl4-hero-copy"><span>CAREER LEAGUE</span><h1 id="cl4-title">{t.hero}</h1><p>{t.heroDescription}</p><div className="cl4-hero-actions"><Link href={href(locale, '/onboarding')}>{t.start}</Link><Link href="#journey">{t.explore}</Link></div></div>
    <p className="cl4-art-disclaimer">{t.artworkNote}</p>
  </section>;
}

function CareerJourneyWorld({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-journey" id="journey" aria-labelledby="cl4-journey-title">
    <header className="cl4-world-heading"><h2 id="cl4-journey-title">{t.journey}</h2><p>{t.journeyDescription}</p><span className="cl4-journey-scroll-hint">{t.journeyScrollHint}</span></header>
    <div className="cl4-journey-art" id="companies">
      <Image src="/landing/career-journey-world-v2.webp" alt="" fill quality={75} sizes="(max-width: 600px) 1100px, (max-width: 1672px) 100vw, 1672px" className="cl4-art-image"/>
      <div className="cl4-stage-hotspots">
        {stageRoutes.map((route, index) => <Link key={route} className={`cl4-stage-hotspot cl4-stage-${index + 1}`} href={href(locale, route)} aria-label={t.stages[index]}><span className="cl4-stage-number">{index + 1}</span><strong>{t.stages[index]}</strong><small>{t.stageStatuses[index]}</small></Link>)}
      </div>
    </div>
  </section>;
}

function LandingFeatureWorlds({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-features" id="competition" aria-labelledby="cl4-features-title">
    <header className="cl4-world-heading"><h2 id="cl4-features-title">{t.features}</h2><p>{t.featuresDescription}</p></header>
    <div className="cl4-feature-art">
      {featureRoutes.map((route, index) => <Link key={route} className={`cl4-feature-hotspot cl4-feature-${index + 1}`} href={href(locale, route)} aria-label={t.featureLinks[index]}><span className="cl4-feature-image"><Image src={featureImages[index]} alt="" fill quality={75} sizes="(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 520px"/></span><span className="cl4-feature-copy"><strong>{t.featureTitles[index]}</strong><span>{t.featureDescriptions[index]}</span><b>{t.featureLinks[index]}{locale === 'ar' ? <ArrowLeft aria-hidden/> : <ArrowRight aria-hidden/>}</b></span></Link>)}
    </div>
    <div className="cl4-skill-status" id="tools" aria-label={t.statusTitle}>
      <strong>{t.statusTitle}</strong>
      <ul>{t.statuses.map((status) => <li key={status}>{status}</li>)}</ul>
    </div>
  </section>;
}

function CareerFutureCta({locale}: Props) {
  const t = language[locale];
  return <section className="cl4-final" id="about" aria-labelledby="cl4-final-title">
    <Image src="/landing/approved-final.png" alt="" fill quality={landingImageQuality} sizes="100vw" className="cl4-final-image"/>
    <div className="cl4-final-copy"><h2 id="cl4-final-title">{t.final}</h2><p>{t.finalDescription}</p><div className="cl4-final-actions"><Link href={href(locale, '/onboarding')}>{t.finalStart}</Link><Link href={href(locale, '/career-league/companies')}>{t.finalExplore}</Link></div></div>
  </section>;
}
