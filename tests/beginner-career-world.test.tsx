import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { GameHub } from "@/components/platform/game-hub";
import { createCareerLeagueState } from "@/lib/career-league/engine";
import { CAREER_LEAGUE_KEY } from "@/lib/career-league/repository";
import { PLAYER_STORAGE_KEY, recordGameActivity } from "@/lib/game/progress";
import { LOCAL_CANDIDATE_KEY, SKILL_EVIDENCE_KEY } from "@/lib/career/repository";
import { ThemeProvider } from "@/components/platform/theme-provider";
import type { SkillEvidence } from "@/lib/career/model";
import { GAME_KEY } from "@/lib/campaign/store";
import { FIRST_DAY_KEY } from "@/lib/campaign/first-day";
import { initialState } from "@/lib/campaign/director";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/game",
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    CAREER_LEAGUE_KEY,
    JSON.stringify({
      ...createCareerLeagueState(),
      persona: "student",
      placementPath: "start-basics",
      placementRecommendation: 1,
      onboardingComplete: true,
    }),
  );
});
afterEach(cleanup);

const show = async (locale: "ar" | "en" = "en") => {
  const view = render(<ThemeProvider><GameHub locale={locale} /></ThemeProvider>);
  await waitFor(() => expect(view.container.querySelector(".command-game")).toBeInTheDocument());
  return view;
};

describe("Phase 3 Game Hub deduplication", () => {
  it("keeps beginner students on the single shared Game Hub", async () => {
    const view = await show("en");
    expect(view.container.querySelector(".beginner-world")).not.toBeInTheDocument();
    expect(view.container.querySelectorAll(".platform-nav")).toHaveLength(1);
    expect(view.container.querySelectorAll(".command-game")).toHaveLength(1);
    expect(view.container.querySelectorAll(".phase3-owner-capital")).toHaveLength(1);
    expect(view.container.querySelectorAll(".phase3-career-entry")).toHaveLength(1);
    expect(view.container.querySelectorAll(".bcw-company")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "View company progression" })).toHaveAttribute("href", "/en/career-league/companies");
  });

  it("preserves Arabic routing and content without a second navigation system", async () => {
    const view = await show("ar");
    expect(view.container.querySelectorAll(".platform-nav")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "ابدأ التدريب" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "عرض تقدم الشركات" })).toHaveAttribute("href", "/ar/career-league/companies");
  });

  it("records a perfect owner-capital result under the exact existing activity key", async () => {
    await show();
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));
    for (const answer of ["The owner invested capital", "Cash and Owner Capital", "Cash and equity both increase", "No, both accounts increased"]) {
      fireEvent.click(screen.getByRole("button", { name: answer }));
    }
    expect(screen.getByText("Transaction understood")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
    expect(saved.activities["practice:beginner-owner-capital"]).toMatchObject({ bestScore: 100, attempts: 1, kind: "practice" });
    expect(localStorage.getItem(SKILL_EVIDENCE_KEY)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Back to Game Hub" }));
    expect(within(document.querySelector(".phase3-owner-capital") as HTMLElement).getByText("Completed")).toBeInTheDocument();
  });

  it("preserves retry scoring and never creates professional evidence", async () => {
    await show();
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));
    fireEvent.click(screen.getByRole("button", { name: "The company earned sales revenue" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Look at the source document");
    for (const answer of ["The owner invested capital", "Cash and Owner Capital", "Cash and equity both increase", "No, both accounts increased"]) {
      fireEvent.click(screen.getByRole("button", { name: answer }));
    }
    const saved = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
    expect(saved.activities["practice:beginner-owner-capital"]).toMatchObject({ bestScore: 80, attempts: 2 });
    expect(localStorage.getItem(SKILL_EVIDENCE_KEY)).toBeNull();
  });

  it("recognizes the historical saved practice key without migration", async () => {
    recordGameActivity("practice", "beginner-owner-capital", 100, ["fundamentals"], "2026-10-20T00:00:00.000Z", 1);
    await show();
    expect(within(document.querySelector(".phase3-owner-capital") as HTMLElement).getByText("Completed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Practice again" })).toBeInTheDocument();
  });

  it("keeps the calculator as a focused utility", async () => {
    await show();
    fireEvent.click(screen.getByRole("button", { name: "Open calculator" }));
    const dialog = screen.getByRole("dialog", { name: "Calculator" });
    fireEvent.change(within(dialog).getByLabelText("Calculation"), { target: { value: "10000 + 2500" } });
    fireEvent.keyDown(within(dialog).getByLabelText("Calculation"), { key: "Enter" });
    expect(within(dialog).getByRole("status")).toHaveTextContent("12500");
  });

  it("shows real company unlock state and keeps graduate users on the same hub", async () => {
    const view = await show();
    expect(screen.getByText("1 of 5 company levels unlocked from your real evidence and assessments.")).toBeInTheDocument();
    view.unmount();
    localStorage.setItem(CAREER_LEAGUE_KEY, JSON.stringify({ ...createCareerLeagueState(), persona: "graduate", placementRecommendation: 1 }));
    const graduate = await show();
    expect(graduate.container.querySelector(".command-game")).toBeInTheDocument();
    expect(graduate.container.querySelector(".beginner-world")).not.toBeInTheDocument();
  });

  it("derives company unlocks only from the current candidate's real evidence", async () => {
    const candidateId = "current-candidate";
    const evidence = (skillId: "document-analysis" | "journal-entries"): SkillEvidence => ({
      version: 1,
      evidenceId: `proof-${skillId}`,
      localCandidateId: candidateId,
      activityId: `case-${skillId}`,
      activityType: "case",
      chapterId: 1,
      missionId: "first-shift",
      skillId,
      roleRelevance: ["junior-accountant"],
      difficulty: 1,
      score: 90,
      accuracy: 90,
      firstAttemptCorrect: true,
      attempts: 1,
      hintsUsed: 0,
      independentCompletion: true,
      criticalErrors: 0,
      completedAt: "2026-10-20T00:00:00.000Z",
      source: "mission",
      assessmentIntegrity: "demonstrated",
      titleAr: "دليل",
      titleEn: "Evidence",
    });
    localStorage.setItem(LOCAL_CANDIDATE_KEY, candidateId);
    localStorage.setItem(SKILL_EVIDENCE_KEY, JSON.stringify([evidence("document-analysis"), evidence("journal-entries")]));
    localStorage.setItem(GAME_KEY, JSON.stringify({ ...initialState(), legacy: { [FIRST_DAY_KEY]: { completed: ["supplier-invoice", "customer-receipt", "office-expense"] } } }));
    localStorage.setItem(CAREER_LEAGUE_KEY, JSON.stringify({ ...createCareerLeagueState(), persona: "student", placementRecommendation: 1, assessmentResults: { "promotion-1": "pass" } }));
    const view = await show();
    await waitFor(() => expect(screen.getByText("2 of 5 company levels unlocked from your real evidence and assessments.")).toBeInTheDocument());
    view.unmount();
    localStorage.setItem(LOCAL_CANDIDATE_KEY, "different-candidate");
    await show();
    expect(screen.getByText("1 of 5 company levels unlocked from your real evidence and assessments.")).toBeInTheDocument();
  });
});
