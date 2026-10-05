import { validateJournalEntry } from "@/lib/accounting/validation";
import type { GeneratedJournalEntry } from "@/types";
import {
  bootcampMissionIds,
  bootcampMissions,
  foundationAccounts,
  foundationEntries,
  getBootcampMission,
} from "./catalog";
import type {
  BootcampMissionId,
  BootcampState,
  FoundationEntry,
  FoundationLine,
  FoundationResponse,
  FoundationTask,
} from "./model";
const validMission = (value: unknown): value is BootcampMissionId =>
  typeof value === "string" &&
  bootcampMissionIds.includes(value as BootcampMissionId);
const uniqueStrings = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.filter((x): x is string => typeof x === "string"))]
    : [];
export const createBootcampState = (): BootcampState => ({
  version: 2,
  currentMissionId: "business-world",
  completedMissionIds: [],
  interactionProgress: {},
  attempts: {},
  drafts: {},
  bossCompleted: false,
  mizanUnlocked: false,
  completedAt: null,
  legacy: {
    completedMissionIds: [],
    interactionProgress: {},
    mizanUnlocked: false,
  },
});
export function migrateBootcampState(value: unknown): BootcampState {
  const base = createBootcampState();
  if (!value || typeof value !== "object") return base;
  const row = value as Partial<BootcampState> & { version?: number };
  if (row.version !== 2) {
    const completed = uniqueStrings(row.completedMissionIds).filter((id) =>
      [
        "business-world",
        "missing-story",
        "transaction-radar",
        "equation-builder",
        "account-city",
        "movement-lab",
        "debit-credit",
        "document-dock",
        "first-journal",
        "mizan-boss",
      ].includes(id),
    );
    const unlocked = completed.includes("mizan-boss");
    return {
      ...base,
      mizanUnlocked: unlocked,
      legacy: {
        completedMissionIds: completed,
        interactionProgress:
          row.interactionProgress && typeof row.interactionProgress === "object"
            ? Object.fromEntries(
                Object.entries(row.interactionProgress).map(([id, ids]) => [
                  id,
                  uniqueStrings(ids),
                ]),
              )
            : {},
        mizanUnlocked: unlocked,
      },
    };
  }
  const interactionProgress: BootcampState["interactionProgress"] = {},
    attempts: BootcampState["attempts"] = {};
  for (const mission of bootcampMissions) {
    const known = uniqueStrings(row.interactionProgress?.[mission.id]);
    interactionProgress[mission.id] = mission.tasks
      .map((task) => task.id)
      .filter(
        (id, i) =>
          known.includes(id) &&
          mission.tasks.slice(0, i).every((t) => known.includes(t.id)),
      );
    const count = row.attempts?.[mission.id];
    if (typeof count === "number" && Number.isFinite(count))
      attempts[mission.id] = Math.max(0, Math.floor(count));
  }
  const completed: BootcampMissionId[] = [];
  for (const mission of bootcampMissions) {
    if (
      uniqueStrings(row.completedMissionIds).includes(mission.id) &&
      mission.tasks.every((t) =>
        interactionProgress[mission.id]?.includes(t.id),
      )
    )
      completed.push(mission.id);
    else break;
  }
  const legacy = {
    completedMissionIds: uniqueStrings(row.legacy?.completedMissionIds),
    interactionProgress:
      row.legacy?.interactionProgress &&
      typeof row.legacy.interactionProgress === "object"
        ? Object.fromEntries(
            Object.entries(row.legacy.interactionProgress).map(([id, ids]) => [
              id,
              uniqueStrings(ids),
            ]),
          )
        : {},
    mizanUnlocked: Boolean(
      row.legacy?.completedMissionIds?.includes("mizan-boss"),
    ),
  };
  const current =
    validMission(row.currentMissionId) &&
    getBootcampMission(row.currentMissionId)!.order <= completed.length + 1
      ? row.currentMissionId
      : bootcampMissions[Math.min(completed.length, 12)].id;
  const drafts: BootcampState["drafts"] = {};
  for (const [key, response] of Object.entries(row.drafts ?? {})) {
    if (
      Array.isArray(response) &&
      response.length <= 20 &&
      response.every(
        (x) =>
          typeof x === "string" ||
          (x &&
            typeof x === "object" &&
            typeof x.account === "string" &&
            Number.isFinite(x.debit) &&
            Number.isFinite(x.credit)),
      )
    )
      drafts[key] = response;
  }
  return {
    ...base,
    currentMissionId: current,
    completedMissionIds: completed,
    interactionProgress,
    attempts,
    drafts,
    legacy,
    bossCompleted: completed.includes("mizan-boss"),
    mizanUnlocked: completed.includes("mizan-boss") || legacy.mizanUnlocked,
    completedAt:
      completed.includes("mizan-boss") && typeof row.completedAt === "string"
        ? row.completedAt
        : null,
  };
}
export const isBootcampMissionUnlocked = (
  state: BootcampState,
  id: BootcampMissionId,
) => {
  const mission = getBootcampMission(id);
  return Boolean(
    mission &&
      (mission.order === 1 ||
        state.completedMissionIds.includes(
          bootcampMissions[mission.order - 2].id,
        )),
  );
};
export const bootcampMissionReady = (
  state: BootcampState,
  id: BootcampMissionId,
) =>
  getBootcampMission(id)?.tasks.every((t) =>
    (state.interactionProgress[id] ?? []).includes(t.id),
  ) ?? false;
