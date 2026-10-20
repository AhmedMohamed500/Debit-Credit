"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  FileBadge2,
  FileText,
  GraduationCap,
  ListFilter,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AuthCTA } from "@/components/cloud/auth-cta";
import type { Locale } from "@/types";
import "@/app/employer-discovery-showcase.css";

const copy = {
  ar: {
    eyebrow: "Debit & Credit",
    titleStart: "خلّي",
    titleMiddle: "الشركات تكتشفك من مكان",
    titleEnd: "واحد",
    description:
      "كل تدريب ومشروع ومهارة موثّقة تظهر في ملفك المهني، وبموافقتك تكتشف الشركات مهاراتك والأعمال التي اخترت مشاركتها.",
    talentBadge: "ملف مهني جاهز للمشاركة",
    employerBadge: "مساحة للشركات لاكتشاف المواهب المحاسبية",
    demo: "عرض توضيحي ببيانات خيالية",
    sources: [
      ["الكورسات التدريبية", "التي يضيفها صاحب الملف"],
      ["المشاريع العملية", "محاكاة تدريبية معلّمة بوضوح"],
      ["الشهادات المهنية", "المضافة للملف، لا اعتماد تلقائي"],
      ["المهارات العملية", "ما تدعمه أدلة ممارسة مؤهلة"],
    ],
    sourceStatus: "قابل للمشاركة",
    profile: "ملفي المهني",
    name: "أحمد محمد",
    role: "محاسب مبتدئ",
    location: "موقع يحدده صاحب الملف",
    available: "التوفر يُحدده صاحب الملف",
    consent: "الظهور يتطلب موافقة صريحة",
    tabs: ["نظرة عامة", "المهارات", "الشهادات", "المشاريع"],
    summaryTitle: "نبذة مهنية",
    summary:
      "ملف توضيحي يجمع المهارات والأعمال التدريبية المؤهلة، مع تمييز المحاكاة عن خبرة التوظيف.",
    skillsTitle: "مهارات مدعومة بممارسة",
    skills: ["القيود اليومية", "تصنيف الحسابات", "ميزان المراجعة"],
    projectsTitle: "أعمال عملية",
    project: "إعداد ميزان مراجعة — محاكاة تدريبية",
    coursesTitle: "كورسات وشهادات",
    courses: "تظهر العناصر التي يسمح صاحب الملف بمشاركتها ومصدر كل منها.",
    courseCards: ["دورة تدريبية مضافة", "شهادة يضيفها صاحب الملف"],
    bridge: "يظهر ملفك للشركات",
    bridgeSmall: "بعد تفعيل المشاركة فقط",
    searchHeading: "البحث عن مواهب محاسبية",
    searchSub: "معاينة توضيحية لمساحة الشركات — ليست نتائج فعلية",
    searchPlaceholder: "ابحث في النماذج التوضيحية...",
    search: "بحث",
    filters: ["جميع المهارات", "جميع المناطق", "جميع الخبرات"],
    candidates: "نماذج مرشحين توضيحية",
    candidateNames: ["أحمد — نموذج", "سارة — نموذج", "محمد — نموذج", "ليلى — نموذج"],
    candidateRoles: ["محاسب مبتدئ", "متدربة محاسبة", "محاسب", "محاسبة مبتدئة"],
    preview: "عرض الملف",
    shortlist: "إضافة للقائمة",
    shortlisted: "في القائمة التوضيحية",
    contact: "فكرة طلب التواصل",
    contactNote:
      "في المساحة الفعلية، يُرسل طلب تواصل داخلي فقط بعد موافقة المرشح على الاكتشاف والتواصل؛ لا يظهر البريد أو الهاتف هنا.",
    noResults: "لا توجد نماذج مطابقة لهذا البحث.",
    benefits: [
      ["ظهور أمام الشركات المشاركة", "لمن فعّل اكتشاف الملف المهني بإرادته."],
      ["ملف مهني مدعوم بالممارسة", "أدلة تدريب مقبولة تُعرض بصفتها محاكاة."],
      ["سيرة ذاتية مناسبة للتقديم", "بياناتك الفعلية في صيغة واضحة دون خبرة مخترعة."],
      ["مهارات ومشاريع قابلة للمراجعة", "تراجع الشركة ما سمحت بمشاركته فقط."],
    ],
    companies: "مساحة مخصصة للشركات التي تستخدم المنصة",
    companyTiles: ["شركة محاسبة", "فريق مالي", "مكتب مراجعة", "جهة تدريب", "قسم حسابات", "شركة تجارية"],
    start: "ابدأ رحلتك الآن",
    explore: "استكشف كيف تظهر للشركات",
  },
  en: {
    eyebrow: "Debit & Credit",
    titleStart: "Let",
    titleMiddle: "employers discover you in one",
    titleEnd: "place",
    description:
      "Your training, projects and evidence-backed skills build your career profile. With your permission, companies can discover the work you choose to share.",
    talentBadge: "A career profile ready to share",
    employerBadge: "A space for employers to discover accounting talent",
    demo: "Illustrative demo with fictional data",
    sources: [
      ["Training courses", "Added by the profile owner"],
      ["Practical projects", "Clearly labelled training simulations"],
      ["Professional certificates", "User-added, not automatically verified"],
      ["Practical skills", "Supported by eligible practice evidence"],
    ],
    sourceStatus: "Shareable",
    profile: "My career profile",
    name: "Ahmed Mohamed",
    role: "Junior accountant",
    location: "Location set by the member",
    available: "Availability set by the member",
    consent: "Discovery requires explicit consent",
    tabs: ["Overview", "Skills", "Certificates", "Projects"],
    summaryTitle: "Professional summary",
    summary:
      "An illustrative profile combining eligible skills and training work, clearly separated from employment experience.",
    skillsTitle: "Practice-supported skills",
    skills: ["Journal entries", "Account classification", "Trial balance"],
    projectsTitle: "Practical work",
    project: "Prepare a trial balance — training simulation",
    coursesTitle: "Courses and certificates",
    courses: "Only member-approved items appear, each with its source made clear.",
    courseCards: ["Added training course", "Member-added certificate"],
    bridge: "Your profile appears to employers",
    bridgeSmall: "Only after you opt in",
    searchHeading: "Discover accounting talent",
    searchSub: "Illustrative employer workspace — not live results",
    searchPlaceholder: "Search illustrative examples...",
    search: "Search",
    filters: ["All skills", "All locations", "All experience"],
    candidates: "Illustrative candidate examples",
    candidateNames: ["Ahmed — example", "Sara — example", "Mohamed — example", "Layla — example"],
    candidateRoles: ["Junior accountant", "Accounting trainee", "Accountant", "Junior accountant"],
    preview: "View profile",
    shortlist: "Add to shortlist",
    shortlisted: "In demo shortlist",
    contact: "How contact works",
    contactNote:
      "In the real workspace, an internal contact request is sent only when the candidate consents to discovery and contact. Email and phone are not shown here.",
    noResults: "No illustrative examples match this search.",
    benefits: [
      ["Be seen by participating employers", "Only when you opt in to career-profile discovery."],
      ["A profile backed by practice", "Accepted training evidence stays labelled as simulation."],
      ["A CV ready for applications", "Your real details in a clear format, without invented experience."],
      ["Reviewable skills and projects", "Employers review only the information you permit."],
    ],
    companies: "Space reserved for companies using the platform",
    companyTiles: ["Accounting firm", "Finance team", "Audit office", "Training team", "Accounts unit", "Trading company"],
    start: "Start your journey",
    explore: "See how discovery works",
  },
} as const;

