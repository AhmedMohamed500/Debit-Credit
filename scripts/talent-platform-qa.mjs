// Isolated local PostgreSQL fixtures only. Never run writes against a hosted URL.
import assert from "node:assert/strict";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { Client } from "pg";
import { chromium } from "playwright-core";
import sharp from "sharp";
const base = "http://localhost:3118", output = path.resolve("artifacts/talent-platform"), temporary = path.join(output, "tmp"), results = [], errors = [];
let database, browser, app, sql;
function record(name, condition = true) { assert.ok(condition, name); results.push(name); console.log("PASS", name); }
function done(child) { return new Promise((resolve, reject) => { child.once("error", reject); child.once("exit", code => code === 0 ? resolve() : reject(new Error("QA process failed"))); }); }
async function api(context, route, method = "GET", data) { return context.request.fetch(base + "/api/v1/" + route, { method, headers: { Origin: base }, ...(data === undefined ? {} : { data }) }); }
async function json(context, route, method = "GET", data) { const response = await api(context, route, method, data); assert.ok(response.ok(), route + " " + response.status() + " " + await response.text()); return response.json(); }
const personal = name => ({ fullName: name, phone: "+201001234567", country: "Egypt", location: "Alexandria", institution: "Fixture University", degree: "Bachelor", field: "Accounting", graduationYear: "2026", experienceLevel: "student", linkedIn: "https://www.linkedin.com/in/qa-fixture", portfolio: "", languages: ["English"] });
const defaults = { enabled: false, photo: false, location: false, education: false, languages: false, socials: false, courses: false, certificates: false, cv: false, contactRequests: false };
async function account(name) {
  const context = await browser.newContext(), email = randomUUID() + "@fixture.test", password = randomBytes(18).toString("base64url");
  for (const [route, data] of [["sign-up/email", { name, email, password }], ["sign-in/email", { email, password }]]) {
    const result = await context.request.post(base + "/api/auth/" + route, { headers: { Origin: base }, data }); assert.ok(result.ok(), "Fixture authentication " + result.status());
  }
  await json(context, "me/personal", "PUT", { revision: 0, details: personal(name) });
  return { context, email, id: (await json(context, "me")).user.id };
}
async function shot(page, name) {
  await page.waitForLoadState("networkidle"); await page.evaluate(async () => document.fonts.ready);
  record(name + " no overflow", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: path.join(output, name + ".png"), fullPage: true });
}
try {
  await mkdir(temporary, { recursive: true });
  const databaseDir = path.join(temporary, "postgres");
  database = new EmbeddedPostgres({ databaseDir, user: "postgres", password: "local-talent-fixture-only", port: 55438, persistent: true, createPostgresUser: false, postgresFlags: ["-h", "127.0.0.1"], onLog: () => {}, onError: () => {} });
  if (!existsSync(path.join(databaseDir, "PG_VERSION"))) await database.initialise();
  await database.start();
  const starter = database.getPgClient(); await starter.connect();
  if (!(await starter.query("SELECT 1 FROM pg_database WHERE datname='talent_utf8_test'")).rowCount) await starter.query("CREATE DATABASE talent_utf8_test ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0");
  await starter.end();
  const url = "postgresql://postgres:local-talent-fixture-only@127.0.0.1:55438/talent_utf8_test";
  const env = { ...process.env, APP_BUILD_DIR: ".next", DATABASE_DRIVER: "postgres", DATABASE_URL: url, DIRECT_URL: url, BETTER_AUTH_SECRET: randomBytes(32).toString("hex"), BETTER_AUTH_URL: base, GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "", RESEND_API_KEY: "", EMAIL_FROM: "", ADMIN_EMAILS: "" };
  await done(spawn(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env, stdio: "ignore", windowsHide: true }));
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3118"], { env, stdio: "ignore", windowsHide: true });
  let ready = false;
  for (let i = 0; i < 100; i++) { try { if ((await fetch(base + "/api/auth/get-session")).status === 200) { ready = true; break; } } catch {} await new Promise(resolve => setTimeout(resolve, 300)); }
  assert.ok(ready, "Local server starts");
  browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, env: { ...process.env, TEMP: temporary, TMP: temporary }, args: ["--disable-background-networking", "--no-first-run"] });
  sql = new Client({ connectionString: url }); await sql.connect();
  // Repeated runs remove only consent for this isolated harness's former fixture users.
  await sql.query("DELETE FROM cloud_progress WHERE domain LIKE 'talent/%'");
  const candidate = await account("Local QA Candidate"), privateUser = await account("Private QA Candidate"), a = await account("QA Recruiter A"), b = await account("QA Recruiter B");
  record("Normal candidate cannot search", (await api(candidate.context, "employer/candidates")).status() === 403);
  record("Normal candidate cannot access shortlist", (await api(candidate.context, "employer/shortlist")).status() === 403);
  record("Forged recruiter privilege rejected", (await api(candidate.context, "employer/company", "PUT", { name: "Fake", recruiter: "Fake", industry: "Accounting", location: "Cairo", website: "", role: "ADMIN" })).status() === 400);
  const company = { name: "Local QA Company A", recruiter: "QA Recruiter A", industry: "Accounting", location: "Cairo", website: "https://fixture.example" };
  await json(a.context, "employer/company", "PUT", company); await json(b.context, "employer/company", "PUT", { ...company, name: "Local QA Company B", recruiter: "QA Recruiter B" });
  record("Signup does not change USER role to ADMIN", (await json(a.context, "me")).user.role === "USER");
  record("Zero real discoverable candidates", (await json(a.context, "employer/candidates")).total === 0);
  const emptyPage = await a.context.newPage(); emptyPage.on("pageerror", error => errors.push(error.message));
  await emptyPage.goto(base + "/ar/employer/candidates"); await emptyPage.getByText("لا يوجد مرشحون ظاهرون", { exact: true }).waitFor(); await shot(emptyPage, "employer-zero-candidates-ar");
  const choices = { ...defaults, enabled: true, photo: true, location: true, education: true, languages: true, courses: true, certificates: true, cv: true, contactRequests: true };
  await json(candidate.context, "me/discovery", "PUT", { revision: 0, preferences: choices });
  record("Exactly one opt-in candidate; private users excluded", (await json(a.context, "employer/candidates")).total === 1);
  const photo = await sharp({ create: { width: 512, height: 512, channels: 3, background: "#4b9a8b" } }).jpeg().toBuffer();
  await json(candidate.context, "me/photo", "PUT", { revision: 0, image: "data:image/jpeg;base64," + photo.toString("base64") });
  const answers = [{ action: "hold-duplicate" }, { debit: "cash", credit: "capital", amount: "100000" }, { debit: "equipment", credit: "cash", amount: "20000" }, { debit: "inventory", credit: "payable", amount: "15000" }, { debit: "receivable", credit: "revenue", amount: "12000" }, { debit: "cash", credit: "receivable", amount: "7000" }, { debit: "rent", credit: "cash", amount: "3000" }, { amount: "84000" }, { debitTotal: "127000", creditTotal: "127000" }, { action: "reclassify-equipment" }, { formula: "=SUM(C2:C9)", differenceFormula: "=C10-D10" }];
  const steps = ["document-control", "journal-capital", "journal-equipment", "journal-inventory", "journal-service", "journal-receipt", "journal-rent", "ledger-cash", "trial-balance", "classification-error", "worksheet"];
  for (let i = 0; i < steps.length; i++) { const state = await json(candidate.context, "me/student-unit"); const answer = Object.fromEntries(Object.entries(answers[i]).map(([key, value]) => [key, ["amount", "debitTotal", "creditTotal"].includes(key) ? Number(value) : value])); await json(candidate.context, "me/student-unit", "POST", { revision: state.revision, step: steps[i], answer }); record("Accepted local task " + steps[i]); }
  let portfolio = await json(candidate.context, "me/portfolio");
  portfolio = await json(candidate.context, "me/portfolio", "PUT", { revision: portfolio.revision, action: "save-course", course: { title: "Spreadsheet Practice", provider: "Fixture University", date: "2026-10", status: "completed", notes: "Private notes" } });
  const certificateImage = await sharp({ create: { width: 900, height: 600, channels: 3, background: "#fff4cc" } }).jpeg().toBuffer();
  portfolio = await json(candidate.context, "me/portfolio", "PUT", { revision: portfolio.revision, action: "add-certificate", certificate: { title: "Fixture Certificate", issuer: "Fixture University", date: "2026-10", credentialId: "PRIVATE-QA-ID" }, image: "data:image/jpeg;base64," + certificateImage.toString("base64") });
  const one = await json(a.context, "employer/candidates"), id = one.items[0].id;
  record("Current source updates photo and accepted skill projection", one.items[0].photo?.startsWith("data:image/webp") && one.items[0].skills.length > 0 && one.items[0].works.length === 4);
  record("No private email, phone, user ID, certificate image or private notes in recruiter response", !JSON.stringify(one).includes(candidate.email) && !JSON.stringify(one).includes(candidate.id) && !JSON.stringify(one).includes("+201001234567") && !JSON.stringify(one).includes("PRIVATE-QA-ID") && !JSON.stringify(one).includes("Private notes"));
  record("Name search", (await json(a.context, "employer/candidates?q=local%20qa")).total === 1);
  record("Human skill label search", (await json(a.context, "employer/candidates?q=Journal%20Entries")).total === 1);
  record("Role filter", (await json(a.context, "employer/candidates?role=junior-accountant")).total === 1);
  record("Different role excludes", (await json(a.context, "employer/candidates?role=finance-manager")).total === 0);
  record("Skill filter", (await json(a.context, "employer/candidates?skill=journal-entries")).total === 1);
  record("Unsupported bank skill is not invented", (await json(a.context, "employer/candidates?skill=bank-reconciliation")).total === 0);
  record("Location filter", (await json(a.context, "employer/candidates?location=alexandria")).total === 1);
  record("Education filter", (await json(a.context, "employer/candidates?education=fixture%20university")).total === 1);
  record("Availability filter", (await json(a.context, "employer/candidates?availability=not-looking")).total === 1);
  record("Experience filter", (await json(a.context, "employer/candidates?level=student")).total === 1);
  record("Invalid filter and owner injection rejected", (await api(a.context, "employer/candidates?role=ADMIN")).status() === 400 && (await api(a.context, "employer/candidates?userId=" + candidate.id)).status() === 400);
  await json(a.context, "employer/shortlist", "PUT", { candidate: id, action: "add" }); await json(a.context, "employer/shortlist", "PUT", { candidate: id, action: "add" });
  record("Duplicate shortlist idempotent", (await json(a.context, "employer/shortlist")).items.length === 1);
  record("Company B cannot view A shortlist", (await json(b.context, "employer/shortlist")).items.length === 0);
  record("Forged company scope rejected", (await api(b.context, "employer/shortlist", "PUT", { candidate: id, action: "remove", companyId: "company-a" })).status() === 400);
  record("Recruiter cannot read private certificate image", (await api(a.context, "me/certificates/" + portfolio.certificates[0].id)).status() === 404);
  const cv = await json(a.context, `employer/candidates/${id}/cv`);
  record("Consented CV has accounting outcomes and course without canonical contact", JSON.stringify(cv).includes("Spreadsheet Practice") && !JSON.stringify(cv).includes(candidate.email) && !JSON.stringify(cv).includes("+201001234567"));
  await json(a.context, "employer/contact", "POST", { candidate: id, message: "A local fixture internship opportunity for your review." });
  record("Internal request delivered only to candidate inbox", (await json(candidate.context, "me/contact-requests")).items.length === 1 && (await json(b.context, "me/contact-requests")).items.length === 0);
  record("Consent and recruiter domains excluded from progress backups", !(await (await api(candidate.context, "me/progress")).text()).includes("talent/discovery") && !(await (await api(a.context, "me/progress")).text()).includes("talent/company"));
  record("Public sharing remains disabled despite discovery consent", (await json(candidate.context, "me/showcase")).token === null);
  // Many-result fixtures are created ONLY inside this isolated local test database.
  const projection = (await sql.query('SELECT data FROM cloud_progress WHERE "userId"=$1 AND domain=$2', [candidate.id, "talent/discovery"])).rows[0].data;
  for (let i = 0; i < 22; i++) {
    const userId = randomUUID(), candidateId = randomUUID(), name = "Local Fixture " + String(i).padStart(2, "0");
    await sql.query('INSERT INTO app_user (id,name,email,"updatedAt") VALUES ($1,$2,$3,now())', [userId, name, userId + "@fixture.test"]);
    const data = structuredClone(projection); data.candidate.id = candidateId; data.candidate.name = name; data.search = name.toLowerCase() + " junior accountant";
    await sql.query('INSERT INTO cloud_progress (id,"userId",domain,data,revision,provenance,"updatedAt") VALUES ($1,$2,$3,$4,1,$5,now())', [candidateId, userId, "talent/discovery", JSON.stringify(data), "SERVER"]);
  }
  const first = await json(a.context, "employer/candidates"), second = await json(a.context, "employer/candidates?page=2"), beyond = await json(a.context, "employer/candidates?page=3");
  record("Pagination returns 20 then 3 with exact real total", first.items.length === 20 && second.items.length === 3 && first.total === 23 && second.total === 23 && beyond.total === 23 && beyond.items.length === 0);
  record("Pagination has no duplicate candidates", !first.items.some(row => second.items.some(other => other.id === row.id)));
  for (const locale of ["ar", "en"]) for (const width of [1920, 1440, 1024, 390]) {
    const page = await a.context.newPage(); await page.setViewportSize({ width, height: width === 390 ? 844 : width === 1920 ? 1080 : 900 }); page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}/${locale}/employer/candidates`); await page.locator('.talent-result').first().waitFor();
    const name = `employer-search-${locale}-${width}`; await shot(page, name); if (locale === "ar" && width === 390) await page.screenshot({ path: path.join(output, "employer-search-mobile-ar.png"), fullPage: true });
    await page.locator('input[name=q]').fill("Local QA Candidate"); await page.locator('.talent-search-form button[type=submit]').click(); await page.locator('.talent-result').getByText("Local QA Candidate", { exact: true }).waitFor();
    await page.locator('.candidate-result-open').click(); await page.locator('.talent-preview').waitFor(); await shot(page, `employer-preview-${locale}-${width}`);
    if (locale === "ar" && width === 1440) await page.screenshot({ path: path.join(output, "employer-candidate-preview-ar.png"), fullPage: true });
    record(name + " truthful simulation labels without game currency", !(await page.locator('.talent-preview').innerText()).match(/\bXP\b|coins|78% Match/));
    if (width === 390) record(name + " mobile preview replaces list", !(await page.locator('.talent-list').isVisible()));
    await page.locator('.preview-close').click(); record(name + " close restores list", await page.locator('.talent-list').isVisible());
    await page.evaluate(() => document.documentElement.dataset.theme = "dark"); record(name + " dark contrast", await page.locator('.talent-list').evaluate(el => getComputedStyle(el).backgroundColor !== getComputedStyle(el).color)); await shot(page, name + "-dark"); await page.close();
  }
  const profilePage = await candidate.context.newPage(); profilePage.on("pageerror", error => errors.push(error.message));
  for (const locale of ["ar", "en"]) for (const width of [1920, 1440, 390]) {
    await profilePage.setViewportSize({ width, height: width === 390 ? 844 : width === 1920 ? 1080 : 900 }); await profilePage.goto(`${base}/${locale}/career-profile`); await profilePage.locator('.candidate-overview').waitFor(); await profilePage.locator('.member-portrait img').waitFor();
    await shot(profilePage, `candidate-profile-${locale}-${width}`); if (locale === "ar" && width === 390) await profilePage.screenshot({ path: path.join(output, "candidate-profile-mobile-ar.png"), fullPage: true });
    record(`candidate-${locale}-${width} seven professional tabs`, await profilePage.locator('.member-tabs button').count() === 7);
    record(`candidate-${locale}-${width} daylight workspace hero`, (await profilePage.locator('.professional-hero').evaluate(el => getComputedStyle(el).backgroundImage)).includes('first-shift-desk-v2'));
    await profilePage.evaluate(() => document.documentElement.dataset.theme = "dark"); record(`candidate-${locale}-${width} dark surface`, await profilePage.locator('.member-profile').evaluate(el => getComputedStyle(el).backgroundColor === 'rgb(12, 35, 50)')); record(`candidate-${locale}-${width} dark social link contrast`, await profilePage.locator('.candidate-basics .showcase-socials a').first().evaluate(el => { const style = getComputedStyle(el); const luminance = value => { const channels = value.match(/\d+/g).slice(0, 3).map(Number).map(n => { const s = n / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }); return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722; }; const a = luminance(style.color), b = luminance(style.backgroundColor); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5; })); await shot(profilePage, `candidate-profile-${locale}-${width}-dark`);
  }
  const shortlistPage = await a.context.newPage(); await shortlistPage.goto(base + "/ar/employer/shortlist"); await shortlistPage.locator('.talent-result').waitFor(); await shot(shortlistPage, "employer-shortlist-ar"); await shortlistPage.reload(); await shortlistPage.locator('.talent-result').waitFor(); record("Shortlist survives a fresh page load", true);
  let consent = await json(candidate.context, "me/discovery");
  await json(candidate.context, "me/discovery", "PUT", { revision: consent.revision, preferences: { ...choices, enabled: false } });
  record("Revocation removes candidate from search", (await json(a.context, "employer/candidates?q=Local%20QA%20Candidate")).total === 0);
  record("Revocation blocks direct preview and CV", (await api(a.context, "employer/candidates/" + id)).status() === 404 && (await api(a.context, "employer/candidates/" + id + "/cv")).status() === 404);
  record("Revocation removes saved candidate from shortlist", (await json(a.context, "employer/shortlist")).items.length === 0);
  record("Private candidate never exposed", (await api(a.context, "employer/candidates/" + privateUser.id)).status() === 404);
  record("Stale identity context rejected", (await a.context.request.get(base + "/api/v1/employer/candidates", { headers: { "X-Account-Context": b.id } })).status() === 409);
  const anon = await browser.newContext();
  record("Anonymous search protected", (await api(anon, "employer/candidates")).status() === 401);
  const anonPage = await anon.newPage(); await anonPage.goto(base + "/ar/employer/candidates"); record("Anonymous employer route redirects to real localized login", new URL(anonPage.url()).pathname === "/ar/login"); await anon.close();
  record("No browser runtime errors", errors.length === 0);
  await writeFile(path.join(output, "report.json"), JSON.stringify({ checks: results.length, results, errors, isolatedLocalFixturesOnly: true, productionDataUsed: false }, null, 2));
  console.log(`Talent platform QA: ${results.length} checks passed.`);
} finally {
  if (sql) await sql.end(); if (browser) await browser.close();
  if (app && app.exitCode === null) { if (process.platform === "win32") await done(spawn("taskkill", ["/PID", String(app.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true })); else app.kill(); }
  if (database) await database.stop();
}