export const currentFoundationTask = (
  state: BootcampState,
  id = state.currentMissionId,
) => {
  const mission = getBootcampMission(id)!;
  return (
    mission.tasks.find((t) => !state.interactionProgress[id]?.includes(t.id)) ??
    null
  );
};
export function validateFoundationJournal(
  lines: FoundationLine[],
  entry: FoundationEntry,
) {
  if (
    !Array.isArray(lines) ||
    lines.some(
      (l) => !l || !Number.isFinite(l.debit) || !Number.isFinite(l.credit),
    )
  )
    return {
      valid: false,
      debit: 0,
      credit: 0,
      difference: 0,
      reason: "invalid",
    };
  const journal: GeneratedJournalEntry = {
    id: entry.id,
    entryNumber: entry.reference,
    date: "2026-01-01",
    transactionType: "foundation-practice",
    titleAr: entry.story.ar,
    titleEn: entry.story.en,
    reference: entry.reference,
    narrationAr: entry.story.ar,
    narrationEn: entry.story.en,
    currency: "EGP",
    lines: lines.map((l, i) => ({
      id: String(i),
      accountCode:
        foundationAccounts.find((a) => a.id === l.account)?.code ?? "",
      accountNameAr: accountLabelSafe(l.account),
      accountNameEn: l.account,
      debit: l.debit,
      credit: l.credit,
    })),
    totalDebit: 0,
    totalCredit: 0,
    isBalanced: false,
    explanationAr: [],
    explanationEn: [],
    assumptionsAr: [],
    assumptionsEn: [],
    warningsAr: [],
    warningsEn: [],
    accountingRuleAr: "",
    accountingRuleEn: "",
    financialStatementImpact: {
      assets: 0,
      liabilities: 0,
      equity: 0,
      revenue: 0,
      expenses: 0,
      profit: 0,
    },
  };
  const validation = validateJournalEntry(journal);
  const normalized = (ls: FoundationLine[]) =>
    ls
      .map((l) => `${l.account}:${l.debit}:${l.credit}`)
      .sort()
      .join("|");
  const matches = normalized(lines) === normalized(entry.lines);
  return {
    valid: validation.valid && matches,
    debit: validation.totalDebit,
    credit: validation.totalCredit,
    difference: validation.totalDebit - validation.totalCredit,
    reason: validation.valid
      ? matches
        ? "correct"
        : "economic"
      : (validation.errors[0]?.code ?? "invalid"),
  };
}
const accountLabelSafe = (id: string) =>
  foundationAccounts.find((a) => a.id === id)?.label.ar ?? id;
