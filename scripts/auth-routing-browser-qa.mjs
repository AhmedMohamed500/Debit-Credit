import assert from "node:assert/strict";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { chromium } from "playwright-core";
import pg from "pg";
import { auditAuthRoutes } from "./auth-route-smoke.mjs";
import { completeStudentDetails } from "./student-qa-helpers.mjs";

const production = process.argv.includes("--production");
const redesign = process.argv.includes("--redesign");
const base = production
  ? "https://debit-credit-nine.vercel.app"
  : "http://localhost:3111";
const output = path.resolve(
  process.argv.includes("--signup-signin-home")
    ? "artifacts/auth-signin-home"
    : redesign
      ? "artifacts/auth-redesign"
      : "artifacts/auth-routing-regression",
);
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
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(output, label + ".png"),
    fullPage: redesign,
  });
}
async function checkAuthUI(page, label, ar, signup) {
  if (!redesign) return;
  await page.evaluate(() => document.fonts.ready);
  record(
    label + " localized form direction",
    (await page.locator(".auth-form-side").getAttribute("dir")) ===
      (ar ? "rtl" : "ltr"),
  );
  record(
    label + " no horizontal overflow",
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  for (const field of await page.locator(".auth-email-form input").all()) {
    await field.scrollIntoViewIfNeeded();
    const rect = await field.boundingBox();
    assert.ok(
      rect &&
        rect.width > 230 &&
        rect.height >= 50 &&
        rect.x >= 0 &&
        rect.x + rect.width <= page.viewportSize().width + 1,
      "Comfortable unclipped input",
    );
  }
  record(label + " fields remain usable through normal scrolling");
  const field = page.locator('[name="password"]');
  await field.fill("reveal-ui-fixture-only");
  await field.focus();
  await page.keyboard.press("Tab");
  record(
    label + " keyboard focus reaches password reveal",
    await page
      .getByRole("button", {
        name: ar ? "إظهار كلمة المرور" : "Show password",
        exact: true,
      })
      .evaluate(
        (element) =>
          element === document.activeElement &&
          getComputedStyle(element).outlineStyle !== "none",
      ),
  );
  await page
    .getByRole("button", {
      name: ar ? "إظهار كلمة المرور" : "Show password",
      exact: true,
    })
    .click();
  assert.equal(await field.getAttribute("type"), "text");
  assert.equal(await field.inputValue(), "reveal-ui-fixture-only");
  await page
    .getByRole("button", {
      name: ar ? "إخفاء كلمة المرور" : "Hide password",
      exact: true,
    })
    .click();
  assert.equal(await field.getAttribute("type"), "password");
  await field.fill("");
  if (signup) {
    const confirm = page.locator('[name="confirm"]');
    await page
      .getByRole("button", {
        name: ar ? "إظهار كلمة المرور المؤكدة" : "Show password confirmation",
        exact: true,
      })
      .click();
    assert.equal(await confirm.getAttribute("type"), "text");
    await page
      .getByRole("button", {
        name: ar ? "إخفاء كلمة المرور المؤكدة" : "Hide password confirmation",
        exact: true,
      })
      .click();
  }
  record(label + " independent accessible password visibility");
  if (!production && signup && page.viewportSize().width === 1920) {
    let posts = 0;
    const countSignup = (request) => {
      if (
        request.method() === "POST" &&
        request.url().includes("/api/auth/sign-up/email")
      )
        posts++;
    };
    page.on("request", countSignup);
    await page.locator('[name="name"]').fill("UI validation fixture");
    await page.locator('[name="email"]').fill("invalid-email");
    await field.fill("validation-only-password");
    await page.locator('[name="confirm"]').fill("validation-only-password");
    await page.locator('.auth-email-form button[type="submit"]').click();
    await page
      .getByRole("alert")
      .filter({ hasText: ar ? "راجع البريد" : "Check your email" })
      .waitFor();
    record(
      label + " invalid email gives inline feedback without an auth request",
      posts === 0,
    );
    await page.locator('[name="email"]').fill("validation-only@routing.test");
    await page
      .locator('[name="confirm"]')
      .fill("different-validation-password");
    await page.locator('.auth-email-form button[type="submit"]').click();
    await page
      .getByRole("alert")
      .filter({ hasText: ar ? "غير متطابقتين" : "do not match" })
      .waitFor();
    record(
      label + " mismatched passwords rejected before the server",
      posts === 0,
    );
    page.off("request", countSignup);
    await page.reload();
    await page.locator('[name="confirm"]').waitFor();
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
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
    executablePath:
      process.env.CHROME_EXECUTABLE ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    env: { ...process.env, TEMP: temporary, TMP: temporary },
    args: ["--disable-background-networking", "--no-first-run"],
  });
  for (const locale of ["ar", "en"])
    for (const viewport of redesign
      ? [
          { width: 1920, height: 1080 },
          { width: 1440, height: 900 },
          { width: 1366, height: 768 },
          { width: 430, height: 932 },
          { width: 390, height: 844 },
        ]
      : [
          { width: 1920, height: 1080 },
          { width: 1440, height: 900 },
          { width: 390, height: 844 },
        ]) {
      if (
        redesign &&
        !production &&
        ((locale === "en" && viewport.width === 1920) || viewport.width === 390)
      ) {
        // Both locales share localhost's IP. Signup now requires an additional
        // explicit login: let the 10/minute window expire before the fifth
        // viewport and the next locale, without resetting/disabling protection.
        console.log("Waiting for the unchanged local auth rate-limit window");
        for (let part = 0; part < 3; part++)
          await new Promise((resolve) => setTimeout(resolve, 22000));
      }
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
        new URL(page.url()).searchParams.get("next") === `/${locale}`,
      );
      await page.locator('[name="confirm"]').waitFor();
      await checkAuthUI(page, label + "-signup", ar, true);
      await capture(
        page,
        redesign
          ? `signup-${locale}-${viewport.width < 600 ? "mobile-" : ""}${viewport.width}${production ? "-production" : ""}`
          : label + "-signup",
      );
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
        new URL(page.url()).searchParams.get("next") === `/${locale}`,
      );
      await checkAuthUI(page, label + "-login", ar, false);
      await capture(
        page,
        redesign
          ? `login-${locale}-${viewport.width < 600 ? "mobile-" : ""}${viewport.width}${production ? "-production" : ""}`
          : label + "-login",
      );
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
            ? (await page
                .locator('.auth-email-form button[type="submit"]')
                .isDisabled()) &&
                (await page
                  .getByRole("button", {
                    name: /Continue with Google|المتابعة باستخدام Google/,
                  })
                  .isDisabled())
            : await page
                .locator('.auth-email-form button[type="submit"]')
                .isEnabled(),
        );
      } else {
        record(
          label + " Google unavailable without credentials",
          await page
            .getByRole("button", {
              name: /Continue with Google|المتابعة باستخدام Google/,
            })
            .isDisabled(),
        );
        await page
          .getByRole("link", {
            name: ar ? "إنشاء حساب جديد" : "Create an account",
            exact: true,
          })
          .click();
        await page.waitForURL(`**/${locale}/signup?**`);
        await page.waitForLoadState("networkidle");
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
          await page.waitForLoadState("networkidle");
        }
        if (signup) await page.locator('[name="name"]').fill("Routing QA");
        await page.locator('[name="email"]').fill(email);
        await page.locator('[name="password"]').fill(password);
        if (signup) await page.locator('[name="confirm"]').fill(password);
        if (redesign && signup)
          await page.route("**/api/auth/sign-up/email", async (route) => {
            // Delay the unchanged real request only; never fake an auth response.
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await route.continue();
          });
        await page.locator('.auth-email-form button[type="submit"]').click();
        if (redesign && signup)
          record(
            label +
              " real signup shows loading and blocks duplicate submission",
            (await page
              .locator('.auth-email-form button[type="submit"]')
              .isDisabled()) &&
              (await page
                .locator(".auth-email-form")
                .getAttribute("aria-busy")) === "true",
          );
        if (signup) {
          await page.waitForURL(`**/${locale}/login?**`);
          await page.waitForLoadState("networkidle");
          record(label + " Email signup -> separate localized sign-in form");
          record(
            label + " Signup leaves session unauthenticated",
            (await (
              await context.request.get(base + "/api/auth/get-session")
            ).json()) === null,
          );
          record(
            label + " Signup does not put credentials in redirect URL",
            !page.url().includes(email) && !page.url().includes(password),
          );
          await page.locator('[name="email"]').fill(email);
          await page.locator('[name="password"]').fill(password);
          await page.locator('.auth-email-form button[type="submit"]').click();
        }
        if (signup) {
          await page.waitForURL(`**/${locale}/student-profile?**`);
          record(label + " first sign-in requires private CV personal details");
          await completeStudentDetails(page, locale);
        }
        await page.waitForURL(`**/${locale}`);
        record(
          label +
            (signup
              ? " Email signup -> sign-in -> authenticated homepage"
              : " Login -> authenticated homepage"),
        );
        await page.goto(base + "/" + locale);
        await page
          .getByRole("button", { name: ar ? "خروج" : "Sign out", exact: true })
          .waitFor();
        await page.locator('.student-next-action a').waitFor();
        record(
          label + " authenticated homepage opens student curriculum",
          await page.locator('.student-next-action a').getAttribute('href') === `/${locale}/game/student`,
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
        await page.waitForLoadState("networkidle");
        record(label + " Logout -> localized landing -> Login");
        await page.locator('[name="email"]').fill(email);
        if (redesign && signup) {
          await page
            .locator('[name="password"]')
            .fill("deliberately-incorrect-password");
          await page.locator('.auth-email-form button[type="submit"]').click();
          await page
            .getByRole("alert")
            .filter({ hasText: ar ? "غير صحيحة" : "incorrect" })
            .waitFor();
          record(
            label + " real invalid login returns polished inline error",
            new URL(page.url()).pathname === `/${locale}/login`,
          );
        }
        await page.locator('[name="password"]').fill(password);
        await page.locator('.auth-email-form button[type="submit"]').click();
        await page.waitForURL(`**/${locale}`);
        record(label + " Email login -> authenticated homepage");
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
  if (!production && redesign) {
    const fixtureClient = new pg.Client({
      connectionString:
        "postgresql://postgres:routing-local-fixture-only@127.0.0.1:55433/auth_routing_test",
    });
    await fixtureClient.connect();
    try {
      for (const [locale, fixture] of credentials) {
        const count = await fixtureClient.query(
          "SELECT COUNT(*)::int AS count FROM app_user WHERE email=$1",
          [fixture.email],
        );
        record(
          locale + " repeated login keeps exactly one database user",
          count.rows[0].count === 1,
        );
      }
    } finally {
      await fixtureClient.end();
    }
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
