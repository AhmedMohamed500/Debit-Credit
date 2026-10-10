import { z } from "zod";
import { roleIds } from "./catalog";
import {
  studentAccounts,
  studentLedger,
  transactions,
  stepIds,
  type StudentState,
} from "@/lib/student/unit";

export const workIds = [
  "journal",
  "cash-ledger",
  "trial-balance",
  "worksheet",
] as const;
export type WorkId = (typeof workIds)[number];
export const socialKeys = [
  "linkedin",
  "github",
  "facebook",
  "instagram",
  "website",
] as const;
export type SocialKey = (typeof socialKeys)[number];
export const socialLabels: Record<SocialKey, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  facebook: "Facebook",
  instagram: "Instagram",
  website: "Portfolio / Website",
};
export function safeSocial(key: SocialKey, value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash
    )
      return false;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (key === "website")
      return (
        host.includes(".") &&
        !/^[\d.]+$/.test(host) &&
        !host.endsWith(".local") &&
        host !== "localhost" &&
        !host.includes(":")
      );
    return (
      host ===
      {
        linkedin: "linkedin.com",
        github: "github.com",
        facebook: "facebook.com",
        instagram: "instagram.com",
      }[key]
    );
  } catch {
    return false;
  }
}
const social = (key: SocialKey) =>
  z
    .string()
    .trim()
    .max(300)
    .refine(
      (value) => safeSocial(key, value),
      "Use a clean HTTPS profile link without tracking parameters.",
    );
const pins = z
  .array(z.enum(workIds))
  .max(3)
  .refine((values) => new Set(values).size === values.length);
export const showcaseSettings = z
  .object({
    socials: z
      .object({
        linkedin: social("linkedin"),
        github: social("github"),
        facebook: social("facebook"),
        instagram: social("instagram"),
        website: social("website"),
      })
      .strict(),
    pinned: pins,
    availability: z
      .object({
        status: z.enum(["not-looking", "internship", "work"]),
        role: z.enum(roleIds),
      })
      .strict(),
    public: z
      .object({
        name: z.boolean(),
        socials: z.boolean(),
        availability: z.boolean(),
        summary: z.boolean(),
        works: pins,
      })
      .strict(),
  })
  .strict()
  .refine(
    (value) => value.public.works.every((id) => value.pinned.includes(id)),
    "Shared works must be pinned.",
  );
export type ShowcaseSettings = z.infer<typeof showcaseSettings>;
export const showcaseCommand = z
  .object({
    revision: z.number().int().nonnegative(),
    action: z.enum(["save", "publish", "revoke"]),
    settings: showcaseSettings,
  })
  .strict();
