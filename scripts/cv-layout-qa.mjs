// Optional local browser check for the same compact blocks sent to PDF/DOCX.
// Generate synthetic fixtures first with CV_EXPORT_WRITE_FIXTURE=1.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const css = readFileSync(join(root, "app", "career-profile-documents.css"), "utf8");
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-sandbox"],
});
const escape = (text) => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
let failed = false;
for (const fixture of ["synthetic-accounting-cv", "synthetic-dense-accounting-cv"]) {
  const blocks = JSON.parse(readFileSync(join(root, "artifacts", "cv-export-qa", `${fixture}-blocks.json`), "utf8"));
  const markup = blocks.map((block) => block.header
    ? `<header><h1>${escape(block.lines[0] ?? "")}</h1><p>${escape(block.lines[1] ?? "")}</p><address>${escape(block.lines[2] ?? "")}</address></header>`
    : `<section>${block.heading ? `<h2>${escape(block.heading)}</h2>` : ""}${block.lines.map((line) => `<p>${escape(line)}</p>`).join("")}</section>`).join("");
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.setContent(`<style>${css}</style><div class="cv-measure cv-typeset">${markup}</div>`);
    await page.evaluate(() => document.fonts.ready);
    const heights = await page.locator(".cv-measure > *").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
    const maxHeight = 265 * 96 / 25.4;
    let pages = 1;
    let used = 0;
    let omitted = 0;
    for (const height of heights) {
      if (height > maxHeight) { omitted++; continue; }
      if (used + height > maxHeight) {
        if (pages === 2) { omitted++; continue; }
        pages++;
        used = 0;
      }
      used += height;
    }
    console.log(`${fixture} at ${width}px: ${pages} preview page(s), ${omitted} omitted block(s)`);
    if (omitted) failed = true;
    await page.close();
  }
}
await browser.close();
if (failed) process.exitCode = 1;
