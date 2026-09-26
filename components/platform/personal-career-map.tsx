'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,Check,Compass,Flag,Lock,Map,ShieldCheck,Sparkles,Trophy} from 'lucide-react';
import {useGame} from '@/lib/campaign/store';
import {calculatePassport,firstShiftSkillEvidence} from '@/lib/career/evidence';
import {roleCatalog,skillCatalog} from '@/lib/career/catalog';
import {BrowserSkillEvidenceRepository,getOrCreateLocalCandidateId} from '@/lib/career/repository';
import {BrowserCareerLeagueRepository} from '@/lib/career-league/repository';
import {createCareerLeagueState} from '@/lib/career-league/engine';
import type {CareerLeagueState} from '@/lib/career-league/model';
import {nextCareerActivity,personalCareerMap} from '@/lib/career-entry/engine';
import {BrowserPlacementRepository} from '@/lib/placement/repository';
import type {PlacementResult} from '@/lib/placement/model';
import type {Locale} from '@/types';
import {PlatformNav} from './platform-nav';

export function PersonalCareerMap({locale}:{locale:Locale}){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en,Arrow=ar?ArrowLeft:ArrowRight,{state:game}=useGame();
 const [career,setCareer]=useState<CareerLeagueState>(createCareerLeagueState);
 const [diagnostic,setDiagnostic]=useState<PlacementResult|null>(null);
 const [evidence,setEvidence]=useState(()=>new BrowserSkillEvidenceRepository().getAll());
 useEffect(()=>{setCareer(new BrowserCareerLeagueRepository().get());setDiagnostic(new BrowserPlacementRepository().get().result);setEvidence(new BrowserSkillEvidenceRepository().getAll())},[]);
 const role=career.targetRoleId??'junior-accountant';
 const passport=calculatePassport([...evidence,...firstShiftSkillEvidence(game,getOrCreateLocalCandidateId())]);
 const nodes=personalCareerMap(career,passport,diagnostic),next=nextCareerActivity(nodes);
 const labels={locked:say('Locked','مقفول'),available:say('Available','متاح'),practiced:say('Practiced','تمت ممارسته'),demonstrated:say('Demonstrated','تم إثباته'),planned:say('Planned','مخطط له')};
 return <main className="platform-page career-entry personal-career-map-page" dir={ar?'rtl':'ltr'}>
  <PlatformNav locale={locale}/>
  <div className="career-entry-shell">
   <header className="career-entry-intro">
    <span><Map size={18}/>{say('PERSONAL CAREER MAP','خريطتك المهنية')}</span>
    <h1>{say('Your path to the next role','طريقك للدور اللي تستهدفه')}</h1>
    <p>{say('A role-specific path based on saved evidence. The map never turns a diagnostic answer into a verified skill.','مسار مخصص لهدفك، مبني على الأدلة المحفوظة. إجابة التشخيص لا تتحول إلى مهارة موثقة.')}</p>
    <div className="career-entry-context"><span>{say('Now','أنت الآن')}: <b>{career.persona?say('Career learner','لاعب في مسار مهني'):say('Start your campaign','ابدأ حملتك')}</b></span><span>{say('Target','الهدف')}: <b>{roleCatalog[role].label[locale]}</b></span></div>
   </header>
   <section className="career-map-track" aria-label={say('Skill progression','تقدم المهارات')}>
    <div className="career-map-endpoint"><Compass/><strong>{say('You are here','أنت الآن')}</strong></div>
    {nodes.map((node,index)=><article className={`career-map-node ${node.status}`} key={node.skillId}>
     <div className="career-map-marker">{node.status==='demonstrated'||node.status==='practiced'?<Check/>:node.status==='locked'?<Lock/>:index+1}</div>
     <div className="career-map-node-copy"><small>{labels[node.status]} · {say('STEP','خطوة')} {index+1}</small><h2>{skillCatalog[node.skillId].label[locale]}</h2><p>{node.why[locale]}</p><span>{say('Relevant roles','أدوار مرتبطة')}: {node.roles.map(id=>roleCatalog[id].label[locale]).join(' · ')}</span><div>{node.route&&node.status!=='planned'?<Link href={`/${locale}${node.route}`}>{node.status==='locked'?say('View required activity','اعرض النشاط المطلوب'):say('Play required activity','ابدأ النشاط المطلوب')}<Arrow/></Link>:<em>{say('Activity in development','النشاط قيد التطوير')}</em>}</div></div>
    </article>)}
    <article className="career-map-node assessment"><div className="career-map-marker"><Trophy/></div><div className="career-map-node-copy"><small>{say('Existing checkpoint · eligibility applies','تقييم موجود · حسب شروط الأهلية')}</small><h2>{say('Promotion Assessment','تقييم الترقية')}</h2><p>{say('The available assessment checks early progression. Further role-specific assessments remain planned.','التقييم الحالي يتحقق من التقدم المبكر. تقييمات الأدوار الأعلى ما زالت ضمن الخطة.')}</p><div><Link href={`/${locale}/career-league/promotion`}>{say('View assessment requirements','اعرض شروط التقييم')}<Arrow/></Link></div></div></article>
    <div className="career-map-endpoint target"><Flag/><strong>{roleCatalog[role].label[locale]}</strong><small>{say('Target, not an awarded title','هدف، وليس مسمى ممنوحًا')}</small></div>
   </section>
   <aside className="career-map-links"><div><Sparkles/><span><b>{say('Next mission','المهمة التالية')}</b><strong>{next?skillCatalog[next.skillId].label[locale]:say('Keep building evidence','استمر في بناء الأدلة')}</strong></span>{next?.route?<Link href={`/${locale}${next.route}`}>{say('Open activity','افتح النشاط')}<Arrow/></Link>:null}</div><nav aria-label={say('Connected career tools','أدوات المسار المتصلة')}><Link href={`/${locale}/career-profile`}>{say('Career Profile','الملف المهني')}</Link><Link href={`/${locale}/career-profile/skills`}>{say('Skill Passport','جواز المهارات')}</Link><Link href={`/${locale}/career-league/gap`}>{say('Career Gap','فجوة المسار')}</Link><Link href={`/${locale}/career-profile/cv`}>{say('ATS CV','السيرة الذاتية')}</Link><Link href={`/${locale}/bootcamp`}>{say('Bootcamp','معسكر البداية')}</Link><Link href={`/${locale}/game`}>{say('Mizan Trading','ميزان للتجارة')}</Link><Link href={`/${locale}/career`}>{say('Career League','المسار المهني')}</Link></nav></aside>
   <p className="career-entry-note"><ShieldCheck size={17}/>{say('Verified remains unavailable locally. Planned activities cannot be played yet.','حالة Verified غير متاحة محليًا. الأنشطة المخطط لها غير قابلة للعب بعد.')}</p>
  </div>
 </main>;
}
