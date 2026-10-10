import { beforeEach, describe, expect, it } from "vitest";
import {
  personalSchema,
  personalCommand,
  applyPersonal,
  isPersonalRecord,
} from "@/lib/career/personal";
import {
  emptyStudentState,
  gradeStudent,
  studentEvidence,
  studentLedger,
  trialTotals,
  transactions,
  stepIds,
  studentCommand,
  type StudentCommand,
} from "@/lib/student/unit";
import {
  createDefaultProfile,
  BrowserCareerProfileRepository,
  BrowserSkillEvidenceRepository,
} from "@/lib/career/repository";
import { calculatePassport, calculateSkill } from "@/lib/career/evidence";
import { buildCv } from "@/lib/career/cv";
import { cvToPlainText, checkAtsFormat } from "@/lib/career/ats";
import { BrowserCvVersionRepository } from "@/lib/career/cv-history";
import { activitySummary } from "@/lib/career/activity-summary";
const details = {
  fullName: "Student Accountant",
  phone: "+20 100 123 4567",
  country: "Egypt",
  location: "Cairo",
  institution: "Training University",
  degree: "BCom (in progress)",
  field: "Accounting",
  graduationYear: "2028",
  experienceLevel: "student" as const,
  linkedIn: "",
  portfolio: "",
  languages: ["Arabic", "English"],
};
const record = {
  details,
  email: "fixture@example.test",
  savedAt: "2026-10-10T12:00:00.000Z",
};
const now = record.savedAt;
function correctAnswer(step: string): StudentCommand["answer"] {
  const transaction = transactions.find((row) => `journal-${row.id}` === step);
  if (transaction)
    return {
      debit: transaction.debit,
      credit: transaction.credit,
      amount: transaction.amount,
    };
  return step === "document-control"
    ? { action: "hold-duplicate" }
    : step === "ledger-cash"
      ? { amount: 84000 }
      : step === "trial-balance"
        ? { debitTotal: 127000, creditTotal: 127000 }
        : step === "classification-error"
          ? { action: "reclassify-equipment" }
          : { formula: "=SUM(C2:C9)", differenceFormula: "=C10-D10" };
}
function finish() {
  let state = emptyStudentState();
  const evidence = [];
  for (const step of stepIds) {
    state = gradeStudent(
      state,
      { revision: 0, step, answer: correctAnswer(step) },
      now,
    ).state;
    evidence.push(...studentEvidence("student", state, step, now));
  }
  return { state, evidence };
}
describe("Student personal CV setup", () => {
  beforeEach(() => localStorage.clear());
  it("requires necessary personal and education fields, not invasive attributes", () => {
    expect(personalSchema.safeParse(details).success).toBe(true);
    for (const field of [
      "fullName",
      "phone",
      "country",
      "location",
      "institution",
      "degree",
      "field",
      "graduationYear",
    ])
      expect(
        personalSchema.safeParse({ ...details, [field]: "" }).success,
      ).toBe(false);
    expect(
      personalSchema.safeParse({ ...details, nationalId: "private-data" })
        .success,
    ).toBe(false);
  });
  it("rejects forged owner/email/completion and malformed phone or links", () => {
    for (const extra of [
      { userId: "other" },
      { email: "other@test.test" },
      { completed: true },
    ])
      expect(
        personalCommand.safeParse({ revision: 0, details, ...extra }).success,
      ).toBe(false);
    expect(
      personalSchema.safeParse({ ...details, phone: "123456" }).success,
    ).toBe(false);
    expect(
      personalSchema.safeParse({ ...details, linkedIn: "javascript:alert(1)" })
        .success,
    ).toBe(false);
    expect(
      personalSchema.safeParse({ ...details, graduationYear: "tomorrow" })
        .success,
    ).toBe(false);
  });
  it("derives completion from validated account data, not a legacy boolean", () => {
    expect(isPersonalRecord({ completed: true })).toBe(false);
    expect(isPersonalRecord(record)).toBe(true);
    expect(isPersonalRecord({ ...record, email: "" })).toBe(false);
  });
  it("preserves privacy, past education, experience and preferences", () => {
    const profile = createDefaultProfile("Old");
    profile.education = [
      {
        id: "other",
        institution: "Earlier College",
        degree: "Diploma",
        field: "Finance",
        graduationYear: "2024",
      },
    ];
    profile.experience = [
      {
        id: "job",
        title: "Intern",
        company: "Real Company",
        startDate: "2025",
        endDate: "2025",
        current: false,
        description: "Self-entered actual internship",
      },
    ];
    profile.targetRoleId = "ap-accountant";
    const next = applyPersonal(profile, record);
    expect(next.privacy).toEqual(profile.privacy);
    expect(next.privacy.visibility).toBe("private");
    expect(next.privacy.showPhone).toBe(false);
    expect(next.privacy.showEmail).toBe(false);
    expect(next.experience).toEqual(profile.experience);
    const newJob = { ...profile.experience[0], id: "personal-experience", company: "New Internship" };
    expect(applyPersonal(next, { ...record, details: { ...details, actualExperience: [newJob] } }).experience).toEqual([newJob, ...profile.experience]);
    expect(next.education).toHaveLength(2);
    expect(next.targetRoleId).toBe("ap-accountant");
    expect(applyPersonal(next, record).education).toHaveLength(2);
  });
  it("produces a ready personal CV without fabricating skills", () => {
    const profile = applyPersonal(createDefaultProfile(), record),
      cv = buildCv(profile, calculatePassport([]), [], "junior-accountant"),
      text = cvToPlainText(profile, cv);
    expect(text).toContain(details.phone);
    expect(text).toContain(details.institution);
    expect(text).toContain("2028");
    expect(text).toContain(record.email);
    expect(cv.coreSkills).toEqual([]);
    expect(cv.simulationBullets).toEqual([]);
    expect(cv.summary).toContain("no completed");
  });
});
describe("Source documents to books — graded introductory unit", () => {
  it("counts completed activities once and keeps First Shift separate", () => {
    const { evidence } = finish();
    expect(activitySummary(evidence, "first-day/")).toEqual({ completed: 0, accuracy: null, firstAttempt: 0, hints: 0 });
    expect(activitySummary([...evidence, ...evidence], "student-unit1/").completed).toBe(11);
    expect(activitySummary(evidence.map(row => ({ ...row, criticalErrors: 1 })), "student-unit1/").completed).toBe(0);
  });
  beforeEach(() => localStorage.clear());
  it("requires ordered steps and rejects fabricated response fields", () => {
    expect(() =>
      gradeStudent(
        emptyStudentState(),
        { revision: 0, step: "worksheet", answer: correctAnswer("worksheet") },
        now,
      ),
    ).toThrow("STEP_LOCKED");
    expect(
      studentCommand.safeParse({ revision: 0, step: "unknown", answer: {} })
        .success,
    ).toBe(false);
    expect(
      studentCommand.safeParse({
        revision: 0,
        step: "document-control",
        answer: {},
        completed: true,
      }).success,
    ).toBe(false);
  });
  it.each(transactions.map((row) => [row.id, row]))(
    "requires correct accounts and amount for %s",
    (_id, row) => {
      const step = `journal-${row.id}`,
        index = stepIds.indexOf(step),
        state = { ...emptyStudentState(), accepted: stepIds.slice(0, index) };
      const wrong = gradeStudent(
        state,
        {
          revision: 0,
          step,
          answer: { debit: row.credit, credit: row.debit, amount: row.amount },
        },
        now,
      );
      expect(wrong.correct).toBe(false);
      expect(wrong.state.accepted).toEqual(state.accepted);
      expect(studentEvidence("student", wrong.state, step, now)).toEqual([]);
      expect(
        gradeStudent(
          state,
          { revision: 0, step, answer: correctAnswer(step) },
          now,
        ).correct,
      ).toBe(true);
    },
  );
  it("links accepted entries to ledger and TB with no duplicate postings", () => {
    const { state } = finish(),
      balances = studentLedger(state.accepted);
    expect(balances).toEqual({
      cash: 84000,
      capital: -100000,
      equipment: 20000,
      inventory: 15000,
      payable: -15000,
      receivable: 5000,
      revenue: -12000,
      rent: 3000,
    });
    expect(trialTotals(balances)).toEqual({ debit: 127000, credit: 127000 });
    const replay = gradeStudent(
      state,
      {
        revision: 0,
        step: "journal-capital",
        answer: correctAnswer("journal-capital"),
      },
      now,
    );
    expect(replay.replayed).toBe(true);
    expect(replay.state).toBe(state);
    expect(state.completedAt).toBe(now);
  });
  it("rejects balanced but misclassified postings and incorrect formulas", () => {
    const index = stepIds.indexOf("classification-error");
    expect(
      gradeStudent(
        { ...emptyStudentState(), accepted: stepIds.slice(0, index) },
        {
          revision: 0,
          step: "classification-error",
          answer: { action: "none" },
        },
        now,
      ).correct,
    ).toBe(false);
    expect(
      gradeStudent(
        { ...emptyStudentState(), accepted: stepIds.slice(0, -1) },
        {
          revision: 0,
          step: "worksheet",
          answer: { formula: "=SUM(C1:C9)", differenceFormula: "=D10-C10" },
        },
        now,
      ).correct,
    ).toBe(false);
  });
  it("does not treat retries as independent demonstration", () => {
    let state = emptyStudentState();
    const evidence = [];
    for (const step of stepIds) {
      state = gradeStudent(state, { revision: 0, step, answer: {} }, now).state;
      state = gradeStudent(
        state,
        { revision: 0, step, answer: correctAnswer(step) },
        now,
      ).state;
      evidence.push(...studentEvidence("student", state, step, now));
    }
    expect(calculateSkill("journal-entries", evidence).status).toBe(
      "practiced",
    );
    expect(
      evidence.every((item) => item.assessmentIntegrity === "practice"),
    ).toBe(true);
  });
  it("requires three independent introductory tasks and never verifies employment", () => {
    const { evidence } = finish();
    expect(calculateSkill("journal-entries", evidence).status).toBe(
      "demonstrated",
    );
    expect(calculateSkill("ledger-posting", evidence).status).toBe("practiced");
    expect(
      calculatePassport(evidence).some((row) => row.status === "verified"),
    ).toBe(false);
  });
  it("automatically translates every accepted step to unique bilingual CV bullets", () => {
    const { evidence } = finish(),
      profile = applyPersonal(createDefaultProfile(), record),
      cv = buildCv(
        profile,
        calculatePassport(evidence),
        evidence,
        "junior-accountant",
      );
    expect(cv.simulationBullets).toHaveLength(stepIds.length);
    expect(new Set(cv.simulationBullets.map((row) => row.text)).size).toBe(
      stepIds.length,
    );
    expect(
      cv.simulationBullets.every(
        (row) => row.text.length <= 220 && row.textAr.length > 10,
      ),
    ).toBe(true);
    expect(cvToPlainText(profile, cv)).toContain(
      "ACCOUNTING SIMULATION EXPERIENCE",
    );
    expect(checkAtsFormat(profile, cv).every((row) => row.passed)).toBe(true);
  });
  it("withholds critical-error achievements and irrelevant role keywords", () => {
    const { evidence } = finish(),
      profile = createDefaultProfile(),
      damaged = evidence.map((row) => ({ ...row, criticalErrors: 1 }));
    expect(
      buildCv(profile, calculatePassport(damaged), damaged, "junior-accountant")
        .simulationBullets,
    ).toEqual([]);
    const ap = buildCv(
      profile,
      calculatePassport(evidence),
      evidence,
      "ap-accountant",
    );
    expect(
      ap.skills.every((row) => row.skillId !== "accounts-receivable"),
    ).toBe(true);
  });
  it("creates automatic idempotent CV versions on evidence save, not a manual button", () => {
    const profile = applyPersonal(createDefaultProfile(), record);
    profile.localCandidateId = "student";
    new BrowserCareerProfileRepository().save(profile);
    const { evidence } = finish(),
      repository = new BrowserSkillEvidenceRepository();
    const before = new BrowserCvVersionRepository().get().items.length;
    repository.merge(evidence);
    const after = new BrowserCvVersionRepository().get().items;
    expect(after.length).toBe(before + 1);
    expect(after.at(-1)?.plainText).toContain("trial balance");
    repository.merge(evidence);
    expect(new BrowserCvVersionRepository().get().items).toHaveLength(
      after.length,
    );
  });
  it("does not add another candidate's evidence to automatic CV history", () => {
    const profile = applyPersonal(createDefaultProfile(), record);
    profile.localCandidateId = "other";
    new BrowserCareerProfileRepository().save(profile);
    new BrowserSkillEvidenceRepository().merge(finish().evidence);
    expect(
      new BrowserCvVersionRepository().get().items.at(-1)?.bulletEvidenceIds,
    ).toEqual([]);
  });
});
