import { beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { createDefaultProfile } from "@/lib/career/repository";
import { buildCv } from "@/lib/career/cv";
import { calculatePassport } from "@/lib/career/evidence";
import { defaultShowcase } from "@/lib/career/showcase";
import { discoveryDefaults, discoveryCommand, companyInput, talentQuery, requirementOverlap, shortlistCommand } from "@/lib/talent/model";
vi.mock("server-only", () => ({}));
type Row = { id: string; userId: string; domain: string; provenance: string; data: unknown; revision: number };
const store = vi.hoisted(() => ({ rows: new Map<string, Row>(), sources: new Map<string, unknown>(), query: vi.fn() }));
vi.mock("@/lib/server/profiles/cv", () => ({ deriveAccountCv: vi.fn(async (_tx: unknown, id: string) => store.sources.get(id) ?? null) }));
vi.mock("@/lib/server/db/client", () => {
  type Where = { id?: string | { in: string[] }; userId_domain?: { userId: string; domain: string }; userId?: string; provenance?: string; domain?: string | { in?: string[]; startsWith?: string } };
  const find = (where: Where) => [...store.rows.values()].filter(row => (!where.id || (typeof where.id === "string" ? row.id === where.id : where.id.in.includes(row.id))) && (!where.userId_domain || (row.userId === where.userId_domain.userId && row.domain === where.userId_domain.domain)) && (!where.userId || row.userId === where.userId) && (!where.provenance || row.provenance === where.provenance) && (!where.domain || (typeof where.domain === "string" ? row.domain === where.domain : (where.domain.in ? where.domain.in.includes(row.domain) : row.domain.startsWith(where.domain.startsWith ?? "")))));
  const client = {
    cloudProgress: {
      findUnique: vi.fn(async ({ where }: { where: Where }) => find(where)[0] ?? null),
      findMany: vi.fn(async ({ where }: { where: Where }) => find(where)),
      count: vi.fn(async ({ where }: { where: Where }) => find(where).length),
      deleteMany: vi.fn(async ({ where }: { where: Where }) => { for (const row of find(where)) store.rows.delete(row.userId + ":" + row.domain); }),
      upsert: vi.fn(async ({ where, create, update }: { where: Where; create: Omit<Row, "id"> & { id?: string }; update: Partial<Row> }) => {
        const old = find(where)[0];
        const row = old ? { ...old, ...update, revision: Object.keys(update).length ? old.revision + 1 : old.revision } : { ...create, id: create.id ?? crypto.randomUUID() };
        store.rows.set(row.userId + ":" + row.domain, row); return row;
      }),
      update: vi.fn(async ({ where, data }: { where: Where; data: Partial<Row> }) => { const old = find(where)[0]; const next = { ...old, ...data }; store.rows.set(old.userId + ":" + old.domain, next); return next; }),
    },
    $queryRaw: (...args: unknown[]) => store.query(...args),
    $transaction: async (work: (tx: unknown) => unknown) => work(client),
  };
  return { db: () => client, serial: (work: (tx: unknown) => unknown) => work(client), json: (value: unknown) => value };
});
import { discoveryFor, saveDiscovery, saveCompany, searchCandidates, previewCandidate, candidateCv, mutateShortlist, shortlistFor, refreshDiscovery, requestContact, contactInbox } from "@/lib/server/talent/service";
import { db } from "@/lib/server/db/client";
import type { Transaction } from "@/lib/server/db/client";
const company = { name: "Fixture Company", recruiter: "Fixture Recruiter", industry: "Accounting", location: "Cairo", website: "https://fixture.example" };
function source(id: string) {
  const profile = { ...createDefaultProfile("Fixture Accountant"), localCandidateId: id, fullName: "Fixture Accountant", email: "private@fixture.test", phone: "+201001234567", location: "Alexandria", country: "Egypt", education: [{ id: "private-education-id", institution: "Fixture University", degree: "Bachelor", field: "Accounting", graduationYear: "2026" }], languages: ["English"] };
  return { profile, cv: buildCv(profile, calculatePassport([]), [], "junior-accountant") };
}
function row(userId: string, domain: string, data: unknown) { store.rows.set(userId + ":" + domain, { id: randomUUID(), userId, domain, data, provenance: "SERVER", revision: 1 }); }
beforeEach(() => {
  store.rows.clear(); store.sources.clear(); store.query.mockReset();
  store.sources.set("candidate", source("candidate"));
  row("candidate", "private-showcase", { settings: defaultShowcase() });
  row("candidate", "private-portfolio", { courses: [{ title: "Never begun", provider: "School", date: "", status: "not-started" }, { title: "Started course", provider: "School", date: "", status: "in-progress", notes: "private notes", id: "private-course-id" }], certificates: [{ id: "private-cert-id", credentialId: "private-credential", title: "Uploaded certificate", issuer: "School", date: "2026-10", image: "private-image" }] });
  row("candidate", "profile-photo", { image: "data:image/webp;base64,fixture" });
  store.query.mockResolvedValue([{ items: [], total: BigInt(0) }]);
});
describe("Talent privacy and consent", () => {
  it("defaults to private and never infers discovery from availability", async () => {
    expect((await discoveryFor("candidate")).preferences).toEqual(discoveryDefaults);
    await saveCompany("recruiter", company);
    expect((await searchCandidates("recruiter", talentQuery.parse({}))).items).toEqual([]);
    expect(store.rows.has("candidate:talent/discovery")).toBe(false);
  });
  it("opt-in exposes only explicit safe fields, without contact or uploaded certificates", async () => {
    await saveCompany("recruiter", company);
    await saveDiscovery("candidate", { revision: 0, preferences: { ...discoveryDefaults, enabled: true } });
    const id = store.rows.get("candidate:talent/discovery")!.id;
    const preview = await previewCandidate("recruiter", id);
    expect(preview.name).toBe("Fixture Accountant");
    expect(preview.photo).toBeNull(); expect(preview.location).toBe("");
    expect(preview.education).toEqual([]); expect(preview.courses).toEqual([]); expect(preview.certificates).toEqual([]);
    expect(JSON.stringify(preview)).not.toMatch(/private@|201001234567|private-cert|private-image|private-education/);
    expect(preview.id).not.toBe("candidate");
  });
  it("photo, education, courses and certificate metadata need separate consent", async () => {
    await saveCompany("recruiter", company);
    await saveDiscovery("candidate", { revision: 0, preferences: { ...discoveryDefaults, enabled: true, photo: true, education: true, courses: true, certificates: true } });
    const preview = await previewCandidate("recruiter", store.rows.get("candidate:talent/discovery")!.id);
    expect(preview.photo).toContain("data:image/webp");
    expect(preview.courses.map(row => row.title)).toEqual(["Started course"]);
    expect(preview.certificates).toEqual([{ title: "Uploaded certificate", issuer: "School", date: "2026-10" }]);
    expect(JSON.stringify(preview)).not.toMatch(/private-credential|private-cert|private notes|private@/);
  });
  it("revocation prevents preview and shortlist access; re-enable rotates identifiers", async () => {
    await saveCompany("recruiter", company);
    let consent = await saveDiscovery("candidate", { revision: 0, preferences: { ...discoveryDefaults, enabled: true } });
    const id = store.rows.get("candidate:talent/discovery")!.id;
    await mutateShortlist("recruiter", { candidate: id, action: "add" });
    consent = await saveDiscovery("candidate", { revision: consent.revision, preferences: { ...discoveryDefaults } });
    await expect(previewCandidate("recruiter", id)).rejects.toMatchObject({ status: 404 });
    expect((await shortlistFor("recruiter")).items).toEqual([]);
    await saveDiscovery("candidate", { revision: consent.revision, preferences: { ...discoveryDefaults, enabled: true } });
    expect(store.rows.get("candidate:talent/discovery")!.id).not.toBe(id);
    expect((await shortlistFor("recruiter")).items).toEqual([]);
  });
  it("rejects stale consent and incomplete profiles", async () => {
    await saveDiscovery("candidate", { revision: 0, preferences: { ...discoveryDefaults } });
    await expect(saveDiscovery("candidate", { revision: 0, preferences: { ...discoveryDefaults, enabled: true } })).rejects.toMatchObject({ status: 409 });
    await expect(saveDiscovery("missing", { revision: 0, preferences: { ...discoveryDefaults, enabled: true } })).rejects.toMatchObject({ code: "COMPLETE_CAREER_PROFILE_FIRST" });
  });
  it("current cloud updates refresh the search projection, not a stale browser snapshot", async () => {
    await saveDiscovery("candidate", { revision: 0, preferences: { ...discoveryDefaults, enabled: true, location: true } });
    const next = source("candidate"); next.profile.fullName = "Updated Accountant"; next.profile.location = "Giza"; store.sources.set("candidate", next);
    await refreshDiscovery(db() as unknown as Transaction, "candidate");
    const data = store.rows.get("candidate:talent/discovery")!.data as { candidate: { name: string; location: string }; search: string };
    expect(data.candidate.name).toBe("Updated Accountant"); expect(data.candidate.location).toContain("Giza"); expect(data.search).toContain("updated accountant");
  });
  it("CV preview is separately consented and strips canonical contact fields", async () => {
    await saveCompany("recruiter", company);
    let consent = await saveDiscovery("candidate", { revision: 0, preferences: { ...discoveryDefaults, enabled: true } });
    const id = store.rows.get("candidate:talent/discovery")!.id;
    await expect(candidateCv("recruiter", id)).rejects.toMatchObject({ code: "CV_NOT_SHARED" });
    consent = await saveDiscovery("candidate", { revision: consent.revision, preferences: { ...discoveryDefaults, enabled: true, cv: true, courses: true } });
    const cv = await candidateCv("recruiter", id);
    expect(JSON.stringify(cv)).toContain("Started course");
    expect(JSON.stringify(cv)).not.toMatch(/private@|201001234567|private-credential|data:image/);
    expect(consent.preferences.cv).toBe(true);
  });
});
describe("Recruiter permissions, shortlist and contact", () => {
  it("candidate users cannot read recruiter data or grant a role through payloads", async () => {
    await expect(searchCandidates("candidate", talentQuery.parse({}))).rejects.toMatchObject({ status: 403 });
    await expect(shortlistFor("candidate")).rejects.toMatchObject({ status: 403 });
    expect(companyInput.safeParse({ ...company, role: "ADMIN" }).success).toBe(false);
    expect(discoveryCommand.safeParse({ revision: 0, preferences: { ...discoveryDefaults }, userId: "other" }).success).toBe(false);
    expect(shortlistCommand.safeParse({ action: "add", candidate: randomUUID(), companyId: "other" }).success).toBe(false);
  });
  it("company onboarding grants only a server-owned workspace capability", async () => {
    const result = await saveCompany("recruiter", company);
    expect(result.company.permission).toBe("OWNER");
    expect(store.rows.get("recruiter:talent/company")!.provenance).toBe("SERVER");
    expect(store.rows.has("recruiter:role")).toBe(false);
  });
  it("shortlist is persistent, idempotent and isolated across company owners", async () => {
    await saveCompany("company-a", company); await saveCompany("company-b", { ...company, name: "Other Company" });
    await saveDiscovery("candidate", { revision: 0, preferences: { ...discoveryDefaults, enabled: true } });
    const id = store.rows.get("candidate:talent/discovery")!.id;
    await mutateShortlist("company-a", { candidate: id, action: "add" }); await mutateShortlist("company-a", { candidate: id, action: "add" });
    expect((await shortlistFor("company-a")).items).toHaveLength(1); expect((await shortlistFor("company-b")).items).toEqual([]);
    await mutateShortlist("company-b", { candidate: id, action: "remove" }); expect((await shortlistFor("company-a")).items).toHaveLength(1);
    await mutateShortlist("company-a", { candidate: id, action: "remove" }); expect((await shortlistFor("company-a")).items).toEqual([]);
  });
  it("contact requests require consent and are visible only in the recipient inbox", async () => {
    await saveCompany("recruiter", company);
    let consent = await saveDiscovery("candidate", { revision: 0, preferences: { ...discoveryDefaults, enabled: true } });
    const id = store.rows.get("candidate:talent/discovery")!.id;
    await expect(requestContact("recruiter", { candidate: id, message: "Internship opportunity" })).rejects.toMatchObject({ status: 403 });
    consent = await saveDiscovery("candidate", { revision: consent.revision, preferences: { ...discoveryDefaults, enabled: true, contactRequests: true } });
    await requestContact("recruiter", { candidate: id, message: "Internship opportunity" });
    expect((await contactInbox("candidate")).items).toHaveLength(1); expect((await contactInbox("recruiter")).items).toEqual([]);
    expect(consent.preferences.contactRequests).toBe(true);
  });
  it("search input is bounded and overlap is an explicit skill count, not AI or readiness", () => {
    expect(talentQuery.safeParse({ page: "0" }).success).toBe(false);
    expect(talentQuery.safeParse({ page: "1001" }).success).toBe(false);
    expect(talentQuery.safeParse({ skill: "invented" }).success).toBe(false);
    expect(talentQuery.safeParse({ userId: "other" }).success).toBe(false);
    expect(requirementOverlap({ skills: [{ skillId: "journal-entries" }] } as Parameters<typeof requirementOverlap>[0], ["journal-entries", "trial-balance", "journal-entries"])).toEqual({ matched: 1, requested: 2 });
  });
});
