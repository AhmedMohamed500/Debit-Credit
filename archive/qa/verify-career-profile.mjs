import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");

const base = process.env.CAREER_PROFILE_URL ?? "http://localhost:3103";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", error => errors.push(error.message));

const attempts = ["supplier-invoice", "customer-receipt", "office-expense"].map((document, index) => ({
  activityId: `first-day/${document}`, missionId: "first-day", chapterId: 1, skillId: "journal",
  difficulty: 2, accuracy: 100, attempts: 1, hintsUsed: 0, completionTime: 42,
  independentCompletion: true, criticalErrors: 0, score: 100,
  completedAt: `2026-09-10T00:00:0${index}Z`, mode: "practice", response: "balanced", correct: true,
}));
const game = { version: 2, name: "Ahmed Mohamed", xp: 300, coins: 150, active: null, completed: {}, evidence: attempts,
  journal: [], posted: [], reconciled: [], unlocked: [], upgrades: [], activeDays: [], arcade: null,
  arcadeBest: {}, rewardKeys: [], legacy: {} };
const profile = { version: 1, localCandidateId: "local_qa_candidate", slug: "ahmed-mohamed",
  fullName: "Ahmed Mohamed", headline: "Junior Accountant · Practical accounting simulations",
  targetRoleId: "junior-accountant", country: "Egypt", location: "Cairo", email: "ahmed@example.com", phone: "+20 100 000 0000",
  linkedIn: "", portfolio: "", education: [{ id: "edu-1", institution: "Cairo University", degree: "B.Com.", field: "Accounting", graduationYear: "2026" }],
  experience: [], graduationYear: "2026", experienceLevel: "fresh-graduate", yearsOfExperience: 0, languages: ["Arabic", "English"],
  employmentStatus: "Fresh graduate", openToWork: true, preferredWorkType: "hybrid", preferredLocation: "Cairo",
  summary: "Accounting candidate with hands-on evidence from document processing and journal entry simulations.",
  privacy: { visibility: "link", showEmail: true, showPhone: false, showLocation: true, showEducation: true, showExperience: true, showSkillScores: true, showSimulationResults: true },
  onboardingStep: 5, completed: true, updatedAt: "2026-09-10T00:00:00Z" };

async function seedAndOpen(path) {
  await page.goto(`${base}/en`);
  await page.evaluate(({ game, profile }) => {
    localStorage.clear();
    localStorage.setItem("debit-credit-world-v2", JSON.stringify(game));
    localStorage.setItem("debit-credit-local-candidate-id-v1", profile.localCandidateId);
    localStorage.setItem("debit-credit-career-profile-v1", JSON.stringify(profile));
  }, { game, profile });
  await page.goto(`${base}${path}`);
  await page.locator(".career-app").waitFor();
  await page.evaluate(() => document.fonts.ready);
}

try {
  await seedAndOpen("/ar/career-profile");
  assert.equal(await page.locator(".career-app").getAttribute("dir"), "rtl");
  assert.match(await page.locator(".career-identity").innerText(), /Ahmed Mohamed/);
  assert.match(await page.locator(".simulation").innerText(), /3\/3/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
  await page.screenshot({ path: "artifacts/career-profile-dashboard-ar.png", fullPage: true });

  await page.goto(`${base}/en/career-profile/skills`);
  await page.locator(".passport-list").waitFor();
  assert.match(await page.locator(".passport-list").innerText(), /Journal Entries/);
  assert.doesNotMatch(await page.locator("body").innerText(), /Verified\s+Career\s+Assessment/i);
  await page.locator(".passport-row").filter({ hasText: "Journal Entries" }).click();
  assert.match(await page.locator(".evidence-list").innerText(), /First Shift/);

  await page.goto(`${base}/en/career-profile/cv`);
  await page.locator(".professional-cv").waitFor();
  const cvText = await page.locator(".professional-cv").innerText();
  assert.match(cvText, /Ahmed Mohamed/);
  assert.doesNotMatch(cvText, /\bXP\b|\bCoins?\b|\bStreak\b/);
  await page.screenshot({ path: "artifacts/career-profile-cv-en.png", fullPage: true });
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".career-header").evaluate(node => getComputedStyle(node).display), "none");
  await page.emulateMedia({ media: "screen" });

  await page.goto(`${base}/ar/career-profile/employer-preview`);
  await page.locator(".talent-card").waitFor();
  assert.match(await page.locator(".talent-card").innerText(), /Ahmed Mohamed/);
  assert.match(await page.locator(".talent-card").innerText(), /محاكاة عملية/);
  await page.screenshot({ path: "artifacts/career-profile-employer-ar.png", fullPage: true });

  await page.goto(`${base}/en/talent/ahmed-mohamed`);
  await page.locator(".talent-card").waitFor();
  assert.match(await page.locator(".talent-card").innerText(), /ahmed@example.com/);
  assert.doesNotMatch(await page.locator(".talent-card").innerText(), /\+20 100/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/ar/career-profile`);
  await page.locator(".career-identity").waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.equal(overflow, 0);
  await page.screenshot({ path: "artifacts/career-profile-mobile-ar.png", fullPage: true });

  await page.goto(`${base}/ar/career-profile/edit`);
  await page.locator(".career-form").waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);

  assert.deepEqual(errors, []);
  const qa = { dashboard: true, skillDrillDown: true, cv: true, printStyles: true, employerPreview: true,
    publicLinkPrivacy: true, rtl: true, mobileWidth: 390, horizontalOverflow: 0, pageErrors: errors };
  await writeFile("artifacts/career-profile-qa.json", JSON.stringify(qa, null, 2));
  console.log(JSON.stringify(qa));
} finally {
  await browser.close();
}
