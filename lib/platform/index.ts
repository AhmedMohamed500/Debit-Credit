import { roleCatalog } from "@/lib/career/catalog";
import type { RoleId, SkillId, SkillResult } from "@/lib/career/model";

export type ThemePreference = "light" | "dark" | "system";
export const THEME_KEY = "debit-credit-theme-v1";
export const resolveTheme = (preference: ThemePreference, systemDark: boolean): "light" | "dark" => (preference === "system" ? (systemDark ? "dark" : "light") : preference);

export const academyPhases = [
  {
    id: 0,
    ar: "التهيئة",
    en: "Orientation",
    state: "available",
    route: "/game",
    skills: ["Game mechanics", "Supporting evidence"],
  },
  {
    id: 1,
    ar: "أساسيات المحاسبة",
    en: "Accounting Foundations",
    state: "available",
    route: "/academy/accounting-foundations",
    skills: ["Accounting equation", "Nature of accounts"],
  },
  {
    id: 2,
    ar: "تطبيق المعاملات",
    en: "Transaction Practice",
    state: "available",
    route: "/game/first-shift",
    skills: ["Documents", "Journal entries"],
  },
  {
    id: 3,
    ar: "محاسبة الأقسام",
    en: "Department Accounting",
    state: "preview",
    route: "/missions",
    skills: ["AP", "AR", "Cash & Bank", "Inventory"],
  },
  {
    id: 4,
    ar: "الإقفال",
    en: "Period End & Closing",
    state: "locked",
    route: null,
    skills: ["Reconciliation", "Adjustments", "Trial balance"],
  },
  {
    id: 5,
    ar: "قطاعات الأعمال",
    en: "Real Business Tracks",
    state: "planned",
    route: null,
    skills: ["Trading", "Retail", "Restaurant", "Manufacturing"],
  },
  {
    id: 6,
    ar: "الجاهزية المهنية",
    en: "Career Readiness",
    state: "available",
    route: "/career",
    skills: ["Skill Passport", "Role fit", "Auto CV"],
  },
] as const;

export const placementRecommendation = (score: number) => (score >= 80 ? 2 : score >= 45 ? 1 : 0);
export function professionalRank(passport: SkillResult[]) {
  const demonstrated = passport.filter((item) => item.status === "demonstrated" || item.status === "verified").length,
    practiced = passport.filter((item) => item.status === "practiced").length;
  if (demonstrated >= 14) return "Senior Accountant";
  if (demonstrated >= 10) return "General Accountant";
  if (demonstrated >= 6) return "Staff Accountant";
  if (demonstrated >= 3) return "Junior Accountant";
  return practiced > 0 ? "Accounting Trainee" : "Accounting Explorer";
}
export const challengeCatalog = [
  {
    id: "daily-journal",
    type: "daily",
    ar: "أصلح القيد",
    en: "Fix the Journal",
    route: "/practice",
    locked: false,
  },
  {
    id: "weekly-supplier",
    type: "weekly",
    ar: "تحقيق المورد",
    en: "Supplier Investigation",
    route: "/game/first-shift",
    locked: false,
  },
  {
    id: "boss-month-end",
    type: "boss",
    ar: "أزمة نهاية الشهر",
    en: "Month-End Crisis",
    route: null,
    locked: true,
  },
] as const;

export const gameBadges = [
  { id: "first-journal", ar: "أول قيد", en: "First Journal" },
  {
    id: "clean-first-attempt",
    ar: "محاولة أولى نظيفة",
    en: "Clean First Attempt",
  },
  { id: "evidence-hunter", ar: "صياد الأدلة", en: "Evidence Hunter" },
  { id: "risk-spotter", ar: "مراقب المخاطر", en: "Risk Spotter" },
  { id: "document-detective", ar: "محقق المستندات", en: "Document Detective" },
  { id: "perfect-shift", ar: "وردية مثالية", en: "Perfect Shift" },
] as const;

export function roleSkillGroups(roleId: RoleId, passport: SkillResult[]) {
  const weights = roleCatalog[roleId].skills,
    rows = Object.keys(weights).map((id) => passport.find((item) => item.skillId === (id as SkillId))!);
  return {
    demonstrated: rows.filter((x) => x.status === "demonstrated" || x.status === "verified"),
    practiced: rows.filter((x) => x.status === "practiced"),
    missing: rows.filter((x) => x.status === "unassessed"),
  };
}
const missionBySkill: Partial<Record<SkillId, { route: string | null; ar: string; en: string; locked?: boolean }>> = {
  "bank-reconciliation": {
    route: "/game/bank-reconciliation",
    ar: "تسوية البنك — ورقة عمل مهنية",
    en: "Bank Reconciliation — Professional Workpaper",
    locked: false,
  },
  "journal-entries": {
    route: "/practice",
    ar: "تحدي القيود اليومية",
    en: "Journal Entry Challenge",
  },
  "document-analysis": {
    route: "/game/first-shift",
    ar: "أول وردية مهنية",
    en: "First Professional Shift",
  },
  "accounts-payable": {
    route: "/game/first-shift",
    ar: "تحقيق فاتورة المورد",
    en: "Supplier Invoice Investigation",
  },
  "account-classification": {
    route: "/account-guide",
    ar: "طبيعة الحسابات",
    en: "Nature of Accounts",
  },
};
export function recommendMission(roleId: RoleId, passport: SkillResult[]) {
  const missing = roleSkillGroups(roleId, passport).missing.sort((a, b) => (roleCatalog[roleId].skills[b.skillId] ?? 0) - (roleCatalog[roleId].skills[a.skillId] ?? 0));
  for (const skill of missing) {
    const mission = missionBySkill[skill.skillId];
    if (mission) return { skillId: skill.skillId, ...mission };
  }
  return {
    skillId: null,
    route: "/missions",
    ar: "استمر في الحالات المهنية",
    en: "Continue professional cases",
    locked: false,
  };
}
