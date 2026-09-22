import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.PHASE_A_URL ?? "http://localhost:3104";
const mode = process.env.PHASE_A_MODE ?? "after";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const output = `artifacts/phase-a-${mode}`;
await mkdir(output, { recursive: true });
const errors = [];
const report = { mode, routes: {}, errors };

async function pageAt(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on("pageerror", error => errors.push(error.message));
  return page;
}

async function captureIntro(locale, width, height, name) {
  const page = await pageAt(width, height);
  await page.goto(`${base}/${locale}`);
  await page.locator(".fd-entry-gate").waitFor();
  await page.evaluate(() => document.fonts.ready);
  const action = page.locator(".fd-start-story");
  const box = await action.boundingBox();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height, `${name}: primary CTA is visible`);
  assert.equal(overflow, 0, `${name}: no horizontal overflow`);
  await page.screenshot({ path: `${output}/${name}.png` });
  report.routes[name] = { width, height, overflow, ctaVisible: true };
  await page.close();
}

async function captureManual(locale, width, height, name) {
  const page = await pageAt(width, height);
  await page.goto(`${base}/${locale}/account-guide`);
  await page.locator(".manual-book").waitFor();
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const rings = await page.locator(".manual-binding").boundingBox();
  const listPage = await page.locator(".manual-list-page").boundingBox();
  const detailPage = await page.locator(".manual-detail-page").boundingBox();
  assert.equal(overflow, 0, `${name}: no horizontal overflow`);
  if (width >= 1000) assert.ok(rings && listPage && detailPage, `${name}: desktop book geometry exists`);
  await page.screenshot({ path: `${output}/${name}.png` });
  report.routes[name] = { width, height, overflow, rings, listPage, detailPage };
  await page.close();
}

async function captureDeskAndFlow(locale, width, height, name) {
  const page = await pageAt(width, height);
  await page.goto(`${base}/${locale}`);
  const start = page.locator(".fd-start-story");
  await start.click();
  await page.getByRole("button", { name: locale === "ar" ? "ادخل الشركة" : "ENTER COMPANY" }).click();
  await page.getByRole("button", { name: locale === "ar" ? /ورّيني المكتب/ : /SHOW ME THE DESK/ }).click();
  await page.locator(".scene-paper").first().waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.equal(overflow, 0);
  await page.screenshot({ path: `${output}/${name}.png` });
  report.routes[name] = { width, height, overflow };
  await page.close();
}

try {
  await captureManual("ar", 1906, 890, "nature-ar-1906x890");
  await captureIntro("ar", 1877, 953, "first-day-intro-ar-1877x953");
  for (const width of [360, 390, 768, 1280, 1440]) {
    await captureIntro("ar", width, width <= 390 ? 844 : width === 768 ? 900 : 900, `intro-ar-${width}`);
    await captureManual("en", width, width <= 390 ? 844 : width === 768 ? 900 : 900, `manual-en-${width}`);
  }
  await captureDeskAndFlow("ar", 390, 844, "desk-ar-390");
  assert.deepEqual(errors, []);
  await writeFile(`${output}/qa.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ mode, captures: Object.keys(report.routes).length, errors }));
} finally {
  await browser.close();
}
