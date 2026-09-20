import Image from 'next/image';
import Link from 'next/link';
import type {CSSProperties} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  FileCheck2,
  Gamepad2,
  GraduationCap,
  Landmark,
  LineChart,
  LockKeyhole,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';
import type {Locale} from '@/types';

type LandingProps={locale:Locale};

const copy={
  ar:{
    direction:'rtl',
    eyebrow:'CAREER LEAGUE · نسخة محلية تجريبية',
    title:'منافسة حقيقية من أي مكان!',
    subtitle:'تعلّم. طبّق. نافس. وابنِ مستقبلك المهني داخل لعبة محاسبة تحاكي الشغل الحقيقي.',
    primary:'ابدأ رحلتك الآن',secondary:'اكتشف الرحلة',
    you:'أنت',rival:'منافسك',level:'المستوى',mission:'المهمة الحالية',
    missionA:['راجع المستند','حدد الحسابات','سجّل القيد'],
    missionB:['حلّل المستند','اختبر الحسابات','راجع النتيجة'],
    preview:'منافسة محلية تجريبية',
    nodes:['البداية','شركة محلية','شركة متوسطة','شركة كبيرة','قرارك القادم'],
    metrics:[['3','شخصيات بداية'],['9','مستويات مهنية'],['5','درجات شركات'],['53','وحدة في خريطة التعلّم']],
    journeyKicker:'خريطة مهنية قابلة للعب',journeyTitle:'رحلتك المهنية تبدأ من هنا',journeyText:'ابدأ من الأساسيات، اشتغل داخل شركة محاكاة، واجمع دليلًا مهنيًا من كل قرار محاسبي.',
    stages:[
      ['معسكر البداية','مفاهيم محاسبية أساسية','متاح'],
      ['ميزان للتجارة','أول شركة ومحاكاة مكتبية','ابدأ هنا'],
      ['شركات أكبر','حالات أصعب ومسؤوليات أكثر','يتفتح بالتقدم'],
      ['الإقفال الشهري','مراجعة وتسويات واقعية','قريبًا'],
      ['المدير المالي','قرار وتأثير مهني','هدف مهني'],
    ],
    explore:'استكشف رحلتك المهنية',
    featureKicker:'كل خطوة لها أثر',featureTitle:'اللعبة التي تحوّل الممارسة إلى مستقبل مهني',
    competitionTitle:'تنافس مع زملائك',competitionText:'تحديات محاسبية تجريبية بنتائج واضحة. قارن قراراتك وتعلّم من كل محاولة داخل تجربة محلية.',competitionCta:'ادخل المنافسة',
    cvTitle:'سيرة ذاتية تنمو معك',cvText:'الإنجازات الحقيقية داخل المحاكاة تتحول إلى أدلة قابلة للشرح في ملفك المهني.',cvCta:'شاهد سيرتك',
    skillsTitle:'اكتسب مهارات مطلوبة',skillsText:'ابنِ الأساس المحاسبي ثم تابع خريطة مهارات مهنية واضحة من القيود إلى التحليل المالي.',skillsCta:'تصفح المهارات',
    featurePreview:'عرض تجريبي محلي',proof:'دليل مهني من اللعب',roadmap:'خريطة تعلّم وتطوير',
    voicesTitle:'ماذا يقول اللاعبون؟',voicesNote:'نماذج توضيحية لشخصيات رحلة المستخدم — وليست تقييمات منشورة.',
    voices:[
      ['محمود','طالب محاسبة','الطريقة دي خلتني أفهم الحسابات بشكل عملي بدل الحفظ فقط.'],
      ['نور','خريجة جديدة','أخيرًا عندي رحلة واضحة تربط التعلم بمهارات الشغل.'],
      ['عمر','محاسب عامل','أراجع قراراتي وأشوف الدليل المهني الذي بنيته من الحالات.'],
    ],
    finalKicker:'من أول قيد إلى قرار مدير مالي',finalTitle:'مستقبلك المهني يبدأ الآن',finalText:'ابدأ مجانًا داخل النسخة المحلية، تعلّم بالممارسة، وابنِ ملفًا يشرح ما تستطيع فعله.',finalCta:'ابدأ مجانًا',
    roles:['محاسب','محاسب أول','رئيس حسابات','مدير مالي'],
    trust:['نسخة محلية تجريبية','لا تحتاج بطاقة ائتمان','عربي وإنجليزي','تقدم محفوظ على جهازك'],
  },
  en:{
    direction:'ltr',
    eyebrow:'CAREER LEAGUE · LOCAL DEMO',
    title:'Real competition. From anywhere.',
    subtitle:'Learn. Apply. Compete. Build your career inside an accounting game inspired by real work.',
    primary:'Start your journey',secondary:'Explore the journey',
    you:'You',rival:'Your rival',level:'Level',mission:'Current mission',
    missionA:['Review the document','Choose the accounts','Record the entry'],
    missionB:['Inspect the evidence','Test the accounts','Review the outcome'],
    preview:'Local competition preview',
    nodes:['Start','Local company','Growing company','Corporate','Your next decision'],
    metrics:[['3','starting personas'],['9','career levels'],['5','company tiers'],['53','learning-map modules']],
    journeyKicker:'A playable career map',journeyTitle:'Your professional journey starts here',journeyText:'Start with the foundations, work inside a simulated company, and collect professional evidence from every accounting decision.',
    stages:[
      ['Accounting Bootcamp','Core accounting foundations','Available'],
      ['Mizan Trading','Your first company simulation','Start here'],
      ['Bigger Companies','Harder cases and more responsibility','Unlock by progress'],
      ['Month-End','Realistic review and adjustments','Coming soon'],
      ['Finance Manager','Professional judgment and impact','Career goal'],
    ],
    explore:'Explore your career journey',
    featureKicker:'Every action has an outcome',featureTitle:'Practice that grows into a professional future',
    competitionTitle:'Compete with your peers',competitionText:'Try local accounting challenges with clear outcomes. Compare decisions and learn from every attempt.',competitionCta:'Enter competition',
    cvTitle:'A CV that grows with you',cvText:'Real achievements from the simulation become explainable evidence inside your professional profile.',cvCta:'View your CV',
    skillsTitle:'Build in-demand skills',skillsText:'Master the accounting foundations, then follow a clear professional roadmap from entries to financial analysis.',skillsCta:'Browse skills',
    featurePreview:'Local demo preview',proof:'Evidence earned through play',roadmap:'Learning and development map',
    voicesTitle:'What could each journey feel like?',voicesNote:'Illustrative journey voices — these are not published user reviews.',
    voices:[
      ['Mahmoud','Accounting student','The practical flow helps me understand accounts instead of memorizing rules.'],
      ['Nour','Fresh graduate','I can finally see a clear path from learning to workplace skills.'],
      ['Omar','Working accountant','I can review my decisions and see the professional evidence I built.'],
    ],
    finalKicker:'From your first entry to finance leadership',finalTitle:'Your professional future starts now',finalText:'Start free in the local preview, learn through practice, and build a profile that explains what you can do.',finalCta:'Start free',
    roles:['Accountant','Senior Accountant','Chief Accountant','Finance Manager'],
    trust:['Local demo preview','No credit card needed','Arabic and English','Progress saved on this device'],
  },
} as const;

