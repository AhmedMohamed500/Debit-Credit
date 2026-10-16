import { roleCatalog, skillCatalog } from "./catalog";
import type { CareerProfile, CvDocument } from "./model";
import type { CompactCv } from "./compact-cv";
export interface AtsFormatCheck {
  id:
    | "single-column"
    | "standard-headings"
    | "contact"
    | "duplicate-bullets"
    | "bullet-length"
    | "selectable-text"
    | "supported-keywords";
  passed: boolean;
  message: string;
}
export function cvToPlainText(profile: CareerProfile, cv: CvDocument) {
  const lines = [
    profile.fullName,
    cv.headline,
    [profile.email, profile.phone, profile.location, profile.country]
      .filter(Boolean)
      .join(" | "),
    "",
    "PROFESSIONAL SUMMARY",
    cv.summary,
    "",
    "TARGET ROLE",
    roleCatalog[cv.targetRoleId].label.en,
    "",
    "CORE ACCOUNTING SKILLS",
    ...cv.coreSkills.map((item) => skillCatalog[item.skillId].label.en),
    ...(cv.practiceSkills.length
      ? [
          "",
          "ACCOUNTING PRACTICE",
          ...cv.practiceSkills.map(
            (item) => skillCatalog[item.skillId].label.en,
          ),
        ]
      : []),
    ...(cv.simulationBullets.length
      ? [
          "",
          "ACCOUNTING SIMULATION EXPERIENCE",
          "Mizan Trading — Practical Simulation",
          ...cv.simulationBullets.map((item) => `• ${item.text}`),
        ]
      : []),
    ...(profile.education.length
      ? [
          "",
          "EDUCATION",
          ...profile.education.map(
            (item) =>
              `${item.degree}${item.field ? ` — ${item.field}` : ""} | ${item.institution}${item.graduationYear ? ` | ${item.graduationYear}` : ""}`,
          ),
        ]
      : []),
    ...(profile.experience.length
      ? [
          "",
          "EXPERIENCE",
          ...profile.experience.map(
            (item) =>
              `${item.title} | ${item.company} | ${item.startDate} - ${item.current ? "Present" : item.endDate}\n${item.description}`,
          ),
        ]
      : []),
    ...([profile.linkedIn, profile.portfolio].some(Boolean)
      ? ["", "LINKS", ...[profile.linkedIn, profile.portfolio].filter(Boolean)]
      : []),
    ...(profile.languages.length
      ? ["", "LANGUAGES", profile.languages.join(" | ")]
      : []),
  ];
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
export function checkAtsFormat(
  profile: CareerProfile,
  cv: CvDocument,
): AtsFormatCheck[] {
  const bullets = cv.simulationBullets.map((item) => item.text.trim()),
    normalized = bullets.map((item) => item.toLowerCase()),
    keywords = new Set(
      [...cv.coreSkills, ...cv.practiceSkills].map((item) =>
        skillCatalog[item.skillId].label.en.toLowerCase(),
      ),
    );
  return [
    {
      id: "single-column",
      passed: true,
      message: "Generated CV uses one reading column.",
    },
    {
      id: "standard-headings",
      passed:
        cv.sections.includes("contact") &&
        cv.sections.includes("summary") &&
        cv.sections.includes("skills"),
      message: "Standard contact, summary and skills headings are present.",
    },
    {
      id: "contact",
      passed: Boolean(profile.fullName && profile.email),
      message: "Full name and email are present.",
    },
    {
      id: "duplicate-bullets",
      passed: new Set(normalized).size === normalized.length,
      message: "Simulation bullets are unique.",
    },
    {
      id: "bullet-length",
      passed: bullets.every((item) => item.length <= 220),
      message: "Simulation bullets stay within 220 characters.",
    },
    {
      id: "selectable-text",
      passed: true,
      message: "Export is text, not a flattened image.",
    },
    {
      id: "supported-keywords",
      passed: keywords.size > 0,
      message: "Keywords come from evidence-backed skills or saved experience.",
    },
  ];
}

export type CvReadinessDimension = {
  id:
    | "format"
    | "contact"
    | "english"
    | "summary"
    | "education"
    | "skills"
    | "practical-work"
    | "learning";
  label: string;
  points: number;
  max: number;
  detail: string;
  fixHref?: string;
};
export type CvReadiness = {
  score: number;
  max: 100;
  dimensions: CvReadinessDimension[];
  formatChecksPassed: number;
  formatChecksTotal: number;
  missingEnglish: number;
};

/**
 * A transparent document-completeness checklist, never an employer ATS score.
 * The generated downloads have a fixed single-column, searchable-text layout.
 * Paid employment is optional: accepted labeled simulations can earn all
 * practical-work points, which avoids penalising students for being students.
 */
export function scoreCvReadiness(
  profile: CareerProfile,
  cv: CvDocument,
  compact: CompactCv,
): CvReadiness {
  const hasBlock = (prefix: string) =>
    compact.blocks.some((block) => block.id === prefix || block.id.startsWith(prefix + "-"));
  const text = compact.plainText;
  const formatChecks = [
    true, // One reading column is enforced by the renderer.
    true, // PDF and DOCX are actual selectable text, not an image.
    hasBlock("summary"), // Standard heading in the projection.
    new Set(compact.blocks.map((block) => block.id)).size === compact.blocks.length &&
      !text.includes("Your Name"),
  ];
  const englishRequired = [
    profile.fullName,
    profile.headline,
    profile.summary,
    profile.location,
    profile.country,
  ].filter(Boolean);
  const needsEnglish =
    compact.needsEnglish +
    englishRequired.filter((value) => /[\u0600-\u06ff]/u.test(value)).length;
  const contactText = compact.blocks.find((block) => block.id === "contact")?.lines.join(" ") ?? "";
  const contactPoints =
    (profile.fullName.trim() && contactText.includes(profile.fullName.trim()) ? 5 : 0) +
    (profile.email.trim() && contactText.includes(profile.email.trim()) ? 5 : 0) +
    (profile.phone.trim() && contactText.includes(profile.phone.trim()) ? 5 : 0) +
    ([profile.location, profile.country].some((value) => value.trim() && contactText.includes(value.trim())) ? 5 : 0);
  const coreSkillsShown = hasBlock("skills") && cv.coreSkills.length > 0;
  const practiceSkillsShown = hasBlock("practice") && cv.practiceSkills.length > 0;
  const distinctPracticalBullets = compact.blocks.filter((block) => block.id.startsWith("simulation-")).length;
  const experienceCount = compact.blocks.filter((block) => block.id.startsWith("experience-")).length;
  const practicalPoints =
    experienceCount > 0 || distinctPracticalBullets >= 2
      ? 10
      : distinctPracticalBullets === 1
        ? 5
        : 0;
  const learningCount = compact.blocks.filter(
    (block) => block.id.startsWith("course-") || block.id.startsWith("certificate-"),
  ).length;
  const dimensions: CvReadinessDimension[] = [
    {
      id: "format",
      label: "Readable ATS structure",
      points: formatChecks.filter(Boolean).length * 5,
      max: 20,
      detail: "Single column, selectable text, standard headings and no duplicate sections.",
    },
    {
      id: "contact",
      label: "Contact details",
      points: contactPoints,
      max: 20,
      detail: "Five points each for name, email, phone and location.",
      fixHref: "/student-profile",
    },
    {
      id: "english",
      label: "English-ready content",
      points: needsEnglish ? 0 : englishRequired.length ? 10 : 0,
      max: 10,
      detail: needsEnglish
        ? "Some saved names or titles need an English version; no translation was invented."
        : "Selected text contains no untranslated Arabic fields.",
      fixHref: "/student-profile",
    },
    {
      id: "summary",
      label: "Professional summary",
      points: hasBlock("summary") && compact.blocks.some((block) => block.id === "summary" && block.lines.some((line) => line.trim())) ? 10 : 0,
      max: 10,
      detail: "A concise, factual summary tied to the selected accounting role.",
      fixHref: "/career-profile/edit",
    },
    {
      id: "education",
      label: "Education",
      points: hasBlock("education") ? 10 : 0,
      max: 10,
      detail: "A saved education record with English degree and institution.",
      fixHref: "/student-profile",
    },
    {
      id: "skills",
      label: "Evidence-supported skills",
      points: coreSkillsShown ? 15 : practiceSkillsShown ? 7 : 0,
      max: 15,
      detail: "Demonstrated/verified skills earn full points; practiced skills earn partial points.",
      fixHref: "/career-profile/skills",
    },
    {
      id: "practical-work",
      label: "Factual experience or simulation",
      points: practicalPoints,
      max: 10,
      detail: "Actual self-reported employment or accepted, explicitly labeled simulation work.",
      fixHref: "/game/first-shift",
    },
    {
      id: "learning",
      label: "Saved relevant learning",
      points: learningCount ? 5 : 0,
      max: 5,
      detail: "At least one saved course or certificate; self-reported items do not verify a skill.",
      fixHref: "/career-profile#courses",
    },
  ];
  return {
    score: dimensions.reduce((sum, row) => sum + row.points, 0),
    max: 100,
    dimensions,
    formatChecksPassed: formatChecks.filter(Boolean).length,
    formatChecksTotal: formatChecks.length,
    missingEnglish: needsEnglish,
  };
}
