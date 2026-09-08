"use client";

import "@/app/accounting-manual.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, BadgeDollarSign, Banknote, BookOpenCheck, Building2, Check, ChevronRight, CircleDollarSign, FileText, Landmark, Languages, LibraryBig, ReceiptText, RotateCcw, Search, ShieldCheck, UsersRound, WalletCards, X } from "lucide-react";
import { accountGuideCategories, accountLearningGuide, type AccountGuideCategory, type AccountLearningGuideItem } from "@/data/account-learning-guide";
import type { Locale } from "@/types";

const categoryStyle: Record<AccountGuideCategory,{className:string;icon:typeof Banknote}> = {
  assets:{className:"assets",icon:CircleDollarSign}, liabilities:{className:"liabilities",icon:Landmark},
  equity:{className:"equity",icon:UsersRound}, revenue:{className:"revenue",icon:BadgeDollarSign},
  expenses:{className:"expenses",icon:WalletCards}, contra:{className:"contra",icon:RotateCcw},
};

export function AccountGuide({ locale }: { locale: Locale }) {
  const ar=locale==="ar",say=(en:string,arabic:string)=>ar?arabic:en;
  const router=useRouter();
  const [returnContext,setReturnContext]=useState("");
  useEffect(()=>{setReturnContext(window.location.search);},[]);
  const [query,setQuery]=useState(""),[category,setCategory]=useState<AccountGuideCategory>("assets"),[selectedCode,setSelectedCode]=useState(""),[mobilePage,setMobilePage]=useState<"list"|"detail">("list");
  const rows=useMemo(()=>accountLearningGuide.filter(account=>account.category===category&&`${account.nameAr} ${account.nameEn} ${account.categoryAr} ${account.category} ${account.code}`.toLowerCase().includes(query.trim().toLowerCase())),[category,query]);
  const selected=rows.find(account=>account.code===selectedCode)??rows[0]??null;
  useEffect(()=>{if(selected&&!rows.some(account=>account.code===selectedCode))setSelectedCode(selected.code);},[rows,selected,selectedCode]);
  const chooseCategory=(id:AccountGuideCategory)=>{setCategory(id);setQuery("");setSelectedCode("");setMobilePage("list");};
  const chooseAccount=(code:string)=>{setSelectedCode(code);setMobilePage("detail");};
  const back=()=>{if(new URLSearchParams(window.location.search).get("return")==="first-day"){window.close();router.push(`/${locale}`);}else if(window.history.length>1)router.back();else router.push(`/${locale}`);};

  return <main className="account-manual" dir={ar?"rtl":"ltr"}>
    <header className="manual-topbar">
      <Link className="manual-brand" href={`/${locale}`}><span aria-hidden="true"><i/><i/><i/></span><b>Debit & Credit<small>by Money Coder</small></b></Link>
      <nav aria-label={say("Manual navigation","تنقل الدليل")}><button onClick={back}>{ar?<ArrowRight/>:<ArrowLeft/>}{say("Back to desk","العودة للعبة")}</button><Link href={`/${locale}/account-guide`} aria-current="page"><BookOpenCheck/>{say("Nature of Accounts","طبيعة الحسابات")}</Link><a href="/docs/nature-of-accounts.md" download><FileText/>{say("Download MD","تحميل MD")}</a></nav>
      <div className="manual-top-actions"><label><Search/><input aria-label={say("Search accounts","ابحث في الحسابات")} value={query} onChange={event=>setQuery(event.target.value)} placeholder={say("Search name, code, or category…","ابحث بالاسم أو الكود أو التصنيف…")}/>{query&&<button aria-label={say("Clear search","مسح البحث")} onClick={()=>setQuery("")}><X/></button>}</label><Link href={`/${ar?"en":"ar"}/account-guide${returnContext}`} onClick={event=>{event.preventDefault();router.push(`/${ar?"en":"ar"}/account-guide${window.location.search}`);}} aria-label={say("Switch to Arabic","التبديل للإنجليزية")}><Languages/>{ar?"EN":"AR"}</Link></div>
    </header>

    <section className="manual-world">
      <div className="manual-context">
        <div className="manual-sign"><BookOpenCheck aria-hidden="true"/><div><h1>{say("Nature of Accounts","طبيعة الحسابات")}</h1><strong lang={ar?"en":"ar"}>{ar?"Nature of Accounts":"طبيعة الحسابات"}</strong><p>{say("Understand the account before recording the entry.","افهم الحساب قبل ما تسجل القيد.")}</p></div></div>
        <aside><b>{say("Kareem · Finance Manager","أ/ كريم · المدير المالي")}</b><p>{say("Choose an account. Follow its movement.","اختار الحساب وشوف طبيعته وحركته.")}</p></aside>
      </div>

      <div className="manual-categories" aria-label={say("Account categories","مجموعات الحسابات")}>
        {accountGuideCategories.map(item=>{const meta=categoryStyle[item.id],Icon=meta.icon,count=accountLearningGuide.filter(account=>account.category===item.id).length,active=category===item.id;return <button className={`${meta.className} ${active?"active":""}`} aria-pressed={active} onClick={()=>chooseCategory(item.id)} key={item.id}><Icon/><span><b>{ar?item.ar:item.en}</b><em>{ar?item.en:item.ar}</em><small>{count} {say("accounts","حساب")}</small></span>{active&&<Check/>}</button>;})}
      </div>

      <div className="manual-mobile-tabs" role="tablist" aria-label={say("Manual pages","صفحات الدليل")}><button role="tab" aria-selected={mobilePage==="list"} onClick={()=>setMobilePage("list")}><LibraryBig/>{say("Accounts","الحسابات")}<b>{rows.length}</b></button><button role="tab" aria-selected={mobilePage==="detail"} onClick={()=>setMobilePage("detail")} disabled={!selected}><FileText/>{say("Account behavior","سلوك الحساب")}</button></div>

      <section className={`manual-book mobile-${mobilePage}`} aria-label={say("Open accounting manual","دليل الحسابات المفتوح")}>
        <div className="manual-page manual-list-page">
          <header><div><small>{say("ACCOUNT GROUP","مجموعة الحسابات")}</small><h2>{ar?accountGuideCategories.find(item=>item.id===category)?.ar:accountGuideCategories.find(item=>item.id===category)?.en}</h2></div><b>{rows.length}</b></header>
          <div className="manual-list-head"><span>{say("Code","الكود")}</span><span>{say("Account name","اسم الحساب")}</span></div>
          <div className="manual-account-list">{rows.map(account=><button className={selected?.code===account.code?"selected":""} aria-current={selected?.code===account.code} onClick={()=>chooseAccount(account.code)} key={account.code}><code>{account.code}</code><span><b>{ar?account.nameAr:account.nameEn}</b><small>{ar?account.nameEn:account.nameAr}</small></span><ChevronRight/></button>)}</div>
          {!rows.length&&<div className="manual-empty"><Search/><b>{say("No matching accounts","لا توجد حسابات مطابقة")}</b><button onClick={()=>setQuery("")}>{say("Clear search","مسح البحث")}</button></div>}
        </div>
        <div className="manual-binding" aria-hidden="true">{Array.from({length:9},(_,index)=><i key={index}/>)}</div>
        <div className="manual-page manual-detail-page">{selected?<AccountPage account={selected} locale={locale}/>:<div className="manual-empty"><BookOpenCheck/><b>{say("Choose an account from the left page","اختار حساب من الصفحة الأولى")}</b></div>}</div>
      </section>
    </section>
  </main>;
}