function Arrow({ar}:{ar:boolean}){return ar?<ArrowLeft aria-hidden="true"/>:<ArrowRight aria-hidden="true"/>}

export function CareerLandingV4({locale}:LandingProps){
  const ar=locale==='ar',t=copy[locale];
  const start=`/${locale}/onboarding`;
  return <div className="cl4" dir={t.direction}>
    <section className="cl4-hero" id="home" aria-labelledby="cl4-title">
      <Image className="cl4-hero-image" src="/landing/career-league-hero-v2.png" alt={ar?'مشهد Career League للاعبين يتقدمان عبر تحديات وشركات محاسبية':'Career League scene with two players progressing through accounting challenges and companies'} fill priority sizes="100vw"/>
      <div className="cl4-hero-shade"/>
      <div className="cl4-hero-copy">
        <span className="cl4-kicker"><Sparkles/>{t.eyebrow}</span>
        <h1 id="cl4-title">{t.title}</h1>
        <p>{t.subtitle}</p>
        <div className="cl4-actions"><Link className="cl4-primary" href={start}>{t.primary}<Arrow ar={ar}/></Link><Link className="cl4-secondary" href="#journey">{t.secondary}<Route/></Link></div>
      </div>
      <PlayerCard side="a" name={t.you} level={`${t.level} 1`} mission={t.mission} steps={t.missionA}/>
      <PlayerCard side="b" name={t.rival} level={`${t.level} 1`} mission={t.mission} steps={t.missionB}/>
      <div className="cl4-vs" aria-label={t.preview}><strong>VS</strong><small>{t.preview}</small></div>
      <div className="cl4-node-track" aria-label={ar?'مراحل التقدم المهني':'Career progression stages'}>{t.nodes.map((node,index)=><span key={node} className={index===0?'active':index===4?'goal':''}><i>{index===4?<Trophy/>:index+1}</i><b>{node}</b></span>)}</div>
    </section>

    <section className="cl4-metrics" aria-label={ar?'حقائق النسخة الحالية':'Current product facts'}>{t.metrics.map(([value,label],index)=>{const Icon=[Users,Target,Building2,BookOpenCheck][index];return <article key={label}><Icon/><strong>{value}</strong><span>{label}</span></article>})}</section>

    <section className="cl4-journey" id="journey" aria-labelledby="cl4-journey-title">
      <header><span id="companies">{t.journeyKicker}</span><h2 id="cl4-journey-title">{t.journeyTitle}</h2><p>{t.journeyText}</p></header>
      <div className="cl4-islands">{t.stages.map(([title,text,status],index)=>{const Icon=[GraduationCap,Landmark,Building2,FileCheck2,Trophy][index];return <article key={title} className={`${index>2?'locked ':''}stage-${index+1}`}><div className="cl4-island"><i><Icon/></i><span>{index>2?<LockKeyhole/>:<Check/>}</span></div><small>{status}</small><h3>{title}</h3><p>{text}</p>{index<t.stages.length-1?<Arrow ar={ar}/>:null}</article>})}</div>
      <Link className="cl4-dark-cta" href={`/${locale}/career-league/companies`}>{t.explore}<Arrow ar={ar}/></Link>
    </section>

    <section className="cl4-features" id="competition" aria-labelledby="cl4-features-title">
      <header><span>{t.featureKicker}</span><h2 id="cl4-features-title">{t.featureTitle}</h2></header>
      <div className="cl4-feature-grid">
        <article className="cl4-feature competition"><div className="cl4-feature-art cl4-duel"><div><UserRound/><b>{ar?'أحمد':'Alex'}</b></div><strong>VS</strong><div><UserRound/><b>{ar?'سارة':'Sara'}</b></div></div><span><Gamepad2/>{t.featurePreview}</span><h3>{t.competitionTitle}</h3><p>{t.competitionText}</p><Link href={`/${locale}/leaderboard`}>{t.competitionCta}<Arrow ar={ar}/></Link></article>
        <article className="cl4-feature cv"><div className="cl4-feature-art cl4-cv-art"><Image src="/marketing/auto-cv.png" alt={ar?'معاينة السيرة الذاتية المبنية من دليل اللعب':'Preview of the evidence-based Auto CV'} fill sizes="(max-width: 760px) 92vw, 31vw"/></div><span><FileCheck2/>{t.proof}</span><h3>{t.cvTitle}</h3><p>{t.cvText}</p><Link href={`/${locale}/career-profile/cv`}>{t.cvCta}<Arrow ar={ar}/></Link></article>
        <article className="cl4-feature skills" id="tools"><div className="cl4-feature-art cl4-skill-cloud">{['Excel','Financial Analysis','IFRS','Power BI','AI in Finance','Risk & Controls','ERP','Business Partnering'].map(skill=><i key={skill}>{skill}</i>)}</div><span><BarChart3/>{t.roadmap}</span><h3>{t.skillsTitle}</h3><p>{t.skillsText}</p><Link href={`/${locale}/career-profile/skills`}>{t.skillsCta}<Arrow ar={ar}/></Link></article>
      </div>
    </section>

    <section className="cl4-voices" aria-labelledby="cl4-voices-title">
      <header><h2 id="cl4-voices-title">{t.voicesTitle}</h2><p>{t.voicesNote}</p></header>
      <div>{t.voices.map(([name,role,quote],index)=><article key={name}><i>{index===0?'م':index===1?'ن':'ع'}</i><span><b>{name}</b><small>{role}</small></span><blockquote>“{quote}”</blockquote></article>)}</div>
    </section>

    <section className="cl4-final" id="pricing" aria-labelledby="cl4-final-title">
      <Image src="/platform/beginner-career-city.png" alt="" fill sizes="100vw"/>
      <div className="cl4-final-shade"/>
      <div className="cl4-final-copy" id="about"><span>{t.finalKicker}</span><h2 id="cl4-final-title">{t.finalTitle}</h2><p>{t.finalText}</p><Link href={start}>{t.finalCta}<Arrow ar={ar}/></Link></div>
      <div className="cl4-role-path">{t.roles.map((role,index)=><span key={role} style={{'--step':index} as CSSProperties}><i>{index===3?<Trophy/>:<BriefcaseBusiness/>}</i><b>{role}</b></span>)}</div>
      <div className="cl4-trust">{t.trust.map((item,index)=>{const Icon=[ShieldCheck,Check,MapPin,LineChart][index];return <span key={item}><Icon/>{item}</span>})}</div>
    </section>
  </div>;
}

function PlayerCard({side,name,level,mission,steps}:{side:'a'|'b';name:string;level:string;mission:string;steps:readonly string[]}){
  return <aside className={`cl4-player cl4-player-${side}`}><header><i><UserRound/></i><span><b>{name}</b><small>{level}</small></span></header><div><strong>{mission}</strong>{steps.map((step,index)=><span key={step}><i>{index<2?<Check/>:index+1}</i>{step}</span>)}</div></aside>;
}