export function validateFoundationResponse(
  task: FoundationTask,
  response: FoundationResponse,
): boolean {
  if (task.kind === "journal") {
    const entry = foundationEntries.find((e) => e.id === task.entryId);
    return Boolean(
      entry &&
        validateFoundationJournal(response as FoundationLine[], entry).valid,
    );
  }
  if (!Array.isArray(response) || response.some((x) => typeof x !== "string"))
    return false;
  const actual = response as string[];
  if (task.kind === "multiple")
    return (
      [...new Set(actual)].sort().join("|") ===
      [...task.answer].sort().join("|")
    );
  return (
    actual.length === task.answer.length &&
    actual.every((x, i) =>
      task.kind === "equation"
        ? Number(x) === Number(task.answer[i]) && x.trim() !== ""
        : x === task.answer[i],
    )
  );
}
export function submitFoundationTask(
  state: BootcampState,
  id: BootcampMissionId,
  taskId: string,
  response: FoundationResponse,
): { state: BootcampState; correct: boolean } {
  const task = currentFoundationTask(state, id);
  if (
    !isBootcampMissionUnlocked(state, id) ||
    state.completedMissionIds.includes(id) ||
    task?.id !== taskId
  )
    return { state, correct: false };
  const correct = validateFoundationResponse(task, response);
  return {
    correct,
    state: {
      ...state,
      currentMissionId: id,
      drafts: { ...state.drafts, [`${id}/${taskId}`]: response },
      attempts: {
        ...state.attempts,
        [id]: (state.attempts[id] ?? 0) + (correct ? 0 : 1),
      },
      interactionProgress: correct
        ? {
            ...state.interactionProgress,
            [id]: [...(state.interactionProgress[id] ?? []), taskId],
          }
        : state.interactionProgress,
    },
  };
}
export function completeBootcampMission(
  state: BootcampState,
  id: BootcampMissionId,
  now = Date.now(),
): BootcampState {
  if (
    state.completedMissionIds.includes(id) ||
    !isBootcampMissionUnlocked(state, id) ||
    !bootcampMissionReady(state, id)
  )
    return state;
  const completed = [...state.completedMissionIds, id],
    next = bootcampMissions.find((m) => !completed.includes(m.id));
  return {
    ...state,
    completedMissionIds: completed,
    currentMissionId: next?.id ?? id,
    bossCompleted: completed.includes("mizan-boss"),
    mizanUnlocked:
      completed.includes("mizan-boss") || state.legacy.mizanUnlocked,
    completedAt:
      id === "mizan-boss" ? new Date(now).toISOString() : state.completedAt,
  };
}
export const bootcampProgress = (state: BootcampState) =>
  Math.round(
    (state.completedMissionIds.filter((id) => id !== "mizan-boss").length /
      12) *
      100,
  );
export const foundationXp = (state: BootcampState) =>
  bootcampMissions
    .filter((m) => state.completedMissionIds.includes(m.id))
    .reduce((sum, m) => sum + m.xp, 0);
export function foundationBooks(state: BootcampState) {
  const entries = foundationEntries.filter((e) =>
    state.interactionProgress["mizan-boss"]?.includes(`${e.id}:journal`),
  );
  const ledger = foundationAccounts
    .map((a) => {
      const movements = entries.flatMap((e) =>
        e.lines
          .filter((l) => l.account === a.id)
          .map((l) => ({ ...l, reference: e.reference })),
      );
      const debit = movements.reduce((s, l) => s + l.debit, 0),
        credit = movements.reduce((s, l) => s + l.credit, 0);
      return { ...a, movements, debit, credit, balance: debit - credit };
    })
    .filter((a) => a.movements.length);
  const trial = ledger.map((a) => ({
    ...a,
    debitBalance: Math.max(0, a.balance),
    creditBalance: Math.max(0, -a.balance),
  }));
  const assets = ledger
      .filter((a) => a.type === "assets")
      .reduce((s, a) => s + a.balance, 0),
    liabilities = -ledger
      .filter((a) => a.type === "liabilities")
      .reduce((s, a) => s + a.balance, 0),
    capital = -ledger
      .filter((a) => a.type === "equity")
      .reduce((s, a) => s + a.balance, 0),
    revenue = -ledger
      .filter((a) => a.type === "revenue")
      .reduce((s, a) => s + a.balance, 0),
    expenses = ledger
      .filter((a) => a.type === "expenses")
      .reduce((s, a) => s + a.balance, 0);
  return {
    entries,
    ledger,
    trial,
    totalDebit: trial.reduce((s, a) => s + a.debitBalance, 0),
    totalCredit: trial.reduce((s, a) => s + a.creditBalance, 0),
    assets,
    liabilities,
    capital,
    revenue,
    expenses,
    profit: revenue - expenses,
    equity: capital + revenue - expenses,
  };
}
