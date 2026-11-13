import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { chromium } from "playwright-core";
import pg from "pg";
import {
  bootcampMissions,
  foundationEntries,
} from "../lib/bootcamp/foundation-catalog.ts";
import {
  completeBootcampMission,
  createBootcampState,
  submitFoundationTask,
} from "../lib/bootcamp/engine.ts";
import { initialState } from "../lib/campaign/director.ts";
import { firstDayDocuments, submitFirstDayDocument } from "../lib/campaign/first-day.ts";
import { markFirstShiftLedgerReviewed } from "../lib/campaign/first-shift-hub.ts";
import { stepIds } from "../lib/student/unit.ts";

const base = "http://127.0.0.1:3118";
const output = path.resolve("artifacts/unified-journey-v11");
const temporary = path.join(output, "tmp");
const databaseDir = path.join(output, "database");
const connection =
  "postgresql://postgres:journey-v11-local-only@127.0.0.1:55436/journey_v11_test";
const results = [];
const browserErrors = [];
let app;
let browser;
let database;
let pool;

const record = (name, condition = true) => {
  assert.ok(condition, name);
  results.push(name);
  console.log("PASS", name);
};
const waitForHttp = async () => {
  for (let attempt = 0; attempt < 90; attempt++) {
    try {
      const response = await fetch(base + "/en");
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Journey QA application did not start");
};
const stopChild = async (child) => {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      windowsHide: true,
      stdio: "ignore",
    });
    await new Promise((resolve) => killer.once("exit", resolve));
  } else child.kill("SIGTERM");
};
const screenshot = async (page, label) => {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(output, `${label}.png`), fullPage: true });
};
const layoutFits = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const seedPersonal = async (email) => {
  const user = await pool.query('SELECT id FROM app_user WHERE email=$1', [email]);
  assert.equal(user.rowCount, 1);
  const record = {
    details: {
      fullName: "Journey QA Student",
      phone: "+20 100 123 4567",
      country: "Egypt",
      location: "Cairo",
      institution: "Fixture University",
      degree: "BCom in progress",
      field: "Accounting",
      graduationYear: "2028",
      experienceLevel: "student",
      linkedIn: "",
      portfolio: "",
      languages: ["Arabic", "English"],
    },
    email,
    savedAt: "2026-11-13T00:00:00.000Z",
  };
  await pool.query(
    `INSERT INTO cloud_progress (id,"userId",domain,data,revision,provenance,"createdAt","updatedAt")
     VALUES ($1,$2,'student-personal',$3::jsonb,1,'SERVER',now(),now())
     ON CONFLICT ("userId",domain) DO UPDATE SET data=excluded.data,revision=cloud_progress.revision+1,"updatedAt"=now()`,
    [randomUUID(), user.rows[0].id, JSON.stringify(record)],
  );
};
const signUp = async (page, email, locale) => {
  const password = "Journey-v11-local!123";
  await page.goto(`${base}/${locale}/signup?next=/${locale}/journey`);
  await page.locator('[name="name"]').fill("Journey QA Student");
  await page.locator('[name="email"]').fill(email);
  await page.locator('[name="password"]').fill(password);
  await page.locator('[name="confirm"]').fill(password);
  await page.locator('.auth-email-form button[type="submit"]').click();
  await page.waitForURL(`**/${locale}/login?**`);
  await page.locator('[name="email"]').fill(email);
  await page.locator('[name="password"]').fill(password);
  await page.locator('.auth-email-form button[type="submit"]').click();
  await page.waitForURL(`**/${locale}/student-profile?**`);
  await seedPersonal(email);
  await page.goto(`${base}/${locale}/journey`);
  await page.locator(".journey-shell").waitFor();
  record(`${locale} student account created in isolated browser database`);
  return password;
};
const signIn = async (page, email, password, locale = "en") => {
  await page.goto(`${base}/${locale}/login?next=/${locale}/journey`);
  await page.locator('[name="email"]').fill(email);
  await page.locator('[name="password"]').fill(password);
  await page.locator('.auth-email-form button[type="submit"]').click();
  await page.waitForURL(`**/${locale}/journey`);
};
const solveFoundations = (count = bootcampMissions.length) => {
  let state = createBootcampState();
  for (const mission of bootcampMissions.slice(0, count)) {
    for (const task of mission.tasks) {
      const response =
        task.kind === "journal"
          ? foundationEntries.find((entry) => entry.id === task.entryId).lines
          : task.answer;
      const result = submitFoundationTask(
        state,
        mission.id,
        task.id,
        response,
      );
      assert.equal(result.correct, true);
      state = result.state;
    }
    state = completeBootcampMission(state, mission.id, 0);
  }
  return state;
};
const seedServerProgress = async (
  email,
  foundations,
  accepted,
  gameState = null,
) => {
  const user = await pool.query('SELECT id FROM app_user WHERE email=$1', [email]);
  assert.equal(user.rowCount, 1);
  for (const [domain, data] of [
    ["foundations", foundations],
    [
      "student-unit1",
      {
        version: 1,
        accepted,
        attempts: Object.fromEntries(accepted.map((id) => [id, 1])),
        completedAt:
          accepted.length === stepIds.length
            ? "2026-11-13T00:00:00.000Z"
            : null,
      },
    ],
  ])
    await pool.query(
      `INSERT INTO cloud_progress (id,"userId",domain,data,revision,provenance,"createdAt","updatedAt")
       VALUES ($1,$2,$3,$4::jsonb,1,'SERVER',now(),now())
       ON CONFLICT ("userId",domain) DO UPDATE SET data=excluded.data,revision=cloud_progress.revision+1,"updatedAt"=now()`,
      [randomUUID(), user.rows[0].id, domain, JSON.stringify(data)],
    );
  if (gameState)
    await pool.query(
      `INSERT INTO cloud_progress (id,"userId",domain,data,revision,provenance,"createdAt","updatedAt")
       VALUES ($1,$2,'local-backup/debit-credit-world-v2',$3::jsonb,1,'LOCAL_BACKUP',now(),now())
       ON CONFLICT ("userId",domain) DO UPDATE SET data=excluded.data,revision=cloud_progress.revision+1,"updatedAt"=now()`,
      [randomUUID(), user.rows[0].id, JSON.stringify(gameState)],
    );
};
const completeShiftState = () => {
  let state = initialState();
  for (const document of firstDayDocuments)
    state = submitFirstDayDocument(
      state,
      document.id,
      JSON.stringify(document.expected),
      1000,
    ).state;
  return markFirstShiftLedgerReviewed(state);
};

