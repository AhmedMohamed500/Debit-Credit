import assert from "node:assert/strict";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const label = process.argv.includes("--after") ? "after" : "before";
const base = process.env.PHASE3_BASE_URL || "http://localhost:3112";
const output = path.resolve("artifacts/phase3-dedup", label);
const careerLeague = {
  version: 1,
  persona: "student",
  workEnvironment: "small-business",
  goal: "first-job",
  targetRoleId: "junior-accountant",
  placementPath: "start-basics",
  placementScore: 40,
  placementRecommendation: 1,
  targetOpportunityId: null,
  acceptedOfferId: null,
  onboardingComplete: true,
  assessmentResults: {},
  updatedAt: "2026-10-27T00:00:00.000Z",
};
const baselineScenarios = [
  { locale: "ar", width: 1440, height: 1000, theme: "light", persona: "student" },
  { locale: "en", width: 1440, height: 1000, theme: "dark", persona: "student" },
  { locale: "ar", width: 390, height: 844, theme: "light", persona: "student" },
];
const scenarios = label === "before"
  ? baselineScenarios
  : [
      ...baselineScenarios,
      { locale: "en", width: 1024, height: 900, theme: "dark", persona: "graduate" },
      { locale: "en", width: 390, height: 844, theme: "light", persona: "guest" },
    ];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_EXECUTABLE ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--disable-background-networking", "--no-first-run", "--no-sandbox"],
});
const browserErrors = [];
try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({
      locale: scenario.locale === "ar" ? "ar-EG" : "en-US",
      viewport: { width: scenario.width, height: scenario.height },
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        !message.text().includes("status of 401 (Unauthorized)")
      )
        browserErrors.push(message.text());
    });
    await page.addInitScript(
      ({ state, theme, persona }) => {
        localStorage.clear();
        if (persona !== "guest") {
          localStorage.setItem(
            "debit-credit-career-league-v1",
            JSON.stringify({ ...state, persona }),
          );
        }
        localStorage.setItem("debit-credit-theme-v1", theme);
      },
      { state: careerLeague, theme: scenario.theme, persona: scenario.persona },
    );
    const response = await page.goto(`${base}/${scenario.locale}/game`, {
      waitUntil: "networkidle",
    });
    assert.equal(response?.status(), 200);
    const root = label === "before" ? ".beginner-world" : ".command-game";
    await page.locator(root).waitFor({ state: "visible" });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      true,
      `${scenario.locale}-${scenario.width} has horizontal overflow`,
    );
    if (label === "before") {
      assert.equal(await page.locator(".beginner-world").count(), 1);
      assert.equal(await page.locator(".bcw-company").count(), 5);
      assert.equal(await page.locator(".bcw-roadmap-node").count(), 8);
    } else {
      assert.equal(await page.locator(".beginner-world").count(), 0);
      assert.equal(await page.locator(".phase3-owner-capital").count(), 1);
      assert.equal(await page.locator(".phase3-career-entry").count(), 1);
      assert.equal(await page.locator(".student-game-link").count(), 0);
      assert.equal(await page.locator(".hub-next-mission").count(), 1);
      assert.equal(await page.locator(".command-rail nav a").count(), 6);
      assert.equal(
        await page.locator(".platform-nav").count(),
        1,
        "Game Hub must have one shared global navigation",
      );
    }
    const stem = scenario.persona === "student"
      ? `${scenario.locale}-${scenario.width}-${scenario.theme}`
      : `${scenario.locale}-${scenario.width}-${scenario.theme}-${scenario.persona}`;
    await page.screenshot({
      path: path.join(output, `${stem}.png`),
      fullPage: true,
    });
    if (scenario.width === 1440 && scenario.persona === "student") {
      const start = page.getByRole("button", {
        name:
          scenario.locale === "ar"
            ? label === "before"
              ? /ابدأ حالة رأس المال|أعد حالة رأس المال|افحص إيصال رأس مال المالك/
              : /ابدأ التدريب|تدرّب مرة أخرى/
            : label === "before"
              ? /Start owner capital case|Replay owner capital case|Inspect owner capital receipt/
              : /Start practice|Practice again/,
      });
      await start.first().click();
      await page
        .getByRole("dialog", {
          name:
            scenario.locale === "ar"
              ? "افهم العملية"
              : "Understand the Transaction",
        })
        .waitFor();
      await page.screenshot({
        path: path.join(output, `${stem}-owner-capital-case.png`),
        fullPage: true,
      });
    }
    await context.close();
  }
  assert.deepEqual(browserErrors, [], `Browser errors: ${browserErrors.join(" | ")}`);
  console.log(`PASS Phase 3 ${label} visual QA`);
  console.log(output);
} finally {
  await browser.close();
}