export type ShowcaseCommand = z.infer<typeof showcaseCommand>;
export const defaultShowcase = (): ShowcaseSettings => ({
  socials: {
    linkedin: "",
    github: "",
    facebook: "",
    instagram: "",
    website: "",
  },
  pinned: [],
  availability: { status: "not-looking", role: "junior-accountant" },
  public: {
    name: false,
    socials: false,
    availability: false,
    summary: false,
    works: [],
  },
});
export type Work = {
  id: WorkId;
  title: { en: string; ar: string };
  skill: { en: string; ar: string };
  summary: { en: string; ar: string };
  steps: string[];
  headers: string[];
  rows: (string | number)[][];
};
// Only a contiguous, server-graded prefix can unlock an artifact. No imported evidence or self-reported courses.
export function acceptedWorks(state: StudentState | null): Work[] {
  const accepted: string[] = [];
  for (const step of stepIds) {
    if (!state?.accepted.includes(step)) break;
    accepted.push(step);
  }
  const has = (id: string) => accepted.includes(id);
  const journals = transactions.map((row) => `journal-${row.id}`);
  const balances = studentLedger(accepted);
  const works: Work[] = [];
  if (journals.every(has))
    works.push({
      id: "journal",
      title: {
        en: "Source documents → journal entries",
        ar: "من المستندات إلى قيود اليومية",
      },
      skill: { en: "Double-entry bookkeeping", ar: "إعداد قيود اليومية" },
      summary: {
        en: "Prepared six balanced journal entries from simulated source documents, distinguishing capital, assets, receivables, revenue and expenses.",
        ar: "أعدّ ستة قيود متوازنة من مستندات المحاكاة، مع التمييز بين رأس المال والأصول والعملاء والإيراد والمصروفات.",
      },
      steps: journals,
      headers: ["Reference", "Debit account", "Credit account", "EGP"],
      rows: transactions.map((row) => [
        row.reference,
        studentAccounts[row.debit].en,
        studentAccounts[row.credit].en,
        row.amount,
      ]),
    });
  if (has("ledger-cash")) {
    let running = 0;
    works.push({
      id: "cash-ledger",
      title: { en: "Cash ledger", ar: "دفتر أستاذ النقدية" },
      skill: { en: "Ledger posting", ar: "الترحيل لدفتر الأستاذ" },
      summary: {
        en: "Posted simulated cash transactions and reconciled the EGP 84,000 closing cash balance to the journal.",
        ar: "رحّل حركات النقدية في المحاكاة وطابق رصيد الإقفال البالغ 84,000 جنيه مع اليومية.",
      },
      steps: [...journals, "ledger-cash"],
      headers: ["Reference", "Debit EGP", "Credit EGP", "Running balance"],
      rows: transactions
        .filter((row) => row.debit === "cash" || row.credit === "cash")
        .map((row) => {
          const debit = row.debit === "cash" ? row.amount : 0,
            credit = row.credit === "cash" ? row.amount : 0;
          running += debit - credit;
          return [row.reference, debit, credit, running];
        }),
    });
  }
  if (has("trial-balance"))
    works.push({
      id: "trial-balance",
      title: { en: "Trial balance workpaper", ar: "ورقة عمل ميزان المراجعة" },
      skill: { en: "Trial balance preparation", ar: "إعداد ميزان المراجعة" },
      summary: {
        en: "Prepared an eight-account simulated trial balance with EGP 127,000 on each side. Balance alone does not prove the absence of accounting errors.",
        ar: "أعدّ ميزان مراجعة لثمانية حسابات في المحاكاة بإجمالي 127,000 جنيه لكل جانب. التوازن وحده لا يثبت خلو القيود من الأخطاء.",
      },
      steps: [...journals, "ledger-cash", "trial-balance"],
      headers: ["Account", "Debit EGP", "Credit EGP"],
      rows: [
        ...Object.entries(balances).map(([id, balance]) => [
          studentAccounts[id as keyof typeof studentAccounts].en,
          Math.max(balance, 0),
          Math.max(-balance, 0),
        ]),
        ["Total", 127000, 127000],
      ],
    });
  if (has("worksheet"))
    works.push({
      id: "worksheet",
      title: { en: "Spreadsheet balance checks", ar: "فحوص توازن ورقة العمل" },
      skill: { en: "Basic spreadsheet formulas", ar: "الصيغ الأساسية للجداول" },
      summary: {
        en: "Used SUM and a debit-minus-credit control in a simulated accounting worksheet. This demonstrates basic formulas, not full Excel proficiency.",
        ar: "استخدم SUM وفحص الفرق بين المدين والدائن في ورقة عمل محاسبية بالمحاكاة. يثبت الصيغ الأساسية وليس إتقان Excel بالكامل.",
      },
      steps: ["worksheet"],
      headers: ["Cell", "Accepted formula", "Result EGP"],
      rows: [
        ["C10", "=SUM(C2:C9)", 127000],
        ["D10", "=SUM(D2:D9) · supplied control", 127000],
        ["C11", "=C10-D10", 0],
      ],
    });
  return works;
}
export type Showcase = {
  revision: number;
  settings: ShowcaseSettings;
  token: string | null;
  name: string;
  works: Work[];
};
export type PublicShowcase = {
  name: string | null;
  socials: ShowcaseSettings["socials"] | null;
  availability: ShowcaseSettings["availability"] | null;
  summary: Work["summary"][];
  works: Work[];
};
export function publicShowcase(data: Showcase): PublicShowcase {
  const choice = data.settings.public;
  return {
    name: choice.name ? data.name : null,
    socials: choice.socials ? data.settings.socials : null,
    availability: choice.availability ? data.settings.availability : null,
    summary: choice.summary ? data.works.map((work) => work.summary) : [],
    works: data.works.filter((work) => choice.works.includes(work.id)),
  };
}
