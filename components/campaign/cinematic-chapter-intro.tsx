"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRef,useState } from 'react';
import { Check,Languages,Pause,Play,RotateCcw,SkipForward,Volume2,VolumeX } from 'lucide-react';
import type { CinematicChapter } from '@/lib/campaign/first-day-story';
import type { Locale } from '@/types';

type Props={chapter:CinematicChapter;locale:Locale;variant:'intro'|'outro';onComplete:()=>void;onSkip?:()=>void};

export function CinematicChapterIntro({chapter,locale,onComplete,onSkip}:Props){
 const ar=locale==='ar',say=(en:string,a:string)=>ar?a:en,video=chapter.mode==='video'?(chapter.video.mp4||chapter.video.webm):undefined,poster=chapter.mode==='video'?chapter.poster:chapter.scenes[0].background;
 const player=useRef<HTMLVideoElement>(null),[started,setStarted]=useState(false),[ended,setEnded]=useState(false),[paused,setPaused]=useState(false),[muted,setMuted]=useState(false);
 const toggle=()=>{const el=player.current;if(!el)return;if(el.paused){void el.play();setPaused(false);}else{el.pause();setPaused(true);}};
 const replay=()=>{const el=player.current;if(!el)return;el.currentTime=0;setEnded(false);setPaused(false);void el.play();};
 return <section className="fd-cinema-player fd-entry-gate" dir={ar?'rtl':'ltr'} aria-label={say('Chapter cinematic entry','مدخل الفصل السينمائي')}>
  {video&&started?<video ref={player} className="fd-real-video" poster={poster} autoPlay muted={muted} onEnded={()=>setEnded(true)}><source src={video}/></video>:<Image className="fd-cinema-bg" src={poster} fill priority sizes="100vw" alt=""/>}
  <div className="fd-cinema-vignette"/><div className="fd-cinema-grain"/>
  <header className="fd-cinema-hud"><span><b>Debit & Credit™</b><small>by Money Coder</small></span><div><i>{say('ACCOUNTING CINEMATIC UNIVERSE','عالم المحاسبة السينمائي')}</i><strong>{chapter.chapterTitle[locale]}</strong></div><Link href={`/${ar?'en':'ar'}`}><Languages/>{ar?'EN':'AR'}</Link></header>
  <div className="fd-entry-title"><small>{say('CHAPTER 1','الفصل ١')}</small><h1>{say('FIRST DAY','أول يوم')}</h1><p>{say('Your first shift at Mizan Trading starts with three documents left on the finance desk.','وردية شغلك الأولى في ميزان للتجارة تبدأ بثلاثة مستندات على مكتب الحسابات.')}</p></div>
  <div className="fd-entry-actions">
   {!started?<><button className="fd-start-story" onClick={()=>setStarted(true)}><Play/>{say('START STORY','ابدأ القصة')}</button><span>{say('Nothing starts until you choose.','لن يبدأ أي شيء قبل اختيارك.')}</span></>:video&&!ended?<div className="fd-video-actions"><button onClick={toggle}>{paused?<Play/>:<Pause/>}{paused?say('Play','تشغيل'):say('Pause','إيقاف')}</button><button onClick={()=>{const el=player.current;if(el){el.muted=!el.muted;setMuted(el.muted);}}}>{muted?<VolumeX/>:<Volume2/>}{muted?say('Unmute','تشغيل الصوت'):say('Mute','كتم')}</button><button onClick={replay}><RotateCcw/>{say('Replay','إعادة')}</button><button onClick={()=>{player.current?.pause();setEnded(true);onSkip?.();}}><SkipForward/>{say('Skip','تخطّي')}</button></div>:<div className="fd-poster-fallback" role="status"><Check/><div><b>{say('Cinematic introduction will be available here','المقدمة السينمائية ستتوفر هنا')}</b><small>{say('This is an honest poster preview—not a simulated video.','هذه معاينة ثابتة وليست فيديو وهميًا.')}</small></div></div>}
   {started&&(!video||ended)&&<button className="fd-enter-company" onClick={onComplete}>{say('ENTER COMPANY','ادخل الشركة')}<span>→</span></button>}
  </div>
 </section>;
}
