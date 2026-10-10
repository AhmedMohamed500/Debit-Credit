import { beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { portfolioCommand, recentEvidence } from "@/lib/career/portfolio";
vi.mock("server-only", () => ({}));
const store = vi.hoisted(() => ({
  rows: new Map<string, { revision: number; data: unknown }>(),
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
          data: structuredClone(old ? update.data : create.data),
          revision: old ? old.revision + 1 : 1,
        };
        store.rows.set(key(where), row);
        return row;
      }),
      create: vi.fn(async ({ data }) => {
        const row = {
          data: structuredClone(data.data),
          revision: data.revision,
        };
        store.rows.set(`${data.userId}:${data.domain}`, row);
        return row;
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
  certificateFor,
  portfolioFor,
  sanitizeCertificate,
  savePortfolio,
} from "@/lib/server/profiles/portfolio";

const course = {
  title: "Excel for Accounting",
  provider: "University",
  date: "2026-10",
  status: "in-progress" as const,
  notes: "SUM and trial balance",
};
const certificate = {
  title: "Financial Reporting",
  issuer: "University",
  date: "2026-09",
  credentialId: "CERT-001",
};
beforeEach(() => store.rows.clear());
async function imageFixture() {
  const bytes = await sharp({
    create: { width: 1800, height: 1200, channels: 3, background: "#edf5e9" },
  })
    .jpeg()
    .withMetadata()
    .toBuffer();
  return "data:image/jpeg;base64," + bytes.toString("base64");
}
describe("Private member portfolio", () => {
  it("validates strict commands and never accepts ownership, verification or remote images", () => {
    expect(
      portfolioCommand.safeParse({ action: "save-course", revision: 0, course })
        .success,
    ).toBe(true);
    for (const patch of [
      { userId: "victim" },
      { verified: true },
      { revision: -1 },
    ])
      expect(
        portfolioCommand.safeParse({
          action: "save-course",
          revision: 0,
          course,
          ...patch,
        }).success,
      ).toBe(false);
    for (const image of [
      "https://example.test/image.png",
      "data:image/svg+xml;base64,AAAA",
      "data:image/gif;base64,AAAA",
      "data:image/png;base64," + "A".repeat(900_000),
    ])
      expect(
        portfolioCommand.safeParse({
          action: "add-certificate",
          revision: 0,
          certificate,
          image,
        }).success,
      ).toBe(false);
    expect(
      portfolioCommand.safeParse({
        action: "save-course",
        revision: 0,
        course: { ...course, date: "2026-13" },
      }).success,
    ).toBe(false);
    expect(
      portfolioCommand.safeParse({
        action: "add-certificate",
        revision: 0,
        certificate: { ...certificate, verified: true },
        image: "data:image/png;base64,AAAA",
      }).success,
    ).toBe(false);
  });
  it("preserves certificate aspect ratio and strips embedded metadata", async () => {
    const result = await sanitizeCertificate(await imageFixture());
    const meta = await sharp(
      Buffer.from(result.image.split(",")[1], "base64"),
    ).metadata();
    expect(result.width).toBe(1600);
    expect(result.height).toBe(1067);
    expect(meta.format).toBe("webp");
    expect(meta.exif).toBeUndefined();
    expect(meta.orientation).toBeUndefined();
  });
  it("rejects corrupt, disguised vector, animated and oversized pixel input", async () => {
    for (const buffer of [
      Buffer.from("invalid"),
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>',
      ),
      await sharp({
        create: { width: 3000, height: 3000, channels: 3, background: "white" },
      })
        .png()
        .toBuffer(),
      Buffer.alloc(680_000),
    ])
      await expect(
        sanitizeCertificate(
          "data:image/png;base64," + buffer.toString("base64"),
        ),
      ).rejects.toMatchObject({
        status: 400,
        code: "INVALID_CERTIFICATE_IMAGE",
      });
  });
  it("supports course creation/edit/removal with owner and revision guards", async () => {
    const created = await savePortfolio("alice", {
      action: "save-course",
      revision: 0,
      course,
    });
    expect(created.revision).toBe(1);
    expect(created.courses).toHaveLength(1);
    expect((await portfolioFor("bob")).courses).toEqual([]);
    await expect(
      savePortfolio("alice", { action: "save-course", revision: 0, course }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      savePortfolio("bob", {
        action: "remove-course",
        revision: 0,
        id: created.courses[0].id,
      }),
    ).rejects.toMatchObject({ status: 404 });
    const edited = await savePortfolio("alice", {
      action: "save-course",
      revision: 1,
      id: created.courses[0].id,
      course: { ...course, status: "completed" },
    });
    expect(edited.courses[0].status).toBe("completed");
    expect(edited.courses).toHaveLength(1);
    expect(
      (
        await savePortfolio("alice", {
          action: "remove-course",
          revision: 2,
          id: created.courses[0].id,
        })
      ).courses,
    ).toEqual([]);
  });
  it("saves document separately and never makes an uploaded certificate skill evidence", async () => {
    const added = await savePortfolio("alice", {
      action: "add-certificate",
      revision: 0,
      certificate,
      image: await imageFixture(),
    });
    const id = added.certificates[0].id;
    expect(JSON.stringify(added)).not.toContain("data:image");
    expect(JSON.stringify(added)).not.toContain("verified");
    await expect(certificateFor("bob", id)).rejects.toMatchObject({
      status: 404,
    });
    expect(await certificateFor("alice", id)).toMatchObject({
      width: 1600,
      height: 1067,
    });
    expect(
      [...store.rows.keys()].every((key) => key.startsWith("alice:private-")),
    ).toBe(true);
    await savePortfolio("alice", {
      action: "remove-certificate",
      revision: 1,
      id,
    });
    await expect(certificateFor("alice", id)).rejects.toMatchObject({
      status: 404,
    });
    expect((await portfolioFor("alice")).certificates).toEqual([]);
  });
  it("bounds portfolio storage to twenty courses", async () => {
    for (let revision = 0; revision < 20; revision++)
      await savePortfolio("alice", { action: "save-course", revision, course });
    await expect(
      savePortfolio("alice", { action: "save-course", revision: 20, course }),
    ).rejects.toMatchObject({ code: "PORTFOLIO_LIMIT" });
    expect((await portfolioFor("alice")).courses).toHaveLength(20);
  });
  it("deduplicates real activity rather than counting every skill projection as a course", () => {
    const first = {
      activityId: "case-1",
      completedAt: "2026-10-09",
      score: 80,
    };
    const last = { ...first, completedAt: "2026-10-10", score: 90 };
    expect(
      recentEvidence([
        first,
        last,
        { activityId: "case-2", completedAt: "2026-10-08" },
      ]),
    ).toEqual([last, { activityId: "case-2", completedAt: "2026-10-08" }]);
  });
});
