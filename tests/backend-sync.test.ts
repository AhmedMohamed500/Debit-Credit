import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  configureCloud,
  queueCloudBackup,
  retryBackups,
  pendingBackups,
  submitCloudFoundation,
  notifySync,
  currentSyncStatus,
  type CloudProgress,
} from "@/lib/cloud/runtime";
import { readDrafts } from "@/lib/cloud/outbox";
import { boundedJSON } from "@/lib/server/security/json";
import { createBootcampState } from "@/lib/bootcamp/engine";
const key = "debit-credit-world-v2";
const progress = (revision = 0): CloudProgress => ({
  schemaVersion: 1,
  foundations: { data: createBootcampState(), revision: 0 },
  domains: [
    {
      domain: "local-backup/" + key,
      data: {},
      revision,
      provenance: "LOCAL_BACKUP",
    },
  ],
  evidence: [],
});
beforeEach(() => {
  vi.useFakeTimers();
  configureCloud(null);
  localStorage.clear();
});
afterEach(() => {
  configureCloud(null);
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("account-scoped cloud draft recovery", () => {
  it("ignores an old account's in-flight core response after an account switch", async () => {
    let finish!: (value: Response) => void;
    const fetcher = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            revision: 1,
            data: createBootcampState(),
            correct: true,
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    configureCloud("account-a", progress());
    const old = submitCloudFoundation("business-world", "@complete", []);
    const rejected = expect(old).rejects.toMatchObject({
      code: "ACCOUNT_CHANGED",
    });
    configureCloud("account-b", progress());
    notifySync("ready");
    finish(new Response(JSON.stringify({ revision: 99 }), { status: 200 }));
    await rejected;
    expect(currentSyncStatus()).toBe("ready");
    await submitCloudFoundation("business-world", "@complete", []);
    expect(JSON.parse(fetcher.mock.calls[1][1].body).revision).toBe(0);
  });
  it("preserves a pending draft and its original revision across reload configuration", () => {
    configureCloud("account-a", progress(2));
    queueCloudBackup(key, { note: "private-a" });
    configureCloud(null);
    configureCloud("account-a", progress(9));
    expect(readDrafts("account-a")[key]).toEqual({
      data: { note: "private-a" },
      revision: 2,
    });
    expect(pendingBackups()).toBe(1);
  });
  it("does not send account A drafts using account B's session", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    configureCloud("account-a", progress());
    queueCloudBackup(key, { note: "private-a" });
    configureCloud("account-b", progress());
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetcher).not.toHaveBeenCalled();
    expect(pendingBackups()).toBe(0);
    expect(readDrafts("account-a")[key].data).toEqual({ note: "private-a" });
  });
  it("only removes recovery data after a server acknowledgment", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ revision: 1 }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetcher);
    configureCloud("account-a", progress());
    queueCloudBackup(key, { note: "draft" });
    await vi.advanceTimersByTimeAsync(1300);
    expect(pendingBackups()).toBe(1);
    retryBackups();
    await vi.advanceTimersByTimeAsync(1);
    expect(pendingBackups()).toBe(0);
    expect(readDrafts("account-a")).toEqual({});
    expect(fetcher.mock.calls[0][1].headers["X-Account-Context"]).toBe(
      "account-a",
    );
  });
  it("rejects oversized, dangerous or deeply nested backup JSON", () => {
    expect(
      boundedJSON.safeParse({ okay: [1, "two", true, null] }).success,
    ).toBe(true);
    expect(
      boundedJSON.safeParse(JSON.parse('{"__proto__":{"x":1}}')).success,
    ).toBe(false);
    expect(boundedJSON.safeParse({ text: "x".repeat(12001) }).success).toBe(
      false,
    );
    let data: unknown = 0;
    for (let i = 0; i < 17; i++) data = { data };
    expect(boundedJSON.safeParse(data).success).toBe(false);
  });
});
