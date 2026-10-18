import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const base = process.argv[2] || "http://localhost:3105";
const out = process.argv[3] || "landing-cv-ats-qa";
const viewports = [
  [1920, 1080], [1440, 900], [1024, 900], [768, 1024], [390, 844],
];
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
let failed = false;
for (const locale of ["ar", "en"]) {
  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
    const section = page.locator("#cv-ats");
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: join(out, `${locale}-${width}x${height}.png`) });
    const result = await page.evaluate(() => ({
      sections: document.querySelectorAll("#cv-ats").length,
      sources: document.querySelectorAll("#cv-ats .landing-cv-ats-source").length,
      documentOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      sectionOverflow: (() => {
        const section = document.querySelector("#cv-ats");
        return section ? section.scrollWidth > section.clientWidth + 1 : true;
      })(),
    }));
    const okay = result.sections === 1 && result.sources === 5 && !result.documentOverflow && !result.sectionOverflow && errors.length === 0;
    if (!okay) failed = true;
    process.stdout.write(`${locale} ${width}x${height}: ${JSON.stringify({ ...result, errors, okay })}\n`);
    await page.close();
  }
}
await browser.close();
if (failed) process.exitCode = 1;
