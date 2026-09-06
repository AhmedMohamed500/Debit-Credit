"use client";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/types";

const links = [
  ["", "الرئيسية", "Home"], ["learning-map", "خريطة التعلم", "Learning Map"], ["missions", "المهام", "Missions"],
  ["practice", "التدريب", "Practice"], ["detective", "المحقق", "Detective"], ["arena", "الساحة", "Arena"],
  ["skills", "المهارات", "Skills"], ["career", "المسار المهني", "Career"], ["profile", "الملف", "Profile"],
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname=usePathname();
  const [open, setOpen] = useState(false); const ar = locale === "ar";
  return <header className="dc-header"><div className="dc-nav"><Link href={`/${locale}`} className="dc-brand"><span>D<span>&</span>C</span><div><strong>Debit & Credit</strong><small>by Money Coder</small></div></Link><nav id="primary-game-navigation" className={open ? "open" : ""} aria-label={ar ? "التنقل الرئيسي" : "Primary navigation"}>{links.map(([path,a,e]) => <Link aria-current={pathname===`/${locale}${path?`/${path}`:""}`?"page":undefined} onClick={() => setOpen(false)} key={path} href={`/${locale}${path?`/${path}`:""}`}>{ar ? a : e}</Link>)}<Link className="dc-company-link" onClick={()=>setOpen(false)} href={`/${locale}/companies`}><Building2/>{ar?"للشركات":"Companies"}</Link><Link className="dc-lang" href={`/${ar ? "en" : "ar"}`}>{ar ? "EN" : "العربية"}</Link></nav><button className="dc-menu" onClick={() => setOpen(!open)} aria-controls="primary-game-navigation" aria-expanded={open} aria-label={open?(ar?"إغلاق القائمة":"Close menu"):(ar?"فتح القائمة":"Open menu")}>{open ? <X/> : <Menu/>}</button></div></header>;
}
