import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const base = "https://debit-credit-nine.vercel.app", results = [];
function record(name, condition) { assert.ok(condition, name); results.push(name); console.log("PASS", name); }
for (const locale of ["ar", "en"]) {
  for (const route of ['login', 'signup']) record(`${locale} ${route} remains a real page`, (await fetch(`${base}/${locale}/${route}`)).status === 200);
  for (const token of ['invalid-token', randomUUID().replaceAll('-', '')]) {
    const response = await fetch(`${base}/${locale}/portfolio/${token}`, { redirect: 'manual' });
    record(`${locale} absent public profile returns 404 without redirect`, response.status === 404 && !response.headers.get('location'));
    record(`${locale} public route cannot be cached or indexed`, response.headers.get('cache-control').includes('no-store') && response.headers.get('x-robots-tag').includes('noindex') && response.headers.get('referrer-policy') === 'no-referrer');
  }
}
const privateResponse = await fetch(base + '/api/v1/me/showcase', { redirect: 'manual' }), privateBody = await privateResponse.json();
record('Private showcase requires authentication', privateResponse.status === 401);
record('Private API response has no settings token or user data', Object.keys(privateBody).join(',') === 'error');
record('Private API response never publicly cached', privateResponse.headers.get('cache-control') === 'private, no-store');
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
record('Shared token pages not enumerated in public sitemap', !sitemap.includes('/portfolio/'));
await mkdir('artifacts/showcase-production-readonly', { recursive: true });
await writeFile(path.resolve('artifacts/showcase-production-readonly/report.json'), JSON.stringify({ results, methods: ['GET'], testAccountsCreated: false, productionDataWritten: false }, null, 2));
console.log(`Showcase production read-only QA: ${results.length} checks passed.`);
