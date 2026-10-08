// Explicitly opted-in production auth integration proof. Two new QA accounts
// only; no reset/deletion, existing credentials, or Google OAuth impersonation.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

assert.ok(
  process.argv.includes("--write-test-users"),
  "Explicit --write-test-users is required",
);
const base = "https://debit-credit-nine.vercel.app";
const output = path.resolve("artifacts/auth-activation");
await mkdir(output, { recursive: true });
const results = [],
  accounts = [],
  errors = [];
const record = (name, condition = true) => {
  assert.ok(condition, name);
  results.push(name);
  console.log("PASS", name);
};
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--disable-background-networking", "--no-first-run"],
});
let complete = false;
try {
  const sessionResponse = await fetch(base + "/api/auth/get-session");
  record(
    "Production Better Auth session handler is configured",
    sessionResponse.status === 200,
  );
  for (const locale of ["ar", "en"]) {
    const ar = locale === "ar";
    const email = `activation-${randomUUID()}@routing.test`;
    const password = randomBytes(24).toString("base64url");
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      const label = `${locale}-${viewport.width}`;
      const signup = viewport.width === 1440;
      const response = await page.goto(
        `${base}/${locale}/${signup ? "signup" : "login"}?next=%2F${locale}%2Fonboarding`,
      );
      record(label + " real auth page returns 200", response.status() === 200);
      const button = page.locator('.auth-email-form button[type="submit"]');
      record(label + " email auth is enabled", await button.isEnabled());
      record(
        label + " unconfigured Google stays disabled",
        await page
          .getByRole("button", {
            name: /Continue with Google|المتابعة باستخدام Google/,
          })
          .isDisabled(),
      );
      const art = page.locator(
        viewport.width < 900 ? ".auth-art-mobile" : ".auth-art-desktop",
      );
      await art.evaluate((image) => image.decode());
      record(
        label + " clear artwork uses its direct versioned source",
        (await art.getAttribute("src")).endsWith("-v2.webp"),
      );
      record(
        label + " artwork is not stretched beyond source at DPR 1",
        await art.evaluate(
          (image) =>
            image.naturalWidth >= image.getBoundingClientRect().width &&
            image.naturalHeight >= image.getBoundingClientRect().height,
        ),
      );
      await page.screenshot({
        path: path.join(output, `${signup ? "signup" : "login"}-${label}.png`),
        fullPage: true,
      });
      if (signup)
        await page.locator('[name="name"]').fill("Auth Activation QA");
      await page.locator('[name="email"]').fill(email);
      await page.locator('[name="password"]').fill(password);
      if (signup) await page.locator('[name="confirm"]').fill(password);
      await button.click();
      await page.waitForURL(`**/${locale}/onboarding`, { timeout: 45000 });
      record(
        label +
          (signup
            ? " real signup reaches onboarding"
            : " same account signs in on a fresh mobile context"),
      );
      const session = await context.request.get(base + "/api/auth/get-session");
      const identity = await session.json();
      record(
        label + " server confirms authenticated identity",
        identity?.user?.email === email && Boolean(identity?.session),
      );
      if (signup) accounts.push({ locale, email, userId: identity.user.id });
      else
        record(
          label + " repeat login retains the same user ID",
          identity.user.id ===
            accounts.find((account) => account.locale === locale).userId,
        );
      const cookies = await context.cookies();
      record(
        label + " session cookie is HttpOnly and Secure",
        cookies.some(
          (cookie) =>
            cookie.name.endsWith("session_token") &&
            cookie.httpOnly &&
            cookie.secure,
        ),
      );
      await page.goto(`${base}/${locale}`);
      const logout = page.getByRole("button", {
        name: ar ? "خروج" : "Sign out",
        exact: true,
      });
      await logout.waitFor();
      await Promise.all([
        page.waitForNavigation({ url: `${base}/${locale}`, waitUntil: "load" }),
        logout.click(),
      ]);
      const signedOutResponse = await context.request.get(
        base + "/api/auth/get-session",
      );
      record(
        label + " real logout clears server session",
        (await signedOutResponse.json()) === null,
      );
      await page.goto(`${base}/${locale}/login?next=%2F${locale}%2Fonboarding`);
      await page.locator('[name="email"]').fill(email);
      await page
        .locator('[name="password"]')
        .fill("deliberately-wrong-password");
      await page.locator('.auth-email-form button[type="submit"]').click();
      await page
        .getByRole("alert")
        .filter({ hasText: ar ? "غير صحيحة" : "incorrect" })
        .waitFor();
      record(
        label + " invalid credentials do not authenticate",
        new URL(page.url()).pathname === `/${locale}/login`,
      );
      await context.close();
    }
  }
  record("No uncaught browser errors", errors.length === 0);
  complete = true;
} finally {
  await browser.close();
  await writeFile(
    path.join(output, "production-auth-qa.json"),
    JSON.stringify(
      {
        base,
        complete,
        checks: results.length,
        results,
        accounts,
        errors,
        passwordValuesRecorded: false,
        existingDatabaseReset: false,
        paidPlanEnabled: false,
        googleOAuth: "not configured or claimed working",
      },
      null,
      2,
    ),
  );
}
