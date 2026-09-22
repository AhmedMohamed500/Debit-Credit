"use client";
import '@/app/first-day-entry.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRef,useState } from 'react';
import { BookOpen,Check,Languages,Pause,Play,RotateCcw,SkipForward,Volume2,VolumeX } from 'lucide-react';
import type { CinematicChapter } from '@/lib/campaign/first-day-story';
import type { Locale } from '@/types';

type Props={chapter:CinematicChapter;locale:Locale;variant:'intro'|'outro';onComplete:()=>void;onSkip?:()=>void};

export function CinematicChapterIntro({chapter,locale,onComplete,onSkip}:Props){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en,video=chapter.mode==='video'?(chapter.video.mp4||chapter.video.webm):undefined,poster=chapter.mode==='video'?chapter.poster:chapter.scenes[0].background;
 const player=useRef<HTMLVideoElement>(null),[started,setStarted]=useState(false),[ended,setEnded]=useState(false),[paused,setPaused]=useState(false),[muted,setMuted]=useState(false);
 const toggle=()=>{const el=player.current;if(!el)return;if(el.paused){void el.play();setPaused(false);}else{el.pause();setPaused(true);}};
 const replay=()=>{const el=player.current;if(!el)return;el.currentTime=0;setEnded(false);setPaused(false);void el.play();};
 return <section className="fd-entry-experience fd-entry-gate" dir={ar?'rtl':'ltr'} aria-label={say('Chapter cinematic entry','مدخل الفصل السينمائي')}>
  {video&&started?<video ref={player} className="fd-real-video" poster={poster} autoPlay muted={muted} onEnded={()=>setEnded(true)}><source src={video}/></video>:<Image className="fd-cinema-bg" src={poster} fill priority sizes="100vw" alt=""/>}
  <div className="fd-entry-overlay"/><div className="fd-cinema-grain"/>
  <header className="fd-entry-header"><div className="fd-entry-header-inner"><Link className="fd-entry-brand" href={`/${locale}`}><span aria-hidden="true">▂▅▇</span><b>Debit & Credit<small>by Money Coder</small></b></Link><div className="fd-entry-shift"><i>{say('ACCOUNTING CINEMATIC UNIVERSE','عالم المحاسبة السينمائي')}</i><strong>{chapter.chapterTitle[locale]}</strong></div><nav aria-label={say('Chapter tools','أدوات الفصل')}><Link className="fd-cinema-manual" href={`/${locale}/account-guide?return=first-day`} target="_blank" rel="noopener noreferrer"><BookOpen/>{say('Nature of Accounts','طبيعة الحسابات')}</Link><Link href={`/${ar?'en':'ar'}`} aria-label={say('Switch to Arabic','التبديل للإنجليزية')}><Languages/>{ar?'EN':'AR'}</Link></nav></div></header>
  <div className="fd-entry-content"><div className="fd-entry-copy"><small>{say('CHAPTER 1 · MIZAN TRADING','الفصل ١ · ميزان للتجارة')}</small><h1>{say('FIRST DAY','أول يوم')}</h1><p>{say('Your first shift starts with three documents waiting on the finance desk. Inspect the source, decide what changed, and record a balanced entry.','وردية شغلك الأولى تبدأ بثلاثة مستندات على مكتب الحسابات. افحص المصدر، وحدد ما تغيّر، وسجّل قيدًا متوازنًا.')}</p><strong>{say('Your decisions change the company books.','قراراتك تغيّر دفاتر الشركة.')}</strong>
  <div className="fd-entry-cta-row">
   {!started?<><button className="fd-start-story" onClick={()=>setStarted(true)}><Play/>{say('START STORY','ابدأ القصة')}</button><span>{say('Nothing starts until you choose.','لن يبدأ أي شيء قبل اختيارك.')}</span></>:video&&!ended?<div className="fd-video-actions"><button onClick={toggle}>{paused?<Play/>:<Pause/>}{paused?say('Play','تشغيل'):say('Pause','إيقاف')}</button><button onClick={()=>{const el=player.current;if(el){el.muted=!el.muted;setMuted(el.muted);}}}>{muted?<VolumeX/>:<Volume2/>}{muted?say('Unmute','تشغيل الصوت'):say('Mute','كتم')}</button><button onClick={replay}><RotateCcw/>{say('Replay','إعادة')}</button><button onClick={()=>{player.current?.pause();setEnded(true);onSkip?.();}}><SkipForward/>{say('Skip','تخطّي')}</button></div>:<div className="fd-poster-fallback" role="status"><Check/><div><b>{say('Cinematic introduction will be available here','المقدمة السينمائية ستتوفر هنا')}</b><small>{say('This is an honest poster preview—not a simulated video.','هذه معاينة ثابتة وليست فيديو وهميًا.')}</small></div></div>}
   {started&&(!video||ended)&&<button className="fd-enter-company" onClick={onComplete}>{say('ENTER COMPANY','ادخل الشركة')}<span>→</span></button>}
  </div></div></div>
 </section>;
}
