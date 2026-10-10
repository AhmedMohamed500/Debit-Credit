import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptedWorks,
  defaultShowcase,
  publicShowcase,
  safeSocial,
  showcaseCommand,
  type Showcase,
} from "@/lib/career/showcase";
import { emptyStudentState, stepIds } from "@/lib/student/unit";
vi.mock("server-only", () => ({}));
const store = vi.hoisted(() => ({
  rows: new Map<
    string,
    {
      userId: string;
      domain: string;
      revision: number;
      provenance: string;
      data: unknown;
    }
  >(),
}));
vi.mock("@/lib/server/db/client", () => {
  const key = (where: { userId_domain: { userId: string; domain: string } }) =>
    `${where.userId_domain.userId}:${where.userId_domain.domain}`;
  const client = {
    cloudProgress: {
      findUnique: vi.fn(async ({ where }) =>
        where.id
          ? ([...store.rows.values()].find(
              (row) => row.domain === "public-profile/" + where.id,
            ) ?? null)
          : (store.rows.get(key(where)) ?? null),
      ),
      findFirst: vi.fn(
        async ({ where }) =>
          [...store.rows.values()].find(
            (row) =>
              row.domain === where.domain &&
              row.provenance === where.provenance,
          ) ?? null,
      ),
      upsert: vi.fn(async ({ where, create, update }) => {
        const old = store.rows.get(key(where));
        const row = old
          ? {
              ...old,
              data: structuredClone(update.data),
              revision: old.revision + 1,
            }
          : structuredClone(create);
        store.rows.set(key(where), row);
        return row;
      }),
      create: vi.fn(async ({ data }) => {
        store.rows.set(`${data.userId}:${data.domain}`, structuredClone(data));
        return data;
      }),
      deleteMany: vi.fn(async ({ where }) => {
        store.rows.delete(`${where.userId}:${where.domain}`);
      }),
    },
  };
  return {
    db: () => client,
    json: (value: unknown) => value,
    serial: (work: (tx: typeof client) => unknown) => work(client),
  };
});
import {
  showcaseFor,
  saveShowcase,
  sharedShowcase,
} from "@/lib/server/profiles/showcase";
const completed = () => ({
  ...emptyStudentState(),
  accepted: [...stepIds],
  completedAt: "2026-10-11T00:00:00Z",
});
function seed(owner = "alice", provenance = "SERVER") {
  store.rows.set(`${owner}:student-unit1`, {
    userId: owner,
    domain: "student-unit1",
    revision: 1,
    provenance,
    data: completed(),
  });
}
beforeEach(() => store.rows.clear());
describe("Truthful accounting showcase", () => {
  it("unlocks only accepted contiguous work and has no bank or accreditation claims", () => {
    expect(acceptedWorks(null)).toEqual([]);
    expect(
      acceptedWorks({
        ...completed(),
        accepted: ["trial-balance", "worksheet"],
      }),
    ).toEqual([]);
    expect(
      acceptedWorks({ ...completed(), accepted: stepIds.slice(0, 7) }).map(
        (work) => work.id,
      ),
    ).toEqual(["journal"]);
    const works = acceptedWorks(completed());
    expect(works).toHaveLength(4);
    expect(
      works.find((work) => work.id === "trial-balance")?.rows.at(-1),
    ).toEqual(["Total", 127000, 127000]);
    expect(
      works
        .find((work) => work.id === "cash-ledger")
        ?.rows.at(-1)
        ?.at(-1),
    ).toBe(84000);
    expect(works.some((work) => /bank/i.test(work.skill.en))).toBe(false);
    expect(works.find((work) => work.id === "worksheet")?.summary.en).toContain(
      "not full Excel proficiency",
    );
  });
  it("rejects unsafe, credential-bearing, tracking and lookalike social links", () => {
    expect(
      safeSocial("linkedin", "https://www.linkedin.com/in/accountant"),
    ).toBe(true);
    for (const value of [
      "javascript:alert(1)",
      "http://linkedin.com/in/a",
      "https://linkedin.com.evil.test/a",
      "https://secret@linkedin.com/a",
      "https://linkedin.com/a?token=secret",
      "https://linkedin.com/a#secret",
    ])
      expect(safeSocial("linkedin", value)).toBe(false);
    expect(safeSocial("website", "https://127.0.0.1/a")).toBe(false);
    expect(
      safeSocial("website", "https://portfolio.example.com/accountant"),
    ).toBe(true);
  });
  it("enforces three distinct pins, explicit sharing and no client-injected ownership/evidence", () => {
    const command = {
      revision: 0,
      action: "save",
      settings: defaultShowcase(),
    };
    expect(showcaseCommand.safeParse(command).success).toBe(true);
    for (const extra of [
      { userId: "bob" },
      { works: acceptedWorks(completed()) },
      { verified: true },
      { revision: -1 },
    ])
      expect(showcaseCommand.safeParse({ ...command, ...extra }).success).toBe(
        false,
      );
    for (const pinned of [
      ["journal", "journal"],
      ["journal", "cash-ledger", "trial-balance", "worksheet"],
    ])
      expect(
        showcaseCommand.safeParse({
          ...command,
          settings: { ...command.settings, pinned },
        }).success,
      ).toBe(false);
    expect(
      showcaseCommand.safeParse({
        ...command,
        settings: {
          ...command.settings,
          public: { ...command.settings.public, works: ["journal"] },
        },
      }).success,
    ).toBe(false);
  });
  it("public projection is an allowlist even if private input contains extra PII", () => {
    const data = {
      revision: 1,
      settings: defaultShowcase(),
      token: "secret",
      name: "Private name",
      works: acceptedWorks(completed()),
      email: "private@test.test",
      phone: "private-phone",
      certificates: ["private-certificate"],
      userId: "private-owner",
    } as Showcase;
    expect(publicShowcase(data)).toEqual({
      name: null,
      socials: null,
      availability: null,
      summary: [],
      works: [],
    });
    data.settings.public.name = true;
    data.settings.public.summary = true;
    const shared = publicShowcase(data);
    expect(shared.name).toBe("Private name");
    expect(shared.summary).toHaveLength(4);
    expect(JSON.stringify(shared)).not.toMatch(
      /private@test|private-phone|private-certificate|private-owner|secret/,
    );
  });
});
describe("Owner-controlled server showcase", () => {
  it("starts private and rejects pins for tasks not accepted by server", async () => {
    const data = await showcaseFor("alice");
    expect(data.token).toBeNull();
    expect(data.settings.public.name).toBe(false);
    const settings = defaultShowcase();
    settings.pinned = ["journal"];
    await expect(
      saveShowcase("alice", { revision: 0, action: "save", settings }),
    ).rejects.toMatchObject({ code: "WORK_NOT_ACCEPTED" });
    seed("alice", "IMPORTED");
    expect((await showcaseFor("alice")).works).toEqual([]);
  });
  it("uses opaque tokens, isolates owners, rejects stale revisions and honors revocation", async () => {
    seed();
    const settings = defaultShowcase();
    settings.pinned = ["trial-balance", "journal", "cash-ledger"];
    settings.public.works = ["trial-balance"];
    settings.public.summary = true;
    const saved = await saveShowcase("alice", {
      revision: 0,
      action: "publish",
      settings,
    });
    expect(saved.token).toMatch(/^[0-9a-f]{32}$/);
    const publicData = await sharedShowcase(saved.token!);
    expect(publicData?.works.map((work) => work.id)).toEqual(["trial-balance"]);
    expect(publicData?.name).toBeNull();
    expect((await showcaseFor("bob")).token).toBeNull();
    await expect(
      saveShowcase("alice", { revision: 0, action: "save", settings }),
    ).rejects.toMatchObject({ code: "REVISION_CONFLICT" });
    await saveShowcase("alice", { revision: 1, action: "revoke", settings });
    expect(await sharedShowcase(saved.token!)).toBeNull();
    const again = await saveShowcase("alice", {
      revision: 2,
      action: "publish",
      settings,
    });
    expect(again.token).not.toBe(saved.token);
  });
  it("does not enable a link without explicit field selection; invalid tokens do not hit the database", async () => {
    await expect(
      saveShowcase("alice", {
        revision: 0,
        action: "publish",
        settings: defaultShowcase(),
      }),
    ).rejects.toMatchObject({ code: "SELECT_PUBLIC_FIELDS" });
    for (const token of [
      "alice",
      "../../private-showcase",
      "[token]",
      "0".repeat(31),
    ])
      expect(await sharedShowcase(token)).toBeNull();
  });
  it("shared summary updates automatically when further tasks are accepted", async () => {
    seed();
    const row = store.rows.get("alice:student-unit1")!;
    row.data = { ...completed(), accepted: stepIds.slice(0, 7) };
    const settings = defaultShowcase();
    settings.public.summary = true;
    const saved = await saveShowcase("alice", {
      revision: 0,
      action: "publish",
      settings,
    });
    expect((await sharedShowcase(saved.token!))?.summary).toHaveLength(1);
    row.data = completed();
    expect((await sharedShowcase(saved.token!))?.summary).toHaveLength(4);
  });
});
