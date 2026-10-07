import assert from "node:assert/strict";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import pg from "pg";
const base = "http://localhost:3110",
  out = path.resolve("artifacts/backend-phase-1"),
  tmp = path.join(out, "tmp");
const pool = new pg.Pool({
  connectionString:
    "postgresql://postgres:local-test-only@127.0.0.1:55432/app_phase1_test",
});
const target = new URL(pool.options.connectionString);
assert.equal(target.hostname, "127.0.0.1");
assert.equal(target.pathname, "/app_phase1_test");
// Only this named loopback integration database may have fixtures cleared.
await pool.query("DELETE FROM app_user");
await pool.query("DELETE FROM auth_rate_limit");
await pool.query("DELETE FROM competition_match");
await mkdir(tmp, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  env: { ...process.env, TEMP: tmp, TMP: tmp },
  args: ["--disable-background-networking", "--no-first-run"],
});
const results = [],
  errors = [];
const password = "Phase1-test-pass!123";
async function record(name, condition = true) {
  assert.ok(condition, name);
  results.push(name);
  console.log("PASS", name);
}
async function context(viewport = { width: 1920, height: 1080 }) {
  const c = await browser.newContext({ viewport });
  const p = await c.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("dialog",async dialog=>{
    if(dialog.type()==="confirm" && /not synced|لم تُحفظ/.test(dialog.message()))await dialog.accept();
    else await dialog.dismiss();
  });
  return [c, p];
}
async function shot(p, name) {
  await p.screenshot({ path: path.join(out, name + ".png"), fullPage: false });
}
async function signIn(p, email, locale = "en") {
  await p.goto(
    base +
      `/${locale}/login?next=${encodeURIComponent("/" + locale + "/account")}`,
  );
  await p.locator('[name="email"]').fill(email);
  await p.locator('[name="password"]').fill(password);
  await p.locator("form button").click();
  await p.waitForURL(`**/${locale}/account`);
  await p.locator('[name="displayName"]').waitFor();
}
async function signUp(p, email, name, locale) {
  await p.locator('[name="name"]').fill(name);
  await p.locator('[name="email"]').fill(email);
  await p.locator('[name="password"]').fill(password);
  await p.locator('[name="confirm"]').fill(password);
  await p.locator("form button").click();
  await p.waitForURL(`**/${locale}/onboarding`);
  await p.locator(".career-entry-personas").waitFor();
}
try {
  const [ca, a] = await context();
  await a.goto(base + "/ar");
  await a
    .getByRole("link", { name: "ابدأ مجانًا", exact: true })
    .first()
    .click();
  await a.waitForURL("**/ar/signup?**");
  await record("Arabic logged-out CTA opens signup with safe next");
  await shot(a, "signup-ar-1920");
  await signUp(a, "qa-a@phase1.test", "Ahmed", "ar");
  await record("User A registered through browser UI");
  await a.getByRole("button", { name: /طالب محاسبة/ }).click();
  await a.getByRole("button", { name: /اختار وجهتي/ }).click();
  await a.getByRole("button", { name: /أجهز لأول وظيفة/ }).click();
  await a.getByRole("link", { name: /ابدأ التشخيص المهني/ }).click();
  await a.waitForURL("**/ar/career-league/placement");
  await record("Career Entry saves before navigation");
  await a.goto(base + "/ar/account");
  await a.locator('[name="displayName"]').fill("Ahmed Cloud");
  await a.locator("form button").click();
  await a
    .getByRole("status")
    .filter({ hasText: "تم الحفظ في السحابة" })
    .waitFor();
  await a.goto(base + "/ar/bootcamp");
  await a.getByRole("button", { name: /لنبدأ/ }).click();
  await a.getByRole("button", { name: "حرّك المال", exact: true }).click();
  await a
    .getByRole("button", { name: "شاهدت الحركة · تابع", exact: true })
    .click();
  await a.getByRole("button", { name: "التالي", exact: true }).click();
  await a
    .locator(".fdn-account-pieces")
    .getByRole("button", { name: "النقدية", exact: true })
    .click();
  await a
    .locator(".fdn-account-pieces")
    .getByRole("button", { name: "رأس المال", exact: true })
    .click();
  await a.locator(".fdn-account-matcher .fdn-primary").click();
  await a.getByRole("button", { name: "التالي", exact: true }).click();
  await a.locator(".fdn-mission-done .fdn-primary").click();
  await record("Foundation mission completed by real browser actions");
  await a
    .locator(".cloud-account-bar")
    .getByRole("button", { name: "خروج", exact: true })
    .click();
  await a.waitForURL("**/ar");
  await record("User A signs out");
  await a.goto(base + "/en");
  await a
    .getByRole("link", { name: "Start free", exact: true })
    .first()
    .click();
  await a.waitForURL("**/en/signup?**");
  await shot(a, "signup-en-1920");
  await signUp(a, "qa-b@phase1.test", "Mohamed", "en");
  await record("User B registered through browser UI");
  await a.goto(base + "/en/admin");
  await a.waitForURL("**/en/account?notice=admin-only");
  await record("Normal user cannot open admin page");
  await a
    .locator(".cloud-account-bar")
    .getByRole("button", { name: "Sign out", exact: true })
    .click();
  await a.waitForURL("**/en");
  // Test-only verified-email fixture exercises authorization; it is not a Google/Resend test.
  await pool.query('UPDATE app_user SET "emailVerified"=true WHERE email=$1', [
    "qa-a@phase1.test",
  ]);
  await signIn(a, "qa-a@phase1.test", "ar");
  await a.goto(base + "/ar/admin");
  await a
    .locator(".cloud-metric")
    .filter({ hasText: "إجمالي المستخدمين" })
    .locator("b")
    .waitFor();
  await record(
    "Admin shows exactly two real UI-registered accounts",
    (await a
      .locator(".cloud-metric")
      .filter({ hasText: "إجمالي المستخدمين" })
      .locator("b")
      .innerText()) === "2",
  );
  await shot(a, "admin-ar-1920");
  const [cb, b] = await context({ width: 1440, height: 900 });
  await signIn(b, "qa-b@phase1.test", "en");
  await b.goto(base + "/en/competition");
  await b.getByRole("button", { name: "Find opponent", exact: true }).waitFor();
  await a.goto(base + "/ar/competition");
  await a.getByRole("button", { name: "ابحث عن منافس", exact: true }).click();
  await a
    .getByText(/انتظار/)
    .first()
    .waitFor();
  await b.getByRole("button", { name: "Find opponent", exact: true }).click();
  await b.locator(".cloud-versus").waitFor();
  await a.reload();
  await a.locator(".cloud-versus").waitFor();
  await record(
    "Real match contains Ahmed versus Mohamed",
    (await a.locator(".cloud-versus").innerText()).includes("Mohamed") &&
      (await b.locator(".cloud-versus").innerText()).includes("Ahmed Cloud"),
  );
  await record(
    "Exactly one server-backed match",
    (await pool.query("SELECT count(*)::int n FROM competition_match")).rows[0]
      .n === 1,
  );
  await record(
    "Competition UI has no private email",
    !(await a.locator("main").innerText()).includes("@phase1.test") &&
      !(await b.locator("main").innerText()).includes("@phase1.test"),
  );
  for (const p of [a, b]) {
    const docs = p.locator(".cloud-documents button");
    for (let i = 0; i < (await docs.count()); i++) {
      await docs.nth(i).click();
      await docs.nth(i).waitFor({ state: "visible" });
      await p.waitForFunction(
        () =>
          !document.querySelector(".cloud-documents button:not(:disabled)") ||
          !document.querySelector("form button:disabled"),
      );
    }
  }
  for (const [p, action] of [
    [a, "hold"],
    [b, "post"],
  ]) {
    await p.locator('[name="action"]').selectOption(action);
    await p.locator('[name="debit"]').selectOption("cash");
    await p.locator('[name="credit"]').selectOption("bank");
    await p.locator('[name="amount"]').fill("0");
    await p.locator("form button").click();
    await p.locator("form").waitFor({ state: "hidden" });
  }
  await a.reload();
  await a
    .getByRole("status")
    .filter({ hasText: /الفائز|تعادل/ })
    .waitFor();
  const scored = (
    await pool.query('SELECT "winnerUserId",status FROM competition_match')
  ).rows[0];
  await record(
    "Completed match winner computed on server",
    scored.status === "COMPLETED" && !!scored.winnerUserId,
  );
  await shot(a, "match-ar-1920");
  await shot(b, "match-en-1440");
  const [cf, fresh] = await context({ width: 390, height: 844 });
  await signIn(fresh, "qa-a@phase1.test", "en");
  await record(
    "Completely fresh browser restores cloud profile",
    (await fresh.locator('[name="displayName"]').inputValue()) ===
      "Ahmed Cloud",
  );
  const restored = await fresh.evaluate(async () => {
    const r = await fetch("/api/v1/me/progress");
    return r.json();
  });
  await record(
    "Fresh browser restores server foundations",
    restored.foundations.data.completedMissionIds.includes("business-world"),
  );
  await record(
    "Fresh browser restores Career Entry",
    restored.domains.some(
      (x) => x.domain === "career-entry" && x.data.persona === "student",
    ),
  );
  for (const locale of ["ar", "en"])
    for (const [width, height] of [
      [1920, 1080],
      [1440, 900],
      [390, 844],
    ]) {
      const [guestContext, guestPage] = await context({ width, height });
      for (const route of ["login", "signup"]) {
        await guestPage.goto(base + `/${locale}/${route}`);
        await guestPage.locator("form").waitFor();
        await record(
          `${locale} ${route} fits ${width}`,
          await guestPage.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 2,
          ),
        );
        await shot(guestPage, `${route}-${locale}-${width}`);
      }
      await guestContext.close();
    }
  await fresh.evaluate(() => localStorage.clear());
  await fresh.reload();
  await fresh.locator('[name="displayName"]').waitFor();
  await record(
    "Clearing localStorage does not delete cloud account",
    (await fresh.locator('[name="displayName"]').inputValue()) ===
      "Ahmed Cloud",
  );
  const [legacyContext, legacyPage] = await context({
    width: 390,
    height: 844,
  });
  await legacyPage.goto(base + "/en/login?next=%2Fen%2Faccount");
  // Only a legacy profile draft is injected to exercise migration UI, never a completion.
  await legacyPage.evaluate(() =>
    localStorage.setItem(
      "debit-credit-career-profile-v1",
      JSON.stringify({ version: 1, fullName: "Preserved device draft" }),
    ),
  );
  await legacyPage.locator('[name="email"]').fill("qa-a@phase1.test");
  await legacyPage.locator('[name="password"]').fill(password);
  await legacyPage.locator("form button").click();
  await legacyPage
    .getByRole("heading", { name: "We found progress saved on this device" })
    .waitFor();
  await record("Legacy progress requires explicit migration choice");
  await legacyPage
    .getByRole("button", { name: "Keep cloud account", exact: true })
    .click();
  await legacyPage.locator('[name="displayName"]').waitFor();
  await record(
    "Cloud choice does not overwrite canonical profile",
    (await legacyPage.locator('[name="displayName"]').inputValue()) ===
      "Ahmed Cloud",
  );
  await record(
    "Original guest snapshot is preserved",
    await legacyPage.evaluate(() =>
      localStorage
        .getItem("app-guest-preserved")
        .includes("Preserved device draft"),
    ),
  );
  await legacyContext.close();
  for (const locale of ["ar", "en"])
    for (const [width, height] of [
      [1920, 1080],
      [1440, 900],
      [390, 844],
    ]) {
      await fresh.setViewportSize({ width, height });
      for (const route of ["account", "admin", "competition"]) {
        await fresh.goto(base + `/${locale}/${route}`);
        await fresh.locator(".cloud-card").first().waitFor();
        if (route === "account")
          await fresh.locator('[name="displayName"]').waitFor();
        if (route === "competition")
          await fresh.locator(".cloud-versus").waitFor();
        if (route === "admin")
          await fresh.waitForFunction(() =>
            Array.from(document.querySelectorAll(".cloud-metric b")).some(
              (x) => x.textContent.trim() === "2",
            ),
          );
        await fresh.waitForFunction(
          () =>
            !document
              .querySelector("main")
              ?.textContent?.includes("Loading account"),
        );
        await record(
          `${locale} ${route} fits ${width}`,
          await fresh.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 2,
          ),
        );
        await shot(fresh, `${route}-${locale}-${width}`);
      }
    }
  await record("No uncaught browser errors", errors.length === 0);
  await writeFile(
    path.join(out, "browser-qa.json"),
    JSON.stringify(
      {
        base,
        checks: results.length,
        results,
        errors,
        google: "not configured or tested",
        resend: "not configured or tested",
        adminVerification: "test-only fixture",
        viewports: ["1920x1080", "1440x900", "390x844"],
      },
      null,
      2,
    ),
  );
  await ca.close();
  await cb.close();
  await cf.close();
} catch (error) {
  for (const [index, c] of browser.contexts().entries())
    for (const p of c.pages())
      await shot(p, `failed-browser-${index}`).catch(() => {});
  await writeFile(
    path.join(out, "browser-qa-failure.json"),
    JSON.stringify(
      { checksPassed: results, error: String(error), errors },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
  await pool.end();
}
