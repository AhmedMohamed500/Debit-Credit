"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, BarChart3, BookMarked, BookOpen, BriefcaseBusiness, Building2, Check, ChevronRight, ClipboardCheck, FileBarChart, FileText, Inbox, Landmark, ShieldCheck, Target, Truck, Users, WalletCards } from "lucide-react";
import { useGame } from "@/lib/campaign/store";
import { firstDayCompany, firstDayDocuments, firstDayProgress } from "@/lib/campaign/first-day";
import { projectShiftPerformance } from "@/lib/cases/performance";
import { calculatePassport, firstShiftSkillEvidence } from "@/lib/career/evidence";
import { roleCatalog, skillCatalog } from "@/lib/career/catalog";
import { BrowserSkillEvidenceRepository, getOrCreateLocalCandidateId } from "@/lib/career/repository";
import type { SkillEvidence } from "@/lib/career/model";
import { gameHubNextMission } from "@/lib/platform/journey";
import { destination, localizedPath, MIZAN_ZONES, type GameDestinationId, type MizanZoneId } from "@/lib/platform/navigation";
import { usePlayer } from "@/components/game/use-player";
import type { Locale } from "@/types";
import { PlatformNav } from "./platform-nav";
import { BrowserCareerLeagueRepository } from "@/lib/career-league/repository";
import { careerOpportunities, companyTiers } from "@/lib/career-league/catalog";
import { companyUnlocked, createCareerLeagueState } from "@/lib/career-league/engine";
import type { CareerLeagueState } from "@/lib/career-league/model";
import { BrowserPlacementRepository } from "@/lib/placement/repository";
import type { PlacementResult } from "@/lib/placement/model";
import { ProfilePhoto } from "@/components/career/profile-photo";
import { StudentJourneyHome, useStudentJourney } from "@/components/student/student-journey";
import { OwnerCapitalCase } from "@/components/practice/owner-capital-case";
import { AccountingCalculator } from "@/components/practice/accounting-calculator";

type IconType = typeof Inbox;

