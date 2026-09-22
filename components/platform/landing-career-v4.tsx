import Image from 'next/image';
import Link from 'next/link';
import type {CSSProperties} from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, BarChart3, BookOpenCheck,
  BriefcaseBusiness, Building2, Check, FileCheck2, Gamepad2,
  GraduationCap, Landmark, LineChart, LockKeyhole, MapPin, Play,
  Rocket, Route, ShieldCheck, Sparkles, Target, Trophy,
  Users, type LucideIcon,
} from 'lucide-react';
import type {Locale} from '@/types';

type LandingProps={locale:Locale};
type Stage={title:string;english:string;purpose:string;detail:string;status:string;href:string;icon:LucideIcon;locked?:boolean};

const copy={
  ar:{
    direction:'rtl',eyebrow:'CAREER LEAGUE',eyebrowSub:'تجربة المنافسة المهنية',
    title:['منافسة حقيقية','من أي مكان!'],
    subtitle:'تعلّم. طبّق. نافس. وابنِ مستقبلك المهني داخل لعبة محاسبة تحاكي الشغل الحقيقي.',
    primary:'ابدأ رحلتك الآن',secondary:'اكتشف كيف تعمل اللعبة',preview:'منافسة محلية قابلة للتجربة الآن',
    players:[
      {name:'سارة',level:'المستوى 3',xp:'320 / 500 XP',tier:'المستوى الذهبي',tasks:['إعداد القوائم المالية','تحليل البيانات','مراجعة الحسابات']},
      {name:'أحمد',level:'المستوى 2',xp:'210 / 400 XP',tier:'المستوى الفضي',tasks:['تسجيل القيود اليومية','إعداد الموازنة','تحليل التكاليف']},
    ],
    mission:'المهام الحالية',heroPath:[['ميزان للتجارة','ابدأ عملك'],['دلتا للتجارة','طبّق ما تعلمت'],['هورايزون للصناعات','وسع خبرتك'],['أوربت الإقليمية','قد فريقًا'],['أطلس العالمية','محاكاة متقدمة']],
    facts:[['9','مستويات مهنية'],['5','درجات شركات محاكاة'],['197','حسابًا في مدينة الحسابات'],['LOCAL','منافسة تجريبية']],
    journeyKicker:'خريطة رحلتك المهنية',journeyTitle:'رحلتك المهنية تبدأ من هنا',journeyText:'ابدأ من مستواك الحالي، وابنِ خبرتك خطوة بخطوة لحد المستوى المهني اللي تستهدفه.',
    stages:[
      {title:'معسكر البداية',english:'Accounting Bootcamp',purpose:'أساسيات المحاسبة من الصفر.',detail:'مفاهيم وتمارين تأسيسية قبل دخول الشركة.',status:'متاح الآن',href:'/bootcamp',icon:GraduationCap},
      {title:'ميزان للتجارة',english:'Mizan Trading',purpose:'أول تجربة عمل محاسبية فعلية.',detail:'مستندات وحالات وقرارات داخل مكتب محاسبي.',status:'قابل للعب',href:'/game',icon:Landmark},
      {title:'شركات أكبر',english:'Corporate Growth',purpose:'مسؤوليات وحالات أكثر تعقيدًا.',detail:'تدرّج داخل خمس درجات شركات محاكاة.',status:'يفتح بالتقدم',href:'/career-league/companies',icon:Building2},
      {title:'الإقفال الشهري',english:'Month-End',purpose:'تسويات ومراجعة وإقفال الفترة.',detail:'معاينة لمسار الإقفال القادم؛ اللعب الكامل غير متاح.',status:'معاينة مقفلة',href:'/game/month-end',icon:FileCheck2,locked:true},
      {title:'القيادة المالية',english:'Finance Leadership',purpose:'تحليل وقرارات وإدارة مالية.',detail:'هدف تطور مهني داخل المحاكاة، وليس وعدًا بوظيفة.',status:'هدف مهني',href:'/career-league/promotion',icon:Trophy,locked:true},
    ] as Stage[],
    explore:'استكشف رحلتك المهنية',journeyHint:'مرّر أو استخدم لوحة المفاتيح لاستكشاف المراحل',
    featureKicker:'كل خطوة لها أثر',featureTitle:'اللعبة اللي تحوّل الممارسة إلى مستقبل مهني',featureText:'تعلّم. نافس. ابنِ مهارات حقيقية. وحوّل إنجازاتك المؤهلة إلى ملف مهني أقوى.',
    competition:{title:'نافس مع زملائك',text:'واجه نفس التحديات المحاسبية، قارن أداءك، واكتشف نقاط قوتك ونقاط التطوير.',cta:'ادخل المنافسة',state:'منافسة محلية تجريبية'},
    cv:{title:'سيرة ذاتية تنمو معك',text:'إنجازاتك المؤهلة داخل اللعبة تحدّث ملفك المهني وسيرتك الذاتية بدون اختلاق خبرة لم تعملها.',cta:'شاهد سيرتك',state:'دليل مهني قابل للتفسير'},
    skills:{title:'اكتسب مهارات مطلوبة',text:'تعلّم من خلال تحديات عملية، واتبع خريطة مهارات مالية ومهنية واضحة.',cta:'استكشف المهارات',state:'قدرات وخريطة تطوير'},
    cvSignals:['إضافة المهارة','إضافة الدليل','تحديث السيرة'],
    skillStates:[['Excel','متاح'],['Financial Analysis','قيد التطوير'],['IFRS','خريطة مستقبلية'],['Power BI','خريطة مستقبلية'],['ERP','خريطة مستقبلية'],['Risk & Controls','قيد التطوير']],
    storiesKicker:'شخصيات توضيحية — ليست تقييمات منشورة',storiesTitle:'ماذا يقول اللاعبون؟',storiesText:'ثلاث شخصيات افتراضية توضّح كيف تخدم التجربة احتياجات مهنية مختلفة.',
    stories:[['طالب محاسبة','كنت بحفظ المدين والدائن. دلوقتي بقيت أفهم العملية الأول.'],['خريج جديد','كنت فاهم النظرية، لكن ماكنتش فاهم شغل المستندات والحالات.'],['محاسب بشركة صغيرة','اكتشفت المهارات اللي ناقصاني علشان أجهز نفسي لشركة أكبر.']],sample:'مثال توضيحي',
    finalKicker:'محاكاة مهنية حقيقية',finalTitle:['مستقبلك المهني','يبدأ الآن'],finalText:'ابدأ من مستواك الحالي. اشتغل على مهاراتك. وابنِ الطريق للدور اللي تستهدفه.',finalPrimary:'ابدأ رحلتك المهنية',finalSecondary:'اكتشف المسارات',
    roles:['محاسب','محاسب أول','رئيس حسابات','مدير مالي'],trust:['نسخة محلية تجريبية','عربي وإنجليزي','تقدم محفوظ على جهازك'],
  },
  en:{
    direction:'ltr',eyebrow:'CAREER LEAGUE',eyebrowSub:'Professional competition experience',
    title:['Real competition.','From anywhere.'],
    subtitle:'Learn. Apply. Compete. Build your professional future inside an accounting game inspired by real work.',
    primary:'Start your journey',secondary:'See how the game works',preview:'Local competition available to try now',
    players:[
      {name:'Sara',level:'Level 3',xp:'320 / 500 XP',tier:'Gold tier',tasks:['Prepare statements','Analyze data','Review accounts']},
      {name:'Ahmed',level:'Level 2',xp:'210 / 400 XP',tier:'Silver tier',tasks:['Record journal entries','Prepare a budget','Analyze costs']},
    ],
    mission:'Current missions',heroPath:[['Mizan Trading','Start working'],['Delta Commerce','Apply your learning'],['Horizon Industries','Expand your experience'],['Orbit Regional','Lead a team'],['Atlas Global','Advanced simulation']],
    facts:[['9','career levels'],['5','simulated company tiers'],['197','accounts in Account City'],['LOCAL','demo competition']],
    journeyKicker:'Your career journey map',journeyTitle:'Your professional journey starts here',journeyText:'Start at your current level and build your experience step by step toward the professional role you are targeting.',
    stages:[
      {title:'Accounting Bootcamp',english:'Foundation',purpose:'Accounting foundations from zero.',detail:'Concepts and foundation practice before company work.',status:'Available now',href:'/bootcamp',icon:GraduationCap},
      {title:'Mizan Trading',english:'First Company',purpose:'Your first realistic accounting-work experience.',detail:'Documents, cases, and decisions inside an accounting office.',status:'Playable',href:'/game',icon:Landmark},
      {title:'Bigger Companies',english:'Corporate Growth',purpose:'More responsibility and harder cases.',detail:'Progress across five simulated company tiers.',status:'Unlock by progress',href:'/career-league/companies',icon:Building2},
      {title:'Month-End',english:'Close & Review',purpose:'Adjustments, review, and period close.',detail:'A preview of the future close track; full gameplay is unavailable.',status:'Locked preview',href:'/game/month-end',icon:FileCheck2,locked:true},
      {title:'Finance Leadership',english:'Career Goal',purpose:'Analysis, decisions, and financial leadership.',detail:'A simulation career goal, not a promise of employment.',status:'Career target',href:'/career-league/promotion',icon:Trophy,locked:true},
    ] as Stage[],
    explore:'Explore your professional journey',journeyHint:'Scroll or use the keyboard to explore the stages',
    featureKicker:'Every step has an outcome',featureTitle:'The game that turns practice into professional progress',featureText:'Learn. Compete. Build real skills. Turn qualified achievements into a stronger professional profile.',
    competition:{title:'Compete with your peers',text:'Face the same accounting challenges, compare your performance, and discover strengths and development areas.',cta:'Enter competition',state:'Local demo competition'},
    cv:{title:'A CV that grows with you',text:'Qualified achievements update your professional profile and ATS CV without inventing experience you never earned.',cta:'View your CV',state:'Explainable career evidence'},
    skills:{title:'Build in-demand skills',text:'Learn through practical challenges and follow a clear financial and professional skill map.',cta:'Explore skills',state:'Capabilities and roadmap'},
    cvSignals:['Skill added','Evidence added','CV updated'],
    skillStates:[['Excel','Available'],['Financial Analysis','In development'],['IFRS','Roadmap'],['Power BI','Roadmap'],['ERP','Roadmap'],['Risk & Controls','In development']],
    storiesKicker:'Illustrative characters — not published reviews',storiesTitle:'What do players say?',storiesText:'Three fictional characters show how the experience can support different professional needs.',
    stories:[['Accounting student','I used to memorize debit and credit. Now I start by understanding the transaction.'],['Fresh graduate','I knew the theory, but I did not understand document and case workflows.'],['Small-company accountant','I discovered the skills I need to prepare for a larger company.']],sample:'Illustrative example',
    finalKicker:'A real professional simulation',finalTitle:['Your professional future','starts now'],finalText:'Start at your current level. Work on your skills. Build the path toward the role you are targeting.',finalPrimary:'Start your career journey',finalSecondary:'Explore career paths',
    roles:['Accountant','Senior Accountant','Chief Accountant','Finance Manager'],trust:['Local demo preview','Arabic and English','Progress saved on this device'],
  },
} as const;

