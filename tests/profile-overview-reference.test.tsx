import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ProfessionalOverview } from "@/components/career/candidate-portfolio";
import { createDefaultProfile } from "@/lib/career/repository";
import { calculatePassport } from "@/lib/career/evidence";
import { emptyPortfolio } from "@/lib/career/portfolio";
import { defaultShowcase, type Showcase } from "@/lib/career/showcase";

afterEach(cleanup);
const profile = {
  ...createDefaultProfile("Alice Accountant"),
  fullName: "Alice Accountant",
  linkedIn: "https://www.linkedin.com/in/alice-accountant",
  portfolio: "https://alice.example.com",
};
const showcase: Showcase = {
  revision: 0,
  settings: defaultShowcase(),
  token: null,
  name: profile.fullName,
  works: [],
};
function view(locale: "ar" | "en" = "en", data = showcase) {
  const open = vi.fn();
  const result = render(
    <ProfessionalOverview
      profile={profile}
      locale={locale}
      portfolio={emptyPortfolio}
      evidence={[]}
      completeness={50}
      passport={calculatePassport([])}
      showcase={data}
      nextAction={{ href: `/${locale}/game/first-shift`, label: "First Shift" }}
      open={open}
    />,
  );
  return { ...result, open };
}
describe("Compact reference profile overview", () => {
  it.each(["ar", "en"] as const)(
    "keeps real canonical social links in %s",
    (locale) => {
      view(locale);
      expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
        "href",
        profile.linkedIn,
      );
      expect(
        screen.getByRole("link", { name: "Portfolio / Website" }),
      ).toHaveAttribute("href", profile.portfolio);
      expect(screen.queryByRole("link", { name: "GitHub" })).toBeNull();
    },
  );
  it("does not replace a saved showcase link with the canonical fallback", () => {
    view("en", {
      ...showcase,
      settings: {
        ...showcase.settings,
        socials: {
          ...showcase.settings.socials,
          linkedin: "https://www.linkedin.com/in/new-link",
        },
      },
    });
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/new-link",
    );
  });
  it("keeps the five reference metrics ordered and truthful", () => {
    const { container } = view();
    const metrics = container.querySelectorAll(".candidate-metrics article");
    expect(
      Array.from(metrics, (el) => el.querySelector("b")?.textContent),
    ).toEqual(["0", "0", "0", "0", "50%"]);
    expect(metrics[1]).toHaveAttribute(
      "title",
      "Self-reported, not platform verified",
    );
    expect(metrics[4]).toHaveAttribute(
      "title",
      "Profile complete · not readiness",
    );
    expect(
      screen.getByRole("progressbar", {
        name: "Target skill practice coverage",
      }),
    ).toHaveAttribute("value", "0");
    expect(screen.queryByText("78%")).toBeNull();
  });
  it("has compact six-row details and working management destinations", () => {
    const { container, open } = view();
    expect(
      container.querySelectorAll(".candidate-detail-list > div"),
    ).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: "See learning plan" }));
    expect(open).toHaveBeenCalledWith("progress");
    fireEvent.click(screen.getByRole("button", { name: "View & manage" }));
    expect(open).toHaveBeenCalledWith("certifications");
    expect(screen.getByRole("link", { name: /First Shift/ })).toHaveAttribute(
      "href",
      "/en/game/first-shift",
    );
  });
});