export function GameHub({ locale }: { locale: Locale }) {
  const studentJourney = useStudentJourney();
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    Arrow = ar ? ArrowLeft : ArrowRight;
  const { state } = useGame(),
    player = usePlayer(),
    progress = firstDayProgress(state),
    company = firstDayCompany(state),
    performance = projectShiftPerformance(state),
    done = progress.completed.length;
  const [careerState, setCareerState] = useState<CareerLeagueState>(() => createCareerLeagueState()),
    [candidateId, setCandidateId] = useState("local-player"),
    [savedEvidence, setSavedEvidence] = useState<SkillEvidence[]>([]),
    [diagnostic, setDiagnostic] = useState<PlacementResult | null>(null);
  useEffect(() => {
    setCareerState(new BrowserCareerLeagueRepository().get());
    setCandidateId(getOrCreateLocalCandidateId());
    setSavedEvidence(new BrowserSkillEvidenceRepository().getAll());
    setDiagnostic(new BrowserPlacementRepository().get().result);
  }, []);
  const evidence = [...new Map([...firstShiftSkillEvidence(state, candidateId), ...savedEvidence.filter((item) => item.localCandidateId === candidateId)].map((item) => [item.evidenceId, item])).values()],
    passport = calculatePassport(evidence);
  const target = careerOpportunities.find((item) => item.id === careerState.targetOpportunityId),
    nextCompany = companyTiers[1],
    nextMission = gameHubNextMission(careerState, passport, diagnostic);
  const nextTitle = nextMission.kind === "entry" ? say("Choose your starting point", "حدد نقطة بدايتك") : nextMission.kind === "diagnostic" ? say("Take your career diagnostic", "ابدأ التشخيص المهني") : nextMission.kind === "skill" && nextMission.skillId ? skillCatalog[nextMission.skillId].label[locale] : say("Review your career map", "راجع خريطتك المهنية");
  const handledValue = firstDayDocuments.filter((document) => progress.completed.includes(document.id)).reduce((total, document) => total + document.amount, 0);
  const railIds: GameDestinationId[] = ["inbox", "journal", "ledger", "trial-balance", "financial-statements", "nature-of-accounts"];
  const railIcons: Partial<Record<GameDestinationId, IconType>> = {
    inbox: Inbox,
    journal: BookMarked,
    ledger: BookOpen,
    "trial-balance": BarChart3,
    "financial-statements": FileBarChart,
    "nature-of-accounts": FileText,
  };
  const zoneIcons: Record<MizanZoneId, IconType> = {
    suppliers: WalletCards,
    customers: Users,
    bank: Landmark,
    logistics: Truck,
    "month-end": ClipboardCheck,
  };
  const visibleSkills = passport.filter((item) => item.status !== "unassessed").slice(0, 3);
  const completedMissionIds = done === 3 ? ["first-shift"] : [];
  const unlockedCompanies = companyTiers.filter((item) => companyUnlocked(item.id, passport, completedMissionIds, careerState.assessmentResults));
  const currentCompany = unlockedCompanies.at(-1) ?? companyTiers[0];
  if (studentJourney) return <StudentJourneyHome locale={locale} />;
  return (
    <main className="platform-page command-game">
      <PlatformNav locale={locale} />
      <section className="command-shell">
        <aside className="command-rail" aria-label={say("Game navigation", "تنقل اللعبة")}>
          <div className="command-rail-company">
            <Building2 />
            <span>
              <b>Mizan Trading</b>
              <small>{say("Accounting simulation", "محاكاة محاسبية")}</small>
            </span>
          </div>
          <nav>
            {railIds.map((id) => {
              const item = destination(id),
                Icon = railIcons[id]!;
              return (
                <Link href={localizedPath(locale, item.path)} key={id}>
                  <Icon />
                  <span>{item.label[locale]}</span>
                  {id === "inbox" && company.pendingDocuments > 0 ? <em>{company.pendingDocuments}</em> : null}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="command-main">
          <header className="command-heading">
            <div>
              <span>{say("CAREER LEAGUE · LIVE COMPANY SIMULATION", "CAREER LEAGUE · محاكاة شركة حية")}</span>
              <h1>Mizan Trading</h1>
              <p>{say("Start small. Prove your skills. Move up.", "ابدأ من مستواك الحقيقي... واثبت إنك جاهز للشركة الأكبر.")}</p>
            </div>
            <Link className="hub-career-snapshot" href={`/${locale}/career`}>
              <Target />
              <span>
                <small>{say("TARGET ROLE", "الدور المستهدف")}</small>
                <b>{target ? target.title[locale] : careerState.targetRoleId ? roleCatalog[careerState.targetRoleId].label[locale] : say("Choose a career goal", "اختر هدفك المهني")}</b>
                <em>{say(`Next company: ${nextCompany.name.en}`, `الشركة التالية: ${nextCompany.name.ar}`)}</em>
              </span>
              <Arrow />
            </Link>
          </header>
          <section className="hub-next-mission" aria-label={say("Recommended next mission", "المهمة التالية المقترحة")}>
            <div>
              <span>
                <Target />
                {say("RECOMMENDED NEXT MISSION", "المهمة التالية المقترحة")}
              </span>
              <h2>{nextTitle}</h2>
              <p>{nextMission.skillId ? say("Chosen from your career map, skill gap and saved practice evidence.", "اختيرت من خريطتك وفجوة مهاراتك وأدلة الممارسة المحفوظة.") : say("One clear step to continue your professional journey.", "خطوة واحدة واضحة لتكمل رحلتك المهنية.")}</p>
            </div>
            <aside>
              <small>
                {say("Current company", "الشركة الحالية")}: <b>Mizan Trading</b>
              </small>
              <small>
                {say("Career map progress", "تقدم الخريطة")}: <b>{nextMission.totalSteps ? `${nextMission.completedSteps}/${nextMission.totalSteps}` : say("Not started", "لم يبدأ")}</b>
              </small>
              <Link href={`/${locale}${nextMission.route}`}>
                {say("Continue now", "ابدأ الآن")}
                <Arrow />
              </Link>
            </aside>
          </section>
          <section className="company-world" aria-label={say("Interactive Mizan Trading map", "خريطة Mizan Trading التفاعلية")}>
            <div className="company-world-title">
              <Building2 />
              <span>
                <b>Mizan Trading</b>
                <small>{say(`${done} of 3 First Shift cases resolved`, `${done} من 3 حالات في أول وردية مكتملة`)}</small>
              </span>
            </div>
            {MIZAN_ZONES.filter((item) => item.status === "available").map((item) => {
              const Icon = zoneIcons[item.id];
              return (
                <Link className={`world-zone world-zone-${item.id} ${item.status}`} href={localizedPath(locale, item.path)} key={item.id}>
                  <i>
                    <Icon />
                  </i>
                  <span>
                    <b>{item.title[locale]}</b>
                    <small>{item.subtitle[locale]}</small>
                  </span>
                  <ChevronRight />
                </Link>
              );
            })}
            <div className="world-health">
              <BadgeCheck />
              <span>
                <b>{company.ledgerErrors === 0 ? say("Books healthy", "الدفاتر سليمة") : say("Review required", "تحتاج مراجعة")}</b>
                <small>
                  {company.pendingDocuments} {say("documents pending", "مستندات معلقة")}
                </small>
              </span>
            </div>
          </section>
          <section className="operations-deck">
            <article className="active-cases">
              <header>
                <span>
                  <Inbox />
                  {say("Active work", "العمل الحالي")}
                </span>
                <Link href={`/${locale}/game/first-shift`}>
                  {say("Open shift", "افتح الوردية")}
                  <Arrow />
                </Link>
              </header>
              {firstDayDocuments.map((document, index) => {
                const completed = progress.completed.includes(document.id);
                return (
                  <Link href={`/${locale}/game/first-shift`} className={`case-line ${completed ? "complete" : ""}`} key={document.id}>
                    <i>{completed ? <Check /> : index + 1}</i>
                    <span>
                      <b>{document.title[locale]}</b>
                      <small>
                        {document.party[locale]} · {document.amount.toLocaleString(locale)} EGP
                      </small>
                    </span>
                    <em>{completed ? say("Processed", "تمت المعالجة") : say("Pending", "معلّق")}</em>
                    <Arrow />
                  </Link>
                );
              })}
            </article>
            <article className="chapter-progress">
              <header>
                <span>
                  <ClipboardCheck />
                  {say("Chapter 1 · First Shift", "الفصل 1 · أول وردية")}
                </span>
                <b>{Math.round((done / 3) * 100)}%</b>
              </header>
              <div className="chapter-meter">
                <i style={{ width: `${(done / 3) * 100}%` }} />
              </div>
              <ul>
                <li className={done > 0 ? "done" : ""}>
                  <i>{done > 0 ? <Check /> : null}</i>
                  {say("Review source documents", "مراجعة المستندات")}
                </li>
                <li className={done === 3 ? "done" : ""}>
                  <i>{done === 3 ? <Check /> : null}</i>
                  {say("Post three entries", "ترحيل ثلاثة قيود")}
                </li>
              </ul>
              <p className="chapter-status">{done === 3 ? say("First Shift completed. Review it from Active work when needed.", "اكتملت أول وردية. يمكنك مراجعتها من العمل الحالي عند الحاجة.") : say("Use the recommended mission above to continue from the right step.", "استخدم المهمة المقترحة بالأعلى لتكمل من الخطوة المناسبة.")}</p>
            </article>
            <article className="company-impact">
              <header>
                <span>
                  <BarChart3 />
                  {say("Your company impact", "أثرك داخل الشركة")}
                </span>
              </header>
              <dl>
                <div>
                  <dt>{say("Transactions processed", "معاملات معالجة")}</dt>
                  <dd>{done}</dd>
                </div>
                <div>
                  <dt>{say("Accuracy", "الدقة")}</dt>
                  <dd>{performance.accuracy}%</dd>
                </div>
                <div>
                  <dt>{say("Value handled", "قيمة تمت معالجتها")}</dt>
                  <dd>
                    {handledValue.toLocaleString(locale)} <small>EGP</small>
                  </dd>
                </div>
                <div>
                  <dt>{say("Ledger issues", "مشكلات الدفتر")}</dt>
                  <dd>{company.ledgerErrors}</dd>
                </div>
              </dl>
            </article>
          </section>
          <section className="phase3-practice-grid" aria-label={say("Practice and career utilities", "التدريب والأدوات المهنية")}>
            <OwnerCapitalCase locale={locale} />
            <AccountingCalculator locale={locale} />
            <article className="phase3-career-entry">
              <header><BriefcaseBusiness />{say("Company progression", "تقدم الشركات")}</header>
              <h2>{currentCompany.name[locale]}</h2>
              <p>{say(`${unlockedCompanies.length} of ${companyTiers.length} company levels unlocked from your real evidence and assessments.`, `تم فتح ${unlockedCompanies.length} من ${companyTiers.length} مستويات شركات بناءً على أدلتك وتقييماتك الحقيقية.`)}</p>
              <Link href={`/${locale}/career-league/companies`}>{say("View company progression", "عرض تقدم الشركات")}<Arrow /></Link>
            </article>
          </section>
        </div>
        <aside className="command-dossier">
          <section className="player-dossier">
            <ProfilePhoto locale={locale} name={player.displayName} />
            <div>
              <b>{player.displayName}</b>
              <small>{say("Your saved learning profile", "ملف تعلمك المحفوظ")}</small>
              <span>{done} {say("First Shift cases completed", "حالات مكتملة في أول وردية")}</span>
            </div>
            <Link href={`/${locale}/career-profile`}>{say("Career profile", "الملف المهني")}</Link>
          </section>
          <section className="passport-panel">
            <header>
              <span>
                <ShieldCheck />
                {say("Professional progress · Skill Passport", "التقدم المهني · جواز المهارات")}
              </span>
              <Link href={`/${locale}/career-profile/skills`}>
                {say("View all", "عرض الكل")}
                <Arrow />
              </Link>
            </header>
            {visibleSkills.length ? (
              visibleSkills.map((item) => (
                <div className="skill-line" key={item.skillId}>
                  <i>
                    <BadgeCheck />
                  </i>
                  <span>
                    <b>{skillCatalog[item.skillId].label[locale]}</b>
                  </span>
                  <strong>{item.status === "demonstrated" ? say("Demonstrated", "مثبتة") : item.status === "verified" ? say("Verified", "موثقة") : say("Practiced", "تمت ممارستها")}</strong>
                </div>
              ))
            ) : (
              <p className="passport-empty">{say("Complete a professional case to add evidence here.", "أكمل حالة مهنية ليظهر دليل مهاراتك هنا.")}</p>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}
