"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect,useMemo,useRef,useState } from 'react';
import { Check,ChevronLeft,ChevronRight,Languages,Pause,Play,RotateCcw,SkipForward,Volume2 } from 'lucide-react';
import { storyCharacters,type CinematicChapter } from '@/lib/campaign/first-day-story';
import type { Locale } from '@/types';

type Props={chapter:CinematicChapter;locale:Locale;variant:'intro'|'outro';onComplete:()=>void;onSkip?:()=>void};

export function CinematicChapterIntro({chapter,locale,variant,onComplete,onSkip}:Props){
 const ar=locale==='ar',scenes=chapter.mode==='scene'?chapter.scenes:chapter.fallbackScenes;
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(true),[elapsed,setElapsed]=useState(0);const completed=useRef(false);
 const scene=scenes[index],total=useMemo(()=>scenes.reduce((sum,item)=>sum+item.duration,0),[scenes]);
 const elapsedBefore=scenes.slice(0,index).reduce((sum,item)=>sum+item.duration,0),timeline=Math.min(100,(elapsedBefore+elapsed)/total*100);
 const say=(en:string,a:string)=>ar?a:en,character=scene.character?storyCharacters[scene.character]:null;
 const emit=(type:string)=>window.dispatchEvent(new CustomEvent('debit-credit-sound-event',{detail:{type,chapterId:chapter.chapterId,sceneId:scene.id}}));
 const finish=()=>{if(completed.current)return;completed.current=true;setPlaying(false);emit(variant==='outro'?'mission-complete':'intro-complete');onComplete();};
 const next=()=>{if(index===scenes.length-1){finish();return;}emit('scene-transition');setIndex(value=>value+1);setElapsed(0);setPlaying(true);};
 const previous=()=>{emit('scene-transition');setIndex(value=>Math.max(0,value-1));setElapsed(0);setPlaying(false);};
 const replay=()=>{completed.current=false;emit('scene-transition');setIndex(0);setElapsed(0);setPlaying(true);};
 // `elapsed` is intentionally captured only when a play segment starts; including it would restart the timer on every frame.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(()=>{if(!playing)return;const started=performance.now()-elapsed;const timer=window.setInterval(()=>{const value=performance.now()-started;if(value>=scene.duration){window.clearInterval(timer);next();}else setElapsed(value);},80);return()=>window.clearInterval(timer);},[playing,index,scene.duration]);
 if(chapter.mode==='video'&&(chapter.video.mp4||chapter.video.webm))return <div className={`fd-cinema-player ${variant}`} dir={ar?'rtl':'ltr'}><video className="fd-real-video" poster={chapter.poster} autoPlay controls onEnded={finish}>{chapter.video.webm&&<source src={chapter.video.webm} type="video/webm"/>}{chapter.video.mp4&&<source src={chapter.video.mp4} type="video/mp4"/>}</video></div>;
 return <section className={`fd-cinema-player ${variant}`} dir={ar?'rtl':'ltr'} aria-label={say('Chapter cinematic','المشهد السينمائي للفصل')}>
  <Image key={scene.id} className={`fd-cinema-bg scene-${index}`} src={scene.background} fill priority sizes="100vw" alt=""/>
  <div className="fd-cinema-vignette"/><div className="fd-cinema-grain"/>
  <header className="fd-cinema-hud"><span><b>Debit & Credit™</b><small>by Money Coder</small></span><div><i>{say('CHAPTER 1','الفصل ١')}</i><strong>{chapter.chapterTitle[locale]}</strong></div><Link href={`/${ar?'en':'ar'}`} aria-label={say('Switch to Arabic','التبديل للإنجليزية')}><Languages/>{ar?'EN':'AR'}</Link></header>
  <div className="fd-scene-copy" key={`copy-${scene.id}`}><span>{scene.eyebrow[locale]}</span><h1>{scene.title[locale]}</h1></div>
  <div className="fd-scene-dialogue" key={`dialogue-${scene.id}`}>
   {character&&<div className="fd-speaker"><b>{character.initials}</b><span><strong>{character.name[locale]}</strong><small>{character.role[locale]}</small></span></div>}
   <p>{scene.dialogue[locale]}</p><small>{scene.caption[locale]}</small>
  </div>
  <footer className="fd-cinema-controls">
   <div className="fd-scene-count"><b>{String(index+1).padStart(2,'0')}</b><span>/ {String(scenes.length).padStart(2,'0')}</span></div>
   <div className="fd-control-buttons"><button onClick={previous} disabled={index===0} aria-label={say('Previous scene','المشهد السابق')}><ChevronLeft/></button><button className="primary" onClick={()=>{emit(playing?'scene-pause':'scene-play');setPlaying(value=>!value);}} aria-label={playing?say('Pause cinematic','إيقاف المشهد'):say('Play cinematic','تشغيل المشهد')}>{playing?<Pause/>:<Play/>}</button><button onClick={next} aria-label={index===scenes.length-1?say('Finish cinematic','إنهاء المشهد'):say('Next scene','المشهد التالي')}>{index===scenes.length-1?<Check/>:<ChevronRight/>}</button><button onClick={replay} aria-label={say('Replay cinematic','إعادة المشهد')}><RotateCcw/></button></div>
   <div className="fd-cinema-timeline"><span><i style={{width:`${timeline}%`}}/></span><small>{Math.round((elapsedBefore+elapsed)/1000)}s / {Math.round(total/1000)}s</small></div>
   <Volume2 className="fd-sound-ready" aria-label={say('Sound ready','جاهز للصوت')}/>
   {variant==='intro'&&<button className="fd-skip" onClick={()=>{emit('intro-skip');onSkip?.();}}><SkipForward/>{say('Skip intro','تخطّي المقدمة')}</button>}
  </footer>
 </section>;
}
