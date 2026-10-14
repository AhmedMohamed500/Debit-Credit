import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const port = 3138;
const base = `http://127.0.0.1:${port}`;
const output = path.resolve("artifacts/pricing-reference/qa");
const sizes = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1024, height: 900 },
  { width: 390, height: 844 },
];
const results = [];
let server;
let browser;

function record(name, condition) {
  assert.ok(condition, name);
  results.push(name);
  process.stdout.write(`PASS ${name}\n`);
}

async function ready() {
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error("Pricing QA server exited");
    try {
      const response = await fetch(`${base}/ar/pricing`);
      if (response.ok) return;
    } catch {
      /* server starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error("Pricing QA server did not start");
}

try {
  await mkdir(output, { recursive: true });
  const env = {
    ...process.env,
    DATABASE_URL: "",
    DIRECT_URL: "",
    BETTER_AUTH_SECRET: "",
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    RESEND_API_KEY: "",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "-H",
      "127.0.0.1",
      "-p",
      String(port),
    ],
    { env, windowsHide: true, stdio: "ignore" },
  );
  await ready();
  browser = await chromium.launch({
    executablePath:
      process.env.CHROME_EXECUTABLE ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-first-run", "--disable-background-networking"],
  });
  for (const locale of ["ar", "en"]) {
    for (const viewport of sizes) {
      const context = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await page.goto(`${base}/${locale}/pricing`, {
        waitUntil: "networkidle",
      });
      await page.evaluate(() => document.fonts.ready);
      const label = `${locale}-${viewport.width}`;
      const viewportImage = await page.screenshot({
        path: path.join(output, `${label}.png`),
      });
      const screenshotSize = await sharp(viewportImage).metadata();
      record(
        `${label} exact screenshot size`,
        screenshotSize.width === viewport.width &&
          screenshotSize.height === viewport.height,
      );
      await page.screenshot({
        path: path.join(output, `${label}-full.png`),
        fullPage: true,
      });
      record(
        `${label} route/title`,
        (await page.title()) !== "" &&
          (await page.locator(".pricing-page").count()) === 1,
      );
      record(
        `${label} four cards`,
        (await page.locator(".pricing-card").count()) === 4,
      );
      const metrics = await page.evaluate(() => {
        const cards = [...document.querySelectorAll(".pricing-card")];
        const rect = (el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom };
        };
        return {
          cards: cards.map(rect),
          actions: cards.map((card) =>
            rect(card.querySelector(".pricing-card__action")),
          ),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      record(`${label} no horizontal overflow`, !metrics.overflow);
      if (viewport.width >= 1440) {
        record(
          `${label} equal card widths`,
          metrics.cards.every(
            (card) => Math.abs(card.w - metrics.cards[0].w) <= 1,
          ),
        );
        record(
          `${label} equal card heights`,
          metrics.cards.every(
            (card) => Math.abs(card.h - metrics.cards[0].h) <= 1,
          ),
        );
        record(
          `${label} same row`,
          metrics.cards.every(
            (card) => Math.abs(card.y - metrics.cards[0].y) <= 1,
          ),
        );
        record(
          `${label} equal gaps`,
          Math.abs(
            metrics.cards[1].x -
              metrics.cards[0].x -
              metrics.cards[0].w -
              (metrics.cards[2].x - metrics.cards[1].x - metrics.cards[1].w),
          ) <= 1,
        );
        record(
          `${label} action baseline`,
          metrics.actions.every(
            (action) =>
              Math.abs(action.bottom - metrics.actions[0].bottom) <= 1,
          ),
        );
      }
      if (viewport.width === 390)
        record(
          `${label} mobile single column`,
          metrics.cards[1].y > metrics.cards[0].bottom,
        );
      record(`${label} no client errors`, pageErrors.length === 0);
      await writeFile(
        path.join(output, `${label}.json`),
        JSON.stringify(metrics, null, 2),
      );
      if (viewport.width === 1440 && locale === "ar") {
        await page.locator('[data-billing="monthly"]').click();
        record(
          "billing switches without hiding plans",
          (await page.locator(".pricing-card").count()) === 4 &&
            (await page
              .locator('[data-billing="monthly"]')
              .getAttribute("aria-pressed")) === "true",
        );
        await page.locator('[data-audience="company"]').click();
        record(
          "company audience selection",
          (await page
            .locator('[data-audience="company"]')
            .getAttribute("aria-selected")) === "true",
        );
        await page
          .locator(".pricing-card--monthly .pricing-card__action")
          .click();
        record(
          "paid action discloses unavailability",
          (await page
            .getByRole("dialog")
            .getByText(/غير متاح/)
            .count()) > 0,
        );
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "إغلاق" })
          .click();
        await page.goto(`${base}/ar/pricing?theme=dark`, {
          waitUntil: "networkidle",
        });
        await page.screenshot({
          path: path.join(output, "ar-1440-dark.png"),
        });
        await page.screenshot({
          path: path.join(output, "ar-1440-dark-full.png"),
          fullPage: true,
        });
        record(
          "dark mode",
          await page.evaluate(
            () => document.documentElement.dataset.theme === "dark",
          ),
        );
      }
      await context.close();
    }
  }
  await writeFile(
    path.join(output, "results.json"),
    JSON.stringify({ base, results }, null, 2),
  );
} finally {
  await browser?.close();
  if (server && server.exitCode === null) server.kill();
}
