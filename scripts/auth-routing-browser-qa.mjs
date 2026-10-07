import assert from "node:assert/strict";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { chromium } from "playwright-core";
import { auditAuthRoutes } from "./auth-route-smoke.mjs";

const production = process.argv.includes("--production");
const base = production
  ? "https://debit-credit-nine.vercel.app"
  : "http://localhost:3111";
const output = path.resolve("artifacts/auth-routing-regression");
const temporary = path.resolve("artifacts/backend-phase-1/tmp/auth-routing");
const results = [],
  errors = [];
const credentials = new Map();
let database, app, browser, currentPage;
const record = (name, value = true) => {
  assert.ok(value, name);
  results.push(name);
  console.log("PASS", name);
};
async function childDone(child) {
  await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error("Local child process failed")),
    );
  });
}
async function startLocal() {
  const manifest = JSON.parse(
    await readFile(".next/server/app-paths-manifest.json", "utf8"),
  );
  for (const route of [
    "/[locale]/login/page",
    "/[locale]/signup/page",
    "/api/auth/[...all]/route",
  ])
    record(
      "Production build manifest includes " + route,
      Object.hasOwn(manifest, route),
    );
  const databaseDir = path.join(temporary, "postgres");
  database = new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password: "routing-local-fixture-only",
    port: 55433,
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
    !(
      await client.query(
        "SELECT 1 FROM pg_database WHERE datname='auth_routing_test'",
      )
    ).rowCount
  )
    await database.createDatabase("auth_routing_test");
  await client.end();
  // Separate localhost-only database. No existing database/user rows are reset,
  // deleted or overwritten. Every signup below uses a new random fixture email.
  const env = {
    ...process.env,
    APP_BUILD_DIR: ".next",
    DATABASE_DRIVER: "postgres",
    DATABASE_URL:
      "postgresql://postgres:routing-local-fixture-only@127.0.0.1:55433/auth_routing_test",
    DIRECT_URL:
      "postgresql://postgres:routing-local-fixture-only@127.0.0.1:55433/auth_routing_test",
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
    BETTER_AUTH_URL: base,
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    RESEND_API_KEY: "",
    EMAIL_FROM: "",
    ADMIN_EMAILS: "",
  };
  await childDone(
    spawn(
      process.execPath,
      ["node_modules/prisma/build/index.js", "migrate", "deploy"],
      { env, windowsHide: true, stdio: "ignore" },
    ),
  );
  app = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "-H",
      "127.0.0.1",
      "-p",
      "3111",
    ],
    { env, windowsHide: true, stdio: "ignore" },
  );
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (app.exitCode !== null)
      throw new Error("Local production server exited");
    try {
      if ((await fetch(base + "/api/auth/get-session")).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, "Local production build must start");
}
async function stopLocal() {
  if (app && app.exitCode === null) {
    if (process.platform === "win32")
      await childDone(
        spawn("taskkill", ["/PID", String(app.pid), "/T", "/F"], {
          windowsHide: true,
          stdio: "ignore",
        }),
      );
    else {
      app.kill();
      await new Promise((resolve) => app.once("exit", resolve));
    }
  }
  if (database) await database.stop();
}
async function capture(page, label) {
  await page.screenshot({ path: path.join(output, label + ".png") });
}
try {
  await mkdir(output, { recursive: true });
  await mkdir(temporary, { recursive: true });
  if (!production) await startLocal();
  const httpResults = await auditAuthRoutes(base);
  for (const result of httpResults)
    record(
      `${base}${result.pathname}: HTTP ${result.status}, not locale rewritten`,
    );
  browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    env: { ...process.env, TEMP: temporary, TMP: temporary },
    args: ["--disable-background-networking", "--no-first-run"],
  });
  for (const locale of ["ar", "en"])
    for (const viewport of [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      currentPage = page;
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("dialog", async (dialog) => {
        if (
          dialog.type() === "confirm" &&
          /not synced|لم تُحفظ/.test(dialog.message())
        )
          await dialog.accept();
        else await dialog.dismiss();
      });
      const ar = locale === "ar",
        label = `${production ? "production" : "local"}-${locale}-${viewport.width}`;
      const response = await page.goto(base + "/" + locale);
      assert.equal(response.status(), 200);
      const starts = page.getByRole("link", {
        name: ar ? "ابدأ مجانًا" : /^Start (?:for )?free$/i,
        exact: true,
      });
      const links = await page
        .locator("a[href]")
        .evaluateAll((elements) =>
          elements.map((element) => element.getAttribute("href")),
        );
      record(
        label + " has no malformed locale links",
        links.every(
          (href) => !/\[locale\]|undefined|^\/(ar|en)\/\1\//.test(href),
        ),
      );
      await starts.first().click();
      await page.waitForURL(`**/${locale}/signup?**`);
      record(
        label + " Landing CTA -> existing localized signup",
        new URL(page.url()).searchParams.get("next") ===
          `/${locale}/onboarding`,
      );
      await page.locator('[name="confirm"]').waitFor();
      await capture(page, label + "-signup");
      await page
        .getByRole("link", {
          name: ar
            ? "لديك حساب؟ سجّل الدخول"
            : "Already have an account? Sign in",
          exact: true,
        })
        .click();
      await page.waitForURL(`**/${locale}/login?**`);
      await page.locator('[name="email"]').waitFor();
      record(
        label + " Signup -> Login preserves safe destination",
        new URL(page.url()).searchParams.get("next") ===
          `/${locale}/onboarding`,
      );
      await capture(page, label + "-login");
      record(
        label + " layout fits viewport",
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      if (production) {
        // Read-only production QA never creates fake production users or submits
        // credentials. Live auth must be completed by the owner once configured.
        const unavailable =
          httpResults.find((result) => result.pathname.endsWith("get-session"))
            .status === 503;
        record(
          label + " production auth controls reflect configuration",
          unavailable
            ? (await page.locator("form button").isDisabled()) &&
                (await page
                  .getByRole("button", {
                    name: /Continue with Google|تابع باستخدام Google/,
                  })
                  .count()) === 0
            : await page.locator("form button").isEnabled(),
        );
      } else {
        record(
          label + " Google unavailable without credentials",
          (await page
            .getByRole("button", {
              name: /Continue with Google|تابع باستخدام Google/,
            })
            .count()) === 0,
        );
        await page
          .getByRole("link", {
            name: ar ? "إنشاء حساب جديد" : "Create an account",
            exact: true,
          })
          .click();
        await page.waitForURL(`**/${locale}/signup?**`);
        // Two local fixtures, reused across viewports, respect production auth
        // rate limits without weakening/resetting those limits for this test.
        const signup = !credentials.has(locale);
        if (signup)
          credentials.set(locale, {
            email: `routing-${randomUUID()}@routing.test`,
            password: randomBytes(18).toString("base64url"),
          });
        const { email, password } = credentials.get(locale);
        if (!signup) {
          await page
            .getByRole("link", {
              name: ar
                ? "لديك حساب؟ سجّل الدخول"
                : "Already have an account? Sign in",
              exact: true,
            })
            .click();
          await page.waitForURL(`**/${locale}/login?**`);
        }
        if (signup) await page.locator('[name="name"]').fill("Routing QA");
        await page.locator('[name="email"]').fill(email);
        await page.locator('[name="password"]').fill(password);
        if (signup) await page.locator('[name="confirm"]').fill(password);
        await page.locator("form button").click();
        await page.waitForURL(`**/${locale}/onboarding`);
        record(
          label +
            (signup
              ? " Email signup -> authenticated onboarding"
              : " Signup -> Login -> authenticated onboarding"),
        );
        await page.goto(base + "/" + locale);
        await page
          .getByRole("button", { name: ar ? "خروج" : "Sign out", exact: true })
          .waitFor();
        record(
          label + " authenticated CTA uses onboarding",
          (await starts.first().getAttribute("href")) ===
            `/${locale}/onboarding`,
        );
        // We are already on the landing URL. waitForURL alone would resolve
        // before signOut's asynchronous full-document navigation happened.
        await Promise.all([
          page.waitForNavigation({
            url: base + "/" + locale,
            waitUntil: "load",
          }),
          page
            .getByRole("button", {
              name: ar ? "خروج" : "Sign out",
              exact: true,
            })
            .click(),
        ]);
        const login = page
          .getByRole("link", { name: ar ? "دخول" : "Sign in", exact: true })
          .first();
        if (!(await login.isVisible()))
          await page
            .getByRole("button", { name: ar ? "القائمة" : "Menu", exact: true })
            .click();
        await login.click();
        await page.waitForURL(`**/${locale}/login`);
        record(label + " Logout -> localized landing -> Login");
        await page.locator('[name="email"]').fill(email);
        await page.locator('[name="password"]').fill(password);
        await page.locator("form button").click();
        await page.waitForURL(`**/${locale}/onboarding`);
        record(label + " Email login -> authenticated onboarding");
        const cookies = await context.cookies();
        record(
          label + " Session remains HttpOnly",
          cookies.some(
            (cookie) =>
              cookie.name.endsWith("session_token") && cookie.httpOnly,
          ),
        );
      }
      await context.close();
    }
  record("No uncaught browser errors", errors.length === 0);
  await writeFile(
    path.join(output, `${production ? "production" : "local"}-qa.json`),
    JSON.stringify(
      {
        base,
        production,
        checks: results.length,
        results,
        httpResults,
        errors,
        googleLogin: "not tested; callback smoke is not OAuth sign-in",
        productionEmailLogin: "not submitted; read-only production audit",
        existingDatabaseReset: false,
      },
      null,
      2,
    ),
  );
} catch (error) {
  if (currentPage && !currentPage.isClosed())
    await capture(
      currentPage,
      `${production ? "production" : "local"}-failure`,
    ).catch(() => {});
  await writeFile(
    path.join(output, `${production ? "production" : "local"}-failure.json`),
    JSON.stringify({ results, errors, error: String(error) }, null, 2),
  );
  throw error;
} finally {
  if (browser) await browser.close();
  await stopLocal();
}
