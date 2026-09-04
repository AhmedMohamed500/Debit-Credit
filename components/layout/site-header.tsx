"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/types";

const links = [
  ["learn", "تعلّم", "Learn"], ["money-flow", "تدفق الأموال", "Money Flow"], ["missions", "المهام", "Missions"],
  ["detective", "المحقق", "Detective"], ["arena", "الساحة", "Arena"], ["profile", "التقدم", "Progress"],
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false); const ar = locale === "ar";
  return <header className="dc-header"><div className="dc-nav"><Link href={`/${locale}`} className="dc-brand"><span>D<span>&</span>C</span><div><strong>Debit & Credit</strong><small>by Money Coder</small></div></Link><nav className={open ? "open" : ""} aria-label={ar ? "التنقل الرئيسي" : "Primary navigation"}>{links.map(([path,a,e]) => <Link onClick={() => setOpen(false)} key={path} href={`/${locale}/${path}`}>{ar ? a : e}</Link>)}<Link className="dc-lang" href={`/${ar ? "en" : "ar"}`}>{ar ? "EN" : "العربية"}</Link></nav><button className="dc-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={ar ? "فتح القائمة" : "Open menu"}>{open ? <X/> : <Menu/>}</button></div></header>;
}
