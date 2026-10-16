import { describe, expect, it, vi } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import JSZip from "jszip";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createDefaultProfile } from "@/lib/career/repository";
import { buildCv } from "@/lib/career/cv";
import { compactCv } from "@/lib/career/compact-cv";
import { scoreCvReadiness } from "@/lib/career/ats";
import { emptyPortfolio } from "@/lib/career/portfolio";
import type { CareerProfile, SkillResult } from "@/lib/career/model";

vi.mock("server-only", () => ({}));
import {
  exportAccountCv,
  validateCvExport,
} from "@/lib/server/profiles/cv-export";

const course = {
  id: "course-1",
  title: "Excel Accounting",
  provider: "Accounting Institute",
  status: "completed" as const,
  date: "2026-10",
  notes: "Private course notes never go in a CV",
  updatedAt: "2026-10-15T10:00:00Z",
};
const profile = (): CareerProfile => ({
  ...createDefaultProfile("Alice Accountant"),
  localCandidateId: "alice",
  email: "alice@example.test",
  phone: "+201000000001",
  country: "Egypt",
  location: "Cairo",
  education: [
    {
      id: "edu",
      institution: "Cairo University",
      degree: "Bachelor",
      field: "Accounting",
      graduationYear: "2026",
    },
  ],
  languages: ["English", "Arabic"],
});
const skill: SkillResult = {
  skillId: "journal-entries",
  status: "demonstrated",
  score: 89,
  confidence: "strong",
  evidenceCount: 2,
  uniqueActivities: 2,
  successfulActivities: 2,
};
function fixture(withSkill = true) {
  const p = profile();
  const cv = buildCv(
    p,
    withSkill ? [skill] : [],
    [],
    "junior-accountant",
  );
  const compact = compactCv(p, cv, {
    ...emptyPortfolio,
    courses: [course],
  });
  return {
    profile: p,
    cv,
    compact,
    plainText: compact.plainText,
    readiness: scoreCvReadiness(p, cv, compact),
  };
}

