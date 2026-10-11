// GET-only production verification. No fixtures, signup, secrets, or database writes.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = "https://debit-credit-nine.vercel.app", results = [];
function record(name, value) { assert.ok(value, name); results.push(name); console.log("PASS", name); }
async function get(route) { return fetch(base + route, { redirect: "manual", signal: AbortSignal.timeout(30000) }); }
for (const locale of ["ar", "en"]) {
  for (const route of ["companies", "employers", "login", "signup"]) record(locale + " " + route + " exists", (await get(`/${locale}/${route}`)).status === 200);
  for (const route of ["employer", "employer/company", "employer/candidates", "employer/shortlist"]) {
    const response = await get(`/${locale}/${route}`), target = new URL(response.headers.get("location") || "/", base);
    record(locale + " " + route + " requires real localized login", response.status === 307 && target.origin === base && target.pathname === `/${locale}/login` && target.searchParams.get("next") === `/${locale}/employer/candidates`);
    record(locale + " " + route + " not cached or indexed", response.headers.get("cache-control")?.includes("no-store") && response.headers.get("x-robots-tag")?.includes("noindex"));
  }
  for (const route of ["companies/talent", "employers/talent"]) {
    const response = await get(`/${locale}/${route}`), target = new URL(response.headers.get("location") || "/", base);
    record(locale + " " + route + " no demo directory", response.status === 307 && target.pathname === `/${locale}/employer/candidates`);
  }
}
for (const route of ["me/discovery", "me/contact-requests", "employer/account", "employer/candidates", "employer/shortlist"]) {
  const response = await get("/api/v1/" + route), body = await response.json();
  record(route + " anonymous access blocked without user fields", response.status === 401 && Object.keys(body).join(",") === "error");
  record(route + " private no-store", response.headers.get("cache-control") === "private, no-store");
}
const session = await get("/api/auth/get-session");
record("Better Auth remains directly reachable and configured", session.status === 200 && await session.json() === null);
const sitemap = await (await get("/sitemap.xml")).text();
record("Private employer search and shared tokens not in sitemap", !sitemap.includes("/employer/") && !sitemap.includes("/employers/talent") && !sitemap.includes("/portfolio/"));
await mkdir("artifacts/talent-production-readonly", { recursive: true });
await writeFile("artifacts/talent-production-readonly/report.json", JSON.stringify({ checks: results.length, results, methods: ["GET"], testAccountsCreated: false, productionDataWritten: false, authenticatedEmployerWorkflowTested: false }, null, 2));
console.log(`Talent production read-only QA: ${results.length} checks passed.`);