try {
  await mkdir(temporary, { recursive: true });
  database = new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password: "journey-v11-local-only",
    port: 55436,
    persistent: true,
    createPostgresUser: false,
    postgresFlags: ["-h", "127.0.0.1"],
    onLog: () => {},
    onError: (error) => console.error(String(error)),
  });
  if (!existsSync(path.join(databaseDir, "PG_VERSION")))
    await database.initialise();
  await database.start();
  const admin = database.getPgClient();
  await admin.connect();
  if (
    !(await admin.query("SELECT 1 FROM pg_database WHERE datname='journey_v11_test'"))
      .rowCount
  )
    await database.createDatabase("journey_v11_test");
  await admin.end();
  const env = {
    ...process.env,
    APP_BUILD_DIR: ".next-backend-test",
    DATABASE_URL: connection,
    DIRECT_URL: connection,
    DATABASE_DRIVER: "postgres",
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
    BETTER_AUTH_URL: base,
  };
  const migration = spawn(
    process.execPath,
    ["node_modules/prisma/build/index.js", "migrate", "deploy"],
    { env, stdio: "inherit", windowsHide: true },
  );
  await new Promise((resolve, reject) =>
    migration.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error("Migration failed")),
    ),
  );
  pool = new pg.Pool({ connectionString: connection });
  await pool.query("DELETE FROM app_user");
  await pool.query("DELETE FROM auth_rate_limit");
  app = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "-H", "127.0.0.1", "-p", "3118"],
    { env, stdio: "inherit", windowsHide: true },
  );
  await waitForHttp();
  browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    env: { ...process.env, TEMP: temporary, TMP: temporary },
    args: ["--disable-background-networking", "--no-first-run"],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  const primaryEmail = "journey-primary@v11.test";
  const secondaryEmail = "journey-secondary@v11.test";
  const password = await signUp(page, primaryEmail, "en");
  await page.locator(".student-journey-page").waitFor();
  await page.waitForTimeout(1500);
  const journeyText = await page.locator(".student-journey-page").innerText();
  console.log("JOURNEY STATE", journeyText.slice(0, 1000));
  const startLink = page.locator(".journey-primary-cta, .student-next-action a").first();
  record("new student starts at Accounting Foundations", (await startLink.getAttribute("href")) === "/en/bootcamp?mission=business-world");
  record("new student journey fits 1440px", await layoutFits(page));
  await screenshot(page, "new-student-en-1440");

  await startLink.click();
  await page.getByRole("button", { name: "Move the money", exact: true }).click();
  await page.getByRole("button", { name: "I saw the movement · continue", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.reload();
  await page.locator(".fdn-account-matcher").waitFor();
  record("page refresh resumes the current foundation task");
  await page.locator(".fdn-account-pieces").getByRole("button", { name: "Cash", exact: true }).click();
  await page.locator(".fdn-account-matcher .fdn-primary").click();
  await page.locator(".fdn-error").waitFor();
  record("wrong answer displays corrective feedback without completion");
  await page.locator(".fdn-account-pieces").getByRole("button", { name: "Capital", exact: true }).click();
  await page.locator(".fdn-account-matcher .fdn-primary").click();
  await page.locator(".fdn-task-success").waitFor();
  record("retry accepts the corrected answer through server grading");

  await seedServerProgress(primaryEmail, solveFoundations(), stepIds.slice(0, 4));
  await page.goto(base + "/en/journey");
  await page.locator(".student-journey-page").waitFor();
  await page.getByRole("button", { name: /3\. Journal Entries/ }).click();
  record("partial student level deep link targets journal-service", (await page.locator(".journey-primary-cta").getAttribute("href")) === "/en/game/student?focus=journal-service");
  await screenshot(page, "partial-student-en-1440");

  const shift = completeShiftState();
  await seedServerProgress(
    primaryEmail,
    solveFoundations(),
    [...stepIds],
    shift,
  );
  await page.evaluate((state) => localStorage.setItem("debit-credit-world-v2", state), JSON.stringify(shift));
  await page.goto(base + "/en/journey");
  await page.getByText("7/8", { exact: true }).waitFor();
  record("all available work remains 7/8 full-program levels");
  record("full program progress is 88%, never false 100%", (await page.locator(".journey-total-progress i").getAttribute("style")).includes("88%"));
  record("Level 6 remains visibly in development", await page.getByText("In development", { exact: true }).isVisible());

  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => localStorage.setItem("debit-credit-theme-v1", value), theme);
    await page.reload();
    await page.locator(".student-journey-page").waitFor();
    record(`${theme} theme renders the journey`, await page.locator(".student-journey-page").isVisible());
    await screenshot(page, `full-en-1440-${theme}`);
  }
  for (const locale of ["ar", "en"])
    for (const viewport of [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
      { width: 320, height: 720 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(`${base}/${locale}/journey`);
      await page.locator(".journey-shell").waitFor();
      record(`${locale} journey fits ${viewport.width}px`, await layoutFits(page));
      record(`${locale} direction is correct at ${viewport.width}px`, (await page.locator(".student-journey-page").getAttribute("dir")) === (locale === "ar" ? "rtl" : "ltr"));
      await screenshot(page, `full-${locale}-${viewport.width}`);
    }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + "/en/account");
  await page.getByLabel("Account menu", { exact: true }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL("**/en");
  const secondaryPassword = await signUp(page, secondaryEmail, "en");
  await page.getByText("0/8", { exact: true }).waitFor();
  record("account switch does not leak the previous student's progress", await page.getByText("0/8", { exact: true }).isVisible());
  await page.goto(base + "/en/account");
  await page.getByLabel("Account menu", { exact: true }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL("**/en");
  await signIn(page, primaryEmail, password);
  await page.getByText("7/8", { exact: true }).waitFor();
  record("returning student restores server progress after account switching");
  assert.ok(secondaryPassword);

  const reduced = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reduced.newPage();
  await signIn(reducedPage, primaryEmail, password);
  record("reduced-motion browser renders without horizontal overflow", await layoutFits(reducedPage));
  await reducedPage.keyboard.press("Tab");
  record("keyboard navigation exposes a visible focus target", await reducedPage.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement !== document.body));
  await reduced.close();
  record("no uncaught browser errors", browserErrors.length === 0);
  await writeFile(
    path.join(output, "browser-qa.json"),
    JSON.stringify(
      {
        base,
        isolatedDatabase: connection.replace(/:[^:@]+@/, ":***@"),
        checks: results.length,
        results,
        browserErrors,
        viewports: [1920, 1440, 768, 390, 320],
        locales: ["ar", "en"],
        productionWrites: false,
      },
      null,
      2,
    ),
  );
  await context.close();
} catch (error) {
  await writeFile(
    path.join(output, "browser-qa-failure.json"),
    JSON.stringify({ results, browserErrors, error: String(error) }, null, 2),
  ).catch(() => {});
  throw error;
} finally {
  if (browser) await browser.close();
  if (pool) await pool.end();
  await stopChild(app);
  if (database) await database.stop().catch(() => {});
}