describe("account CV readiness and real downloads", () => {
  it("uses fixed 100-point transparent dimensions and responds to factual changes", () => {
    const withEvidence = fixture();
    const withoutEvidence = fixture(false);
    expect(
      withEvidence.readiness.dimensions.reduce((sum, row) => sum + row.max, 0),
    ).toBe(100);
    expect(
      withEvidence.readiness.dimensions.reduce(
        (sum, row) => sum + row.points,
        0,
      ),
    ).toBe(withEvidence.readiness.score);
    expect(withEvidence.readiness.score).toBeGreaterThan(
      withoutEvidence.readiness.score,
    );
    expect(
      withEvidence.readiness.dimensions.find((row) => row.id === "practical-work")
        ?.points,
    ).toBe(0);
    expect(
      withEvidence.readiness.dimensions.find((row) => row.id === "learning")
        ?.points,
    ).toBe(5);
  });

  it("does not fabricate a name and blocks untranslated English CV exports", () => {
    const missing = fixture();
    missing.profile.fullName = "";
    missing.compact = compactCv(missing.profile, missing.cv);
    expect(missing.compact.plainText).not.toContain("Your Name");
    expect(validateCvExport(missing)).toBe("CV_CONTACT_INCOMPLETE");
    const untranslated = fixture();
    untranslated.profile.fullName = "أليس";
    untranslated.compact = compactCv(untranslated.profile, untranslated.cv);
    expect(validateCvExport(untranslated)).toBe("CV_NEEDS_ENGLISH");
  });

  it("exports actual A4 searchable PDF and Office OOXML with the same factual course", async () => {
    const data = fixture();
    expect(validateCvExport(data)).toBeNull();
    const pdf = await exportAccountCv(data, "pdf");
    const word = await exportAccountCv(data, "docx");
    const text = await exportAccountCv(data, "txt");
    if (process.env.CV_EXPORT_WRITE_FIXTURE === "1") {
      const directory = join(process.cwd(), "artifacts", "cv-export-qa");
      mkdirSync(directory, { recursive: true });
      writeFileSync(join(directory, "synthetic-accounting-cv.pdf"), pdf.bytes);
      writeFileSync(join(directory, "synthetic-accounting-cv.docx"), word.bytes);
      writeFileSync(join(directory, "synthetic-accounting-cv.txt"), text.bytes);
      writeFileSync(join(directory, "synthetic-accounting-cv-blocks.json"), JSON.stringify(data.compact.blocks));
    }
    expect(pdf.bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(word.bytes.subarray(0, 2).toString()).toBe("PK");
    expect(text.bytes.toString()).toContain("Excel Accounting");
    expect(pdf.contentType).toBe("application/pdf");
    expect(word.contentType).toContain("officedocument.wordprocessingml");
    expect(pdf.filename).toBe("alice-accountant-accounting-cv.pdf");

    const loadingPdf = getDocument({ data: new Uint8Array(pdf.bytes) });
    const parsedPdf = await loadingPdf.promise;
    expect(parsedPdf.numPages).toBeGreaterThan(0);
    expect(parsedPdf.numPages).toBeLessThanOrEqual(2);
    const extracted: string[] = [];
    for (let index = 1; index <= parsedPdf.numPages; index++) {
      const page = await parsedPdf.getPage(index);
      const content = await page.getTextContent();
      extracted.push(
        content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" "),
      );
    }
    const pdfText = extracted.join(" ");
    expect(pdfText).toContain("Alice Accountant");
    expect(pdfText).toContain("alice@example.test");
    expect(pdfText).toContain("Cairo University");
    expect(pdfText).toContain("Excel Accounting");
    expect(pdfText.indexOf("PROFESSIONAL SUMMARY")).toBeLessThan(
      pdfText.indexOf("EDUCATION"),
    );
    expect(pdfText).not.toMatch(/private course notes|photo|QR code/i);
    await loadingPdf.destroy();

    const archive = await JSZip.loadAsync(word.bytes);
    const xml = await archive.file("word/document.xml")!.async("string");
    const wordText = new DOMParser()
      .parseFromString(xml, "application/xml")
      .documentElement.textContent ?? "";
    expect(wordText).toContain("Alice Accountant");
    expect(wordText).toContain("alice@example.test");
    expect(wordText).toContain("Cairo University");
    expect(wordText).toContain("Excel Accounting");
    expect(wordText.indexOf("PROFESSIONAL SUMMARY")).toBeLessThan(
      wordText.indexOf("EDUCATION"),
    );
    expect(xml).not.toMatch(/<w:tbl|<w:drawing|<w:pict/);
    expect(Object.keys(archive.files).filter((path) => path.startsWith("word/media/")))
      .toEqual([]);
    expect(wordText).not.toMatch(/private course notes|photo|QR code/i);
  });

  it("curates a dense saved profile without deleting records or spilling the PDF past two A4 pages", async () => {
    const data = fixture();
    data.profile.experience = Array.from({ length: 5 }, (_, index) => ({
      id: `experience-${index}`,
      company: `Fixture Company ${index + 1}`,
      title: `Accounting Assistant ${index + 1}`,
      startDate: "2024-01",
      endDate: "2025-06",
      current: false,
      description:
        "Recorded source documents, reconciled account balances and prepared review notes for an actual saved experience entry. ".repeat(4),
    }));
    data.profile.education.push({
      id: "edu-2",
      institution: "Training College",
      degree: "Diploma",
      field: "Bookkeeping",
      graduationYear: "2024",
    });
    const courses = Array.from({ length: 20 }, (_, index) => ({
      ...course,
      id: `course-${index}`,
      title: `Accounting Course ${index + 1}`,
    }));
    const certificates = Array.from({ length: 8 }, (_, index) => ({
      id: `certificate-${index}`,
      title: `Accounting Certificate ${index + 1}`,
      issuer: "Training College",
      credentialId: "",
      date: "2026-09",
      updatedAt: "2026-10-15T10:00:00Z",
      width: 512,
      height: 512,
    }));
    const completePortfolio = { ...emptyPortfolio, courses, certificates };
    const sourceBefore = JSON.stringify({ profile: data.profile, portfolio: completePortfolio });
    data.cv = buildCv(data.profile, [skill], [], "junior-accountant");
    data.compact = compactCv(data.profile, data.cv, completePortfolio);
    data.plainText = data.compact.plainText;
    data.readiness = scoreCvReadiness(data.profile, data.cv, data.compact);
    expect(data.compact.omitted).toBeGreaterThan(0);
    expect(JSON.stringify({ profile: data.profile, portfolio: completePortfolio })).toBe(sourceBefore);
    const pdf = await exportAccountCv(data, "pdf");
    const word = await exportAccountCv(data, "docx");
    if (process.env.CV_EXPORT_WRITE_FIXTURE === "1") {
      const directory = join(process.cwd(), "artifacts", "cv-export-qa");
      mkdirSync(directory, { recursive: true });
      writeFileSync(join(directory, "synthetic-dense-accounting-cv.pdf"), pdf.bytes);
      writeFileSync(join(directory, "synthetic-dense-accounting-cv.docx"), word.bytes);
      writeFileSync(join(directory, "synthetic-dense-accounting-cv.txt"), data.compact.plainText);
      writeFileSync(join(directory, "synthetic-dense-accounting-cv-blocks.json"), JSON.stringify(data.compact.blocks));
    }
    const loading = getDocument({ data: new Uint8Array(pdf.bytes) });
    const parsed = await loading.promise;
    expect(parsed.numPages).toBeLessThanOrEqual(2);
    expect(parsed.numPages).toBeGreaterThan(0);
    const archive = await JSZip.loadAsync(word.bytes);
    const xml = await archive.file("word/document.xml")!.async("string");
    const wordText = new DOMParser().parseFromString(xml, "application/xml").documentElement.textContent ?? "";
    expect(wordText).toContain("Fixture Company");
    expect(wordText).not.toContain("Accounting Course 20");
    expect(xml).not.toMatch(/<w:tbl|<w:drawing|<w:pict/);
    expect(Object.keys(archive.files).filter((path) => path.startsWith("word/media/"))).toEqual([]);
    await loading.destroy();
  });
});
