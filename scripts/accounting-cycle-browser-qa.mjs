import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const base = process.argv[2] || "http://localhost:3106";
const out = process.argv[3] || "accounting-cycle-qa";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
let failed = false;
for (const locale of ["ar", "en"]) {
  for (const [width, height] of [[1920, 1080], [1440, 900], [1024, 900], [768, 1024], [430, 932], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
    const section = page.locator("#accounting-cycle");
    await section.evaluate(element => element.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForTimeout(130);
    await page.locator(".ac-sticky").screenshot({ path: join(out, `${locale}-${width}x${height}.png`) });
    const initial = await page.evaluate(() => ({
      count: document.querySelectorAll("#accounting-cycle").length,
      stages: document.querySelectorAll("#accounting-cycle .ac-stage-button").length,
      previews: document.querySelectorAll("#accounting-cycle .ac-preview").length,
      dir: document.querySelector("#accounting-cycle")?.getAttribute("dir"),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      active: document.querySelector("#accounting-cycle")?.getAttribute("data-active-stage"),
    }));
    const okay = initial.count === 1 && initial.stages === 12 && initial.previews === 12 && !initial.overflow && initial.dir === (locale === "ar" ? "rtl" : "ltr") && errors.length === 0;
    if (!okay) failed = true;
    process.stdout.write(`${locale} ${width}x${height}: ${JSON.stringify({ ...initial, errors, okay })}\n`);
    if (width === 1440) {
      const visited = [];
      for (let index = 0; index < 12; index++) {
        await page.evaluate(index => {
          const section = document.querySelector("#accounting-cycle");
          if (!section) return;
          const y = scrollY + section.getBoundingClientRect().top + (section.offsetHeight - innerHeight) * ((index + .3) / 12);
          scrollTo({ top: y, behavior: "instant" });
        }, index);
        await page.waitForTimeout(35);
        const state = await page.evaluate(() => ({
          section: Number(document.querySelector("#accounting-cycle")?.getAttribute("data-active-stage")),
          timeline: Number(document.querySelector(".ac-stage-button.is-active .ac-stage-number")?.textContent),
          preview: Number(document.querySelector(".ac-preview.is-active .ac-preview-number")?.textContent),
          heading: document.querySelector(".ac-info h3")?.textContent,
          laptop: document.querySelector(".ac-workspace-heading h3")?.textContent,
          pinnedTop: document.querySelector(".ac-sticky")?.getBoundingClientRect().top,
        }));
        visited.push(state);
        if (state.section !== index + 1 || state.timeline !== index + 1 || state.preview !== index + 1 || state.heading !== state.laptop || Math.abs(state.pinnedTop) > 2) {
          failed = true;
          process.stdout.write(`${locale} mismatch at ${index + 1}: ${JSON.stringify(state)}\n`);
        }
      }
      process.stdout.write(`${locale} desktop scroll: ${JSON.stringify(visited.map(s => s.section))}\n`);
      const released = await page.evaluate(() => {
        const section = document.querySelector("#accounting-cycle");
        if (!section) return false;
        scrollTo({ top: scrollY + section.getBoundingClientRect().top + section.offsetHeight + 20, behavior: "instant" });
        return document.querySelector(".ac-sticky")?.getBoundingClientRect().bottom < 0;
      });
      if (!released) failed = true;
      process.stdout.write(`${locale} sticky released: ${released}\n`);
      await page.getByRole("button", { name: locale === "ar" ? "المرحلة 2: المستندات الواردة" : "Stage 2: Source Documents" }).click();
      const afterClick = await section.getAttribute("data-active-stage");
      if (afterClick !== "2") failed = true;
      process.stdout.write(`${locale} desktop direct selection: ${afterClick}\n`);
    }
    await page.close();
  }
}
await browser.close();
if (failed) process.exitCode = 1;
