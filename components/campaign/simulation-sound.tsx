"use client";
import{useEffect,useState}from'react';
import{Volume2,VolumeX}from'lucide-react';
import type{Locale}from'@/types';

const SOUND_KEY='debit-credit-simulation-muted';
type SoundEvent=CustomEvent<{type?:string}>;

export function SimulationSound({locale}:{locale:Locale}){
 const[muted,setMuted]=useState(true);
 useEffect(()=>{setMuted(localStorage.getItem(SOUND_KEY)!=='false')},[]);
 useEffect(()=>{const play=(raw:Event)=>{if(muted||typeof AudioContext==='undefined')return;const type=(raw as SoundEvent).detail?.type;if(!['paper-open','correct-answer','wrong-answer'].includes(type??''))return;const context=new AudioContext();void context.resume();const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;oscillator.type='sine';oscillator.frequency.setValueAtTime(type==='paper-open'?240:type==='correct-answer'?520:165,now);if(type==='correct-answer')oscillator.frequency.exponentialRampToValueAtTime(720,now+.09);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.035,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.14);oscillator.connect(gain).connect(context.destination);oscillator.start(now);oscillator.stop(now+.15);oscillator.addEventListener('ended',()=>void context.close(),{once:true})};window.addEventListener('debit-credit-sound-event',play);return()=>window.removeEventListener('debit-credit-sound-event',play)},[muted]);
 const toggle=()=>setMuted(current=>{const next=!current;localStorage.setItem(SOUND_KEY,String(next));return next});
 const label=locale==='ar'?(muted?'تشغيل الأصوات الهادئة':'كتم الأصوات'):(muted?'Enable subtle sounds':'Mute sounds');
 return <button className="scene-sound" type="button" aria-label={label} aria-pressed={!muted} onClick={toggle}>{muted?<VolumeX/>:<Volume2/>}</button>;
}
