import type { CareerProfile, CvDocument } from "./model";
import type { Portfolio } from "./portfolio";
import { skillCatalog } from "./catalog";

export type CvBlock = {
  id: string;
  heading?: string;
  lines: string[];
  header?: boolean;
};
export type CompactCv = {
  blocks: CvBlock[];
  plainText: string;
  omitted: number;
  needsEnglish: number;
};
const english = (value: string) => !/[\u0600-\u06ff]/u.test(value);
const brief = (value: string, max = 240) => {
  const clean = value.replace(/[\p{Cc}\p{Cf}]/gu, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const prefix = clean.slice(0, max - 3);
  return prefix.slice(0, Math.max(prefix.lastIndexOf(" "), max - 35)) + "...";
};

// A CV is a curated document, not a task transcript. Never modify the saved
// profile or award assessed skills for manually entered courses/certificates.
export function compactCv(
  profile: CareerProfile,
  cv: CvDocument,
  portfolio?: Portfolio,
): CompactCv {
  let omitted = 0,
    needsEnglish = 0;
  const englishOrEmpty = (value: string) => {
    if (english(value)) return value;
    needsEnglish++;
    return "";
  };
  const blocks: CvBlock[] = [
    {
      id: "contact",
      header: true,
      lines: [
        englishOrEmpty(profile.fullName),
        brief(cv.headline, 140),
        [profile.email, profile.phone, englishOrEmpty(profile.location), englishOrEmpty(profile.country)]
          .filter(Boolean)
          .join(" | "),
      ],
    },
  ];
  blocks.push({
    id: "summary",
    heading: "Professional Summary",
    lines: [brief(cv.summary, 280)],
  });
  const select = <T>(rows: T[], limit: number, text: (row: T) => string) => {
    const valid = rows.filter((row) => {
      if (english(text(row))) return true;
      needsEnglish++;
      return false;
    });
    omitted += Math.max(0, valid.length - limit);
    return valid.slice(0, limit);
  };
  const experience = select(
    [...profile.experience].sort(
      (a, b) =>
        Number(b.current) - Number(a.current) ||
        b.startDate.localeCompare(a.startDate),
    ),
    3,
    (row) => `${row.title} ${row.company} ${row.description}`,
  );
  experience.forEach((row, index) =>
    blocks.push({
      id: `experience-${row.id}`,
      heading: index === 0 ? "Experience" : undefined,
      lines: [
        `${brief(row.title, 100)} | ${brief(row.company, 100)} | ${row.startDate} - ${row.current ? "Present" : row.endDate}`,
        brief(row.description, 240),
      ].filter(Boolean),
    }),
  );
  const education = select(
    profile.education,
    2,
    (row) => `${row.degree} ${row.field} ${row.institution}`,
  );
  education.forEach((row, index) =>
    blocks.push({
      id: `education-${row.id}`,
      heading: index === 0 ? "Education" : undefined,
      lines: [
        `${brief(row.degree, 100)}${row.field ? ` - ${brief(row.field, 80)}` : ""} | ${brief(row.institution, 120)}${row.graduationYear ? ` | ${row.graduationYear}` : ""}`,
      ],
    }),
  );
  if (cv.coreSkills.length)
    blocks.push({
      id: "skills",
      heading: "Relevant Skills",
      lines: [
        cv.coreSkills
          .slice(0, 8)
          .map((row) => skillCatalog[row.skillId].label.en)
          .join(" | "),
      ],
    });
  if (cv.practiceSkills.length)
    blocks.push({
      id: "practice",
      heading: "Additional Accounting Practice",
      lines: [
        cv.practiceSkills
          .slice(0, 8)
          .map((row) => skillCatalog[row.skillId].label.en)
          .join(" | "),
      ],
    });
  const journals = cv.evidence.filter(
    (row) =>
      row.missionId === "student-unit1" &&
      row.caseId?.startsWith("student-unit1/journal-"),
  );
  const journalIds = new Set(journals.map((row) => row.evidenceId));
  const grouped = new Set(journals.map((row) => row.caseId)).size === 6;
  const bullets = cv.simulationBullets
    .filter((row) => !grouped || !journalIds.has(row.evidenceId))
    .map((row) => row.text);
  if (grouped)
    bullets.unshift(
      "Recorded six source-linked journal entries: owner capital contribution, equipment, inventory, revenue, customer receipts and rent; classified accounts payable and receivable.",
    );
  // Prioritize distinct accounting outcomes; identical skill projections were
  // already deduplicated by buildCv. The full evidence stays in the passport.
  const selected = [...new Set(bullets)].slice(0, 6);
  omitted += Math.max(0, new Set(bullets).size - selected.length);
  selected.forEach((line, index) =>
    blocks.push({
      id: `simulation-${index}`,
      heading: index === 0 ? "Accounting Simulation Projects" : undefined,
      lines: [
        ...(index === 0
          ? ["Debit & Credit - Training simulations, not employment"]
          : []),
        "• " + brief(line, 220),
      ],
    }),
  );
  const courses = select(
    [...(portfolio?.courses ?? [])]
      .filter((row) => row.status !== "not-started")
      .sort(
        (a, b) =>
          Number(b.status === "completed") - Number(a.status === "completed") ||
          b.date.localeCompare(a.date) ||
          b.updatedAt.localeCompare(a.updatedAt),
      ),
    6,
    (row) => `${row.titleEn || row.title} ${row.providerEn || row.provider}`,
  );
  courses.forEach((row, index) =>
    blocks.push({
      id: `course-${row.id}`,
      heading: index === 0 ? "Courses (self-reported)" : undefined,
      lines: [
        `${brief(row.titleEn || row.title, 100)} | ${brief(row.providerEn || row.provider, 100)}${row.date ? ` | ${row.date}` : ""} | ${row.status === "completed" ? "Completed" : "In progress"}`,
      ],
    }),
  );
  const certificates = select(
    [...(portfolio?.certificates ?? [])].sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt),
    ),
    4,
    (row) => `${row.title} ${row.issuer}`,
  );
  certificates.forEach((row, index) =>
    blocks.push({
      id: `certificate-${row.id}`,
      heading: index === 0 ? "Certificates (self-reported)" : undefined,
      lines: [
        `${brief(row.title, 100)} | ${brief(row.issuer, 100)}${row.date ? ` | ${row.date}` : ""}`,
      ],
    }),
  );
  const links = [profile.linkedIn, profile.portfolio].filter(Boolean);
  if (links.length)
    blocks.push({ id: "links", heading: "Professional Links", lines: links });
  const languages = select(profile.languages, 6, (row) => row);
  if (languages.length)
    blocks.push({
      id: "languages",
      heading: "Languages",
      lines: [languages.join(" | ")],
    });
  // Conservative content budget reserves space for headings/line wrapping at
  // readable print size. Excess items remain on the profile, not deleted.
  const order = (block: CvBlock) => {
    const id = block.id;
    if (id === "contact") return 0;
    if (id === "summary") return 1;
    if (id.startsWith("experience-")) return 2;
    if (id.startsWith("simulation-")) return 3;
    if (id.startsWith("education-")) return 4;
    if (id === "skills" || id === "practice") return 5;
    if (id.startsWith("course-")) return 6;
    if (id.startsWith("certificate-")) return 7;
    if (id === "languages") return 8;
    return 9;
  };
  blocks.sort((a, b) => order(a) - order(b));
  let budget = 78;
  const kept = blocks.filter((block) => {
    const cost =
      (block.heading ? 3 : 1) +
      block.lines.reduce(
        (sum, line) => sum + Math.max(1, Math.ceil(line.length / 68)),
        0,
      ) + (block.header ? 4 : 0);
    if (cost <= budget || block.header) {
      budget -= cost;
      return true;
    }
    omitted++;
    return false;
  });
  return { blocks: kept, plainText: blocksText(kept), omitted, needsEnglish };
}
export function blocksText(blocks: CvBlock[]) {
  return blocks
    .map((block) =>
      [
        ...(block.heading ? [block.heading.toUpperCase()] : []),
        ...block.lines,
      ].join("\n"),
    )
    .join("\n\n");
}

// Measurements are taken at the same fixed A4 content width used in print,
// independent of the mobile screen. Never clip text or reduce the font size.
export function paginateCv(
  blocks: CvBlock[],
  heights: number[],
  maxHeight: number,
) {
  const pages: CvBlock[][] = [[]];
  let used = 0,
    omitted = 0;
  blocks.forEach((block, index) => {
    const height = heights[index] ?? maxHeight + 1;
    if (height > maxHeight) {
      omitted++;
      return;
    }
    if (used + height > maxHeight) {
      if (pages.length === 2) {
        omitted++;
        return;
      }
      pages.push([]);
      used = 0;
    }
    pages.at(-1)!.push(block);
    used += height;
  });
  return { pages: pages.filter((page) => page.length), omitted };
}
