import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultProfile } from "@/lib/career/repository";
import { buildCv } from "@/lib/career/cv";
import { compactCv } from "@/lib/career/compact-cv";
import { scoreCvReadiness } from "@/lib/career/ats";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/server/auth/guards", () => ({
  requireUser: vi.fn(),
}));
vi.mock("@/lib/server/profiles/cv", () => ({
  automaticCvFor: vi.fn(),
}));
vi.mock("@/lib/server/security/http", () => {
  class HttpError extends Error {
    constructor(public status: number, public code: string) {
      super(code);
    }
  }
  return {
    HttpError,
    limit: vi.fn(async () => {}),
    respond: (value: unknown, status = 200) => Response.json(value, { status }),
  };
});
import { requireUser } from "@/lib/server/auth/guards";
import { automaticCvFor } from "@/lib/server/profiles/cv";
import { HttpError } from "@/lib/server/security/http";
import { GET } from "@/app/api/v1/me/cv/export/route";

const user = { id: "owner-a", email: "alice@example.test" };
const profile = {
  ...createDefaultProfile("Alice Accountant"),
  localCandidateId: "owner-a",
  email: user.email,
};
const cv = buildCv(profile, [], [], "junior-accountant");
const compact = compactCv(profile, cv);
const accountCv = {
  data: {
    fingerprint: "saved-document-v1",
    profile,
    cv,
    compact,
    plainText: compact.plainText,
    readiness: scoreCvReadiness(profile, cv, compact),
  },
};
const request = (suffix = "?format=pdf", context?: string) =>
  new Request("https://fixture.test/api/v1/me/cv/export" + suffix, {
    headers: context ? { "X-Account-Context": context } : {},
  });

beforeEach(() => {
  vi.mocked(requireUser).mockReset();
  vi.mocked(automaticCvFor).mockReset();
  vi.mocked(requireUser).mockResolvedValue(user as never);
  vi.mocked(automaticCvFor).mockResolvedValue(accountCv as never);
});

describe("private account CV export route", () => {
  it("requires an authenticated owner and rejects stale-tab account context", async () => {
    vi.mocked(requireUser).mockRejectedValueOnce(new HttpError(401, "UNAUTHORIZED"));
    expect((await GET(request())).status).toBe(401);
    const switched = await GET(request("?format=pdf", "different-owner"));
    expect(switched.status).toBe(409);
    expect(await switched.json()).toEqual({ error: { code: "ACCOUNT_CHANGED" } });
    expect(automaticCvFor).not.toHaveBeenCalled();
  });
  it("rejects invalid format and unsupported target roles", async () => {
    expect((await GET(request("?format=html"))).status).toBe(400);
    expect((await GET(request("?format=pdf&role=some-fake-role"))).status).toBe(400);
    expect(automaticCvFor).not.toHaveBeenCalled();
  });
  it("downloads only this user's derived CV as a real private PDF", async () => {
    const response = await GET(request("?format=pdf&role=junior-accountant", user.id));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString()).toBe("%PDF-");
    expect(automaticCvFor).toHaveBeenCalledWith(user.id, "junior-accountant");
  });
  it("does not export missing or untranslated private records", async () => {
    vi.mocked(automaticCvFor).mockResolvedValueOnce(null);
    expect((await GET(request())).status).toBe(404);
    const untranslated = { ...accountCv.data, profile: { ...profile, fullName: "أليس" } };
    vi.mocked(automaticCvFor).mockResolvedValueOnce({ data: untranslated } as never);
    expect((await GET(request())).status).toBe(422);
  });
  it("rejects export when saved CV changed since the preview", async () => {
    const stale = new Request("https://fixture.test/api/v1/me/cv/export?format=pdf", {
      headers: { "X-Account-Context": user.id, "X-CV-Version": "outdated" },
    });
    const response = await GET(stale);
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: { code: "CV_CHANGED_REFRESH_PREVIEW" } });
  });
});
