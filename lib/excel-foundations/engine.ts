/** A deliberately small spreadsheet dialect for the accounting lesson. No eval. */
export type SheetValue = number | "" | "#REF!" | "#NAME?" | "#VALUE!" | "#DIV/0!" | "#CIRC!";
export type Workbook = Record<string, string>;
export type ExcelStep = 1 | 2 | 3 | 4 | 5;

export const EXCEL_RULES = {
  stepXp: 20,
  stageXp: 100,
  finalBossXp: 200,
  accountingMastery: 80,
  excelMastery: 80,
} as const;

export const scenarios = [
  { cash: 50_000, receivables: 30_000, inventory: 20_000, equipment: 100_000, loan: 70_000, payables: 30_000, capital: 100_000 },
  { cash: 45_000, receivables: 35_000, inventory: 25_000, equipment: 110_000, loan: 65_000, payables: 25_000, capital: 125_000 },
  { cash: 60_000, receivables: 25_000, inventory: 30_000, equipment: 95_000, loan: 80_000, payables: 20_000, capital: 110_000 },
] as const;
export type Scenario = (typeof scenarios)[number];

const amounts = (scenario: Scenario) => ({
  B2: scenario.cash, B3: scenario.receivables, B4: scenario.inventory,
  B5: scenario.equipment, B8: scenario.loan, B9: scenario.payables,
  B10: scenario.capital,
});
const categories: Record<string, string> = {
  C2: "asset", C3: "asset", C4: "asset", C5: "asset",
  C8: "liability", C9: "liability", C10: "equity",
};
export const editableCells = ["B2", "B3", "B4", "B5", "B6", "B8", "B9", "B10", "B11", ...Object.keys(categories)] as const;

export function initialWorkbook(): Workbook {
  return { B2: "50000", B3: "30000", B4: "20000", B5: "100000", C2: "asset", C3: "asset", C4: "asset", C5: "asset" };
}
export function finalWorkbook(variant: number): Workbook {
  const scenario = scenarios[variant] ?? scenarios[0];
  const data = amounts(scenario);
  return {
    ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)])),
    ...categories,
    C8: "asset", // A planted classification error to be found and corrected.
    B6: "=SUM(B2:B4)",
    B11: "=SUM(B8:B9)",
  };
}

