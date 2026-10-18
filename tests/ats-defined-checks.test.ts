import { describe, expect, it } from "vitest";
import { evaluateAtsCv } from "@/lib/career/ats";
import { blocksText, type CompactCv } from "@/lib/career/compact-cv";

function sample(): CompactCv {
  const blocks = [
    { id: "contact", header: true, lines: ["Candidate Name", "Junior Accountant", "candidate@example.test"] },
    { id: "summary", heading: "Professional Summary", lines: ["Saved factual summary."] },
    { id: "skills", heading: "Relevant Skills", lines: ["Journal Entries"] },
  ];
  return { blocks, plainText: blocksText(blocks), omitted: 0, needsEnglish: 0 };
}

describe("defined platform ATS checks", () => {
  it("passes only an actual valid six-check structural sample", () => {
    const result = evaluateAtsCv(sample());
    expect(result).toMatchObject({ passed: 6, total: 6, score: 100 });
  });
  it("lowers the score and exposes each failed check", () => {
    const cv = sample();
    cv.blocks = cv.blocks.filter((block) => block.id !== "skills");
    cv.blocks[0].lines[2] = "no email";
    cv.plainText = blocksText(cv.blocks);
    const result = evaluateAtsCv(cv);
    expect(result.score).toBe(67);
    expect(result.checks.filter((check) => !check.passed).map((check) => check.id)).toEqual(["readable-text", "available-keywords"]);
  });
  it("rejects an untranslated document and duplicate section ids", () => {
    const cv = sample();
    cv.blocks.push({ id: "skills", heading: "Relevant Skills", lines: ["مهارة"] });
    cv.plainText = blocksText(cv.blocks);
    const result = evaluateAtsCv(cv);
    expect(result.checks.find((check) => check.id === "readable-text")?.passed).toBe(false);
    expect(result.checks.find((check) => check.id === "simple-format")?.passed).toBe(false);
  });
});
