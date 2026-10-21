import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const base = process.env.EXCEL_QA_BASE ?? "http://localhost:3105";
const output = path.resolve("artifacts/excel-foundations-qa");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox"] });
const failures = [];
try {
  for (const locale of ["ar", "en"]) {
    const page = await browser.newPage({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 1 });
    page.on("pageerror", (error) => failures.push(`${locale}: ${error.message}`));
    const response = await page.goto(`${base}/${locale}/bootcamp/excel-foundations`, { waitUntil: "domcontentloaded", timeout: 60000 });
    assert.equal(response?.status(), 200);
    await page.getByRole("heading", { name: /Excel Foundations/i }).waitFor();
    assert.equal(await page.locator(".xf-stagebar button").count(), 5);
    assert.equal(await page.locator(".xf-sheet tbody tr").count(), 11);
    assert.equal(await page.locator(".xf-hero").isVisible(), true);
    await page.screenshot({ path: path.join(output, `${locale}-desktop.png`), fullPage: true });
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    mobile.on("pageerror", (error) => failures.push(`${locale}-mobile: ${error.message}`));
    await mobile.goto(`${base}/${locale}/bootcamp/excel-foundations`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await mobile.getByRole("heading", { name: /Excel Foundations/i }).waitFor();
    assert.equal(await mobile.locator(".xf-stagebar").isVisible(), true);
    const overflow = await mobile.evaluate(() => ({ width: window.innerWidth, scroll: document.documentElement.scrollWidth, elements: [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().right > window.innerWidth + 2 || el.getBoundingClientRect().left < -2).slice(0, 15).map((el) => ({ tag: el.tagName, className: typeof el.className === "string" ? el.className : "", left: Math.round(el.getBoundingClientRect().left), right: Math.round(el.getBoundingClientRect().right) })) }));
    assert.equal(overflow.scroll <= overflow.width + 2, true, `${locale} mobile horizontal overflow`);
    await mobile.screenshot({ path: path.join(output, `${locale}-mobile.png`), fullPage: true });
    await mobile.close();
    if (locale === "ar") {
      await page.getByLabel("B2", { exact: true }).focus();
      await page.getByLabel("concept", { exact: true }).selectOption("cell");
      await page.getByRole("button", { name: "تحقق من الحل" }).click();
      assert.match(await page.locator(".xf-stagebar button.active").innerText(), /المعادلة/);
      for (const [cell, value] of [["C8", "liability"], ["C9", "liability"], ["C10", "equity"]]) await page.getByLabel(cell, { exact: true }).selectOption(value);
      await page.getByLabel("loan", { exact: true }).selectOption("liability");
      await page.getByLabel("equation", { exact: true }).selectOption("assets=liabilities+equity");
      await page.getByRole("button", { name: "تحقق من الحل" }).click();
      assert.match(await page.locator(".xf-stagebar button.active").innerText(), /البيانات/);
      for (const [cell, value] of [["B8", "70000"], ["B9", "30000"], ["B10", "100000"]]) await page.getByLabel(cell, { exact: true }).fill(value);
      await page.getByRole("button", { name: "تحقق من الحل" }).click();
      assert.match(await page.locator(".xf-stagebar button.active").innerText(), /SUM/);
      await page.getByLabel("B6", { exact: true }).fill("=SUM(B2:B5)");
      await page.getByLabel("B11", { exact: true }).fill("=SUM(B8:B10)");
      await page.getByRole("button", { name: "تحقق من الحل" }).click();
      assert.match(await page.locator(".xf-stagebar button.active").innerText(), /تطبيقية/);
      await page.getByLabel("C8", { exact: true }).selectOption("liability");
      await page.getByLabel("B6", { exact: true }).fill("=SUM(B2:B5)");
      await page.getByLabel("B11", { exact: true }).fill("=SUM(B8:B10)");
      await page.getByLabel("loan", { exact: true }).selectOption("liability");
      await page.getByLabel("equation", { exact: true }).selectOption("assets=liabilities+equity");
      await page.getByLabel("equipment", { exact: true }).selectOption("asset-exchange");
      await page.getByLabel("balance", { exact: true }).selectOption("not-proof");
      await page.getByRole("button", { name: "تحقق من الحل" }).click();
      assert.equal(await page.locator(".xf-stagebar button.done").count(), 5);
    }
    await page.close();
  }
  const arena = await browser.newPage();
  const result = await arena.goto(`${base}/ar/accounting-arena`, { waitUntil: "domcontentloaded", timeout: 60000 });
  assert.equal(result?.status(), 200);
  assert.equal(await arena.getByText("لا يوجد مشاركون مؤهلون بعد").isVisible(), true);
  await arena.close();
  assert.deepEqual(failures, []);
  console.log("PASS Excel Foundations Arabic/English desktop/mobile, five-step guest flow, responsive layout, empty honest arena");
  console.log(`Screenshots: ${output}`);
} finally { await browser.close(); }