export function normalizeFormula(value: string) {
  return value.toUpperCase().replace(/\s/g, "").replace(/\$/g, "");
}
const error = (value: SheetValue): value is Exclude<SheetValue, number | ""> => typeof value === "string" && value.startsWith("#");
export function evaluateCell(cells: Workbook, address: string, trail: string[] = []): SheetValue {
  const cell = address.toUpperCase();
  if (!/^[A-D](?:[1-9]|1[0-5])$/.test(cell)) return "#REF!";
  if (trail.includes(cell)) return "#CIRC!";
  const raw = cells[cell] ?? "";
  if (!raw.trim()) return "";
  if (/^-?\d+(?:\.\d+)?$/.test(raw.trim())) return Number(raw);
  const expression = normalizeFormula(raw);
  if (!expression.startsWith("=")) return "#VALUE!";
  const source = expression.slice(1);
  const tokens = source.match(/SUM|[A-Z]+\d+|\d+(?:\.\d+)?|[()+\-*/:,]/g);
  if (!tokens || tokens.join("") !== source) return "#NAME?";
  let index = 0;
  const read = (ref: string) => evaluateCell(cells, ref, [...trail, cell]);
  function atom(): SheetValue {
    const token = tokens![index++];
    if (!token) return "#NAME?";
    if (token === "-") {
      const value = atom();
      return typeof value === "number" ? -value : value;
    }
    if (token === "(") {
      const value = addition();
      if (tokens![index++] !== ")") return "#NAME?";
      return value;
    }
    if (token === "SUM") {
      if (tokens![index++] !== "(") return "#NAME?";
      const from = tokens![index++];
      if (tokens![index++] !== ":") return "#NAME?";
      const to = tokens![index++];
      if (tokens![index++] !== ")" || !/^[A-D](?:[1-9]|1[0-5])$/.test(from ?? "") || !/^[A-D](?:[1-9]|1[0-5])$/.test(to ?? "")) return "#REF!";
      const firstColumn = from!.charCodeAt(0), lastColumn = to!.charCodeAt(0);
      const firstRow = Number(from!.slice(1)), lastRow = Number(to!.slice(1));
      if (firstColumn > lastColumn || firstRow > lastRow) return "#REF!";
      let sum = 0;
      for (let col = firstColumn; col <= lastColumn; col++) for (let row = firstRow; row <= lastRow; row++) {
        const value = read(`${String.fromCharCode(col)}${row}`);
        if (error(value)) return value;
        if (typeof value === "number") sum += value;
      }
      return sum;
    }
    if (/^[A-Z]+\d+$/.test(token)) return read(token);
    if (/^\d+(?:\.\d+)?$/.test(token)) return Number(token);
    return "#NAME?";
  }
  function multiplication(): SheetValue {
    let value = atom();
    while (tokens![index] === "*" || tokens![index] === "/") {
      const operator = tokens![index++], right = atom();
      if (error(value)) return value;
      if (error(right)) return right;
      if (value === "" || right === "") return "";
      if (operator === "/" && right === 0) return "#DIV/0!";
      value = operator === "*" ? Number(value) * Number(right) : Number(value) / Number(right);
    }
    return value;
  }
  function addition(): SheetValue {
    let value = multiplication();
    while (tokens![index] === "+" || tokens![index] === "-") {
      const operator = tokens![index++], right = multiplication();
      if (error(value)) return value;
      if (error(right)) return right;
      if (value === "" || right === "") return "";
      value = operator === "+" ? Number(value) + Number(right) : Number(value) - Number(right);
    }
    return value;
  }
  const result = addition();
  return index === tokens.length ? result : "#NAME?";
}

export interface Assessment {
  passed: boolean;
  score: number;
  accountingScore: number;
  excelScore: number;
  errors: string[];
  mastered: string[];
}
export function assessStep(step: ExcelStep, cells: Workbook, answers: Record<string, string>, variant = 0): Assessment {
  const scenario = step === 5 ? (scenarios[variant] ?? scenarios[0]) : scenarios[0];
  const data = amounts(scenario);
  const errors: string[] = [];
  const check = (condition: boolean, code: string) => { if (!condition) errors.push(code); };
  if (step === 1) {
    check(answers.cell === "B2", "select-B2");
    check(answers.concept === "cell", "cell-concept");
  }
  if (step === 2 || step === 5) {
    for (const [address, category] of Object.entries(categories)) check(cells[address] === category, `classification:${address}`);
    check(answers.loan === "liability", "loan-reasoning");
    check(answers.equation === "assets=liabilities+equity", "equation-reasoning");
  }
  if (step === 3 || step === 5) {
    for (const [address, value] of Object.entries(data)) check(Number(cells[address]) === value && String(cells[address] ?? "").trim() !== "", `amount:${address}`);
  }
  if (step === 4 || step === 5) {
    check(normalizeFormula(cells.B6 ?? "") === "=SUM(B2:B5)", "formula:B6");
    check(normalizeFormula(cells.B11 ?? "") === "=SUM(B8:B10)", "formula:B11");
    const assets = Object.values(data).slice(0, 4).reduce((a, b) => a + b, 0);
    check(evaluateCell(cells, "B6") === assets, "assets-total");
    check(evaluateCell(cells, "B11") === assets, "equation-balance");
  }
  if (step === 5) {
    check(answers.equipment === "asset-exchange", "transaction-reasoning");
    check(answers.balance === "not-proof", "balance-not-proof");
  }
  const accountingErrors = errors.filter((code) => code.startsWith("classification") || code.startsWith("amount") || code.includes("reasoning") || code === "balance-not-proof");
  const excelErrors = errors.filter((code) => !accountingErrors.includes(code));
  const accountingChecks = step === 5 ? 18 : step === 2 ? 9 : step === 3 ? 7 : 0;
  const excelChecks = step === 5 ? 4 : step === 4 ? 4 : step === 1 ? 2 : 0;
  const accountingScore = accountingChecks ? Math.max(0, Math.round((accountingChecks - accountingErrors.length) / accountingChecks * 100)) : 100;
  const excelScore = excelChecks ? Math.max(0, Math.round((excelChecks - excelErrors.length) / excelChecks * 100)) : 100;
  const score = Math.round((accountingScore + excelScore) / 2);
  const passed = errors.length === 0 && accountingScore >= EXCEL_RULES.accountingMastery && excelScore >= EXCEL_RULES.excelMastery;
  return { passed, score, accountingScore, excelScore, errors, mastered: passed ? (step === 5 ? ["accounting-equation", "account-classification", "excel-formulas", "transaction-analysis"] : [`excel-foundations-step-${step}`]) : [] };
}

