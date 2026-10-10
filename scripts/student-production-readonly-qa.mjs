import assert from "node:assert/strict";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
const base = "https://debit-credit-nine.vercel.app",
  output = path.resolve("artifacts/student-production-readonly"),
  results = [],
  errors = [],
  blockedWrites = [];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_EXECUTABLE ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  env: { ...process.env, TEMP: output, TMP: output },
});
function record(name, condition = true) {
  assert.ok(condition, name);
  results.push(name);
  console.log("PASS", name);
}
try {
  for (const locale of ["ar", "en"])
    for (const width of [1440, 390]) {
      const context = await browser.newContext({
          viewport: { width, height: 900 },
        }),
        page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await context.route("**/*", (route) => {
        if (!["GET", "HEAD"].includes(route.request().method())) {
          blockedWrites.push(route.request().method());
          return route.abort();
        }
        return route.continue();
      });
      for (const destination of [
        "student",
        "game/student",
        "student-profile",
        "auth/continue",
      ]) {
        // Next may begin streaming a 200 shell before a protected-page redirect.
        // Verify the actual browser destination instead of assuming HTTP 307.
        await page.goto(`${base}/${locale}/${destination}`);
        await page.waitForURL((url) => url.pathname === `/${locale}/login`);
        await page.locator('.auth-email-form [name="email"]').waitFor();
        record(
          `${locale}-${width} /${destination} resolves to real localized login`,
        );
        record(
          `${locale}-${width} /${destination} login fits viewport`,
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        );
      }
      await context.close();
    }
  for (const destination of ["me/personal", "me/student-unit", "me/cv", "me/photo"]) {
    const response = await fetch(base + "/api/v1/" + destination, {
      redirect: "manual",
    });
    record(
      "Private API " + destination + " requires session",
      response.status === 401,
    );
    record(
      "Private API " +
        destination +
        " bypasses locale routing and prevents caching",
      response.headers.get("cache-control") === "private, no-store" &&
        !response.headers.get("location"),
    );
  }
  record("No production write requests", blockedWrites.length === 0);
  record("No runtime browser errors", errors.length === 0);
  await writeFile(
    path.join(output, "report.json"),
    JSON.stringify(
      { results, errors, blockedWrites, productionAccountsCreated: 0 },
      null,
      2,
    ),
  );
  console.log(
    `Read-only production student QA: ${results.length} checks passed.`,
  );
} finally {
  await browser.close();
}
