import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bootcampMissions,
  foundationEntries,
  getBootcampMission,
} from "@/lib/bootcamp/catalog";
import {
  bootcampMissionReady,
  bootcampProgress,
  completeBootcampMission,
  createBootcampState,
  currentFoundationTask,
  foundationBooks,
  isBootcampMissionUnlocked,
  migrateBootcampState,
  submitFoundationTask,
  validateFoundationJournal,
  validateFoundationResponse,
} from "@/lib/bootcamp/engine";
import {
  BOOTCAMP_KEY,
  BrowserBootcampRepository,
  syncFoundationRewards,
} from "@/lib/bootcamp/repository";
import { loadPlayerState } from "@/lib/game/progress";
import type {
  BootcampMissionId,
  BootcampState,
  FoundationResponse,
} from "@/lib/bootcamp/model";
export function solveFoundationMission(
  state: BootcampState,
  id: BootcampMissionId,
) {
  let next = state;
  for (const task of getBootcampMission(id)!.tasks) {
    const response =
      task.kind === "journal"
        ? foundationEntries.find((e) => e.id === task.entryId)!.lines
        : task.answer;
    const result = submitFoundationTask(next, id, task.id, response);
    expect(result.correct).toBe(true);
    next = result.state;
  }
  return completeBootcampMission(next, id, 0);
}
const beforeMission = (order: number) => {
  let state = createBootcampState();
  for (const mission of bootcampMissions.slice(0, order - 1))
    state = solveFoundationMission(state, mission.id);
  return state;
};
beforeEach(() => localStorage.clear());
describe("Foundations PASS A — see, classify, match, balance", () => {
  it("upgrades the existing Bootcamp to 12 missions and one practice-only boss", () => {
    expect(bootcampMissions).toHaveLength(13);
    expect(bootcampMissions.map((m) => m.order)).toEqual(
      Array.from({ length: 13 }, (_, i) => i + 1),
    );
    expect(
      bootcampMissions.every((m) => m.evidenceRule === "practice-only"),
    ).toBe(true);
    expect(bootcampMissions[8].id).toBe("debit-credit");
  });
  it("does not unlock the next mission or skip an unobserved transfer", () => {
    const state = createBootcampState();
    expect(isBootcampMissionUnlocked(state, "transaction-radar")).toBe(false);
    expect(completeBootcampMission(state, "business-world")).toBe(state);
    expect(
      submitFoundationTask(state, "business-world", "affected", [
        "cash",
        "capital",
      ]).state,
    ).toBe(state);
    const next = solveFoundationMission(state, "business-world");
    expect(next.currentMissionId).toBe("transaction-radar");
    expect(isBootcampMissionUnlocked(next, "transaction-radar")).toBe(true);
  });
  it("requires cash AND capital, not equipment or revenue", () => {
    const task = getBootcampMission("business-world")!.tasks[1];
    expect(validateFoundationResponse(task, ["cash", "capital"])).toBe(true);
    expect(validateFoundationResponse(task, ["cash"])).toBe(false);
    expect(validateFoundationResponse(task, ["cash", "equipment"])).toBe(false);
  });
  it("requires correctly classifying BOTH financial and nonfinancial events", () => {
    let state = beforeMission(2);
    const m = getBootcampMission("transaction-radar")!;
    expect(validateFoundationResponse(m.tasks[0], ["record"])).toBe(false);
    expect(validateFoundationResponse(m.tasks[0], ["no"])).toBe(true);
    expect(validateFoundationResponse(m.tasks[1], ["record"])).toBe(true);
    state = submitFoundationTask(state, m.id, "call", ["record"]).state;
    expect(state.attempts[m.id]).toBe(1);
    expect(bootcampMissionReady(state, m.id)).toBe(false);
    state = solveFoundationMission(state, m.id);
    expect(state.completedMissionIds).toContain(m.id);
  });
  it("distinguishes invoice, cash receipt, voucher, bank advice and authorization", () => {
    const m = getBootcampMission("document-dock")!;
    expect(m.tasks.map((t) => t.answer[0])).toEqual([
      "invoice",
      "receipt",
      "voucher",
      "bank",
      "po",
    ]);
    expect(validateFoundationResponse(m.tasks[0], ["po"])).toBe(false);
  });
  it("rejects a balanced equation that does not match the economic event", () => {
    const m = getBootcampMission("equation-builder")!;
    expect(
      validateFoundationResponse(m.tasks[0], ["100000", "0", "100000"]),
    ).toBe(true);
    expect(
      validateFoundationResponse(m.tasks[0], ["100000", "100000", "0"]),
    ).toBe(false);
    expect(
      validateFoundationResponse(m.tasks[1], ["120000", "20000", "100000"]),
    ).toBe(true);
    expect(validateFoundationResponse(m.tasks[0], ["", "", ""])).toBe(false);
  });
  it("saves selection, attempted answers and partial progress in the existing repository", () => {
    const repo = new BrowserBootcampRepository();
    let state = submitFoundationTask(
      createBootcampState(),
      "business-world",
      "transfer",
      ["move"],
    ).state;
    state = {
      ...state,
      drafts: { ...state.drafts, "business-world/affected": ["cash"] },
    };
    const saved = repo.save(state);
    expect(new BrowserBootcampRepository().get()).toEqual(saved);
    expect(saved.drafts["business-world/affected"]).toEqual(["cash"]);
    expect(localStorage.getItem(BOOTCAMP_KEY)).toContain('"version":2');
  });
});
describe("Foundations PASS B — districts, result, contra, movement", () => {
  it("limits Account City to seven beginner accounts and three districts", () => {
    const m = getBootcampMission("account-city")!;
    expect(m.tasks).toHaveLength(7);
    expect(m.tasks.map((t) => t.answer[0])).toEqual([
      "assets",
      "assets",
      "assets",
      "assets",
      "assets",
      "liabilities",
      "equity",
    ]);
    expect(m.tasks[0].choices).toHaveLength(3);
  });
  it("links revenue and consumption to equity indirectly", () => {
    const m = getBootcampMission("income-expenses")!;
    expect(m.tasks.map((t) => t.answer[0])).toEqual([
      "revenue",
      "expense",
      "expense",
      "revenue",
    ]);
    expect(validateFoundationResponse(m.tasks[1], ["revenue"])).toBe(false);
  });
  it("shows accumulated depreciation without removing the equipment", () => {
    const m = getBootcampMission("contra-account")!;
    expect(m.tasks[0].answer).toEqual(["depreciation"]);
    expect(validateFoundationResponse(m.tasks[1], ["18000"])).toBe(true);
    expect(validateFoundationResponse(m.tasks[1], ["2000"])).toBe(false);
  });
  it("teaches increase and decrease before debit and credit", () => {
    const m = getBootcampMission("movement-lab")!;
    expect(m.order).toBe(8);
    expect(m.tasks.map((t) => t.answer)).toEqual([
      ["down", "up"],
      ["up", "up"],
      ["up", "up"],
      ["up", "up"],
    ]);
    expect(
      m.tasks.every((t) =>
        t.rows!.every((r) =>
          r.options.every((o) => ["up", "down"].includes(o.id)),
        ),
      ),
    ).toBe(true);
  });
  it("unlocks and finishes every pass B mission sequentially", () => {
    let state = beforeMission(5);
    for (const m of bootcampMissions.slice(4, 8)) {
      expect(isBootcampMissionUnlocked(state, m.id)).toBe(true);
      state = solveFoundationMission(state, m.id);
    }
    expect(state.currentMissionId).toBe("debit-credit");
    expect(bootcampProgress(state)).toBe(67);
  });
});
describe("Foundations PASS C — lanes, entry, journey and connected boss", () => {
  it("validates all six recording-side patterns", () =>
    expect(
      getBootcampMission("debit-credit")!.tasks.map((t) => t.answer[0]),
    ).toEqual(["debit", "credit", "credit", "credit", "credit", "debit"]));
  it("requires both equipment increase and cash decrease, then the correct recording sides", () => {
    const m = getBootcampMission("double-entry")!;
    expect(m.tasks[1].answer).toEqual(["up", "down"]);
    expect(m.tasks[2].answer).toEqual(["debit", "credit"]);
  });
  it.each([
    "negative",
    "zero",
    "unbalanced",
    "wrong-account",
    "same-account",
    "wrong-side",
    "nan",
  ])("rejects invalid journal %s", (kind) => {
    const entry = foundationEntries[1],
      lines = entry.lines.map((l) => ({ ...l }));
    if (kind === "negative") lines[0].debit = -20000;
    if (kind === "zero") {
      lines[0].debit = 0;
      lines[1].credit = 0;
    }
    if (kind === "unbalanced") lines[1].credit = 10000;
    if (kind === "wrong-account") lines[0].account = "inventory";
    if (kind === "same-account") lines[0].account = "cash";
    if (kind === "wrong-side") {
      lines[0] = { account: "equipment", debit: 0, credit: 20000 };
      lines[1] = { account: "cash", debit: 20000, credit: 0 };
    }
    if (kind === "nan") lines[0].debit = NaN;
    expect(validateFoundationJournal(lines, entry).valid).toBe(false);
  });
  it("accepts only an economically correct balanced entry and supports reversed row order", () => {
    const entry = foundationEntries[1];
    expect(validateFoundationJournal(entry.lines, entry)).toMatchObject({
      valid: true,
      debit: 20000,
      credit: 20000,
      difference: 0,
    });
    expect(
      validateFoundationJournal([...entry.lines].reverse(), entry).valid,
    ).toBe(true);
  });
  it("visits all five cycle stations in order and cannot jump to statements", () => {
    let state = beforeMission(12);
    expect(
      submitFoundationTask(state, "accounting-cycle", "statements", ["visit"])
        .state,
    ).toBe(state);
    expect(currentFoundationTask(state)?.id).toBe("source");
    state = solveFoundationMission(state, "accounting-cycle");
    expect(state.currentMissionId).toBe("mizan-boss");
    expect(bootcampProgress(state)).toBe(100);
    expect(state.mizanUnlocked).toBe(false);
  });
  it("requires evidence, all accounts, movements and a journal for every boss transaction", () => {
    const state = beforeMission(13);
    expect(getBootcampMission("mizan-boss")!.tasks).toHaveLength(28);
    expect(
      submitFoundationTask(
        state,
        "mizan-boss",
        "owner-cash:journal",
        foundationEntries[0].lines,
      ).state,
    ).toBe(state);
    expect(completeBootcampMission(state, "mizan-boss")).toBe(state);
  });
  it("records both sale and inventory cost and never collects nonexistent receivables", () => {
    const entry = foundationEntries[3];
    expect(entry.lines).toHaveLength(4);
    expect(
      validateFoundationJournal(entry.lines.slice(0, 2), entry).valid,
    ).toBe(false);
    expect(foundationEntries[5].lines[1]).toEqual({
      account: "receivable",
      debit: 0,
      credit: 15000,
    });
  });
  it("creates a consistent journal, ledger, trial balance and statements from accepted entries only", () => {
    const empty = beforeMission(13);
    expect(foundationBooks(empty).entries).toEqual([]);
    const final = solveFoundationMission(empty, "mizan-boss"),
      books = foundationBooks(final);
    expect(books.entries).toHaveLength(7);
    expect(books.ledger.find((a) => a.id === "cash")?.balance).toBe(80000);
    expect(books.ledger.find((a) => a.id === "payable")?.balance).toBe(-20000);
    expect(books.ledger.find((a) => a.id === "receivable")?.balance).toBe(0);
    expect(books.totalDebit).toBe(135000);
    expect(books.totalCredit).toBe(135000);
    expect(books).toMatchObject({
      assets: 120000,
      liabilities: 20000,
      equity: 100000,
      revenue: 15000,
      expenses: 15000,
      profit: 0,
    });
    expect(books.assets).toBe(books.liabilities + books.equity);
    expect(final.mizanUnlocked).toBe(true);
    expect(final.completedAt).toBe("1970-01-01T00:00:00.000Z");
    expect(completeBootcampMission(final, "mizan-boss")).toBe(final);
  });
  it("awards XP once, no coins, professional skills, certificates or employment evidence", () => {
    const state = solveFoundationMission(beforeMission(13), "mizan-boss");
    syncFoundationRewards(state);
    const before = loadPlayerState();
    syncFoundationRewards(state);
    expect(loadPlayerState()).toEqual(before);
    expect(before.coins).toBe(0);
    expect(
      Object.values(before.activities).every(
        (a) => a.kind === "practice" && a.skills.length === 0,
      ),
    ).toBe(true);
    expect(before.certificates).toEqual([]);
    expect(before.badges).toEqual(["foundation-company-starter"]);
    expect(localStorage.getItem("debit-credit-skill-evidence-v1")).toBeNull();
    expect(localStorage.getItem("debit-credit-career-profile-v1")).toBeNull();
  });
});
describe("Foundation migration and recovery", () => {
  it("preserves the old 10-mission save and prior company access without pretending new missions were completed", () => {
    const old = {
      version: 1,
      currentMissionId: "mizan-boss",
      completedMissionIds: ["business-world", "missing-story", "mizan-boss"],
      interactionProgress: { "business-world": ["owner", "cash"] },
      mizanUnlocked: true,
    };
    const state = migrateBootcampState(old);
    expect(state.version).toBe(2);
    expect(state.legacy.completedMissionIds).toEqual(old.completedMissionIds);
    expect(state.legacy.interactionProgress["business-world"]).toEqual([
      "owner",
      "cash",
    ]);
    expect(state.completedMissionIds).toEqual([]);
    expect(state.mizanUnlocked).toBe(true);
    expect(state.bossCompleted).toBe(false);
    expect(migrateBootcampState(state).legacy).toEqual(state.legacy);
  });
  it("filters fake completion and malformed saved progress", () => {
    const state = migrateBootcampState({
      version: 2,
      currentMissionId: "mizan-boss",
      completedMissionIds: ["business-world", "mizan-boss", "fake"],
      interactionProgress: { "business-world": ["affected", "fake"] },
      drafts: { fake: [{ account: "cash", debit: NaN, credit: 0 }] },
      attempts: { "business-world": -2 },
    });
    expect(state.completedMissionIds).toEqual([]);
    expect(state.currentMissionId).toBe("business-world");
    expect(state.interactionProgress["business-world"]).toEqual([]);
    expect(state.drafts).toEqual({});
    expect(state.mizanUnlocked).toBe(false);
  });
  it("keeps blocked-storage progress in memory and warns honestly", () => {
    const repo = new BrowserBootcampRepository(),
      state = solveFoundationMission(createBootcampState(), "business-world");
    const mock = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw Error("blocked");
      });
    expect(repo.save(state).storageWarning).toBe(true);
    expect(repo.snapshot().completedMissionIds).toContain("business-world");
    mock.mockRestore();
  });
  it("preserves an attempted journal draft when reopened", () => {
    const state = beforeMission(11),
      draft: FoundationResponse = [
        { account: "equipment", debit: 12000, credit: 0 },
        { account: "cash", debit: 0, credit: 20000 },
      ],
      result = submitFoundationTask(state, "first-journal", "journal", draft),
      repo = new BrowserBootcampRepository();
    repo.save(result.state);
    expect(repo.get().drafts["first-journal/journal"]).toEqual(draft);
    expect(repo.get().completedMissionIds).not.toContain("first-journal");
  });
});
