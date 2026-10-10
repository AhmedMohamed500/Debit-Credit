import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import type { CloudIdentity } from "@/lib/cloud/runtime";
import { initialState } from "@/lib/campaign/director";
import { stepIds } from "@/lib/student/unit";
import {
  StudentJourneyHome,
  StudentJourneyProvider,
} from "@/components/student/student-journey";

const fixture = vi.hoisted(() => ({
  identity: null as CloudIdentity | null,
  path: "/en",
  request: vi.fn(),
  ready: true,
}));
vi.mock("next/navigation", () => ({ usePathname: () => fixture.path }));
vi.mock("@/components/cloud/session-boundary", () => ({
  useCloudIdentity: () => fixture.identity,
}));
vi.mock("@/components/career/profile-photo", () => ({
  ProfilePhoto: () => null,
}));
vi.mock("@/lib/cloud/runtime", () => ({
  requestJSON: (...args: unknown[]) => fixture.request(...args),
}));
vi.mock("@/lib/campaign/store", () => ({
  useGame: () => ({ state: initialState(), ready: fixture.ready }),
}));

const identity = (owner = "student-a"): CloudIdentity => ({
  personalComplete: true,
  user: {
    id: owner,
    email: `${owner}@example.test`,
    emailVerified: false,
    role: "USER",
  },
  profile: {
    userId: owner,
    displayName: owner,
    handle: owner,
    avatar: "blue",
    locale: "en",
    persona: "student",
    targetRoleId: "junior-accountant",
    updatedAt: "2026-10-10",
  },
  capabilities: { email: true, google: false },
});
const view = () => (
  <StudentJourneyProvider locale="en">
    <StudentJourneyHome locale="en" />
  </StudentJourneyProvider>
);
afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  fixture.path = "/en";
  fixture.ready = true;
  fixture.identity = identity();
  fixture.request.mockReset();
  fixture.request.mockResolvedValue({ data: { accepted: [] } });
});
describe("Account-safe student journey guidance", () => {
  it.each(["ar", "en"] as const)(
    "does not duplicate the journey panel inside the %s first-shift workspace",
    async (locale) => {
      fixture.path = `/${locale}/game/first-shift`;
      const { container } = render(
        <StudentJourneyProvider locale={locale}>
          <p>Integrated shift workspace</p>
        </StudentJourneyProvider>,
      );
      await waitFor(() => expect(fixture.request).toHaveBeenCalled());
      expect(container.querySelector(".student-journey-bar")).toBeNull();
      expect(
        screen.getByText("Integrated shift workspace"),
      ).toBeInTheDocument();
    },
  );
  it("shows one primary next link and puts optional activities behind a disclosure", async () => {
    render(view());
    expect(
      (
        await screen.findByRole("link", { name: "Continue my journey" })
      ).getAttribute("href"),
    ).toBe("/en/game/student");
    expect(
      screen.getByText("Extra tools & activities (optional)").closest("details")
        ?.open,
    ).toBe(false);
  });
  it("waits for saved progress and does not invent a starting point on a failed request", async () => {
    fixture.request.mockRejectedValue(new Error("unavailable"));
    render(view());
    await screen.findByRole("alert");
    expect(
      screen.queryByRole("link", { name: "Continue my journey" }),
    ).toBeNull();
    fixture.request.mockResolvedValue({ data: { accepted: [...stepIds] } });
    await act(async () =>
      screen.getByRole("button", { name: "Retry" }).click(),
    );
    expect(
      (
        await screen.findByRole("link", { name: "Continue my journey" })
      ).getAttribute("href"),
    ).toBe("/en/game/first-shift");
  });
  it("refreshes next-step guidance after an accepted server task", async () => {
    render(view());
    await screen.findByRole("link", { name: "Continue my journey" });
    fixture.request.mockResolvedValue({ data: { accepted: [...stepIds] } });
    await act(async () =>
      window.dispatchEvent(new Event("student-progress-changed")),
    );
    await waitFor(() =>
      expect(
        screen
          .getByRole("link", { name: "Continue my journey" })
          .getAttribute("href"),
      ).toBe("/en/game/first-shift"),
    );
  });
  it("does not show previous student's completion during an account switch", async () => {
    fixture.request.mockResolvedValueOnce({ data: { accepted: [...stepIds] } });
    const result = render(view());
    await screen.findByRole("link", { name: "Continue my journey" });
    let resolve: ((value: unknown) => void) | undefined;
    fixture.request.mockImplementationOnce(
      () =>
        new Promise((value) => {
          resolve = value;
        }),
    );
    fixture.identity = identity("student-b");
    result.rerender(view());
    expect(
      screen.queryByRole("link", { name: "Continue my journey" }),
    ).toBeNull();
    expect(screen.getByRole("status").textContent).toContain(
      "Finding your saved next step",
    );
    await act(async () => resolve?.({ data: { accepted: [] } }));
    expect(
      screen
        .getByRole("link", { name: "Continue my journey" })
        .getAttribute("href"),
    ).toBe("/en/game/student");
  });
  it.each([null, "graduate", "working-accountant"] as const)(
    "preserves non-student navigation for %s",
    async (persona) => {
      fixture.identity = persona
        ? { ...identity(), profile: { ...identity().profile, persona } }
        : null;
      render(
        <StudentJourneyProvider locale="en">
          <p>Existing advanced or guest page</p>
        </StudentJourneyProvider>,
      );
      expect(screen.getByText("Existing advanced or guest page")).toBeTruthy();
      expect(fixture.request).not.toHaveBeenCalled();
    },
  );
});
