'use client';
import Link from 'next/link';
import {BriefcaseBusiness,CircleUserRound,FileText,Gamepad2,Home,Menu,Route,ShieldCheck,Trophy,Workflow,X,type LucideIcon} from 'lucide-react';
import {useState} from 'react';
import {usePathname} from 'next/navigation';
import {ThemeToggle} from './theme-provider';
import type {Locale} from '@/types';

export function PlatformNav({locale,marketing=false}:{locale:Locale;marketing?:boolean}){
  const ar=locale==='ar',path=usePathname(),[open,setOpen]=useState(false);
  const main:[string,LucideIcon,string,string][]=[
    ['',Home,'الرئيسية','Home'],['/career-league/map',Route,'مساري المهني','My Career'],['/game',Gamepad2,'العب','Play'],['/career-profile/skills',ShieldCheck,'المهارات','Skills'],['/leaderboard',Trophy,'المنافسة','Competition'],['/career-profile/cv',FileText,'السيرة الذاتية','CV'],['/profile',CircleUserRound,'الملف','Profile'],
  ];
  const items:[string,LucideIcon,string,string][]=marketing?[
    [`/${locale}`,Home,'الرئيسية','Home'],
    ['#how',Workflow,'كيف يعمل؟','How it works'],
    ['#audience',BriefcaseBusiness,'لمن المنصة؟','For you'],
    ['#journey',Route,'رحلتك المهنية','Career journey'],
    ['#competition',Trophy,'المنافسة','Competition'],
  ]:main.map(([route,Icon,a,e])=>[`/${locale}${route}`,Icon,a,e]);
  return <header className={`platform-nav ${marketing?'marketing-nav':''}`}><Link className="platform-brand" href={`/${locale}`}><i>▂▅▇</i><span><b>Debit & Credit</b><small>by Money Coder</small></span></Link><nav className={open?'open':''}>{items.map(([href,Icon,a,e])=><Link key={`${String(href)}-${e}`} className={path===href?'active':''} href={String(href)} onClick={()=>setOpen(false)}><Icon/>{ar?a:e}</Link>)}<ThemeToggle compact/><Link className="platform-lang" href={`/${ar?'en':'ar'}${marketing?'':path.replace(/^\/(ar|en)/,'')}`}>{ar?'EN':'ع'}</Link>{marketing?<><Link className="marketing-login" href={`/${locale}/onboarding`}>{ar?'دخول تجريبي':'Demo access'}</Link><Link className="marketing-start" href={`/${locale}/onboarding`}>{ar?'ابدأ مجانًا':'Start free'}</Link></>:null}</nav><button className="platform-menu" onClick={()=>setOpen(!open)} aria-label={open?(ar?'إغلاق':'Close'):(ar?'القائمة':'Menu')}>{open?<X/>:<Menu/>}</button></header>;
}
