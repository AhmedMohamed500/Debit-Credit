import assert from "node:assert/strict";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { chromium } from "playwright-core";
import sharp from "sharp";
import { completeStudentDetails } from "./student-qa-helpers.mjs";
const base = "http://localhost:3114", output = path.resolve("artifacts/student-cv"), temporary = path.join(output, "tmp"), results = [], errors = [];
let app, database, browser, previousAccount;
function record(name, condition = true) { assert.ok(condition, name); results.push(name); console.log("PASS", name); }
function done(child) { return new Promise((resolve, reject) => { child.once("error", reject); child.once("exit", code => code === 0 ? resolve() : reject(new Error("QA child failed"))); }); }
async function api(context, route, method = "GET", data) { return context.request.fetch(base + "/api/v1/" + route, { method, headers: { Origin: base }, ...(data === undefined ? {} : { data }) }); }
async function screenshot(page, label) { await page.waitForLoadState("networkidle"); await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.images).filter(image => image.getClientRects().length > 0).map(image => image.complete ? Promise.resolve() : new Promise(resolve => { const finish = () => { clearTimeout(timeout); resolve(); }; const timeout = setTimeout(finish, 3000); image.addEventListener("load", finish, { once: true }); image.addEventListener("error", finish, { once: true }); }))); }); await page.screenshot({ path: path.join(output, label + ".png"), fullPage: true }); }
async function checkLayout(page, label) { record(label + " no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); }
try {
  await mkdir(temporary, { recursive: true });
  const manifest = JSON.parse(await readFile(".next/server/app-paths-manifest.json", "utf8"));
  for (const route of ["/[locale]/student/page", "/[locale]/game/student/page", "/[locale]/student-profile/page", "/[locale]/login/page", "/[locale]/signup/page", "/api/auth/[...all]/route"]) record("Production route " + route, Object.hasOwn(manifest, route));
  const databaseDir = path.join(temporary, "postgres");
  database = new EmbeddedPostgres({ databaseDir, user: "postgres", password: "student-local-fixture-only", port: 55434, persistent: true, createPostgresUser: false, postgresFlags: ["-h", "127.0.0.1"], onLog: () => {}, onError: () => {} });
  if (!existsSync(path.join(databaseDir, "PG_VERSION"))) await database.initialise();
  await database.start();
  const client = database.getPgClient(); await client.connect();
  if (!(await client.query("SELECT 1 FROM pg_database WHERE datname='student_cv_test'")).rowCount) await database.createDatabase("student_cv_test");
  await client.end();
  const env = { ...process.env, APP_BUILD_DIR: ".next", DATABASE_DRIVER: "postgres", DATABASE_URL: "postgresql://postgres:student-local-fixture-only@127.0.0.1:55434/student_cv_test", DIRECT_URL: "postgresql://postgres:student-local-fixture-only@127.0.0.1:55434/student_cv_test", BETTER_AUTH_SECRET: randomBytes(32).toString("hex"), BETTER_AUTH_URL: base, GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "", RESEND_API_KEY: "", EMAIL_FROM: "", ADMIN_EMAILS: "" };
  await done(spawn(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env, stdio: "ignore", windowsHide: true }));
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3114"], { env, stdio: "ignore", windowsHide: true });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) { if (app.exitCode !== null) throw new Error("QA server exited"); try { if ((await fetch(base + "/api/auth/get-session")).status === 200) { ready = true; break; } } catch {} await new Promise(resolve => setTimeout(resolve, 400)); }
  assert.ok(ready);
  browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, env: { ...process.env, TEMP: temporary, TMP: temporary }, args: ["--disable-background-networking", "--no-first-run"] });
  const answers = [{ action: "hold-duplicate" }, { debit: "cash", credit: "capital", amount: "100000" }, { debit: "equipment", credit: "cash", amount: "20000" }, { debit: "inventory", credit: "payable", amount: "15000" }, { debit: "receivable", credit: "revenue", amount: "12000" }, { debit: "cash", credit: "receivable", amount: "7000" }, { debit: "rent", credit: "cash", amount: "3000" }, { amount: "84000" }, { debitTotal: "127000", creditTotal: "127000" }, { action: "reclassify-equipment" }, { formula: "=SUM(C2:C9)", differenceFormula: "=C10-D10" }];
  for (const locale of ["ar", "en"]) for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const label = locale + "-" + viewport.width, context = await browser.newContext({ viewport }), page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message)); page.on("dialog", dialog => dialog.accept());
    const email = `student-${randomUUID()}@fixture.test`, password = randomBytes(18).toString("base64url");
    await page.goto(`${base}/${locale}/student`); await page.waitForURL(`**/${locale}/login?**`); record(label + " student route requires auth");
    await page.goto(`${base}/${locale}/signup`);
    for (const [name, value] of Object.entries({ name: "Student Fixture", email, password, confirm: password })) await page.locator(`[name="${name}"]`).fill(value);
    await page.locator('.auth-email-form button[type="submit"]').click(); await page.waitForURL(`**/${locale}/login?**`);
    record(label + " signup requires separate sign-in", (await (await context.request.get(base + "/api/auth/get-session")).json()) === null);
    await page.locator('[name="email"]').fill(email); await page.locator('[name="password"]').fill(password); await page.locator('.auth-email-form button[type="submit"]').click(); await page.waitForURL(`**/${locale}/student-profile?**`);
    record(label + " first sign-in requires personal CV details");
    record(label + " email sourced from account", await page.locator('input[type="email"]').inputValue() === email);
    record(label + " task API blocks incomplete personal setup", (await api(context, "me/student-unit", "POST", { revision: 0, step: "document-control", answer: { action: "hold-duplicate" } })).status() === 409);
    record(label + " identity injection rejected", (await api(context, "me/personal", "PUT", { revision: 0, details: {}, userId: "somebody-else" })).status() === 400);
    await screenshot(page, label + "-setup-empty"); await checkLayout(page, label + " setup");
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    record(label + " dark setup uses readable themed surfaces", await page.locator('.student-card').evaluate(element => getComputedStyle(element).backgroundColor !== "rgb(255, 255, 255)" && getComputedStyle(element).backgroundColor !== getComputedStyle(element).color));
    await screenshot(page, label + "-setup-dark"); await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    const photoInput = page.locator('.photo-editor input[type="file"]');
    await page.waitForFunction(() => document.querySelector('.photo-editor input[type="file"]')?.disabled === false);
    record(label + " new account cannot see a previous student's photo", (await (await api(context, "me/photo")).json()).data === null);
    const fixturePhoto = await sharp({ create: { width: 900, height: 600, channels: 3, background: "#246bc9" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
    await photoInput.setInputFiles({ name: "student-fixture.jpg", mimeType: "image/jpeg", buffer: fixturePhoto });
    await page.getByRole("status").filter({ hasText: /Profile photo saved|الصورة اتحفظت/ }).waitFor();
    const photo = await (await api(context, "me/photo")).json();
    const photoMeta = await sharp(Buffer.from(photo.data.image.split(",")[1], "base64")).metadata();
    record(label + " real upload cropped 512 square and stripped EXIF", photo.data.width === 512 && photo.data.height === 512 && photoMeta.format === "webp" && !photoMeta.exif);
    record(label + " corrupt image rejected by server", (await api(context, "me/photo", "PUT", { revision: photo.revision, image: "data:image/png;base64,AAAA" })).status() === 400);
    record(label + " stale photo revision rejected", (await api(context, "me/photo", "PUT", { revision: 0, image: null })).status() === 409);
    record(label + " photo owner injection rejected", (await api(context, "me/photo", "PUT", { revision: photo.revision, image: null, userId: "another-user" })).status() === 400);
    record(label + " photo excluded from general progress backup", !(await (await api(context, "me/progress")).text()).includes(photo.data.image));
    await completeStudentDetails(page); await page.waitForURL(`**/${locale}`); await page.locator('.student-game-link a').waitFor();
    record(label + " saved setup -> authenticated home"); await screenshot(page, label + "-home"); await checkLayout(page, label + " home");
    const personal = await (await api(context, "me/personal")).json(); record(label + " details persisted privately", personal.data.email === email && personal.data.details.phone === "+20 100 123 4567");
    const identity = await (await api(context, "me")).json();
    if (previousAccount) {
      record(label + " query cannot select another account's personal data", (await (await api(context, "me/personal?userId=" + previousAccount)).json()).data.email === email);
      record(label + " query cannot select another student's photo", (await (await api(context, "me/photo?userId=" + previousAccount)).json()).data.image === photo.data.image);
      record(label + " stale cross-account context rejected", (await context.request.get(base + "/api/v1/me/cv", { headers: { "X-Account-Context": previousAccount } })).status() === 409);
    }
    previousAccount = identity.user.id;
    const leaderboard = await (await api(context, "competition/leaderboard")).text();
    record(label + " leaderboard contains no private contact data", !leaderboard.includes(email) && !leaderboard.includes("+20 100 123 4567"));
    record(label + " stale personal revision rejected", (await api(context, "me/personal", "PUT", { revision: 0, details: personal.data.details })).status() === 409);
    await page.locator('.student-game-link a').click(); await page.waitForURL(`**/${locale}/game/student`);
    await page.locator('.student-start-mission').waitFor(); await screenshot(page, label + "-city"); await checkLayout(page, label + " city");
    await page.locator('.student-start-mission').click(); await page.locator('input[name="action"]').first().waitFor();
    await page.waitForLoadState("networkidle"); await page.screenshot({ path: path.join(output, label + "-source-workbench.png") });
    record(label + " game opens student workbench instead of standalone quiz", await page.getByRole("dialog").isVisible() && await page.locator('.student-work-inbox').isVisible());
    await page.locator('input[name="action"][value="post-both"]').check(); await page.locator('.student-card form button[type="submit"]').click(); await page.getByRole("status").filter({ hasText: locale === "ar" ? "غير مقبولة" : "Not accepted" }).waitFor();
    let cloud = await (await api(context, "me/progress")).json(); record(label + " wrong response produces no CV evidence", cloud.evidence.length === 0);
    record(label + " future step locked", (await api(context, "me/student-unit", "POST", { revision: 1, step: "worksheet", answer: { formula: "=SUM(C2:C9)", differenceFormula: "=C10-D10" } })).status() === 409);
    for (let index = 0; index < answers.length; index++) {
      if (index === 10) {
        await page.getByRole("button", { name: /Open office computer|افتح كمبيوتر المكتب/ }).click();
        await page.getByRole("table", { name: "Trial Balance", exact: true }).waitFor();
        const formulaBar = page.locator('#student-sheet-formula');
        record(label + " worksheet is on the office computer with actual accepted cash balance", await page.getByRole("button", { name: "C2: 84,000", exact: true }).isVisible());
        await page.getByRole("button", { name: /^C10 editable:/ }).click(); await formulaBar.fill("=SUM(C2:C8)");
        await formulaBar.press("Enter"); await formulaBar.fill("=C10-D10");
        record(label + " sheet recalculates an incorrect workpaper instead of faking balance", await page.getByRole("button", { name: "C11 editable: -3,000", exact: true }).isVisible());
        const evidenceBefore = (await (await api(context, "me/progress")).json()).evidence.length;
        await page.locator('.student-card form button[type="submit"]').click();
        await page.getByRole("status").filter({ hasText: /Not accepted|غير مقبولة/ }).waitFor();
        record(label + " incorrect spreadsheet adds no CV evidence", (await (await api(context, "me/student-unit")).json()).data.accepted.length === 10 && (await (await api(context, "me/progress")).json()).evidence.length === evidenceBefore);
        await page.getByRole("button", { name: /^C10 editable:/ }).click(); await formulaBar.fill(answers[index].formula);
        await formulaBar.press("Enter"); await formulaBar.fill(answers[index].differenceFormula);
        record(label + " correct workbook recalculates 127000 totals and zero difference", await page.getByRole("button", { name: "C10 editable: 127,000", exact: true }).isVisible() && await page.getByRole("button", { name: "C11 editable: 0", exact: true }).isVisible());
        await page.getByRole("button", { name: /^D10:/ }).click(); record(label + " source and prepared totals are read-only", await formulaBar.getAttribute("readonly") !== null);
        record(label + " formula bar remains visible below desk header while selecting worksheet cells", await formulaBar.evaluate(element => { const bar = element.getBoundingClientRect(), header = document.querySelector('.student-workbench-header').getBoundingClientRect(); return bar.top >= header.bottom - 2 && bar.bottom <= innerHeight; }));
        await screenshot(page, label + "-office-spreadsheet"); await checkLayout(page, label + " office computer");
        await page.getByRole("button", { name: /Back to desk|ارجع للمكتب/ }).click();
        await page.getByRole("button", { name: /Open office computer|افتح كمبيوتر المكتب/ }).click();
        record(label + " workbook unsent formulas preserved on returning to office desk", await page.getByRole("button", { name: "C10 editable: 127,000", exact: true }).isVisible());
      } else {
        for (const [name, value] of Object.entries(answers[index])) { const field = page.locator(`[name="${name}"]`); if (name === "action") await page.locator(`input[name="action"][value="${value}"]`).check(); else if (name === "debit" || name === "credit") await field.selectOption(value); else await field.fill(value); }
      }
      await page.locator('.student-card form button[type="submit"]').click();
      await page.getByRole("status").filter({ hasText: locale === "ar" ? "مقبولة ومحفوظة" : "Accepted and saved" }).waitFor();
      record(label + " task " + (index + 1) + " accepted");
      if (index === 1) { const history = await page.evaluate(() => JSON.parse(localStorage.getItem("debit-credit-cv-history-v1") ?? "{}").items); record(label + " CV updated without opening or clicking generate", history?.at(-1)?.plainText.includes("owner capital contribution")); }
      if (index === 7) { await screenshot(page, label + "-trial-balance"); await checkLayout(page, label + " task"); }
    }
    await page.getByRole("dialog").getByRole("heading", { name: locale === "ar" ? "أنهيت الوحدة" : "Unit completed" }).waitFor();
    const completed = await (await api(context, "me/student-unit")).json(); record(label + " all tasks persisted", completed.data.accepted.length === 11 && !!completed.data.completedAt);
    cloud = await (await api(context, "me/progress")).json(); const count = cloud.evidence.length;
    const savedCv = await (await api(context, "me/cv")).json();
    record(label + " CV regenerated atomically in cloud without browser export", savedCv.data.plainText.includes("owner capital contribution") && savedCv.data.plainText.includes("trial balance") && savedCv.data.profile.email === email);
    const replay = await api(context, "me/student-unit", "POST", { revision: completed.revision, step: "journal-capital", answer: answers[1] });
    // API numbers are intentionally strict; browser strings are converted by the form.
    record(label + " numeric request types validated", replay.status() === 400);
    await api(context, "me/student-unit", "POST", { revision: completed.revision, step: "journal-capital", answer: { debit: "cash", credit: "capital", amount: 100000 } });
    record(label + " replay adds no duplicate evidence", (await (await api(context, "me/progress")).json()).evidence.length === count);
    const downloadEvent = page.waitForEvent("download"); await page.getByRole("button", { name: /Download Excel-compatible|تحميل ورقة العمل/ }).click(); const download = await downloadEvent; const csv = await readFile(await download.path(), "utf8");
    record(label + " real workpaper export matches accepted ledger", csv.includes("Cash,Unit1,84000,0") && csv.includes("=SUM(C2:C9)") && !csv.includes(email));
    await page.goto(`${base}/${locale}/career-profile/cv`); await page.locator('.professional-cv').waitFor(); await screenshot(page, label + "-cv"); await checkLayout(page, label + " CV");
    const cvText = await page.locator('.professional-cv').innerText(); record(label + " CV includes personal details and accounting outcomes", cvText.includes("Student CV Fixture") && cvText.includes("+20 100 123 4567") && cvText.includes("trial balance"));
    record(label + " CV is English LTR even on Arabic site and contains no photo", !/[\u0600-\u06ff]/u.test(cvText) && await page.locator('.professional-cv').getAttribute("lang") === "en" && await page.locator('.professional-cv').getAttribute("dir") === "ltr" && await page.locator('.professional-cv img').count() === 0);
    const textDownloadEvent = page.waitForEvent("download"); await page.getByRole("button", { name: /Plain Text CV|سيرة نصية/ }).click(); const textDownload = await textDownloadEvent, text = await readFile(await textDownload.path(), "utf8");
    record(label + " ATS export has standard text headings and supported keywords", text.includes("ACCOUNTING SIMULATION EXPERIENCE") && text.includes("Journal Entries") && text.includes("2028") && text.includes(email));
    record(label + " ATS export does not invent certification or employment", !/Certified|CPA|CMA|employed at Mizan/i.test(text));
    await page.emulateMedia({ media: "print" }); record(label + " PDF uses single column", await page.locator('.professional-cv>header').evaluate(element => getComputedStyle(element).display === "block")); record(label + " print hides account controls", await page.locator('.cloud-account-bar').evaluate(element => getComputedStyle(element).display === "none")); await page.emulateMedia({ media: "screen" });
    await page.reload(); await page.locator('.professional-cv').waitFor(); record(label + " CV restored after reload", (await page.locator('.professional-cv').innerText()).includes("Student CV Fixture"));
    await page.goto(`${base}/${locale}/profile`); await page.locator('.photo-editor img').waitFor();
    record(label + " uploaded photo restored in game profile", await page.locator('.photo-editor img').getAttribute("src") === photo.data.image);
    await page.getByRole("button", { name: /Remove photo|إزالة الصورة/ }).click(); await page.locator('.photo-editor img').waitFor({ state: "detached" });
    await page.reload(); await page.waitForFunction(() => document.querySelector('.photo-editor input[type="file"]')?.disabled === false);
    record(label + " photo removal persists after reload", (await (await api(context, "me/photo")).json()).data === null);
    await page.locator('.cloud-account-bar button').click(); await page.waitForURL(`**/${locale}`); record(label + " signed-out personal API protected", (await api(context, "me/personal")).status() === 401);
    record(label + " signed-out photo API protected", (await api(context, "me/photo")).status() === 401);
    record(label + " private CV data not visible after logout", !(await page.locator('body').innerText()).includes("+20 100 123 4567"));
    if (viewport.width === 1440) {
      await page.goto(`${base}/${locale}/login`); await page.locator('[name="email"]').fill(email); await page.locator('[name="password"]').fill(password); await page.locator('.auth-email-form button[type="submit"]').click();
      await page.waitForURL(`**/${locale}`); await page.locator('.student-game-link a').waitFor(); record(label + " returning sign-in skips completed setup");
      await page.goto(`${base}/${locale}/student`); await page.getByRole("heading", { name: locale === "ar" ? "أنهيت الوحدة" : "Unit completed" }).waitFor(); record(label + " completed training restored in a new sign-in session");
    }
    const other = await browser.newContext({ viewport }); record(label + " separate browser cannot read personal records", (await api(other, "me/personal")).status() === 401); await other.close(); await context.close();
  }
  record("No browser runtime errors", errors.length === 0);
  await writeFile(path.join(output, "report.json"), JSON.stringify({ results, errors, productionDataUsed: false, databaseReset: false }, null, 2));
  console.log(`Student onboarding/CV QA: ${results.length} checks passed. Only isolated localhost fixtures used.`);
} finally {
  if (browser) await browser.close();
  if (app && app.exitCode === null) { if (process.platform === "win32") await done(spawn("taskkill", ["/PID", String(app.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true })); else app.kill(); }
  if (database) await database.stop();
}
