import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { CareerProfileApp } from "@/components/career/career-profile-app";
import { GameApp } from "@/components/campaign/game-app";
import { initialState } from "@/lib/campaign/director";
import { closeFirstDayDocument, completeFirstDayIntro, enterFirstDayDesk, firstDayDocuments, submitFirstDayDocument } from "@/lib/campaign/first-day";
import { GAME_KEY } from "@/lib/campaign/store";
import { BrowserCareerProfileRepository, createDefaultProfile } from "@/lib/career/repository";

function completedFirstShift() {
  let state = enterFirstDayDesk(completeFirstDayIntro(initialState()));
  for (const document of firstDayDocuments) {
    state = submitFirstDayDocument(state, document.id, JSON.stringify(document.expected), 1000).state;
  }
  return closeFirstDayDocument(state);
}

function seedCareer() {
  const profile = {
    ...createDefaultProfile("Ahmed Mohamed"),
    headline: "Junior Accountant",
    location: "Cairo",
    country: "Egypt",
    email: "ahmed@example.com",
    phone: "+20 100",
    openToWork: true,
    completed: true,
    privacy: {
      ...createDefaultProfile().privacy,
      visibility: "link" as const,
      showEmail: true,
      showPhone: false,
      showLocation: true,
      showSimulationResults: true,
    },
  };
  new BrowserCareerProfileRepository().save(profile);
  localStorage.setItem(GAME_KEY, JSON.stringify({ ...completedFirstShift(), name: profile.fullName }));
  return profile;
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("Career Profile UI", () => {
  it("renders the Arabic professional dashboard in RTL with real First Shift evidence", async () => {
    seedCareer();
    const { container } = render(<CareerProfileApp locale="ar" view="dashboard" />);
    await screen.findByRole("heading", { name: "Ahmed Mohamed" });
    expect(container.querySelector(".career-app")).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("Mizan Trading — First Shift")).toBeInTheDocument();
    expect(screen.getByText("3/3")).toBeInTheDocument();
    expect(screen.getByText("لا يوجد تقييم مهني موثق حتى الآن")).toBeInTheDocument();
  });

  it("renders the English passport in LTR and never promotes game evidence to Verified", async () => {
    seedCareer();
    const { container } = render(<CareerProfileApp locale="en" view="skills" />);
    await screen.findByRole("heading", { name: "Accounting Skill Passport" });
    expect(container.querySelector(".career-app")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("Journal Entries")).toBeInTheDocument();
    expect(screen.getAllByText("Demonstrated").length).toBeGreaterThan(0);
    expect(screen.queryByText("Verified", { selector: ".passport-row em" })).toBeNull();
  });

  it("applies the same profile and privacy controls to employer preview", async () => {
    seedCareer();
    render(<CareerProfileApp locale="en" view="employer" />);
    await screen.findByRole("heading", { name: "Ahmed Mohamed" });
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
    expect(screen.queryByText("+20 100")).toBeNull();
    expect(screen.getByText(/Frontend-only local preview/)).toBeInTheDocument();
  });

  it("keeps Game Profile explicitly separate and links to the professional profile", async () => {
    seedCareer();
    render(<GameApp locale="en" view="profile" />);
    await waitFor(() => expect(screen.getByText("GAME PROFILE")).toBeInTheDocument());
    expect(screen.getByText(/Professional identity and CV live in Career Profile/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Professional Career Profile" })).toHaveAttribute("href", "/en/career-profile");
  });
});
