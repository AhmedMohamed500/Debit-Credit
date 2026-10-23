import assert from "node:assert/strict";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { chromium } from "playwright-core";
import { completeStudentDetails } from "./student-qa-helpers.mjs";

const base = "http://127.0.0.1:3117";
const output = path.resolve("artifacts/student-direct-workbench-qa");
const temporary = path.join(output, "tmp");
const cases = [
  { locale: "ar", width: 1440, height: 900, theme: "light" },
  { locale: "en", width: 1024, height: 768, theme: "dark" },
  { locale: "ar", width: 390, height: 844, theme: "dark" },
];
let app;
let database;
let browser;
const pageErrors = [];

const done = (child) =>
  new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`QA child failed: ${code}`)),
    );
  });

try {
  await mkdir(temporary, { recursive: true });
  const manifest = JSON.parse(
    await readFile(".next/server/app-paths-manifest.json", "utf8"),
  );
  assert.ok(Object.hasOwn(manifest, "/[locale]/student/page"));
  assert.ok(Object.hasOwn(manifest, "/[locale]/game/student/page"));

  const databaseDir = path.join(temporary, "postgres");
  database = new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password: "student-direct-fixture-only",
    port: 55435,
    persistent: true,
    createPostgresUser: false,
    postgresFlags: ["-h", "127.0.0.1"],
    onLog: () => {},
    onError: () => {},
  });
  if (!existsSync(path.join(databaseDir, "PG_VERSION")))
    await database.initialise();
  await database.start();
  const client = database.getPgClient();
  await client.connect();
  if (
    !(await client.query(
      "SELECT 1 FROM pg_database WHERE datname='student_direct_test'",
    )).rowCount
  )
    await database.createDatabase("student_direct_test");
  await client.end();

  const env = {
    ...process.env,
    APP_BUILD_DIR: ".next",
    DATABASE_DRIVER: "postgres",
    DATABASE_URL:
      "postgresql://postgres:student-direct-fixture-only@127.0.0.1:55435/student_direct_test",
    DIRECT_URL:
      "postgresql://postgres:student-direct-fixture-only@127.0.0.1:55435/student_direct_test",
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
    BETTER_AUTH_URL: base,
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    RESEND_API_KEY: "",
    EMAIL_FROM: "",
    ADMIN_EMAILS: "",
  };
  await done(
    spawn(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
      env,
      stdio: "ignore",
      windowsHide: true,
    }),
  );
  app = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3117"],
    { env, stdio: "ignore", windowsHide: true },
  );
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (app.exitCode !== null) throw new Error("QA server exited");
    try {
      if ((await fetch(`${base}/api/auth/get-session`)).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  assert.ok(ready, "QA server ready");

  browser = await chromium.launch({
    executablePath:
      process.env.CHROME_EXECUTABLE ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    env: { ...process.env, TEMP: temporary, TMP: temporary },
    args: ["--disable-background-networking", "--no-first-run"],
  });

  for (const fixture of cases) {
    const label = `${fixture.locale}-${fixture.width}`;
    const context = await browser.newContext({
      viewport: { width: fixture.width, height: fixture.height },
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(`${label}: ${error.message}`));
    const email = `direct-${randomUUID()}@fixture.test`;
    const password = randomBytes(18).toString("base64url");

    await page.goto(`${base}/${fixture.locale}/signup`);
    for (const [name, value] of Object.entries({
      name: "Direct Student Fixture",
      email,
      password,
      confirm: password,
    }))
      await page.locator(`[name="${name}"]`).fill(value);
    await page.locator('.auth-email-form button[type="submit"]').click();
    await page.waitForURL(`**/${fixture.locale}/login?**`);
    await page.locator('[name="email"]').fill(email);
    await page.locator('[name="password"]').fill(password);
    await page.locator('.auth-email-form button[type="submit"]').click();
    await page.waitForURL(`**/${fixture.locale}/student-profile?**`);
    await completeStudentDetails(page);

    await page.goto(`${base}/${fixture.locale}/game/student`);
    await page.getByLabel(
      fixture.locale === "ar"
        ? "مكتب تدريب الطالب في ميزان"
        : "Mizan student accounting workbench",
    ).waitFor();
    await page.evaluate((theme) => {
      localStorage.setItem("debit-credit-theme-v1", theme);
      document.documentElement.dataset.theme = theme;
    }, fixture.theme);

    assert.equal(await page.locator(".student-city").count(), 0, `${label} no city`);
    assert.equal(
      await page.locator(".student-journey-bar").count(),
      0,
      `${label} no journey bar`,
    );
    assert.equal(await page.getByRole("dialog").count(), 0, `${label} no dialog`);
    assert.equal(
      await page.locator(".student-workbench").evaluate((element) => {
        const styles = getComputedStyle(element);
        return styles.position !== "fixed" && !element.hasAttribute("inert");
      }),
      true,
      `${label} normal page workbench`,
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
      `${label} no horizontal overflow`,
    );

    await page.locator('input[name="action"][value="hold-duplicate"]').check();
    await page.locator('.student-card form button[type="submit"]').click();
    await page
      .getByRole("status")
      .filter({ hasText: fixture.locale === "ar" ? "مقبولة ومحفوظة" : "Accepted and saved" })
      .waitFor();
    const progress = await (
      await context.request.get(`${base}/api/v1/me/student-unit`)
    ).json();
    assert.equal(progress.data.accepted.length, 1, `${label} server save`);

    await page.reload();
    await page.locator('select[name="debit"]').waitFor();
    assert.match(
      await page.locator(".student-progress").innerText(),
      /1\s*\/\s*11/,
      `${label} reload restores next mission`,
    );
    await page.screenshot({
      path: path.join(output, `${label}-${fixture.theme}.png`),
      fullPage: true,
    });
    await context.close();
  }

  assert.deepEqual(pageErrors, []);
  console.log(
    "PASS direct Student Workbench: AR/EN desktop/tablet/mobile, light/dark, server save and reload persistence",
  );
  console.log(`Screenshots: ${output}`);
} finally {
  if (browser) await browser.close();
  if (app && app.exitCode === null) {
    if (process.platform === "win32") {
      try {
        await done(
          spawn("taskkill", ["/PID", String(app.pid), "/T", "/F"], {
            stdio: "ignore",
            windowsHide: true,
          }),
        );
      } catch {
        app.kill();
      }
    } else app.kill();
  }
  if (database) await database.stop();
}
