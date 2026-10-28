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
  fixture.request.mockImplementation((route: string) =>
    Promise.resolve(
      route === "me/excel-foundations"
        ? { data: { completedSteps: [1, 2, 3, 4, 5] } }
        : { data: { accepted: [] } },
    ),
  );
});
describe("Account-safe student journey guidance", () => {
  it.each(["ar", "en"] as const)(
    "keeps the %s account settings route free of the learning journey overlay",
    (locale) => {
      fixture.path = `/${locale}/account`;
      const { container } = render(
        <StudentJourneyProvider locale={locale}>
          <main>Account settings content</main>
        </StudentJourneyProvider>,
      );
      expect(screen.getByText("Account settings content")).toBeVisible();
      expect(container.querySelector(".student-journey-bar")).toBeNull();
      expect(
        screen.queryByRole("navigation", {
          name:
            locale === "ar" ? "مكانك في الرحلة" : "Your place in the journey",
        }),
      ).toBeNull();
    },
  );
  it.each([
    "/en/competition",
    "/en/academy",
    "/en/bootcamp",
    "/en/career",
    "/en/arena/missions",
  ])("keeps account progress without adding a global journey bar above %s", async (path) => {
    fixture.path = path;
    const { container } = render(
      <StudentJourneyProvider locale="en">
        <main>Specialized application content</main>
      </StudentJourneyProvider>,
    );
    expect(screen.getByText("Specialized application content")).toBeVisible();
    await waitFor(() => expect(fixture.request).toHaveBeenCalled());
    expect(container.querySelector(".student-journey-bar")).toBeNull();
    expect(
      screen.queryByRole("navigation", {
        name: "Your place in the journey",
      }),
    ).toBeNull();
  });
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
  it.each([
    "/ar/student",
    "/en/student",
    "/ar/game/student",
    "/en/game/student",
  ])("does not place the large journey bar above the direct training desk at %s", (path) => {
    fixture.path = path;
    const locale = path.startsWith("/ar") ? "ar" : "en";
    const { container } = render(
      <StudentJourneyProvider locale={locale}>
        <main>Direct training desk</main>
      </StudentJourneyProvider>,
    );
    expect(screen.getByText("Direct training desk")).toBeVisible();
    expect(container.querySelector(".student-journey-bar")).toBeNull();
  });
  it.each([
    "/ar/bootcamp/excel-foundations",
    "/en/bootcamp/excel-foundations",
  ])("does not place the signed-in journey overlay above %s", (path) => {
    fixture.path = path;
    const locale = path.startsWith("/ar") ? "ar" : "en";
    const { container } = render(
      <StudentJourneyProvider locale={locale}>
        <main>Standalone learning workspace</main>
      </StudentJourneyProvider>,
    );
    expect(screen.getByText("Standalone learning workspace")).toBeVisible();
    expect(container.querySelector(".student-journey-bar")).toBeNull();
  });
  it.each(["ar", "en"] as const)(
    "keeps the %s career profile and CV studio free of a competing journey overlay",
    (locale) => {
      fixture.path = `/${locale}/career-profile/cv`;
      const { container } = render(
        <StudentJourneyProvider locale={locale}>
          <main>Career CV studio</main>
        </StudentJourneyProvider>,
      );
      expect(screen.getByText("Career CV studio")).toBeVisible();
      expect(container.querySelector(".student-journey-bar")).toBeNull();
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
    expect(screen.getByText("Completed learning stages").nextSibling?.textContent).toBe("1/3");
    expect(screen.getByText("Current foundation track progress").nextSibling?.textContent).toBe("33%");
    expect(
      screen.getByRole("list", { name: "Your journey sequence" }),
    ).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    for (const outcome of [
      "Skill Passport",
      "Practical Work",
      "Career Profile",
      "English CV",
      "Achievements",
    ])
      expect(screen.getByRole("link", { name: new RegExp(outcome) })).toBeVisible();
  });
  it("waits for saved progress and does not invent a starting point on a failed request", async () => {
    fixture.request.mockRejectedValue(new Error("unavailable"));
    render(view());
    await screen.findByRole("alert");
    expect(
      screen.queryByRole("link", { name: "Continue my journey" }),
    ).toBeNull();
    fixture.request.mockImplementation((route: string) =>
      Promise.resolve(
        route === "me/excel-foundations"
          ? { data: { completedSteps: [1, 2, 3, 4, 5] } }
          : { data: { accepted: [...stepIds] } },
      ),
    );
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
    fixture.request.mockImplementation((route: string) =>
      Promise.resolve(
        route === "me/excel-foundations"
          ? { data: { completedSteps: [1, 2, 3, 4, 5] } }
          : { data: { accepted: [...stepIds] } },
      ),
    );
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
    fixture.request
      .mockResolvedValueOnce({ data: { accepted: [...stepIds] } })
      .mockResolvedValueOnce({ data: { completedSteps: [1, 2, 3, 4, 5] } });
    const result = render(view());
    await screen.findByRole("link", { name: "Continue my journey" });
    let resolve: ((value: unknown) => void) | undefined;
    fixture.request
      .mockImplementationOnce(
        () =>
          new Promise((value) => {
            resolve = value;
          }),
      )
      .mockResolvedValueOnce({ data: { completedSteps: [1, 2, 3, 4, 5] } });
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
