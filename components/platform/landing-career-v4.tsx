import Image from 'next/image';
import Link from 'next/link';
import type {CSSProperties, ReactNode} from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, BarChart3, BookOpenCheck, BrainCircuit,
  BriefcaseBusiness, Building2, Check, CircleGauge, Database, FileCheck2,
  FileText, Gamepad2, GraduationCap, Landmark, LayoutDashboard, LineChart,
  LockKeyhole, MapPin, Play, Rocket, Route, ShieldCheck, Sparkles, Table2,
  Target, Trophy, Users, Workflow, type LucideIcon,
} from 'lucide-react';
import type {Locale} from '@/types';

type LandingProps={locale:Locale};
type Stage={title:string;english:string;purpose:string;status:string;href:string;icon:LucideIcon;locked?:boolean};
type Skill={name:string;state:string;icon:LucideIcon;tone:'ready'|'building'|'roadmap'};
type Story={role:string;tag:string;before:string;after:string;quote:string;progress:string};

const copy={
  ar:{
    direction:'rtl',eyebrow:'CAREER LEAGUE',eyebrowSub:'محاكاة مهنية تنافسية',
    title:['منافسة حقيقية','من أي مكان!'],
    subtitle:'تعلّم، طبّق، نافس، وابنِ مستقبلك المهني داخل لعبة محاسبة تحاكي الشغل الحقيقي.',
    primary:'ابدأ رحلتك الآن',secondary:'اكتشف رحلتك المهنية',preview:'منافسة محلية تجريبية',
    players:[
      {name:'سارة',level:'المستوى 3',xp:'320 / 500 XP',percent:'64%',gain:'+120 XP',tier:'ذهبي',tasks:['إعداد القوائم المالية','تحليل البيانات','مراجعة الحسابات']},
      {name:'أحمد',level:'المستوى 2',xp:'210 / 400 XP',percent:'52%',gain:'+95 XP',tier:'فضي',tasks:['تسجيل القيود اليومية','إعداد الموازنة','تحليل التكاليف']},
    ],
    mission:'المهام الحالية',heroPath:[['معسكر البداية','ابدأ رحلتك'],['ميزان للتجارة','طبّق ما تعلمت'],['شركة أكبر','طوّر مهاراتك'],['الإقفال الشهري','أتقن الدورة'],['القيادة المالية','حقق طموحك']],
    facts:[['9','مستويات مهنية'],['5','درجات شركات محاكاة'],['197','حسابًا في مدينة الحسابات'],['LOCAL','منافسة تجريبية']],
    journeyKicker:'خريطة رحلتك المهنية',journeyTitle:'رحلتك المهنية تبدأ من هنا',journeyText:'ابدأ من الأساسيات، اكتسب الخبرة العملية، وانتقل خطوة بخطوة نحو الدور المهني الذي تستهدفه.',
    journeyPills:['من مبتدئ إلى قائد','تعلّم بالممارسة','خبرة داخل محاكاة','مسار عملي واضح'],
    stages:[
      {title:'معسكر البداية',english:'Accounting Bootcamp',purpose:'تعلّم أساسيات المحاسبة',status:'متاح الآن',href:'/bootcamp',icon:GraduationCap},
      {title:'ميزان للتجارة',english:'Mizan Trading',purpose:'اكتسب خبرة عملية حقيقية',status:'قابل للعب',href:'/game',icon:Landmark},
      {title:'شركات أكبر',english:'Corporate Growth',purpose:'وسّع نطاقك المهني',status:'يفتح بالتقدم',href:'/career-league/companies',icon:Building2},
      {title:'الإقفال الشهري',english:'Month-End',purpose:'أتقن دورة الإقفال',status:'معاينة مقفلة',href:'/game/month-end',icon:FileCheck2,locked:true},
      {title:'القيادة المالية',english:'Finance Leadership',purpose:'هدفك داخل المحاكاة',status:'هدف مهني',href:'/career-league/promotion',icon:Trophy,locked:true},
    ] as Stage[],
    explore:'استكشف رحلتك المهنية',journeyHint:'مرّر لاستكشاف المراحل',
    featureKicker:'كل خطوة لها أثر',featureTitle:'اللعبة التي تحوّل الممارسة إلى مستقبل مهني',featureText:'تعلّم، نافس، ابنِ سيرتك، واكتسب مهارات حقيقية — في مكان واحد.',
    competition:{title:'نافس مع زملائك',text:'واجه نفس التحديات المحاسبية، قارن أداءك، واكتشف نقاط قوتك وفرص التطوير.',cta:'ابدأ المنافسة',state:'منافسة محلية تجريبية'},
    cv:{title:'سيرة ذاتية تنمو معك',text:'إنجازاتك المؤهلة تضيف مهارات وأدلة قابلة للتفسير إلى ملفك المهني.',cta:'شاهد سيرتك',state:'متوافق مع أنظمة التوظيف'},
    skills:{title:'اكتسب مهارات مطلوبة',text:'خريطة واضحة لقدرات مالية ومهنية تتطور من خلال الممارسة العملية.',cta:'تصفح المهارات',state:'مهارات وخريطة تطوير'},
    cvSignals:['مهارة أضيفت','دليل مهني أضيف','السيرة اتحدثت'],skillsCore:'نواة المهارات المهنية',
    skillStates:[
      {name:'Excel',state:'متاح',icon:Table2,tone:'ready'},
      {name:'Financial Analysis',state:'قيد التطوير',icon:LineChart,tone:'building'},
      {name:'IFRS',state:'خريطة مستقبلية',icon:FileText,tone:'roadmap'},
      {name:'ERP',state:'خريطة مستقبلية',icon:Database,tone:'roadmap'},
      {name:'Power BI',state:'خريطة مستقبلية',icon:LayoutDashboard,tone:'roadmap'},
      {name:'Risk & Controls',state:'قيد التطوير',icon:ShieldCheck,tone:'building'},
      {name:'AI in Finance',state:'خريطة مستقبلية',icon:BrainCircuit,tone:'roadmap'},
    ] as Skill[],
    storiesKicker:'شخصيات توضيحية — ليست تقييمات منشورة',storiesTitle:'رحلة مختلفة. تقدّم حقيقي.',storiesText:'ثلاث شخصيات افتراضية توضّح كيف تخدم التجربة احتياجات مهنية مختلفة.',
    before:'قبل',after:'بعد',sample:'مثال توضيحي',
    stories:[
      {role:'طالب محاسبة',tag:'Accounting Student',before:'كنت بحفظ المدين والدائن.',after:'بدأت أفهم العملية قبل القيد.',quote:'اللعبة خلتني أشوف المحاسبة كحركة شغل، مش مجرد حفظ.',progress:'من الفهم إلى التطبيق'},
      {role:'خريج جديد',tag:'Fresh Graduate',before:'كنت فاهم النظرية فقط.',after:'بقيت أتعامل مع مستندات وحالات.',quote:'التحديات العملية رتبت أفكاري ووضحت لي خطوات الشغل.',progress:'من النظرية إلى الممارسة'},
      {role:'محاسب بشركة صغيرة',tag:'Working Accountant',before:'لم أعرف أين فجوات مهاراتي.',after:'أصبحت أرى المسار المطلوب بوضوح.',quote:'اكتشفت ما أحتاج تطويره قبل الانتقال لمسؤولية أكبر.',progress:'من الخبرة إلى التطور'},
    ] as Story[],
    finalKicker:'محاكاة مهنية حقيقية',finalTitle:['مستقبلك المهني','يبدأ الآن'],finalText:'ابدأ من مستواك الحالي، طوّر مهاراتك، وابنِ الطريق نحو الدور الذي تستهدفه داخل المحاكاة.',finalPrimary:'ابدأ رحلتك المهنية',finalSecondary:'اكتشف المسارات',
    roles:['محاسب','محاسب أول','رئيس حسابات','مدير مالي'],trust:['نسخة محلية تجريبية','عربي وإنجليزي','تقدم محفوظ على جهازك'],
  },
  en:{
    direction:'ltr',eyebrow:'CAREER LEAGUE',eyebrowSub:'Competitive career simulation',
    title:['Real competition.','From anywhere.'],
    subtitle:'Learn, apply, compete, and build your professional future inside an accounting game inspired by real work.',
    primary:'Start your journey',secondary:'Explore your career path',preview:'Local demo competition',
    players:[
      {name:'Sara',level:'Level 3',xp:'320 / 500 XP',percent:'64%',gain:'+120 XP',tier:'Gold',tasks:['Prepare statements','Analyze data','Review accounts']},
      {name:'Ahmed',level:'Level 2',xp:'210 / 400 XP',percent:'52%',gain:'+95 XP',tier:'Silver',tasks:['Record journal entries','Prepare a budget','Analyze costs']},
    ],
    mission:'Current missions',heroPath:[['Bootcamp','Start learning'],['Mizan Trading','Apply learning'],['Bigger Company','Build skills'],['Month-End','Master the close'],['Finance Leadership','Reach your goal']],
    facts:[['9','career levels'],['5','simulated company tiers'],['197','Account City accounts'],['LOCAL','demo competition']],
    journeyKicker:'Your career journey map',journeyTitle:'Your professional journey starts here',journeyText:'Start with the foundations, gain practical experience, and progress step by step toward the role you are targeting.',
    journeyPills:['Beginner to leader','Learn by practice','Simulation experience','A clear career path'],
    stages:[
      {title:'Accounting Bootcamp',english:'Foundation',purpose:'Learn accounting foundations',status:'Available now',href:'/bootcamp',icon:GraduationCap},
      {title:'Mizan Trading',english:'First Company',purpose:'Gain practical experience',status:'Playable',href:'/game',icon:Landmark},
      {title:'Bigger Companies',english:'Corporate Growth',purpose:'Expand your scope',status:'Unlock by progress',href:'/career-league/companies',icon:Building2},
      {title:'Month-End',english:'Close & Review',purpose:'Master the close cycle',status:'Locked preview',href:'/game/month-end',icon:FileCheck2,locked:true},
      {title:'Finance Leadership',english:'Career Goal',purpose:'Your simulation goal',status:'Career target',href:'/career-league/promotion',icon:Trophy,locked:true},
    ] as Stage[],
    explore:'Explore your career journey',journeyHint:'Scroll to explore stages',
    featureKicker:'Every step has an outcome',featureTitle:'The game that turns practice into professional progress',featureText:'Learn, compete, build your CV, and develop real skills — all in one place.',
    competition:{title:'Compete with your peers',text:'Face the same accounting challenges, compare performance, and discover strengths and growth areas.',cta:'Start competition',state:'Local demo competition'},
    cv:{title:'A CV that grows with you',text:'Qualified achievements add explainable skills and evidence to your professional profile.',cta:'View your CV',state:'ATS-friendly structure'},
    skills:{title:'Build in-demand skills',text:'A clear map of financial and professional capabilities developed through practical work.',cta:'Browse skills',state:'Skills and development map'},
    cvSignals:['Skill added','Career evidence added','CV updated'],skillsCore:'Professional Skills Core',
    skillStates:[
      {name:'Excel',state:'Available',icon:Table2,tone:'ready'},
      {name:'Financial Analysis',state:'In development',icon:LineChart,tone:'building'},
      {name:'IFRS',state:'Roadmap',icon:FileText,tone:'roadmap'},
      {name:'ERP',state:'Roadmap',icon:Database,tone:'roadmap'},
      {name:'Power BI',state:'Roadmap',icon:LayoutDashboard,tone:'roadmap'},
      {name:'Risk & Controls',state:'In development',icon:ShieldCheck,tone:'building'},
      {name:'AI in Finance',state:'Roadmap',icon:BrainCircuit,tone:'roadmap'},
    ] as Skill[],
    storiesKicker:'Illustrative characters — not published reviews',storiesTitle:'Different journeys. Real progress.',storiesText:'Three fictional personas show how the experience can support different professional needs.',
    before:'Before',after:'After',sample:'Illustrative example',
    stories:[
      {role:'Accounting Student',tag:'Accounting Student',before:'I memorized debit and credit.',after:'I understand the transaction first.',quote:'The game made accounting feel like work in motion, not memorization.',progress:'Understanding to application'},
      {role:'Fresh Graduate',tag:'Fresh Graduate',before:'I only understood the theory.',after:'I can work through documents and cases.',quote:'Practical challenges organized my thinking and clarified the workflow.',progress:'Theory to practice'},
      {role:'Working Accountant',tag:'Working Accountant',before:'I could not see my skill gaps.',after:'I can see the path I need clearly.',quote:'I found what to develop before moving toward greater responsibility.',progress:'Experience to growth'},
    ] as Story[],
    finalKicker:'A real professional simulation',finalTitle:['Your professional future','starts now'],finalText:'Start at your current level, develop your skills, and build the path toward the role you are targeting inside the simulation.',finalPrimary:'Start your career journey',finalSecondary:'Explore career paths',
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
  return <section className="cl4-hero" id="home" aria-labelledby="cl4-title">
    <Image className="cl4-hero-image" src="/landing/career-league-hero-v2.png" alt={ar?'لاعبان يتنافسان داخل محاكاة Career League المحاسبية':'Two learners competing inside the Career League accounting simulation'} fill priority sizes="100vw"/>
    <div className="cl4-hero-shade"/><div className="cl4-hero-grid"><PlayerHud side="a" player={t.players[0]} mission={t.mission}/><div className="cl4-hero-copy"><span className="cl4-kicker"><Gamepad2/><b>{t.eyebrow}</b><small>{t.eyebrowSub}</small></span><h1 id="cl4-title"><span>{t.title[0]}</span><strong>{t.title[1]}</strong></h1><p>{t.subtitle}</p><div className="cl4-actions"><Link className="cl4-primary" href={localize(locale,'/onboarding')}>{t.primary}<Arrow ar={ar}/></Link><Link className="cl4-secondary" href="#journey">{t.secondary}<Play/></Link></div><span className="cl4-preview-note"><ShieldCheck/>{t.preview}</span></div><PlayerHud side="b" player={t.players[1]} mission={t.mission}/></div>
    <div className="cl4-versus" aria-label={t.preview}><i>V</i><i>S</i><span>{t.players[0].gain}</span><span>{t.players[1].gain}</span></div>
    <div className="cl4-company-path" aria-label={ar?'درجات الشركات المحاكية':'Simulated company progression'}>{t.heroPath.map(([name,detail],index)=><span key={name} className={index===0?'active':index===4?'goal':''}><i>{index===4?<Trophy/>:index+1}</i><b>{name}</b><small>{detail}</small></span>)}</div>
    <div className="cl4-metrics" aria-label={ar?'حقائق المنتج الحالية':'Current product facts'}>{t.facts.map(([value,label],index)=>{const Icon=[Target,Building2,BookOpenCheck,Gamepad2][index];return <article key={label}><Icon/><strong>{value}</strong><span>{label}</span></article>})}</div>
  </section>;
}

function PlayerHud({side,player,mission}:{side:'a'|'b';player:{readonly name:string;readonly level:string;readonly xp:string;readonly percent:string;readonly gain:string;readonly tier:string;readonly tasks:readonly string[]};mission:string}){
  return <aside className={`cl4-player cl4-player-${side}`}><header><i className="cl4-player-photo"><Image src="/landing/player-journeys-v2.png" alt="" fill sizes="72px" className={side==='a'?'portrait-0':'portrait-1'}/></i><span><b>{player.name}</b><small>{player.level} · {player.tier}</small></span><Trophy/></header><div className="cl4-xp"><span><b>{player.xp}</b><em>{player.gain}</em></span><i><span style={{width:player.percent}}/></i></div><div className="cl4-missions"><strong>{mission}</strong>{player.tasks.map((task,index)=><span key={task}><i>{index<2?<Check/>:index+1}</i>{task}</span>)}</div></aside>;
}

function CareerJourneyWorld({locale}:LandingProps){
  const ar=locale==='ar',t=copy[locale];
  return <section className="cl4-journey" id="journey" aria-labelledby="cl4-journey-title"><Image className="cl4-journey-image" src="/landing/career-journey-world-v2.webp" alt={ar?'خمس جزر مهنية متصلة من البداية إلى القيادة المالية':'Five connected career islands from foundations to finance leadership'} fill sizes="100vw"/><div className="cl4-journey-wash"/><header><span id="companies"><Route/>{t.journeyKicker}</span><h2 id="cl4-journey-title">{t.journeyTitle}</h2><p>{t.journeyText}</p><div>{t.journeyPills.map((pill,index)=>{const Icon=[Trophy,Gamepad2,Users,LineChart][index];return <i key={pill}><Icon/>{pill}</i>})}</div></header><div className="cl4-stage-map" role="list" aria-label={ar?'مراحل الرحلة المهنية':'Career journey stages'}>{t.stages.map((stage,index)=><CareerStageIsland key={stage.title} locale={locale} stage={stage} index={index}/>)}</div><div className="cl4-journey-foot"><span><Workflow/>{t.journeyHint}</span><Link href={localize(locale,'/career-league/companies')}>{t.explore}<Arrow ar={ar}/></Link></div></section>;
}

function CareerStageIsland({locale,stage,index}:{locale:Locale;stage:Stage;index:number}){
  const Icon=stage.icon,ar=locale==='ar';
  return <Link className={`cl4-stage ${stage.locked?'locked':'available'}`} style={{'--stage':index} as CSSProperties} href={localize(locale,stage.href)} aria-label={`${stage.title}: ${stage.status}`}><span className="cl4-stage-number">{stage.locked?<LockKeyhole/>:index+1}</span><span className="cl4-stage-plaque"><i><Icon/></i><b>{stage.title}</b><em>{stage.english}</em><small>{stage.purpose}</small><strong>{stage.status}</strong></span><Arrow ar={ar}/></Link>;
}

function LandingFeatureWorlds({locale}:LandingProps){
  const ar=locale==='ar',t=copy[locale];
  return <section className="cl4-features" id="competition" aria-labelledby="cl4-features-title"><header><span><Sparkles/>{t.featureKicker}</span><h2 id="cl4-features-title">{t.featureTitle}</h2><p>{t.featureText}</p></header><div className="cl4-feature-grid"><FeatureCard className="competition" badge={<><Trophy/>{t.competition.state}</>} art={<CompetitionVisual locale={locale}/>} title={t.competition.title} text={t.competition.text} href={localize(locale,'/leaderboard')} cta={t.competition.cta} ar={ar}/><FeatureCard className="cv" badge={<><FileCheck2/>{t.cv.state}</>} art={<CvVisual locale={locale}/>} title={t.cv.title} text={t.cv.text} href={localize(locale,'/career-profile/cv')} cta={t.cv.cta} ar={ar}/><FeatureCard className="skills" id="tools" badge={<><CircleGauge/>{t.skills.state}</>} art={<SkillsOrbit skills={t.skillStates} core={t.skillsCore}/>} title={t.skills.title} text={t.skills.text} href={localize(locale,'/career-profile/skills')} cta={t.skills.cta} ar={ar}/></div></section>;
}

function FeatureCard({className,id,badge,art,title,text,href,cta,ar}:{className:string;id?:string;badge:ReactNode;art:ReactNode;title:string;text:string;href:string;cta:string;ar:boolean}){
  return <article className={`cl4-feature ${className}`} id={id}><div className="cl4-feature-visual">{art}<span className="cl4-feature-badge">{badge}</span></div><div className="cl4-feature-copy"><h3>{title}</h3><p>{text}</p><Link href={href}>{cta}<Arrow ar={ar}/></Link></div></article>;
}

function CompetitionVisual({locale}:LandingProps){
  const ar=locale==='ar';
  return <div className="cl4-compete-visual"><Image src="/landing/competition-world-v2.webp" alt={ar?'لاعبان في تحدٍ محاسبي تجريبي':'Two learners in a demo accounting challenge'} fill sizes="(max-width: 760px) 92vw, 31vw"/><strong><i>V</i><i>S</i></strong><span><Trophy/>{ar?'تحدٍ محاسبي':'Accounting challenge'}</span></div>;
}

function CvVisual({locale}:LandingProps){
  const t=copy[locale];
  return <div className="cl4-cv-visual"><div className="cl4-cv-sheet"><Image src="/marketing/auto-cv.png" alt={locale==='ar'?'معاينة السيرة الذاتية المبنية من دليل اللعب':'Preview of the evidence-based ATS CV'} fill sizes="(max-width: 760px) 92vw, 31vw"/></div><div className="cl4-cv-events">{t.cvSignals.map((signal,index)=>{const Icon=[BarChart3,BadgeCheck,Workflow][index];return <span key={signal}><i><Icon/></i>{signal}<Check/></span>})}</div></div>;
}

function SkillsOrbit({skills,core}:{skills:readonly Skill[];core:string}){
  return <div className="cl4-skill-orbit"><div className="cl4-orbit-lines"/><strong><Sparkles/><span>{core}</span></strong>{skills.map((skill,index)=>{const Icon=skill.icon;return <span className={`skill-${index} ${skill.tone}`} key={skill.name}><i><Icon/></i><b>{skill.name}</b><small>{skill.state}</small></span>})}</div>;
}

function PlayerJourneyStories({locale}:LandingProps){
  const t=copy[locale];
  return <section className="cl4-stories" aria-labelledby="cl4-stories-title"><header><span><Users/>{t.storiesKicker}</span><h2 id="cl4-stories-title">{t.storiesTitle}</h2><p>{t.storiesText}</p></header><div className="cl4-story-grid">{t.stories.map((story,index)=><article key={story.role}><div className="cl4-story-top"><div className="cl4-story-photo"><Image src="/landing/player-journeys-v2.png" alt={story.role} fill sizes="120px" className={`portrait-${index}`}/></div><span><small>{t.sample}</small><b>{story.role}</b><em>{story.tag}</em></span><i>{index===0?<GraduationCap/>:index===1?<BriefcaseBusiness/>:<LineChart/>}</i></div><div className="cl4-story-shift"><span><small>{t.before}</small><b>{story.before}</b></span><ArrowRight/><span><small>{t.after}</small><b>{story.after}</b></span></div><blockquote>“{story.quote}”</blockquote><footer><span><i/><i/><i className={index>0?'done':''}/></span><b>{story.progress}</b></footer></article>)}</div></section>;
}

function CareerFutureCta({locale}:LandingProps){
  const ar=locale==='ar',t=copy[locale];
  return <section className="cl4-final" id="about" aria-labelledby="cl4-final-title"><Image src="/landing/career-future-v2.webp" alt={ar?'محترف ينظر إلى مدينة ومسار مضيء للمسؤوليات المهنية':'A professional looking toward a city and a glowing path of career responsibility'} fill sizes="100vw"/><div className="cl4-final-shade"/><div className="cl4-final-inner"><div className="cl4-final-copy"><span>{t.finalKicker}</span><h2 id="cl4-final-title"><b>{t.finalTitle[0]}</b><strong>{t.finalTitle[1]}</strong></h2><p>{t.finalText}</p><div><Link href={localize(locale,'/onboarding')}>{t.finalPrimary}<Rocket/></Link><Link href={localize(locale,'/career-league/companies')}>{t.finalSecondary}<Arrow ar={ar}/></Link></div></div><div className="cl4-role-path" aria-label={ar?'مسار مسؤوليات محاكاة':'Simulation responsibility path'}>{t.roles.map((role,index)=><span key={role} style={{'--step':index} as CSSProperties}><i>{index===3?<Trophy/>:<BriefcaseBusiness/>}</i><b>{role}</b><small>{index+1}</small></span>)}</div></div><div className="cl4-trust">{t.trust.map((item,index)=>{const Icon=[ShieldCheck,MapPin,Target][index];return <span key={item}><Icon/>{item}</span>})}</div></section>;
}