function Arrow({ar}:{ar:boolean}){return ar?<ArrowLeft aria-hidden="true"/>:<ArrowRight aria-hidden="true"/>}
function localize(locale:Locale,path:string){return `/${locale}${path}`}

export function CareerLandingV4({locale}:LandingProps){
  return <div className="cl4" dir={copy[locale].direction}><CareerLeagueHero locale={locale}/><CareerJourneyWorld locale={locale}/><LandingFeatureWorlds locale={locale}/><PlayerJourneyStories locale={locale}/><CareerFutureCta locale={locale}/></div>;
}

function CareerLeagueHero({locale}:LandingProps){
  const ar=locale==='ar',t=copy[locale];
  return <section className="cl4-hero" id="home" aria-labelledby="cl4-title"><Image className="cl4-hero-image" src="/landing/career-league-hero-v2.png" alt={ar?'لاعبان يتقدمان في محاكاة Career League المحاسبية':'Two learners progressing through the Career League accounting simulation'} fill priority sizes="100vw"/><div className="cl4-hero-shade"/><div className="cl4-hero-copy"><span className="cl4-kicker"><Gamepad2/><b>{t.eyebrow}</b><small>{t.eyebrowSub}</small></span><h1 id="cl4-title"><span>{t.title[0]}</span><strong>{t.title[1]}</strong></h1><p>{t.subtitle}</p><div className="cl4-actions"><Link className="cl4-primary" href={localize(locale,'/onboarding')}>{t.primary}<Arrow ar={ar}/></Link><Link className="cl4-secondary" href="#journey">{t.secondary}<Play/></Link></div><span className="cl4-preview-note"><ShieldCheck/>{t.preview}</span></div><PlayerMissionCard side="a" player={t.players[0]} mission={t.mission}/><PlayerMissionCard side="b" player={t.players[1]} mission={t.mission}/><div className="cl4-vs" aria-label={t.preview}><strong>VS</strong></div><div className="cl4-company-path" aria-label={ar?'درجات الشركات المحاكية':'Simulated company progression'}>{t.heroPath.map(([name,detail],index)=><span key={name} className={index===0?'active':index===4?'goal':''}><i>{index===4?<Trophy/>:index+1}</i><b>{name}</b><small>{detail}</small></span>)}</div><div className="cl4-metrics" aria-label={ar?'حقائق المنتج الحالية':'Current product facts'}>{t.facts.map(([value,label],index)=>{const Icon=[Target,Building2,BookOpenCheck,Users][index];return <article key={label}><Icon/><strong>{value}</strong><span>{label}</span></article>})}</div></section>;
}

