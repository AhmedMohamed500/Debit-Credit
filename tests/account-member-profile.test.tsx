import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AccountMemberProfile } from "@/components/career/account-member-profile";
import { createDefaultProfile } from "@/lib/career/repository";
const fixture = vi.hoisted(() => ({ owner: "a", request: vi.fn() }));
vi.mock("@/lib/cloud/runtime", () => ({
  cloudUser: () => fixture.owner,
  requestJSON: (...args: unknown[]) => fixture.request(...args),
  queueCloudBackup: vi.fn(),
}));
vi.mock("@/components/career/member-profile", () => ({
  MemberProfile: ({
    profile,
  }: {
    profile: { fullName: string; location: string; summary: string };
  }) => (
    <section>
      <h1>{profile.fullName}</h1>
      <p>{profile.location}</p>
      <p>{profile.summary}</p>
    </section>
  ),
}));
const snapshot = (name: string, location = "Alexandria") => ({
  data: {
    profile: { ...createDefaultProfile(name), location },
    cv: { summary: "Accepted accounting practice, not employment." },
  },
});
beforeEach(() => {
  fixture.owner = "a";
  fixture.request.mockReset();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const view = (owner = "a") => (
  <AccountMemberProfile owner={owner} locale="ar" evidence={[]} passport={[]} />
);
it("reads the saved CV/profile identity instead of a blank or stale local profile", async () => {
  localStorage.setItem(
    "debit-credit-career-profile-v1",
    JSON.stringify(createDefaultProfile("")),
  );
  fixture.request.mockResolvedValue(snapshot("Ahmed Mohamed Ahmed Abdallah"));
  render(view());
  expect(
    await screen.findByRole("heading", {
      name: "Ahmed Mohamed Ahmed Abdallah",
    }),
  ).toBeVisible();
  expect(screen.getByText("Alexandria")).toBeVisible();
  expect(fixture.request).toHaveBeenCalledWith("me/cv");
  expect(
    screen.getByText("Accepted accounting practice, not employment."),
  ).toBeVisible();
  expect(
    JSON.parse(localStorage.getItem("debit-credit-career-profile-v1")!)
      .fullName,
  ).toBe("");
});
it("does not show the previous owner while the next account is loading", async () => {
  fixture.request.mockResolvedValueOnce(snapshot("Account A"));
  const { rerender } = render(view());
  await screen.findByRole("heading", { name: "Account A" });
  let resolveB!: (value: ReturnType<typeof snapshot>) => void;
  fixture.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveB = resolve;
      }),
  );
  fixture.owner = "b";
  rerender(view("b"));
  expect(screen.queryByRole("heading", { name: "Account A" })).toBeNull();
  resolveB(snapshot("Account B", "Cairo"));
  expect(
    await screen.findByRole("heading", { name: "Account B" }),
  ).toBeVisible();
});
it("rejects a stale in-flight owner response and refreshes after a saved sync", async () => {
  let resolveA!: (value: ReturnType<typeof snapshot>) => void;
  fixture.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveA = resolve;
      }),
  );
  const { rerender } = render(view());
  fixture.owner = "b";
  fixture.request.mockResolvedValue(snapshot("Account B"));
  rerender(view("b"));
  await screen.findByRole("heading", { name: "Account B" });
  resolveA(snapshot("Account A"));
  await waitFor(() =>
    expect(screen.queryByRole("heading", { name: "Account A" })).toBeNull(),
  );
  fixture.request.mockResolvedValue(snapshot("Account B updated"));
  window.dispatchEvent(new CustomEvent("app-sync-status", { detail: "saved" }));
  expect(
    await screen.findByRole("heading", { name: "Account B updated" }),
  ).toBeVisible();
});
it("reports an unavailable saved profile rather than rendering a default identity", async () => {
  fixture.request.mockResolvedValue(null);
  render(view());
  expect(await screen.findByRole("alert")).toHaveTextContent("تعذر تحميل");
  expect(screen.queryByRole("heading")).toBeNull();
});
