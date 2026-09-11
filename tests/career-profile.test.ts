import { beforeEach, describe, expect, it } from "vitest";
import { roleCatalog, roleIds } from "@/lib/career/catalog";
import { buildCv, exportCareerData } from "@/lib/career/cv";
import { accountingDna, calculatePassport, calculateRoleReadiness, calculateSkill, firstShiftSkillEvidence } from "@/lib/career/evidence";
import {
  BrowserCareerProfileRepository,
  BrowserSkillEvidenceRepository,
  CAREER_PROFILE_KEY,
  LOCAL_CANDIDATE_KEY,
  migrateSkillEvidence,
  SKILL_EVIDENCE_KEY,
  createDefaultProfile,
  getOrCreateLocalCandidateId,
} from "@/lib/career/repository";
import type { Attempt, GameState } from "@/lib/campaign/model";
import type { SkillEvidence, SkillId } from "@/lib/career/model";
import { initialState } from "@/lib/campaign/director";
import { firstDayDocuments,selectFirstDayDocument,submitFirstDayDocument } from "@/lib/campaign/first-day";
import { inspectCaseDocument,selectCaseAction } from "@/lib/cases/engine";

const attempt = (document: string, overrides: Partial<Attempt> = {}): Attempt => ({
  activityId: `first-day/${document}`,
  missionId: "first-day",
  chapterId: 1,
  skillId: "journal",
  difficulty: 2,
  accuracy: 100,
  attempts: 1,
  hintsUsed: 0,
  completionTime: 45,
  independentCompletion: true,
  criticalErrors: 0,
  score: 100,
  completedAt: `2026-09-10T00:00:0${document.length % 9}Z`,
  mode: "practice",
  response: "balanced entry",
  correct: true,
  ...overrides,
});

const game = (evidence: Attempt[]): GameState => ({
  version: 2, name: "Ahmed", xp: 9000, coins: 5000, active: null, completed: {}, evidence,
  journal: [], posted: [], reconciled: [], unlocked: [], upgrades: [], activeDays: [], arcade: null,
  arcadeBest: {}, rewardKeys: [], legacy: {},
});

const evidenceRecord = (skillId: SkillId, activityId: string, overrides: Partial<SkillEvidence> = {}): SkillEvidence => ({
  version: 1,
  evidenceId: `${skillId}:${activityId}`,
  localCandidateId: "candidate",
  activityId,
  activityType: "case",
  chapterId: 1,
  missionId: "test-case",
  skillId,
  roleRelevance: ["junior-accountant"],
  difficulty: 2,
  score: 90,
  accuracy: 90,
  firstAttemptCorrect: true,
  attempts: 1,
  hintsUsed: 0,
  independentCompletion: true,
  criticalErrors: 0,
  completedAt: "2026-09-10T00:00:00Z",
  source: "mission",
  assessmentIntegrity: "demonstrated",
  titleAr: "حالة عملية",
  titleEn: "Practical case",
  ...overrides,
});

describe("career identity repositories", () => {
  beforeEach(() => localStorage.clear());

  it("keeps a stable local candidate ID", () => {
    const first = getOrCreateLocalCandidateId();
    expect(getOrCreateLocalCandidateId()).toBe(first);
    expect(localStorage.getItem(LOCAL_CANDIDATE_KEY)).toBe(first);
  });

  it("stores the career profile separately from game state", () => {
    localStorage.setItem("debit-credit-world-v2", "game-state-stays-here");
    const repository = new BrowserCareerProfileRepository();
    repository.save(createDefaultProfile("Ahmed"));
    expect(repository.get()?.fullName).toBe("Ahmed");
    expect(localStorage.getItem(CAREER_PROFILE_KEY)).toContain("Ahmed");
    expect(localStorage.getItem("debit-credit-world-v2")).toBe("game-state-stays-here");
  });

  it("merges evidence idempotently", () => {
    const repository = new BrowserSkillEvidenceRepository();
    const item = evidenceRecord("journal-entries", "case-1");
    expect(repository.merge([item, item])).toHaveLength(1);
    expect(repository.merge([item])).toHaveLength(1);
    expect(localStorage.getItem(SKILL_EVIDENCE_KEY)).toContain("journal-entries");
  });

  it("migrates historical evidence without inventing first-attempt facts",()=>{const old={...evidenceRecord("journal-entries","first-day/supplier-invoice"),firstAttemptCorrect:undefined,projectionVersion:undefined};const [migrated]=migrateSkillEvidence([old]);expect(migrated).toMatchObject({projectionVersion:1,firstAttemptCorrect:null,caseId:"supplier-invoice",attemptId:null});});
});

