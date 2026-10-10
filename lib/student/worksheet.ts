// Deliberately bounded training formulas, not JavaScript or a full Excel engine.
export type SheetResult =
  number | "#REF!" | "#NAME?" | "#VALUE!" | "#CIRC!" | "";
export function normalizeSheetFormula(value: string) {
  return value
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/\$?([CD])\$?(\d{1,2})/g, "$1$2");
}
export function calculateSheetCell(
  cells: Record<string, number | string>,
  address: string,
  trail: string[] = [],
): SheetResult {
  if (trail.includes(address)) return "#CIRC!";
  if (!Object.hasOwn(cells, address)) return "#REF!";
  const source = cells[address];
  if (typeof source === "number") return source;
  if (!source.trim()) return "";
  const expression = normalizeSheetFormula(source);
  if (/^-?\d+(\.\d+)?$/.test(expression)) return Number(expression);
  const read = (cell: string) =>
    calculateSheetCell(cells, cell, [...trail, address]);
  const sum = /^=SUM\(([CD])(\d{1,2}):([CD])(\d{1,2})\)$/.exec(expression);
  if (sum) {
    const [, column, first, lastColumn, last] = sum;
    if (column !== lastColumn || Number(first) > Number(last)) return "#REF!";
    let total = 0;
    for (let row = Number(first); row <= Number(last); row++) {
      const value = read(`${column}${row}`);
      if (value === "") continue;
      if (typeof value !== "number") return value;
      total += value;
    }
    return total;
  }
  const difference = /^=([CD]\d{1,2})-([CD]\d{1,2})$/.exec(expression);
  if (difference) {
    const left = read(difference[1]),
      right = read(difference[2]);
    if (typeof left === "string" && left !== "") return left;
    if (typeof right === "string" && right !== "") return right;
    // An unfinished prerequisite must not look like a balanced workpaper.
    if (left === "" || right === "") return "";
    return Number(left) - Number(right);
  }
  return expression.startsWith("=") ? "#NAME?" : "#VALUE!";
}
