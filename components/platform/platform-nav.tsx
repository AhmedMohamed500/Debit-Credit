'use client';
import Link from 'next/link';
import {BookOpen,BriefcaseBusiness,Building2,Gamepad2,Home,Info,Medal,Menu,Route,Workflow,X,type LucideIcon} from 'lucide-react';
import {useState} from 'react';
import {usePathname} from 'next/navigation';
import {ThemeToggle} from './theme-provider';
import type {Locale} from '@/types';
import {destination,localizedPath,type GameDestinationId} from '@/lib/platform/navigation';

export function PlatformNav({locale,marketing=false}:{locale:Locale;marketing?:boolean}){
  const ar=locale==='ar',path=usePathname(),[open,setOpen]=useState(false);
  const main:[GameDestinationId,LucideIcon][]=[['game-hub',Home],['academy',BookOpen],['inbox',Gamepad2],['leaderboard',Medal],['career',BriefcaseBusiness]];
  const items:[string,LucideIcon,string,string][]=marketing?[
    [`/${locale}`,Home,'الرئيسية','Home'],
    ['#paths',Route,'المسارات المهنية','Career Paths'],
    ['#companies',Building2,'الشركات','Companies'],
    ['#how',Workflow,'كيف يعمل','How It Works'],
    ['#about',Info,'عن المنصة','About'],
  ]:main.map(([id,Icon])=>{const item=destination(id);return[localizedPath(locale,item.path),Icon,item.label.ar,item.label.en]});
  return <header className={`platform-nav ${marketing?'marketing-nav':''}`}><Link className="platform-brand" href={`/${locale}`}><i>▂▅▇</i><span><b>Debit & Credit</b><small>{marketing?'Career League':'by Money Coder'}</small></span></Link><nav className={open?'open':''}>{items.map(([href,Icon,a,e])=><Link key={String(href)} className={path===href?'active':''} href={String(href)} onClick={()=>setOpen(false)}><Icon/>{ar?a:e}</Link>)}<ThemeToggle compact/><Link className="platform-lang" href={`/${ar?'en':'ar'}${marketing?'':path.replace(/^\/(ar|en)/,'')}`}>{ar?'EN':'ع'}</Link>{marketing?<Link className="marketing-start" href={`/${locale}/onboarding`}>{ar?'ابدأ الآن':'Start Now'}</Link>:null}</nav><button className="platform-menu" onClick={()=>setOpen(!open)} aria-label={open?(ar?'إغلاق':'Close'):(ar?'القائمة':'Menu')}>{open?<X/>:<Menu/>}</button></header>;
}