const sourceIcons = [GraduationCap, FileText, FileBadge2, BarChart3];
const benefitIcons = [Users, ShieldCheck, FileText, BarChart3];

export function EmployerDiscoveryShowcase({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const ar = locale === "ar";
  const Arrow = ArrowRight;
  const [tab, setTab] = useState(0);
  const [candidate, setCandidate] = useState(0);
  const [query, setQuery] = useState("");
  const [shortlisted, setShortlisted] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const explanationRef = useRef<HTMLParagraphElement>(null);
  const visibleCandidates = t.candidateNames.map((name, index) => ({ name, index })).filter(({ name, index }) => {
    const text = `${name} ${t.candidateRoles[index]} ${t.skills.join(" ")}`.toLocaleLowerCase();
    return text.includes(query.trim().toLocaleLowerCase());
  });

  function explainDiscovery() {
    setShowConsent(true);
    window.setTimeout(() => explanationRef.current?.focus(), 0);
  }

  return (
    <section id="employer-discovery" className="employer-discovery" dir={ar ? "rtl" : "ltr"} aria-labelledby="employer-discovery-title">
      <div className="ed-shell">
        <div className="ed-floating-badge ed-talent-badge"><GraduationCap aria-hidden="true" /><strong>{t.talentBadge}</strong></div>
        <div className="ed-floating-badge ed-employer-badge"><Building2 aria-hidden="true" /><strong>{t.employerBadge}</strong></div>
        <header className="ed-heading">
          <span className="ed-eyebrow">{t.eyebrow}</span>
          <h2 id="employer-discovery-title"><em>{t.titleStart}</em> {t.titleMiddle} <em>{t.titleEnd}</em></h2>
          <p>{t.description}</p>
          <span className="ed-demo-label"><Sparkles aria-hidden="true" />{t.demo}</span>
        </header>

        <div className="ed-scene">
          <div className="ed-sources">
            <div className="ed-person" aria-hidden="true"><Image src="/landing/employer-accountant-v2.png" alt="" fill sizes="(max-width: 768px) 180px, 360px" priority /></div>
            <div className="ed-source-list">
              {t.sources.map(([title, description], index) => {
                const Icon = sourceIcons[index];
                return <div className="ed-source" key={title}>
                  <span className="ed-source-icon"><Icon aria-hidden="true" /></span>
                  <span className="ed-source-copy"><strong>{title}</strong><small>{description}</small><span className="ed-source-status"><Check aria-hidden="true" />{t.sourceStatus}</span></span>
                  <CheckCircle2 className="ed-source-check" aria-hidden="true" />
                </div>;
              })}
            </div>
          </div>

          <article className="ed-profile" aria-label={t.profile}>
            <div className="ed-profile-brand"><span><BriefcaseBusiness aria-hidden="true" /> Debit & Credit</span><strong>{t.profile}</strong></div>
            <div className="ed-profile-identity">
              <span className="ed-profile-photo"><Image src="/landing/employer-accountant-v2.png" alt="" width={104} height={104} /></span>
              <div><strong>{t.name}</strong><span>{t.role}</span><small><MapPin aria-hidden="true" />{t.location}</small></div>
            </div>
            <div className="ed-profile-status"><span><Check aria-hidden="true" />{t.available}</span><span><ShieldCheck aria-hidden="true" />{t.consent}</span></div>
            <div className="ed-profile-tabs" role="tablist" aria-label={t.profile}>
              {t.tabs.map((label, index) => <button type="button" key={label} role="tab" aria-selected={tab === index} className={tab === index ? "is-active" : ""} onClick={() => setTab(index)}>{label}</button>)}
            </div>
            <div className="ed-profile-body" role="tabpanel">
              {tab === 0 && <><h3>{t.summaryTitle}</h3><p>{t.summary}</p><h3>{t.skillsTitle}</h3><div className="ed-skill-chips">{t.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><h3>{t.coursesTitle}</h3><div className="ed-course-cards">{t.courseCards.map((label) => <span key={label}><FileBadge2 aria-hidden="true" />{label}<CheckCircle2 aria-hidden="true" /></span>)}</div><h3>{t.projectsTitle}</h3><div className="ed-project"><FileText aria-hidden="true" /><span>{t.project}</span><CheckCircle2 aria-hidden="true" /></div></>}
              {tab === 1 && <><h3>{t.skillsTitle}</h3><p>{t.summary}</p><div className="ed-skill-chips">{t.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></>}
              {tab === 2 && <><h3>{t.coursesTitle}</h3><p>{t.courses}</p><div className="ed-project"><FileBadge2 aria-hidden="true" /><span>{t.consent}</span></div></>}
              {tab === 3 && <><h3>{t.projectsTitle}</h3><p>{t.summary}</p><div className="ed-project"><FileText aria-hidden="true" /><span>{t.project}</span><CheckCircle2 aria-hidden="true" /></div></>}
            </div>
          </article>

          <div className="ed-bridge" aria-label={`${t.bridge}. ${t.bridgeSmall}`}><span>{t.bridge}<small>{t.bridgeSmall}</small></span><Arrow aria-hidden="true" /></div>

          <article className="ed-employer" aria-label={t.searchHeading}>
            <aside className="ed-employer-sidebar" aria-hidden="true"><strong><Building2 /> Debit & Credit</strong><span className="is-selected"><Search />{t.searchHeading}</span><span><Users />{t.candidates}</span><span><Mail />{t.contact}</span><span><BriefcaseBusiness />{t.shortlist}</span></aside>
            <div className="ed-employer-main">
              <div className="ed-employer-top"><strong><Building2 aria-hidden="true" /> Debit & Credit</strong><span>{t.demo}</span></div>
              <h3>{t.searchHeading}</h3><p>{t.searchSub}</p>
              <form className="ed-search" onSubmit={(event) => event.preventDefault()}><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder} /><button type="submit">{t.search}</button></form>
              <div className="ed-filters" aria-label={t.filters.join("، ")}>{t.filters.map((filter) => <span key={filter}>{filter}<ChevronDown aria-hidden="true" /></span>)}<ListFilter aria-hidden="true" /></div>
              <div className="ed-results-title"><strong>{t.candidates}</strong><small>{t.demo}</small></div>
              <div className="ed-results">
                {visibleCandidates.length ? visibleCandidates.map(({ name, index }) => <button type="button" key={name} className={`ed-result ${candidate === index ? "is-selected" : ""}`} onClick={() => { setCandidate(index); setShortlisted(false); }} aria-label={`${t.preview}: ${name}`}><span className="ed-result-avatar">{index === 0 ? <Image src="/landing/employer-accountant-v2.png" alt="" width={40} height={40} /> : ar ? ["", "س", "م", "ل"][index] : ["", "S", "M", "L"][index]}</span><span className="ed-result-person"><strong>{name}</strong><small>{t.candidateRoles[index]}</small><small>{t.skills[index % t.skills.length]}</small></span><span className="ed-result-action">{t.preview}</span></button>) : <p className="ed-no-results">{t.noResults}</p>}
              </div>
              <div className="ed-preview"><strong>{t.candidateNames[candidate]}</strong><span>{t.candidateRoles[candidate]} · {t.demo}</span><div><button type="button" onClick={() => setShortlisted((value) => !value)}>{shortlisted ? t.shortlisted : t.shortlist}</button><button type="button" onClick={explainDiscovery}>{t.contact}</button></div></div>
            </div>
          </article>
        </div>

        <div className="ed-employer-person" aria-hidden="true"><Image src="/landing/employer-reviewer-v2.png" alt="" fill sizes="430px" /></div>

        <div className="ed-benefits">{t.benefits.map(([title, description], index) => { const Icon = benefitIcons[index]; return <div className="ed-benefit" key={title}><span><Icon aria-hidden="true" /></span><div><strong>{title}</strong><p>{description}</p></div></div>; })}</div>
        <div className="ed-bottom"><div className="ed-company-strip"><strong>{t.companies}</strong><div>{t.companyTiles.map((company) => <span key={company}><Building2 aria-hidden="true" />{company}</span>)}</div></div><div className="ed-actions"><button type="button" className="ed-secondary" onClick={explainDiscovery}>{t.explore}<Arrow aria-hidden="true" /></button><AuthCTA className="ed-primary" href={`/${locale}/onboarding`}>{t.start}<Arrow aria-hidden="true" /></AuthCTA></div></div>
        <p ref={explanationRef} className={`ed-consent-explainer ${showConsent ? "is-visible" : ""}`} tabIndex={-1} aria-live="polite">{showConsent ? t.contactNote : ""}</p>
      </div>
    </section>
  );
}
