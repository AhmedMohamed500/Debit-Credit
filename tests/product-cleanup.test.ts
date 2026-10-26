import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const source = (path: string) => readFileSync(join(root, path), "utf8");

describe("product cleanup compatibility contract", () => {
  it("redirects retired competition pages to the surviving destinations", () => {
    expect(source("app/[locale]/leaderboard/page.tsx")).toContain(
      "`/${locale}/competition`",
    );
    expect(source("app/[locale]/arena/leaderboard/page.tsx")).toContain(
      "`/${locale}/competition`",
    );
    expect(source("app/[locale]/accounting-arena/page.tsx")).toContain(
      "`/${locale}/account#learning-competition`",
    );
  });

  it("deletes the duplicate local leaderboard and standalone arena UI", () => {
    for (const path of [
      "components/platform/leaderboard-platform.tsx",
      "components/foundations/accounting-arena.tsx",
      "app/competition-v2.css",
      "lib/local-competition/v2-repository.ts",
      "components/progress/progress-dashboard.tsx",
    ])
      expect(existsSync(join(root, path)), path).toBe(false);
  });

  it("keeps primary navigation on one journey, competition and profile surface", () => {
    const navigation = [
      source("components/platform/platform-nav.tsx"),
      source("components/game/mobile-game-nav.tsx"),
      source("components/platform/game-hub.tsx"),
    ].join("\n");
    expect(navigation).not.toContain('/leaderboard"');
    expect(navigation).not.toContain("Local Career League");
    expect(navigation).not.toContain("EMPLOYER PREVIEW");
    expect(navigation).toContain("/competition");
    expect(navigation).toContain("/career-profile");
  });

  it("preserves server competition and accepted Excel progress while gating the journey", () => {
    expect(source("app/api/v1/[...path]/route.ts")).toContain(
      'case "GET competition/leaderboard"',
    );
    const journey = source("lib/student/journey.ts");
    expect(journey).toContain('/bootcamp/excel-foundations');
    expect(journey).toContain("excelCompletedSteps >= 5");
    expect(journey).toContain("excelCompletedSteps,");
    expect(source("lib/server/progress/excel-foundations.ts")).toContain(
      "rankArena",
    );
  });
});
