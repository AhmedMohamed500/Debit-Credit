import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const base = process.env.QA_BASE_URL || "http://localhost:3105";
const output = process.env.QA_OUTPUT_DIR || path.join(process.cwd(), "employer-discovery-qa");
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
await mkdir(output, { recursive: true });
const failures = [];
try {
  for (const locale of ["ar", "en"]) {
    for (const [width, height] of [[1920, 1080], [1672, 941], [1440, 900], [1024, 768], [768, 1024], [430, 932], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/${locale}`, { waitUntil: "networkidle", timeout: 60000 });
      const section = page.locator("#employer-discovery");
      assert.equal(await section.count(), 1, `${locale}: section count`);
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: path.join(output, `${locale}-${width}x${height}.png`) });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const box = await section.boundingBox();
      const previewClipped = await section.evaluate((node) => {
        const panel = node.querySelector(".ed-employer");
        const preview = node.querySelector(".ed-preview");
        return Boolean(panel && preview && preview.getBoundingClientRect().bottom > panel.getBoundingClientRect().bottom - 2);
      });
      if (overflow > 1) failures.push(`${locale} ${width}x${height}: horizontal overflow ${overflow}px`);
      if (previewClipped) failures.push(`${locale} ${width}x${height}: employer preview clipped`);
      if (errors.length) failures.push(`${locale} ${width}x${height}: ${errors.join(" | ")}`);
      console.log(`${locale} ${width}x${height}: section ${Math.round(box?.width || 0)}x${Math.round(box?.height || 0)}, overflow ${overflow}px, errors ${errors.length}`);
      if (width === 1440) {
        await section.getByRole("button", { name: locale === "ar" ? /استكشف كيف تظهر للشركات/ : /See how discovery works/ }).click();
        assert.ok(await section.locator(".ed-consent-explainer.is-visible").count());
        const primary = section.locator(".ed-primary");
        assert.ok((await primary.getAttribute("href"))?.includes(`/${locale}/`));
        await section.getByRole("tab", { name: locale === "ar" ? "الشهادات" : "Certificates" }).click();
        assert.equal(await section.locator('[role="tab"][aria-selected="true"]').count(), 1);
      }
      await page.close();
    }
  }
  assert.deepEqual(failures, [], failures.join("\n"));
} finally {
  await browser.close();
}
