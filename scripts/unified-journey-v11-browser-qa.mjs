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
  currentFoundationTask,
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
  const profile = {
    fullName: "Journey QA Student",
    phone: "+20 100 123 4567",
    country: "Egypt",
    location: "Cairo",
    institution: "Fixture University",
    degree: "BCom in progress",
    field: "Accounting",
    graduationYear: "2028",
    languages: "Arabic, English",
  };
  for (const [name, value] of Object.entries(profile))
    await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('[name="experienceLevel"]').selectOption("student");
  await page.getByRole("button", { name: locale === "ar" ? "احفظ وابدأ التعلم" : "Save and start learning" }).click();
  await page.waitForURL(`**/${locale}/journey`);
  await page.locator(".journey-shell").waitFor();
  record(`${locale} student account created in isolated browser database`);
  record(`${locale} essential student profile completed through the real form`);
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
const completeFirstMissionThroughServer = async (page) => {
  let progress = await page.evaluate(() =>
    fetch("/api/v1/me/progress", { credentials: "same-origin" }).then((response) =>
      response.json(),
    ),
  );
  let state = progress.foundations.data;
  let revision = progress.foundations.revision;
  let task = currentFoundationTask(state);
  while (task) {
    const response =
      task.kind === "journal"
        ? foundationEntries.find((entry) => entry.id === task.entryId).lines
        : task.answer;
    progress = await page.evaluate(
      async ({ missionId, taskId, answer, currentRevision }) => {
        const result = await fetch("/api/v1/me/progress", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commandId: crypto.randomUUID(),
            missionId,
            taskId,
            response: answer,
            revision: currentRevision,
          }),
        });
        if (!result.ok) throw new Error(`Foundation API ${result.status}`);
        return result.json();
      },
      {
        missionId: "business-world",
        taskId: task.id,
        answer: response,
        currentRevision: revision,
      },
    );
    state = progress.data;
    revision = progress.revision;
    task = currentFoundationTask(state);
  }
  await page.reload();
  const completion = page.getByRole("button", {
    name: "Collect reward · next mission",
    exact: true,
  });
  await completion.waitFor();
  const metric = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/me/beta-event") &&
      response.request().postData()?.includes("first_mission_completed"),
  );
  await completion.click();
  await metric;
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
  const admin = database.getPgClient("postgres", "127.0.0.1");
  await admin.connect();
  if (
    !(await admin.query("SELECT 1 FROM pg_database WHERE datname='journey_v11_test'"))
      .rowCount
  )
    await admin.query("CREATE DATABASE journey_v11_test");
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
  await page.goto(base + "/ar");
  await page.getByRole("heading", { name: "ابدأ المحاسبة بالتطبيق، خطوة بخطوة" }).waitFor();
  const landingCta = page.getByRole("link", { name: "ابدأ أول مهمة محاسبية" }).first();
  record("Arabic beta landing identifies the invited beginner audience", await page.getByText(/لطلاب التجارة والخريجين الجدد/).isVisible());
  record("beta landing explains the practical accounting work", await page.getByText("تدريب على الأساسيات والمستندات والقيود ودفتر الأستاذ", { exact: true }).isVisible());
  record("beta landing states what is free", await page.getByText("كل المحتوى المتاح حاليًا مجاني للمشاركين المدعوين", { exact: true }).isVisible());
  record("beta landing keeps Level 6 honest", await page.getByText("المستوى السادس قيد التطوير ولا ندّعي اكتمال البرنامج", { exact: true }).isVisible());
  record("beta landing has one primary mission destination", (await landingCta.getAttribute("href")) === "/ar/signup?next=%2Far%2Fjourney");
  record("Arabic beta landing fits 1440px", await layoutFits(page));
  await screenshot(page, "beta-landing-ar-1440");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/ar");
  await page.getByRole("heading", { name: "ابدأ المحاسبة بالتطبيق، خطوة بخطوة" }).waitFor();
  record("Arabic beta landing fits 390px", await layoutFits(page));
  await screenshot(page, "beta-landing-ar-390");
  await page.setViewportSize({ width: 1440, height: 900 });
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
  await completeFirstMissionThroughServer(page);
  record("first Accounting Foundations mission completes through server grading");
  const milestone = await pool.query(
    `SELECT p.data FROM cloud_progress p JOIN app_user u ON u.id=p."userId"
     WHERE u.email=$1 AND p.domain='beta-release-metrics-v1'`,
    [primaryEmail],
  );
  record("privacy-conscious beta milestones record signup and first mission", Boolean(
    milestone.rows[0]?.data?.events?.signup &&
      milestone.rows[0]?.data?.events?.firstMissionStarted &&
      milestone.rows[0]?.data?.events?.firstMissionCompleted,
  ));

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
  for (const [number, title, route] of [
    [1, "Accounting Foundations", "/en/bootcamp?mission=business-world"],
    [2, "Source Documents", "/en/game/student?focus=document-control"],
    [3, "Journal Entries", "/en/game/student?focus=journal-service"],
    [4, "General Ledger", "/en/game/student?focus=ledger-cash"],
    [5, "Trial Balance", "/en/game/student?focus=trial-balance"],
    [7, "Review & Analysis", "/en/game/student?focus=classification-error"],
    [8, "Final Company Simulation", "/en/game/first-shift"],
  ]) {
    await page.getByRole("button", { name: new RegExp(`^${number}\\. ${title}`) }).click();
    record(`Level ${number} opens its implemented content`, (await page.locator(".journey-primary-cta").getAttribute("href")) === route);
  }
  record(
    "learning outcomes remain reviewable",
    await page
      .locator(".journey-professional-outcomes")
      .getByRole("link", { name: "Career Profile", exact: true })
      .isVisible(),
  );
  record("Excel Accounting Lab is absent from the core level map", !(await page.locator(".journey-map").innerText()).includes("Excel"));

  await page.getByText("Help improve the beta", { exact: true }).click();
  await page.getByLabel("Experience rating").selectOption("4");
  await page.getByLabel("Topic").selectOption("navigation");
  await page.getByLabel("Optional note").fill("The next mission was clear.");
  const feedbackSaved = page.waitForResponse(
    (response) => response.url().endsWith("/api/v1/me/beta-feedback") && response.ok(),
  );
  await page.getByRole("button", { name: "Send feedback" }).click();
  await feedbackSaved;
  await page.getByText("Thank you — feedback saved.").waitFor();
  await screenshot(page, "beta-feedback-en-1440");
  const feedback = await pool.query(
    `SELECT p.data FROM cloud_progress p JOIN app_user u ON u.id=p."userId"
     WHERE u.email=$1 AND p.domain='beta-release-feedback-v1'`,
    [primaryEmail],
  );
  record("minimal beta feedback saves only the bounded latest response", feedback.rows[0]?.data?.rating === 4 && feedback.rows[0]?.data?.topic === "navigation" && feedback.rows[0]?.data?.comment === "The next mission was clear.");

  const excelBefore = await page.evaluate(() =>
    fetch("/api/v1/me/excel-foundations", { credentials: "same-origin" }).then((response) => response.json()),
  );
  await page.goto(base + "/en/bootcamp/excel-foundations");
  await page.getByRole("heading", { name: /Excel Foundations/ }).waitFor();
  record("Excel Accounting Lab remains a separate route");
  await page.goto(base + "/en/journey");
  await page.getByText("7/8", { exact: true }).waitFor();
  const excelAfter = await page.evaluate(() =>
    fetch("/api/v1/me/excel-foundations", { credentials: "same-origin" }).then((response) => response.json()),
  );
  record("journey use preserves the Excel Accounting Lab record", JSON.stringify(excelBefore) === JSON.stringify(excelAfter));

  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => localStorage.setItem("debit-credit-theme-v1", value), theme);
    await page.reload();
    await page.getByText("7/8", { exact: true }).waitFor();
    record(`${theme} theme renders the journey`, await page.locator(".journey-shell").isVisible());
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
  await pool.query(
    `UPDATE cloud_progress p SET data=jsonb_set(p.data,'{lastSeenAt}',$2::jsonb)
     FROM app_user u WHERE u.id=p."userId" AND u.email=$1
     AND p.domain='beta-release-metrics-v1'`,
    [primaryEmail, JSON.stringify(new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())],
  );
  await signIn(page, primaryEmail, password);
  await page.getByText("7/8", { exact: true }).waitFor();
  record("returning student restores server progress after account switching");
  await page.waitForTimeout(250);
  const returning = await pool.query(
    `SELECT p.data FROM cloud_progress p JOIN app_user u ON u.id=p."userId"
     WHERE u.email=$1 AND p.domain='beta-release-metrics-v1'`,
    [primaryEmail],
  );
  record("returning learner milestone is derived after a meaningful gap", Boolean(returning.rows[0]?.data?.events?.returningLearner));
  assert.ok(secondaryPassword);

  const reduced = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reduced.newPage();
  await signIn(reducedPage, primaryEmail, password);
  await reducedPage.getByText("7/8", { exact: true }).waitFor();
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