function PlayerMissionCard({side,player,mission}:{side:'a'|'b';player:{readonly name:string;readonly level:string;readonly xp:string;readonly tier:string;readonly tasks:readonly string[]};mission:string}){
  return <aside className={`cl4-player cl4-player-${side}`}><header><i className="cl4-player-photo"><Image src="/landing/player-journeys-v2.png" alt="" fill sizes="48px" className={side==='a'?'portrait-0':'portrait-1'}/></i><span><b>{player.name}</b><small>{player.level} · {player.tier}</small></span><em>{player.xp}</em></header><div><strong>{mission}</strong>{player.tasks.map((task,index)=><span key={task}><i>{index<2?<Check/>:index+1}</i>{task}</span>)}</div></aside>;
}

function CareerJourneyWorld({locale}:LandingProps){
  const ar=locale==='ar',t=copy[locale];
  return <section className="cl4-journey" id="journey" aria-labelledby="cl4-journey-title"><Image className="cl4-journey-image" src="/landing/career-journey-world-v2.webp" alt={ar?'خمس جزر مهنية تربط التعلم بالقيادة المالية':'Five career islands connecting accounting foundations to finance leadership'} fill sizes="100vw"/><div className="cl4-journey-sky"/><header><span id="companies">{t.journeyKicker}</span><h2 id="cl4-journey-title">{t.journeyTitle}</h2><p>{t.journeyText}</p></header><div className="cl4-stage-map" role="list" aria-label={ar?'مراحل الرحلة المهنية':'Career journey stages'}>{t.stages.map((stage,index)=><CareerStageIsland key={stage.title} locale={locale} stage={stage} index={index}/>)}</div><div className="cl4-journey-foot"><span><Route/>{t.journeyHint}</span><Link href={localize(locale,'/career-league/companies')}>{t.explore}<Arrow ar={ar}/></Link></div></section>;
}

