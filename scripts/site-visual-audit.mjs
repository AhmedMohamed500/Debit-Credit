// Read-only visual smoke test of representative public routes.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const base = process.argv[2] || "https://debit-credit-nine.vercel.app";
const allRoutes = ["/ar", "/ar/academy", "/ar/pricing", "/ar/onboarding", "/ar/employers", "/ar/game/first-shift", "/ar/signup", "/ar/login", "/en/pricing", "/en/game/first-shift", "/en/signup", "/en/login"];
const routes = process.argv[3] ? [process.argv[3]] : allRoutes;
const widths = process.argv[4] ? [Number(process.argv[4])] : [1440, 390];
const out = path.resolve("artifacts/site-visual-audit", base.includes("localhost") ? "local" : "production");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--disable-background-networking", "--no-first-run"],
});
const results = [];
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
    for (const route of routes) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("response", response => {
        if (response.status() >= 400 && /\.(css|woff2?)(\?|$)/.test(response.url()))
          errors.push(`${response.status()} ${response.url()}`);
      });
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      const filename = route.replaceAll("/", "-").replace(/^-/, "") || "home";
      await page.screenshot({ path: path.join(out, `${filename}-${width}.png`), fullPage: false });
      const layout = await page.evaluate(() => {
        const visible = element => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && style.visibility !== "hidden";
        };
        const textNodes = [...document.querySelectorAll("body *")].filter(element =>
          element.children.length === 0 && element.textContent?.trim() && visible(element));
        const small = textNodes.map(element => ({
          text: element.textContent.trim().slice(0, 80),
          size: Number.parseFloat(getComputedStyle(element).fontSize),
        })).filter(row => row.size < 14);
        return {
          title: document.title,
          path: location.pathname,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          visibleTextCount: textNodes.length,
          smallTextCount: small.length,
          smallExamples: small,
          h1: [...document.querySelectorAll("h1")].filter(visible).map(element => ({ text: element.textContent.trim().slice(0, 70), size: getComputedStyle(element).fontSize })),
        };
      });
      let billingToggleWorks;
      if (route.endsWith("/pricing")) {
        const segments = page.locator(".pricing-billing__segments button");
        await segments.nth(1).click();
        billingToggleWorks = await segments.nth(1).getAttribute("aria-pressed") === "true";
        await segments.nth(0).click();
        billingToggleWorks &&= await segments.nth(0).getAttribute("aria-pressed") === "true";
      }
      results.push({ route, width, status: response?.status(), errors, billingToggleWorks, ...layout });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(path.join(out, "results.json"), JSON.stringify(results, null, 2));
for (const row of results)
  console.log(`${row.width} ${row.route} -> ${row.path} HTTP ${row.status} small ${row.smallTextCount}/${row.visibleTextCount} overflow=${row.horizontalOverflow} errors=${row.errors.length}`);
if (results.some(row => row.status !== 200 || row.horizontalOverflow || row.errors.length || row.billingToggleWorks === false))
  process.exitCode = 1;