export interface ExcelProgress {
  version: 1;
  completedSteps: ExcelStep[];
  draft: Workbook;
  answers: Record<string, string>;
  variant: number;
  attempts: number;
  completedAt: string | null;
  finalScore: number | null;
  publicOptIn: boolean;
  nickname: string;
}
export function createExcelProgress(variant = 0): ExcelProgress {
  return { version: 1, completedSteps: [], draft: initialWorkbook(), answers: {}, variant, attempts: 0, completedAt: null, finalScore: null, publicOptIn: false, nickname: "" };
}
export function readExcelProgress(value: unknown, variant = 0): ExcelProgress {
  const base = createExcelProgress(variant);
  if (!value || typeof value !== "object") return base;
  const row = value as Partial<ExcelProgress>;
  if (row.version !== 1) return base;
  const completed: ExcelStep[] = [];
  for (const step of [1, 2, 3, 4, 5] as const) {
    if (!row.completedSteps?.includes(step)) break;
    completed.push(step);
  }
  const draft = Object.fromEntries(Object.entries(row.draft ?? {}).filter(([key, val]) => editableCells.includes(key as typeof editableCells[number]) && typeof val === "string" && val.length <= 80));
  const answers = Object.fromEntries(Object.entries(row.answers ?? {}).filter(([key, val]) => /^[a-z]+$/.test(key) && typeof val === "string" && val.length <= 80));
  return {
    ...base, completedSteps: completed, draft, answers,
    attempts: Number.isInteger(row.attempts) && (row.attempts ?? 0) >= 0 ? row.attempts! : 0,
    completedAt: completed.includes(5) && typeof row.completedAt === "string" ? row.completedAt : null,
    finalScore: completed.includes(5) && typeof row.finalScore === "number" ? row.finalScore : null,
    publicOptIn: row.publicOptIn === true,
    nickname: typeof row.nickname === "string" ? row.nickname.slice(0, 40) : "",
  };
}
export function earnedExcelXp(progress: ExcelProgress) {
  return progress.completedSteps.filter((step) => step < 5).length * EXCEL_RULES.stepXp + (progress.completedSteps.includes(5) ? EXCEL_RULES.stageXp + EXCEL_RULES.finalBossXp : 0);
}

export interface ArenaEntry {
  userId: string;
  nickname: string;
  completedAt: string;
  score: number;
  xp: number;
  completedStages: number;
}
export function rankArena(entries: ArenaEntry[]) {
  const sorted = [...entries].sort((a, b) =>
    b.completedStages - a.completedStages || b.xp - a.xp || b.score - a.score || a.completedAt.localeCompare(b.completedAt) || a.userId.localeCompare(b.userId));
  return sorted.map((entry, index) => {
    const previous = sorted[index - 1];
    const tied = previous && previous.completedStages === entry.completedStages && previous.xp === entry.xp && previous.score === entry.score;
    const priorRank = index > 0 ? sorted.findIndex((other) => other.completedStages === entry.completedStages && other.xp === entry.xp && other.score === entry.score) + 1 : 1;
    return { ...entry, rank: tied ? priorRank : index + 1 };
  });
}