function CareerStageIsland({locale,stage,index}:{locale:Locale;stage:Stage;index:number}){
  const Icon=stage.icon,ar=locale==='ar';
  return <Link className={`cl4-stage ${stage.locked?'locked':''}`} style={{'--stage':index} as CSSProperties} href={localize(locale,stage.href)} aria-label={`${stage.title}: ${stage.status}`}><i><Icon/></i><span><small>{index+1} · {stage.status}</small><b>{stage.title}</b><em>{stage.english}</em><p>{stage.purpose}</p><strong>{stage.detail}</strong></span>{stage.locked?<LockKeyhole className="cl4-stage-lock"/>:<BadgeCheck className="cl4-stage-check"/>}<Arrow ar={ar}/></Link>;
}

function LandingFeatureWorlds({locale}:LandingProps){
  const ar=locale==='ar',t=copy[locale];
  return <section className="cl4-features" id="competition" aria-labelledby="cl4-features-title"><header><span><Sparkles/>{t.featureKicker}</span><h2 id="cl4-features-title">{t.featureTitle}</h2><p>{t.featureText}</p></header><div className="cl4-feature-grid"><article className="cl4-feature competition"><FeatureArt src="/landing/competition-world-v2.webp" alt={ar?'لاعبان في تحدٍ محاسبي تجريبي':'Two learners in a demo accounting challenge'}/><span><Gamepad2/>{t.competition.state}</span><h3>{t.competition.title}</h3><p>{t.competition.text}</p><div className="cl4-rank-signal"><Trophy/><b>VS</b><LineChart/></div><Link href={localize(locale,'/leaderboard')}>{t.competition.cta}<Arrow ar={ar}/></Link><PeopleRow label={ar?'ملفات تجريبية محلية':'Local demo profiles'}/></article><article className="cl4-feature cv"><FeatureArt src="/marketing/auto-cv.png" alt={ar?'معاينة السيرة الذاتية المبنية من دليل اللعب':'Preview of the evidence-based ATS CV'}/><span><FileCheck2/>{t.cv.state}</span><h3>{t.cv.title}</h3><p>{t.cv.text}</p><div className="cl4-cv-signals">{t.cvSignals.map(signal=><i key={signal}><Check/>{signal}</i>)}</div><Link href={localize(locale,'/career-profile/cv')}>{t.cv.cta}<Arrow ar={ar}/></Link><div className="cl4-evidence-proof"><ShieldCheck/><span><b>{ar?'دليل مهني قابل للتفسير':'Explainable evidence'}</b><small>{ar?'بدون اختلاق خبرة':'No invented experience'}</small></span><BadgeCheck/></div></article><article className="cl4-feature skills" id="tools"><FeatureArt src="/landing/skills-world-v2.webp" alt={ar?'عالم مهارات مالية ومهنية ثلاثي الأبعاد':'Three-dimensional financial and professional skill world'}/><span><BarChart3/>{t.skills.state}</span><h3>{t.skills.title}</h3><p>{t.skills.text}</p><div className="cl4-skill-states">{t.skillStates.map(([skill,state])=><i key={skill}><b>{skill}</b><small>{state}</small></i>)}</div><Link href={localize(locale,'/career-profile/skills')}>{t.skills.cta}<Arrow ar={ar}/></Link><PeopleRow label={ar?'6 مجالات مهارية واضحة':'6 mapped skill areas'}/></article></div></section>;
}

