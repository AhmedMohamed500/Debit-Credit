import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createDefaultProfile } from "@/lib/career/repository";
import { initialState } from "@/lib/campaign/director";
import { calculatePassport } from "@/lib/career/evidence";
import { MemberProfile } from "@/components/career/member-profile";
import { defaultShowcase } from "@/lib/career/showcase";
const fixture = vi.hoisted(() => ({ owner: "alice", request: vi.fn() }));
vi.mock("@/components/cloud/session-boundary", () => ({
  useCloudIdentity: () => ({
    user: { id: fixture.owner, email: `${fixture.owner}@example.test` },
    profile: { displayName: fixture.owner },
  }),
}));
vi.mock("@/lib/cloud/runtime", () => ({
  requestJSON: (...args: unknown[]) => fixture.request(...args),
  cloudUser: () => fixture.owner,
  CloudFailure: class extends Error {},
}));
vi.mock("@/lib/campaign/store", () => ({
  useGame: () => ({ state: initialState() }),
}));
vi.mock("@/components/career/profile-photo", () => ({
  ProfilePhoto: () => null,
}));
const profile = {
  ...createDefaultProfile("Alice Accountant"),
  fullName: "Alice Accountant",
};
const view = (locale: "ar" | "en" = "en") => (
  <MemberProfile
    locale={locale}
    profile={profile}
    evidence={[]}
    passport={calculatePassport([])}
  />
);
afterEach(cleanup);
beforeEach(() => {
  fixture.owner = "alice";
  window.history.replaceState(null, "", "/");
  fixture.request.mockReset();
  fixture.request.mockImplementation(async (route: string) =>
    route === "me/showcase"
      ? { revision: 0, settings: defaultShowcase(), token: null, name: "Alice Accountant", works: [] }
      : route === "me/student-unit"
      ? { data: { accepted: [] } }
      : { revision: 0, courses: [], certificates: [] },
  );
});
describe("Member dashboard", () => {
  it.each(["student", "fresh-graduate", "junior", "mid", "senior"] as const)(
    "supports %s profiles with truthful empty progress",
    async (experienceLevel) => {
      render(
        <MemberProfile
          locale="en"
          profile={{ ...profile, experienceLevel }}
          evidence={[]}
          passport={calculatePassport([])}
        />,
      );
      expect(
        await screen.findByRole("heading", { name: "Alice Accountant" }),
      ).toBeInTheDocument();
      await screen.findByText("0/11");
      expect(
        screen.getByText(/personal profile complete · not a skill score/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Complete your first accounting task/),
      ).toBeInTheDocument();
      expect(screen.queryByText("75% Complete")).toBeNull();
    },
  );
  it("lets a person enter a course and sends a private revision-controlled command", async () => {
    render(view());
    fireEvent.click(
      screen.getByRole("button", { name: "Courses" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Add course" }),
      ).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Add course" }));
    fireEvent.change(screen.getByLabelText("Course title"), {
      target: { value: "Excel Accounting" },
    });
    fireEvent.change(screen.getByLabelText("Training provider"), {
      target: { value: "University" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save course" }));
    await waitFor(() =>
      expect(fixture.request).toHaveBeenCalledWith(
        "me/portfolio",
        "PUT",
        expect.objectContaining({
          action: "save-course",
          revision: 0,
          course: expect.objectContaining({ title: "Excel Accounting" }),
        }),
      ),
    );
    expect(
      await screen.findByText("Saved privately to your account."),
    ).toBeInTheDocument();
  });
  it("exposes Arabic certificate upload with no verification claim", async () => {
    const { container } = render(view("ar"));
    fireEvent.click(
      screen.getAllByRole("button", { name: "الشهادات" })[1],
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "أضف شهادة" }),
      ).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "أضف شهادة" }));
    expect(screen.getByLabelText("صورة الشهادة")).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp",
    );
    expect(
      screen.getByText(/ليست موثقة من Debit & Credit/),
    ).toBeInTheDocument();
    expect(container.querySelector("main")).toHaveAttribute("dir", "rtl");
  });
  it("clears old-owner course records before another account can see them", async () => {
    fixture.request.mockImplementation(async (route: string) =>
      route === "me/student-unit"
        ? { data: { accepted: [] } }
        : {
            revision: 1,
            courses: [
              {
                id: "a",
                title: "Alice private course",
                provider: "School",
                status: "completed",
                notes: "",
                date: "",
                updatedAt: "2026-10-10",
              },
            ],
            certificates: [],
          },
    );
    const { rerender } = render(view());
    fireEvent.click(
      screen.getByRole("button", { name: "Courses" }),
    );
    await screen.findByText("Alice private course");
    fixture.owner = "bob";
    fixture.request.mockImplementation(() => new Promise(() => {}));
    rerender(view());
    expect(screen.queryByText("Alice private course")).toBeNull();
  });
});
