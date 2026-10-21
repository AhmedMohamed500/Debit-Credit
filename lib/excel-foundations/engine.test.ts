import { describe, expect, it } from "vitest";
import { assessStep, createExcelProgress, earnedExcelXp, evaluateCell, finalWorkbook, initialWorkbook, rankArena, readExcelProgress, scenarios } from "./engine";

describe("Excel Foundations workbook", () => {
  it("evaluates references, arithmetic and SUM without arbitrary execution", () => {
    const cells = { ...initialWorkbook(), B6: "=SUM(B2:B5)", B8: "=B6/2", B9: "=B8+200" };
    expect(evaluateCell(cells, "B6")).toBe(200000);
    expect(evaluateCell(cells, "B8")).toBe(100000);
    expect(evaluateCell(cells, "B9")).toBe(100200);
    expect(evaluateCell({ B2: "=process.exit(1)" }, "B2")).toBe("#NAME?");
    expect(evaluateCell({ B2: "=SUM(Z2:Z5)" }, "B2")).toBe("#REF!");
    expect(evaluateCell({ B2: "=B3", B3: "=B2" }, "B2")).toBe("#CIRC!");
    expect(evaluateCell({ B2: "=1/0" }, "B2")).toBe("#DIV/0!");
  });
  it("requires cell meaning and correct accounting categories", () => {
    expect(assessStep(1, initialWorkbook(), { cell: "B2", concept: "cell" }).passed).toBe(true);
    expect(assessStep(1, initialWorkbook(), { cell: "A2", concept: "row" }).passed).toBe(false);
    const classified = { ...initialWorkbook(), C8: "liability", C9: "liability", C10: "equity" };
    expect(assessStep(2, classified, { loan: "liability", equation: "assets=liabilities+equity" }).passed).toBe(true);
    expect(assessStep(2, { ...classified, C8: "asset" }, { loan: "liability", equation: "assets=liabilities+equity" }).passed).toBe(false);
  });
  it("assesses amounts and formulas rather than trusting submitted scores", () => {
    const cells = { ...initialWorkbook(), B8: "70000", B9: "30000", B10: "100000" };
    expect(assessStep(3, cells, {}).passed).toBe(true);
    expect(assessStep(3, { ...cells, B8: "80000" }, {}).passed).toBe(false);
    expect(assessStep(4, { ...cells, B6: "=SUM(B2:B5)", B11: "=SUM(B8:B10)" }, {}).passed).toBe(true);
    expect(assessStep(4, { ...cells, B6: "=200000", B11: "=200000" }, {}).passed).toBe(false);
  });
  it("uses different final variants with planted errors and reasoning", () => {
    for (let variant = 0; variant < scenarios.length; variant++) {
      const broken = finalWorkbook(variant);
      const answers = { loan: "liability", equation: "assets=liabilities+equity", equipment: "asset-exchange", balance: "not-proof" };
      expect(assessStep(5, broken, answers, variant).passed).toBe(false);
      const fixed = { ...broken, C8: "liability", B6: "=SUM(B2:B5)", B11: "=SUM(B8:B10)" };
      const result = assessStep(5, fixed, answers, variant);
      expect(result.passed).toBe(true);
      expect(result.accountingScore).toBe(100);
      expect(result.excelScore).toBe(100);
      expect(assessStep(5, { ...fixed, B5: "1" }, answers, variant).passed).toBe(false);
    }
  });
});

describe("Excel progress and real rankings", () => {
  it("does not create achievement or XP from malformed client progress", () => {
    const recovered = readExcelProgress({ version: 1, completedSteps: [5], finalScore: 100, completedAt: "today" });
    expect(recovered.completedSteps).toEqual([]);
    expect(earnedExcelXp(recovered)).toBe(0);
    expect(earnedExcelXp(createExcelProgress())).toBe(0);
  });
  it("sorts verified entries deterministically and never invents participants", () => {
    expect(rankArena([])).toEqual([]);
    const ranked = rankArena([
      { userId: "b", nickname: "B", completedAt: "2026-10-20T10:00:00Z", score: 100, xp: 180, completedStages: 1 },
      { userId: "a", nickname: "A", completedAt: "2026-10-19T10:00:00Z", score: 100, xp: 180, completedStages: 1 },
    ]);
    expect(ranked.map((entry) => [entry.nickname, entry.rank])).toEqual([["A", 1], ["B", 1]]);
  });
});