function AccountPage({account,locale}:{account:AccountLearningGuideItem;locale:Locale}){
  const ar=locale==="ar",say=(en:string,arabic:string)=>ar?arabic:en,debit=account.normalEn==="Debit";
  return <>
    <header className="manual-account-title"><div><small>{account.categoryAr}</small><h2><code>{account.code}</code> — {ar?account.nameAr:account.nameEn}</h2><p lang={ar?"en":"ar"} dir={ar?"ltr":"rtl"}>{ar?account.nameEn:account.nameAr}</p></div><span className={debit?"debit":"credit"}><ShieldCheck/><small>{say("Normal balance","الطبيعة المعتادة")}</small><b>{ar?account.normalAr:account.normalEn}</b></span></header>
    <div className="manual-movement">
      <section className="increase"><ArrowUpRight/><div><small>{say("INCREASE","عند الزيادة")}</small><b>{ar?account.increaseSideAr:account.increaseSideAr==="مدين"?"Debit":"Credit"}</b><p lang={ar?undefined:"ar"} dir={ar?undefined:"rtl"}>{account.increaseEffectAr}</p></div></section>
      <section className="decrease"><ArrowDownLeft/><div><small>{say("DECREASE","عند النقص")}</small><b>{ar?account.decreaseSideAr:account.decreaseSideAr==="مدين"?"Debit":"Credit"}</b><p lang={ar?undefined:"ar"} dir={ar?undefined:"rtl"}>{account.decreaseEffectAr}</p></div></section>
    </div>
    <div className="manual-facts">
      <Fact icon={<Building2/>} title={say("Financial statement","موضعه في القوائم المالية")} text={account.statementAr} ar={ar}/>
      <Fact icon={<FileText/>} title={say("Supporting documents","المستندات المؤيدة")} text={account.documentsAr} ar={ar}/>
    </div>
    <JournalExample text={account.exampleAr} locale={locale}/>
    <details className="manual-cycle"><summary><RotateCcw/><span><b>{say("Accounting cycle","مساره في الدورة المستندية")}</b><small>{say("Open the full document trail","افتح مسار المستند كاملًا")}</small></span><ChevronRight/></summary><p lang={ar?undefined:"ar"} dir={ar?undefined:"rtl"}>{account.cycleAr}</p></details>
    {!ar&&<p className="manual-language-note">Detailed source explanations are shown in Arabic where no approved English field exists.</p>}
  </>;
}

function Fact({icon,title,text,ar}:{icon:React.ReactNode;title:string;text:string;ar:boolean}){return <section>{icon}<div><b>{title}</b><p lang={ar?undefined:"ar"} dir={ar?undefined:"rtl"}>{text}</p></div></section>;}

function JournalExample({text,locale}:{text:string;locale:Locale}){
  const ar=locale==="ar",match=text.match(/^(.*?):\s*من حـ\/\s*(.+?)\s+إلى حـ\/\s*(.+?)[.]?$/);
  return <section className="manual-entry"><header><ReceiptText/><b>{ar?"مثال على القيد المحاسبي":"Journal entry example"}</b></header>{match?<><small lang="ar" dir="rtl">{match[1]}</small><p><span>{ar?"مدين":"Debit"}</span><b lang="ar" dir="rtl">{match[2]}</b></p><p><span>{ar?"دائن":"Credit"}</span><b lang="ar" dir="rtl">{match[3]}</b></p></>:<p lang="ar" dir="rtl">{text}</p>}</section>;
}
