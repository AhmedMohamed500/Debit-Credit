'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,BarChart3,Check,Lock,Map,Sparkles,Target} from 'lucide-react';
import {useGame} from '@/lib/campaign/store';
import {calculatePassport,firstShiftSkillEvidence} from '@/lib/career/evidence';
import {roleCatalog,skillCatalog} from '@/lib/career/catalog';
import {BrowserSkillEvidenceRepository,getOrCreateLocalCandidateId} from '@/lib/career/repository';
import {BrowserCareerLeagueRepository} from '@/lib/career-league/repository';
import {createCareerLeagueState} from '@/lib/career-league/engine';
import type {CareerLeagueState} from '@/lib/career-league/model';
import {personalCareerGap} from '@/lib/career-entry/engine';
import {BrowserPlacementRepository} from '@/lib/placement/repository';
import type {PlacementResult} from '@/lib/placement/model';
import type {Locale} from '@/types';
import {PlatformNav} from './platform-nav';
export function PersonalCareerGap({locale}:{locale:Locale}){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en,Arrow=ar?ArrowLeft:ArrowRight,{state:game}=useGame();
 const [career,setCareer]=useState<CareerLeagueState>(createCareerLeagueState),[diagnostic,setDiagnostic]=useState<PlacementResult|null>(null),[evidence,setEvidence]=useState(()=>new BrowserSkillEvidenceRepository().getAll());
 useEffect(()=>{setCareer(new BrowserCareerLeagueRepository().get());setDiagnostic(new BrowserPlacementRepository().get().result);setEvidence(new BrowserSkillEvidenceRepository().getAll())},[]);
 const role=career.targetRoleId??'junior-accountant',passport=calculatePassport([...evidence,...firstShiftSkillEvidence(game,getOrCreateLocalCandidateId())]),gap=personalCareerGap(role,passport,diagnostic);
 const groups=[{id:'strong',title:say('Demonstrated','مثبتة بالأدلة'),skills:gap.strong,icon:Check},{id:'practiced',title:say('Practiced','تمت ممارستها'),skills:gap.practiced,icon:Sparkles},{id:'missing',title:say('Needs development','تحتاج تطوير'),skills:gap.missing,icon:Lock}];
 return <main className="platform-page career-entry career-gap-page" dir={ar?'rtl':'ltr'}><PlatformNav locale={locale}/><div className="career-entry-shell"><header className="career-entry-intro"><span><BarChart3 size={18}/>{say('CAREER GAP','فجوة المسار')}</span><h1>{say('What stands between you and your target?','إيه اللي بينك وبين هدفك؟')}</h1><p>{say('This role gap uses saved Skill Passport evidence, not your self-report or diagnostic score.','فجوة الدور تعتمد على أدلة Skill Passport المحفوظة، وليس إجاباتك أو درجة التشخيص.')}</p><div className="career-entry-context"><span>{say('Target role','الدور المستهدف')}: <b>{roleCatalog[role].label[locale]}</b></span></div></header><section className="career-report-grid">{groups.map(group=>{const Icon=group.icon;return <article key={group.id}><h3><Icon/>{group.title}</h3><ul>{group.skills.length?group.skills.map(id=><li key={id}>{skillCatalog[id].label[locale]}</li>):<li>{say('No skills in this group yet.','لا توجد مهارات في هذه المجموعة حاليًا.')}</li>}</ul></article>})}</section><div className="career-report-actions"><Link href={`/${locale}/career-league/map`}><Map/>{say('Follow my career map','تابع خريطتي المهنية')}<Arrow/></Link><Link href={`/${locale}/career-profile/skills`}>{say('Inspect Skill Passport','راجع جواز المهارات')}</Link><Link href={`/${locale}/onboarding`}><Target/>{say('Change target role','غيّر الدور المستهدف')}</Link></div><p className="career-entry-note">{say('Diagnostic strengths are shown separately in your diagnostic result and never counted as demonstrated professional skills.','نقاط قوة التشخيص تظهر منفصلة في نتيجته ولا تُحسب كمهارات مهنية مثبتة.')}</p></div></main>;
}
