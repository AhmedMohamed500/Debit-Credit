import fs from "node:fs/promises";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);

const base = "http://127.0.0.1:3109";
const out = "artifacts/career-league";
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const checks = [];

async function visit(path, size, file, expected, locale = "en") {
  const page = await browser.newPage({ viewport: size, colorScheme: "dark" });
  page.on("console", (msg) => { if (msg.type() === "error" && !msg.text().includes("/_next/hmr")) errors.push(`${path}: ${msg.text()}`); });
  page.on("pageerror", (error) => errors.push(`${path}: ${error.message}`));
  await page.goto(`${base}/${locale}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const body = await page.locator("body").innerText();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  checks.push({ path: `/${locale}${path}`, size: `${size.width}x${size.height}`, expected: body.includes(expected), overflow });
  if (file) await page.screenshot({ path: `${out}/${file}`, fullPage: true });
  await page.close();
}

await visit("/?persona=student", { width: 1920, height: 1080 }, "landing-student.png", "FOR STUDENTS");
await visit("/?persona=graduate", { width: 1440, height: 900 }, "landing-graduate.png", "FOR GRADUATES");
await visit("/?persona=working-accountant", { width: 1366, height: 768 }, "landing-working-accountant.png", "FOR WORKING ACCOUNTANTS");
await visit("/game", { width: 1440, height: 900 }, "game-hub.png", "Mizan Trading");
await visit("/career-league/jobs", { width: 1440, height: 900 }, "job-market.png", "Career Simulation Job Market");
await visit("/career-league/jobs/horizon-general", { width: 1440, height: 900 }, "train-for-job.png", "ROLE-TARGETED TRAINING PLAN");
await visit("/career-league/gap", { width: 1440, height: 900 }, "career-gap.png", "Career Gap Report");
await visit("/career-league/companies", { width: 1440, height: 900 }, "company-progression.png", "Company Career Ladder");
await visit("/career-league/promotion", { width: 1440, height: 900 }, "promotion-assessment.png", "Promotion Assessment");
await visit("/career-league/corporate-bridge", { width: 430, height: 932 }, "mobile-career-league.png", "90 DAYS IN CORPORATE ACCOUNTING");
await visit("/leaderboard", { width: 390, height: 844 }, null, "CAREER LEAGUE");
await visit("/career", { width: 390, height: 844 }, null, "Career Reputation");
await visit("/career-league/jobs", { width: 390, height: 844 }, null, "سوق الوظائف", "ar");
await visit("/career-league/companies", { width: 430, height: 932 }, null, "سلم الشركات", "ar");

await browser.close();
console.log(JSON.stringify({ checks, errors }, null, 2));
if (checks.some((item) => !item.expected || item.overflow !== 0) || errors.length) process.exitCode = 1;