function FeatureArt({src,alt}:{src:string;alt:string}){return <div className="cl4-feature-art"><Image src={src} alt={alt} fill sizes="(max-width: 760px) 92vw, (max-width: 1100px) 48vw, 31vw"/></div>}

function PeopleRow({label}:{label:string}){return <div className="cl4-people-row"><span aria-hidden="true">{[0,1,2,1].map((portrait,index)=><i key={index}><Image src="/landing/player-journeys-v2.png" alt="" fill sizes="36px" className={`portrait-${portrait}`}/></i>)}</span><b>{label}</b></div>}

function PlayerJourneyStories({locale}:LandingProps){
  const t=copy[locale];
  return <section className="cl4-stories" aria-labelledby="cl4-stories-title"><header><span><Users/>{t.storiesKicker}</span><h2 id="cl4-stories-title">{t.storiesTitle}</h2><p>{t.storiesText}</p></header><div>{t.stories.map(([role,quote],index)=><article key={role}><div className="cl4-story-photo"><Image src="/landing/player-journeys-v2.png" alt={role} fill sizes="76px" className={`portrait-${index}`}/></div><span><small>{t.sample}</small><b>{role}</b></span><blockquote>“{quote}”</blockquote><em>{index===0?<GraduationCap/>:index===1?<BriefcaseBusiness/>:<LineChart/>}</em></article>)}</div></section>;
}

function CareerFutureCta({locale}:LandingProps){
  const ar=locale==='ar',t=copy[locale];
  return <section className="cl4-final" id="about" aria-labelledby="cl4-final-title"><Image src="/landing/career-future-v2.webp" alt={ar?'محترف ينظر إلى مدينة ومسار مضيء للمسؤوليات المهنية':'A professional looking toward a city and a glowing path of career responsibility'} fill sizes="100vw"/><div className="cl4-final-shade"/><div className="cl4-final-copy"><span>{t.finalKicker}</span><h2 id="cl4-final-title"><b>{t.finalTitle[0]}</b><strong>{t.finalTitle[1]}</strong></h2><p>{t.finalText}</p><div><Link href={localize(locale,'/onboarding')}>{t.finalPrimary}<Rocket/></Link><Link href={localize(locale,'/career-league/companies')}>{t.finalSecondary}<Arrow ar={ar}/></Link></div></div><div className="cl4-role-path">{t.roles.map((role,index)=><span key={role} style={{'--step':index} as CSSProperties}><i>{index===3?<Trophy/>:<BriefcaseBusiness/>}</i><b>{role}</b></span>)}</div><div className="cl4-trust">{t.trust.map((item,index)=>{const Icon=[ShieldCheck,MapPin,Target][index];return <span key={item}><Icon/>{item}</span>})}</div></section>;
}
