import { describe, it, expect } from "vitest";
import { compactCv, paginateCv } from "@/lib/career/compact-cv";
import { buildCv } from "@/lib/career/cv";
import { createDefaultProfile } from "@/lib/career/repository";
import { emptyPortfolio } from "@/lib/career/portfolio";
import { calculatePassport } from "@/lib/career/evidence";
import {
  emptyStudentState,
  gradeStudent,
  stepIds,
  studentEvidence,
} from "@/lib/student/unit";

const profile = {
  ...createDefaultProfile("Accounting Candidate"),
  email: "candidate@fixture.test",
  languages: ["English", "Arabic"],
};
const course = {
  id: "one",
  title: "Excel for Accountants",
  provider: "University",
  date: "2026-10",
  status: "completed" as const,
  notes: "x".repeat(1000),
  updatedAt: "2026-10-11",
};
describe("Concise linked CV", () => {
  it("uses explicit English CV names without overwriting Arabic profile titles or inventing translations", () => {
    const portfolio = {
      ...emptyPortfolio,
      courses: [
        {
          ...course,
          title: "إكسل للمحاسبين",
          provider: "جامعة التدريب",
          titleEn: "Excel for Accountants",
          providerEn: "Training University",
        },
      ],
    };
    const result = compactCv(
      profile,
      buildCv(profile, [], [], "junior-accountant"),
      portfolio,
    );
    expect(result.plainText).toContain(
      "Excel for Accountants | Training University",
    );
    expect(result.needsEnglish).toBe(0);
    expect(portfolio.courses[0].title).toBe("إكسل للمحاسبين");
  });
  it("includes actual course status and certificate metadata, not images or unsupported skills", () => {
    const cv = buildCv(profile, calculatePassport([]), [], "junior-accountant");
    const compact = compactCv(profile, cv, {
      ...emptyPortfolio,
      courses: [
        course,
        {
          ...course,
          id: "two",
          title: "Financial Reporting",
          status: "in-progress",
        },
        {
          ...course,
          id: "three",
          title: "Planned Training",
          status: "not-started",
        },
      ],
      certificates: [
        {
          id: "cert",
          title: "Bookkeeping Certificate",
          issuer: "University",
          date: "2026-09",
          credentialId: "private-reference",
          updatedAt: "2026-10-11",
          width: 512,
          height: 512,
        },
      ],
    });
    expect(compact.plainText).toContain(
      "Excel for Accountants | University | 2026-10 | Completed",
    );
    expect(compact.plainText).toContain(
      "Financial Reporting | University | 2026-10 | In progress",
    );
    expect(compact.plainText).toContain("COURSES (SELF-REPORTED)");
    expect(compact.plainText).toContain("Bookkeeping Certificate");
    expect(compact.plainText).not.toMatch(
      /Planned Training|private-reference|data:image|xxx|No Demonstrated|qualifying cases|TARGET ROLE/,
    );
    expect(cv.coreSkills).toEqual([]);
    expect(cv.simulationBullets).toEqual([]);
  });
  it("keeps saved records unchanged while transparently curating long/Arabic records", () => {
    const courses = Array.from({ length: 20 }, (_, i) => ({
      ...course,
      id: String(i),
      title: "Course " + i,
    }));
    courses.push({ ...course, id: "ar", title: "محاسبة" });
    const portfolio = { ...emptyPortfolio, courses };
    const before = JSON.stringify(portfolio);
    const compact = compactCv(
      { ...profile, summary: "Words ".repeat(200) },
      buildCv(
        { ...profile, summary: "Words ".repeat(200) },
        [],
        [],
        "junior-accountant",
      ),
      portfolio,
    );
    expect(
      compact.blocks.filter((block) => block.id.startsWith("course-")),
    ).toHaveLength(6);
    expect(compact.needsEnglish).toBe(1);
    expect(compact.omitted).toBe(14);
    expect(JSON.stringify(portfolio)).toBe(before);
    expect(compact.plainText).not.toMatch(/[\u0600-\u06ff]/u);
    expect(compact.plainText.length).toBeLessThan(1800);
  });
  it("groups six accepted journals into one outcome and retains distinct accounting work", () => {
    const answers = [
      { action: "hold-duplicate" },
      { debit: "cash", credit: "capital", amount: 100000 },
      { debit: "equipment", credit: "cash", amount: 20000 },
      { debit: "inventory", credit: "payable", amount: 15000 },
      { debit: "receivable", credit: "revenue", amount: 12000 },
      { debit: "cash", credit: "receivable", amount: 7000 },
      { debit: "rent", credit: "cash", amount: 3000 },
      { amount: 84000 },
      { debitTotal: 127000, creditTotal: 127000 },
      { action: "reclassify-equipment" },
      { formula: "=SUM(C2:C9)", differenceFormula: "=C10-D10" },
    ];
    let state = emptyStudentState();
    const evidence = [];
    for (const [index, step] of stepIds.entries()) {
      state = gradeStudent(
        state,
        { revision: 0, step, answer: answers[index] },
        "2026-10-11T00:00:00Z",
      ).state;
      evidence.push(
        ...studentEvidence("candidate", state, step, "2026-10-11T00:00:00Z"),
      );
    }
    const cv = buildCv(
      profile,
      calculatePassport(evidence),
      evidence,
      "junior-accountant",
    );
    const result = compactCv(profile, cv);
    expect(
      result.blocks.filter((block) => block.id.startsWith("simulation-")),
    ).toHaveLength(6);
    expect(result.plainText).toContain("six source-linked journal entries");
    expect(result.plainText).toContain("trial balance");
    expect(result.plainText).toContain("SUM");
    expect(result.plainText).not.toContain("professional certification");
    expect(cv.simulationBullets).toHaveLength(11);
  });
  it("paginates at actual measured boundaries without exceeding two pages or clipping", () => {
    const blocks = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      lines: ["real content"],
    }));
    const result = paginateCv(blocks, [40, 40, 40, 40, 40, 40, 40, 40], 100);
    expect(result.pages.map((page) => page.length)).toEqual([2, 2]);
    expect(result.omitted).toBe(4);
    expect(
      paginateCv(blocks, [20, 20, 20, 20, 20, 20, 20, 20], 100).pages,
    ).toHaveLength(2);
    expect(
      paginateCv(blocks, [120, 20, 20, 20, 20, 20, 20, 20], 100).omitted,
    ).toBe(1);
  });
});
