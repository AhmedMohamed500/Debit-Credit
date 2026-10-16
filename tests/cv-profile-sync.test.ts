import { beforeEach, describe, it, expect, vi } from "vitest";
import { createDefaultProfile } from "@/lib/career/repository";
import { defaultShowcase } from "@/lib/career/showcase";
import { initialState } from "@/lib/campaign/director";
import {
  enterFirstDayDesk,
  completeFirstDayIntro,
  firstDayDocuments,
  submitFirstDayDocument,
} from "@/lib/campaign/first-day";
vi.mock("server-only", () => ({}));
const store = vi.hoisted(() => ({
  rows: new Map<string, { data: unknown; revision: number }>(),
  versions: [] as { userId: string; data: unknown }[],
}));
vi.mock("@/lib/server/db/client", () => {
  const key = (where: { userId_domain: { userId: string; domain: string } }) =>
    `${where.userId_domain.userId}:${where.userId_domain.domain}`;
  const client = {
    cloudProgress: {
      findUnique: vi.fn(
        async ({ where }) => store.rows.get(key(where)) ?? null,
      ),
      upsert: vi.fn(async ({ where, create, update }) => {
        const old = store.rows.get(key(where));
        const row = {
          data: old ? update.data : create.data,
          revision: old ? old.revision + 1 : 1,
        };
        store.rows.set(key(where), row);
        return row;
      }),
      update: vi.fn(async ({ where, data }) => {
        const old = store.rows.get(key(where));
        if (!old) throw new Error("MISSING_ROW");
        const row = { data: data.data, revision: old.revision + 1 };
        store.rows.set(key(where), row);
        return row;
      }),
    },
    skillEvidenceCloud: { findMany: vi.fn(async () => []) },
    cvVersionCloud: {
      findFirst: vi.fn(
        async ({ where }) =>
          store.versions.filter((row) => row.userId === where.userId).at(-1) ??
          null,
      ),
      create: vi.fn(async ({ data }) => {
        store.versions.push(data);
        return data;
      }),
    },
    $transaction: vi.fn(async (work: (tx: unknown) => unknown) => work(client)),
  };
  return {
    db: () => client,
    json: (data: unknown) => data,
    serial: (work: (tx: unknown) => unknown) => work(client),
  };
});
import { automaticCvFor, saveAutomaticCloudCv } from "@/lib/server/profiles/cv";
import { savePortfolio } from "@/lib/server/profiles/portfolio";
import { db } from "@/lib/server/db/client";
import {
  syncPersonalLinks,
  syncShowcaseLinks,
} from "@/lib/server/profiles/links";
import type { PersonalRecord } from "@/lib/career/personal";
const course = {
  title: "Excel Accounting",
  provider: "Training University",
  date: "2026-10",
  status: "in-progress" as const,
  notes: "Private long notes",
};
const personal: PersonalRecord = {
  email: "alice@fixture.test",
  savedAt: "2026-10-11T00:00:00Z",
  details: {
    fullName: "Alice Accountant",
    phone: "+201001234567",
    country: "Egypt",
    location: "Alexandria",
    institution: "University",
    degree: "Bachelor",
    field: "Accounting",
    graduationYear: "2026",
    experienceLevel: "student",
    linkedIn: "",
    portfolio: "",
    languages: ["English"],
  },
};
beforeEach(() => {
  store.rows.clear();
  store.versions = [];
  store.rows.set("alice:local-backup/debit-credit-career-profile-v1", {
    revision: 1,
    data: {
      ...createDefaultProfile("Alice Accountant"),
      localCandidateId: "alice",
      email: "alice@fixture.test",
    },
  });
});
describe("Server-owned live CV projection", () => {
  it("synchronizes professional links both ways without making private contact data public", async () => {
    store.rows.set("alice:student-personal", { revision: 2, data: personal });
    const settings = defaultShowcase();
    settings.socials.linkedin = "https://www.linkedin.com/in/alice-accountant";
    settings.socials.website = "https://example.com/alice";
    settings.socials.facebook = "https://facebook.com/alice-social";
    store.rows.set("alice:private-showcase", {
      revision: 3,
      data: { settings, token: "existing-consented-token" },
    });
    await db().$transaction((tx) => syncPersonalLinks(tx, "alice", settings));
    const synced = store.rows.get("alice:student-personal")!
      .data as PersonalRecord;
    expect(synced.details.linkedIn).toBe(settings.socials.linkedin);
    expect(synced.email).toBe(personal.email);
    expect(synced.details.phone).toBe(personal.details.phone);
    expect(store.rows.get("alice:student-personal")!.revision).toBe(3);
    expect((await automaticCvFor("alice"))?.data.plainText).toContain(
      settings.socials.website,
    );
    const edited = {
      ...synced,
      details: {
        ...synced.details,
        linkedIn: "",
        portfolio: "https://example.com/updated",
      },
    };
    await db().$transaction((tx) => syncShowcaseLinks(tx, "alice", edited));
    const shared = store.rows.get("alice:private-showcase")!;
    expect(shared.revision).toBe(4);
    expect(shared.data).toMatchObject({
      token: "existing-consented-token",
      settings: {
        socials: {
          linkedin: "",
          website: "https://example.com/updated",
          facebook: settings.socials.facebook,
        },
      },
    });
    expect(JSON.stringify(shared.data)).not.toMatch(
      /alice@fixture|201001234567|Bachelor/,
    );
    expect(store.rows.has("bob:student-personal")).toBe(false);
    await db().$transaction((tx) => syncShowcaseLinks(tx, "alice", edited));
    expect(store.rows.get("alice:private-showcase")!.revision).toBe(4);
  });
  it("retains the existing First Shift game projection without creating official evidence or qualifications", async () => {
    let game = enterFirstDayDesk(completeFirstDayIntro(initialState()));
    for (const document of firstDayDocuments)
      game = submitFirstDayDocument(
        game,
        document.id,
        JSON.stringify(document.expected),
        1000,
      ).state;
    store.rows.set("alice:local-backup/debit-credit-world-v2", {
      revision: 1,
      data: game,
    });
    const result = await automaticCvFor("alice");
    expect(
      result?.data.cv.evidence.some((row) => row.missionId === "first-day"),
    ).toBe(true);
    expect(result?.data.evidence.some((row) => row.missionId === "first-day")).toBe(true);
    expect(result?.data.passport.length).toBeGreaterThan(0);
    expect(
      result?.data.cv.skills.some((row) => row.status === "verified"),
    ).toBe(false);
    expect(store.versions).toEqual([]);
  });
  it("reads courses saved before release without creating history on GET and isolates accounts", async () => {
    store.rows.set("alice:private-portfolio", {
      revision: 1,
      data: {
        courses: [{ ...course, id: "legacy-course", updatedAt: "2026-10-10" }],
        certificates: [],
      },
    });
    const value = await automaticCvFor("alice");
    expect(value?.data.plainText).toContain("Excel Accounting");
    expect(value?.data.plainText).toContain("In progress");
    expect(await automaticCvFor("bob")).toBeNull();
    expect(value?.data.evidence).toEqual([]);
    expect(value?.data.passport.every((skill) => skill.status === "unassessed")).toBe(true);
    expect(store.versions).toEqual([]);
    expect(JSON.stringify(value)).not.toContain("data:image");
  });
  it("regenerates in the same transaction on course add edit remove and leaves assessed skills unchanged", async () => {
    const created = await savePortfolio("alice", {
      action: "save-course",
      revision: 0,
      course,
    });
    expect(store.versions.at(-1)?.data).toMatchObject({
      plainText: expect.stringContaining("In progress"),
    });
    const edited = await savePortfolio("alice", {
      action: "save-course",
      revision: 1,
      id: created.courses[0].id,
      course: { ...course, status: "completed" },
    });
    expect(store.versions.at(-1)?.data).toMatchObject({
      plainText: expect.stringContaining("Completed"),
      cv: { coreSkills: [], simulationBullets: [] },
    });
    await expect(
      savePortfolio("alice", {
        action: "remove-course",
        revision: 0,
        id: edited.courses[0].id,
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(store.versions).toHaveLength(2);
    await savePortfolio("alice", {
      action: "remove-course",
      revision: 2,
      id: edited.courses[0].id,
    });
    expect(store.versions.at(-1)?.data).toMatchObject({
      plainText: expect.not.stringContaining("Excel Accounting"),
    });
  });
  it("uses saved showcase professional links without exposing other socials/photos and preserves history deduplication", async () => {
    const settings = defaultShowcase();
    settings.socials.linkedin = "https://linkedin.com/in/alice-accountant";
    settings.socials.facebook = "https://facebook.com/alice-private";
    store.rows.set("alice:private-showcase", {
      revision: 1,
      data: { settings, token: "private-token" },
    });
    store.rows.set("alice:profile-photo", {
      revision: 1,
      data: { image: "private-photo" },
    });
    const data = await automaticCvFor("alice", "ap-accountant");
    expect(data?.data.cv.targetRoleId).toBe("ap-accountant");
    expect(data?.data.plainText).toContain(
      "https://linkedin.com/in/alice-accountant",
    );
    expect(JSON.stringify(data)).not.toMatch(
      /alice-private|private-photo|private-token/,
    );
    await db().$transaction((tx) => saveAutomaticCloudCv(tx, "alice"));
    await db().$transaction((tx) => saveAutomaticCloudCv(tx, "alice"));
    expect(store.versions).toHaveLength(1);
  });
});
