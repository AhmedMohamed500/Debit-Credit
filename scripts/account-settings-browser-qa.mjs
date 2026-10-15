import assert from "node:assert/strict";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { chromium } from "playwright-core";
import sharp from "sharp";
import { completeStudentDetails } from "./student-qa-helpers.mjs";

const base = "http://localhost:3112";
const output = path.resolve("artifacts/account-settings-browser-qa");
const temporary = path.join(output, "tmp");
const databaseDir = path.join(temporary, "postgres");
const databaseName = "account_settings_qa";
const databaseUrl = `postgresql://postgres:account-local-fixture-only@127.0.0.1:55434/${databaseName}`;
const checks = [];
const errors = [];
let database;
let app;
let browser;
let page;

function pass(name, condition) {
  assert.ok(condition, name);
  checks.push(name);
  console.log("PASS", name);
}

async function childDone(child) {
  await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Child failed (${code})`)));
  });
}

async function startLocal() {
  const manifest = JSON.parse(await readFile(".next/server/app-paths-manifest.json", "utf8"));
  pass("Production build includes account route", Object.hasOwn(manifest, "/[locale]/account/page"));
  database = new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password: "account-local-fixture-only",
    port: 55434,
    persistent: true,
    createPostgresUser: false,
    postgresFlags: ["-h", "127.0.0.1"],
    onLog: () => {},
    onError: () => {},
  });
  if (!existsSync(path.join(databaseDir, "PG_VERSION"))) await database.initialise();
  await database.start();
  const dbClient = database.getPgClient();
  await dbClient.connect();
  const existing = await dbClient.query("SELECT 1 FROM pg_database WHERE datname=$1", [databaseName]);
  if (!existing.rowCount) await database.createDatabase(databaseName);
  await dbClient.end();

  const env = {
    ...process.env,
    APP_BUILD_DIR: ".next",
    DATABASE_DRIVER: "postgres",
    DATABASE_URL: databaseUrl,
    DIRECT_URL: databaseUrl,
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
    BETTER_AUTH_URL: base,
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    RESEND_API_KEY: "",
    EMAIL_FROM: "",
    ADMIN_EMAILS: "",
  };
  await childDone(spawn(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
    env, windowsHide: true, stdio: "ignore",
  }));
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3112"], {
    env, windowsHide: true, stdio: "ignore",
  });
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (app.exitCode !== null) throw new Error("Account QA server exited before becoming ready");
    try {
      if ((await fetch(base + "/api/auth/get-session")).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  pass("Isolated production server ready", ready);
}

async function stopLocal() {
  if (app && app.exitCode === null) {
    if (process.platform === "win32") {
      const killer = spawn("taskkill", ["/PID", String(app.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
      // A completed Next child may disappear before taskkill runs; do not mask
      // the original browser assertion with that ordinary shutdown race.
      await new Promise((resolve) => killer.once("exit", resolve));
    } else {
      app.kill();
      await new Promise((resolve) => app.once("exit", resolve));
    }
  }
  if (database) {
    if (process.platform === "win32") {
      // embedded-postgres.stop() can wait forever on Windows if postgres exited
      // just before it attaches its exit listener. This is an isolated,
      // persistent QA cluster, so stop the exact child PID directly.
      const postgres = database.process;
      if (postgres?.pid && postgres.exitCode === null) {
        const killer = spawn("taskkill", ["/PID", String(postgres.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
        await new Promise((resolve) => killer.once("exit", resolve));
      }
    } else {
      await database.stop();
    }
  }
}

async function screenshot(locale, width, height, suffix = "") {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}/${locale}/account`);
  await page.locator("#account-settings-title").waitFor();
  // The photo is fetched independently after the account shell hydrates.
  // Wait for the persisted image so cross-locale screenshots show the real
  // account state rather than a transient initials fallback.
  await page.locator(".account-settings-identity-photo img").waitFor({ timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  const name = `${locale}-${width}x${height}${suffix}.png`;
  await page.screenshot({ path: path.join(output, name), fullPage: true });
  pass(`${locale} ${width}px no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  pass(`${locale} ${width}px real identity visible`, await page.locator(".account-settings-identity").getByText("Account QA Fixture").isVisible());
  return path.join(output, name);
}

try {
  await mkdir(temporary, { recursive: true });
  await startLocal();
  browser = await chromium.launch({
    executablePath: process.env.CHROME_EXECUTABLE || "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    env: { ...process.env, TEMP: temporary, TMP: temporary },
    args: ["--disable-background-networking", "--no-first-run"],
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  page = await context.newPage();
  const email = `account-qa-${randomUUID()}@routing.test`;
  const password = randomBytes(18).toString("base64url");

  await page.goto(`${base}/ar/signup?next=%2Far%2Faccount`);
  await page.locator('[name="name"]').fill("Account QA Fixture");
  await page.locator('[name="email"]').fill(email);
  await page.locator('[name="password"]').fill(password);
  await page.locator('[name="confirm"]').fill(password);
  await page.locator('.auth-email-form button[type="submit"]').click();
  await page.waitForURL("**/ar/login?**");
  pass("Signup remains a separate login step", true);
  await page.locator('[name="email"]').fill(email);
  await page.locator('[name="password"]').fill(password);
  await page.locator('.auth-email-form button[type="submit"]').click();
  await page.waitForURL("**/ar/student-profile?**");
  await completeStudentDetails(page, "ar");
  await page.goto(`${base}/ar/account`);
  await page.locator("#account-settings-title").waitFor();
  // Record account-page errors only; unauthenticated checks during signup
  // can legitimately produce a 401 while the session is not yet established.
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  pass("Arabic account heading", await page.locator("#account-settings-title").textContent() === "إعدادات الحساب");
  pass("Email comes from real local account", await page.locator(".account-settings-identity").getByText(email).isVisible());

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/en/account`);
  await page.locator("#account-settings-title").waitFor();
  const newName = "Updated Account QA Fixture";
  await page.locator('#account-display-name').fill(newName);
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("status").filter({ hasText: "Changes saved" }).waitFor();
  await page.reload();
  pass("Name save persists across reload", await page.locator('#account-display-name').inputValue() === newName);

  const fixturePhoto = path.join(temporary, "photo-fixture.png");
  await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 16, g: 125, b: 151, alpha: 1 } } }).png().toFile(fixturePhoto);
  await page.waitForFunction(() => !document.querySelector('input[aria-label="Upload profile photo"]')?.disabled);
  await page.getByLabel("Upload profile photo").setInputFiles(fixturePhoto);
  await page.waitForFunction(() => Boolean(document.querySelector('.photo-editor [role="status"]')?.textContent?.trim()));
  const photoStatus = await page.locator('.photo-editor [role="status"]').textContent();
  pass("Photo upload confirms real save", photoStatus?.includes("Profile photo saved"));
  await page.reload();
  await page.locator(".account-settings-identity-photo img").waitFor({ timeout: 15000 });
  pass("Uploaded photo persists across reload", await page.locator(".account-settings-identity-photo img").count() === 1);
  pass("No duplicate cloud account bar", await page.locator(".cloud-account-bar").count() === 0);
  pass("No student journey overlay on account", await page.locator(".student-journey-bar").count() === 0);
  pass("Unverified fixture is not shown as verified", await page.locator(".account-settings-security-state").getAttribute("data-verified") === "false");
  pass("Sync retry disabled with zero queued backups", await page.getByRole("button", { name: "Sync now" }).isDisabled());
  pass("Career profile link points to real route", (await page.getByRole("link", { name: /View career profile/ }).getAttribute("href")) === "/en/career-profile");
  const screenshots = [];
  for (const [width, height] of [[1920, 1080], [1440, 900], [1024, 900], [390, 844]]) {
    screenshots.push(await screenshot("ar", width, height));
  }
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    screenshots.push(await screenshot("en", width, height));
  }
  await page.locator('#account-theme').selectOption("dark");
  pass("Dark theme applies", await page.evaluate(() => document.documentElement.dataset.theme === "dark"));
  screenshots.push(await screenshot("en", 1440, 900, "-dark"));
  pass("Dark preference persists after navigation", await page.evaluate(() => document.documentElement.dataset.theme === "dark"));

  pass("No browser errors", errors.length === 0);
  await writeFile(path.join(output, "results.json"), JSON.stringify({ checks, errors, screenshots, emailRedacted: true, isolatedDatabase: databaseName }, null, 2));
  await unlink(path.join(output, "failure.json")).catch(() => {});
  await unlink(path.join(output, "failure.png")).catch(() => {});
} catch (error) {
  if (page && !page.isClosed()) await page.screenshot({ path: path.join(output, "failure.png"), fullPage: true }).catch(() => {});
  await writeFile(path.join(output, "failure.json"), JSON.stringify({ checks, errors, error: String(error) }, null, 2)).catch(() => {});
  throw error;
} finally {
  console.log("QA teardown: close browser");
  if (browser) await browser.close();
  console.log("QA teardown: stop local fixture");
  await stopLocal();
  console.log("QA teardown complete");
}
// embedded-postgres retains an internal Node handle after its exact child PID
// has exited on Windows. All assertions and teardown have completed above.
process.exit(0);