describe("First Shift professional evidence", () => {
  it("maps the three documents to exact accounting skills without verified claims", () => {
    const records = firstShiftSkillEvidence(game([
      attempt("supplier-invoice"), attempt("customer-receipt"), attempt("office-expense"),
    ]), "candidate");
    const journal = records.filter(item => item.skillId === "journal-entries");
    expect(journal).toHaveLength(3);
    expect(records.some(item => item.skillId === "accounts-payable")).toBe(true);
    expect(records.some(item => item.skillId === "accounts-receivable")).toBe(true);
    expect(records.every(item => item.assessmentIntegrity === "demonstrated")).toBe(true);
    expect(records.every(item => item.source !== "verified_assessment")).toBe(true);
  });

  it("records an incorrect attempt as practice evidence", () => {
    const [record] = firstShiftSkillEvidence(game([
      attempt("supplier-invoice", { correct: false, accuracy: 0, score: 0, criticalErrors: 1 }),
    ]), "candidate");
    expect(record.assessmentIntegrity).toBe("practice");
    expect(record.firstAttemptCorrect).toBe(false);
  });

  it("projects one explainable resolution record per skill from case events", () => {
    let state=selectFirstDayDocument(initialState(),"supplier-invoice",1000);
    state=inspectCaseDocument(state,"supplier-invoice","po-771",1100);
    state=inspectCaseDocument(state,"supplier-invoice","grn-771",1200);
    state=selectCaseAction(state,"supplier-invoice","post",1300).state;
    state=submitFirstDayDocument(state,"supplier-invoice",JSON.stringify(firstDayDocuments[0].expected),1400).state;
    const records=firstShiftSkillEvidence(state,"candidate"),journal=records.find(item=>item.skillId==="journal-entries")!;
    expect(journal).toMatchObject({projectionVersion:2,activityType:"case",attemptId:"first-shift/supplier-invoice/attempt-1",attempts:1,hintsUsed:0,firstAttemptCorrect:true,assessmentIntegrity:"demonstrated"});
    expect(journal.inspectedEvidence).toEqual(["po-771","grn-771"]);
    expect(journal.rationaleEn).toMatch(/2 supporting document/);
  });
});

describe("skill scoring and readiness integrity", () => {
  it("does not publish a score from one activity", () => {
    const result = calculateSkill("journal-entries", [evidenceRecord("journal-entries", "case-1")]);
    expect(result.status).toBe("practiced");
    expect(result.score).toBeNull();
    expect(result.confidence).toBe("insufficient");
  });

  it("requires two distinct successful activities for Demonstrated", () => {
    const repeated = evidenceRecord("journal-entries", "case-1", { evidenceId: "repeat" });
    expect(calculateSkill("journal-entries", [evidenceRecord("journal-entries", "case-1"), repeated]).status).toBe("practiced");
    expect(calculateSkill("journal-entries", [evidenceRecord("journal-entries", "case-1"), evidenceRecord("journal-entries", "case-2")]).status).toBe("demonstrated");
  });

  it("reserves Verified for an explicit verified assessment source", () => {
    const ordinary = [evidenceRecord("debit-credit", "case-1"), evidenceRecord("debit-credit", "case-2")];
    expect(calculateSkill("debit-credit", ordinary).status).toBe("demonstrated");
    const verified = evidenceRecord("debit-credit", "assessment-1", {
      source: "verified_assessment", assessmentIntegrity: "verified_local_beta",
    });
    expect(calculateSkill("debit-credit", [...ordinary, verified]).status).toBe("verified");
  });

  it("withholds role readiness until coverage is credible", () => {
    const one = calculatePassport([evidenceRecord("journal-entries", "case-1"), evidenceRecord("journal-entries", "case-2")]);
    expect(calculateRoleReadiness("junior-accountant", one).score).toBeNull();
    const records = ["account-classification", "debit-credit", "document-analysis", "journal-entries"].flatMap(skill => [
      evidenceRecord(skill as SkillId, `${skill}-1`), evidenceRecord(skill as SkillId, `${skill}-2`),
    ]);
    const readiness = calculateRoleReadiness("junior-accountant", calculatePassport(records));
    expect(readiness.score).not.toBeNull();
    expect(readiness.coverage).toBeGreaterThanOrEqual(40);
  });

  it("shows Accounting DNA only after diverse demonstrated evidence", () => {
    const records = ["journal-entries", "document-analysis", "debit-credit"].flatMap(skill => [
      evidenceRecord(skill as SkillId, `${skill}-1`), evidenceRecord(skill as SkillId, `${skill}-2`),
    ]);
    const passport = calculatePassport(records);
    expect(accountingDna(passport, records)?.archetype).toBe("transaction-specialist");
    expect(accountingDna(passport, records.slice(0, 2))).toBeNull();
  });

  it("keeps every role model normalized to 100 percent", () => {
    for (const roleId of roleIds) {
      const total = Object.values(roleCatalog[roleId].skills).reduce((sum, weight) => sum + (weight ?? 0), 0);
      expect(total).toBeCloseTo(1, 8);
    }
  });
});

describe("role-based Auto CV", () => {
  beforeEach(() => localStorage.clear());

  it("prioritizes role-relevant real skills and excludes game economy", () => {
    const profile = createDefaultProfile("Ahmed");
    const records = [
      evidenceRecord("accounts-payable", "supplier-1", { roleRelevance: ["ap-accountant"] }),
      evidenceRecord("accounts-payable", "supplier-2", { roleRelevance: ["ap-accountant"] }),
      evidenceRecord("journal-entries", "journal-1", { roleRelevance: ["ap-accountant"] }),
      evidenceRecord("journal-entries", "journal-2", { roleRelevance: ["ap-accountant"] }),
    ];
    const cv = buildCv(profile, calculatePassport(records), records, "ap-accountant");
    expect(cv.skills[0].skillId).toBe("accounts-payable");
    expect(cv.evidence).toHaveLength(4);
    expect(exportCareerData(profile, cv, records).toLowerCase()).not.toMatch(/\bxp\b|\bcoins?\b|\bstreak\b/);
    expect(cv.sections).toContain("simulations");
  });
});
