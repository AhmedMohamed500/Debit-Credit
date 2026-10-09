// Local, read-only route and visual regression checks. Never submits credentials.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const phase = process.argv.includes("--before") ? "before" : "after";
const output = path.resolve("artifacts/project-organization");
const base = "http://localhost:3112";
const app = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3112",
  ],
  {
    windowsHide: true,
    stdio: "ignore",
    env: {
      ...process.env,
      APP_BUILD_DIR: ".next",
      DATABASE_URL: "",
      DIRECT_URL: "",
      BETTER_AUTH_URL: "",
      BETTER_AUTH_SECRET: "",
      GOOGLE_CLIENT_ID: "",
      GOOGLE_CLIENT_SECRET: "",
      RESEND_API_KEY: "",
      EMAIL_FROM: "",
    },
  },
);
let browser;
const results = [];
const errors = [];
const visuals = [];
const check = (name, condition = true) => {
  assert.ok(condition, name);
  results.push(name);
  console.log("PASS", name);
};
try {
  await mkdir(output, { recursive: true });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (app.exitCode !== null) throw new Error("Local QA server exited");
    try {
      ready = (await fetch(base + "/ar")).ok;
    } catch {}
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, "Local QA server must start");
  const oldPaths = {
    "/arena/leaderboard": "/leaderboard",
    "/academy/legacy-course/legacy-lesson": "/campaign",
  };
  for (const locale of ["ar", "en"]) {
    for (const route of [
      "",
      "/login",
      "/signup",
      "/game",
      "/account-guide",
      "/academy",
      "/career",
      "/career-profile",
      "/profile",
      "/account",
      "/companies",
      "/employers",
      "/leaderboard",
      "/arena",
      "/academy/account-guide",
    ]) {
      const response = await fetch(base + `/${locale}${route}`, {
        redirect: "manual",
      });
      check(
        `${locale}${route || "/"} physical route resolves`,
        response.status === 200,
      );
    }
    for (const [oldPath, target] of Object.entries(oldPaths)) {
      const response = await fetch(base + `/${locale}${oldPath}`, {
        redirect: "manual",
      });
      check(
        `${locale}${oldPath} compatibility redirect retained`,
        [307, 308].includes(response.status) &&
          new URL(response.headers.get("location"), base).pathname ===
            `/${locale}${target}`,
      );
    }
  }
  browser = await chromium.launch({
    executablePath:
      process.env.CHROME_EXECUTABLE ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--disable-background-networking", "--no-first-run"],
  });
  for (const locale of ["ar", "en"])
    for (const width of [1440, 390])
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        page.on("pageerror", (error) => errors.push(error.name));
        await page.goto(`${base}/${locale}?theme=${theme}`, {
          waitUntil: "networkidle",
        });
        await page.evaluate(async () => {
          await document.fonts.ready;
          for (const image of document.images) image.loading = "eager";
          await Promise.all(
            [...document.images].map((image) =>
              Promise.race([
                image.decode().catch(() => {}),
                new Promise((resolve) => setTimeout(resolve, 10000)),
              ]),
            ),
          );
        });
        const label = `${locale}-${width}-${theme}`;
        const metrics = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          elements: [
            ".marketing-nav",
            ".cl4-hero",
            ".cl4-how",
            ".cl4-audience",
            ".cl4-journey",
            ".cl4-features",
            ".cl4-final",
          ].map((selector) => {
            const element = document.querySelector(selector);
            if (!element) return { selector, missing: true };
            const box = element.getBoundingClientRect(),
              css = getComputedStyle(element);
            return {
              selector,
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              font: css.fontFamily,
              fontSize: css.fontSize,
              color: css.color,
              display: css.display,
            };
          }),
        }));
        check(`${label} no horizontal overflow`, !metrics.overflow);
        const imagePath = path.join(output, `${phase}-${label}.png`);
        await page.screenshot({
          path: imagePath,
          fullPage: true,
          animations: "disabled",
        });
        visuals.push({ label, metrics });
        if (phase === "after") {
          const prior = JSON.parse(
            await readFile(path.join(output, "before.json"), "utf8"),
          ).visuals.find((entry) => entry.label === label);
          assert.deepEqual(
            metrics,
            prior.metrics,
            `${label} layout and typography must remain unchanged`,
          );
          check(`${label} layout and typography preserved`);
          const before = await sharp(path.join(output, `before-${label}.png`))
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
          const after = await sharp(imagePath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
          assert.deepEqual(
            before.info,
            after.info,
            `${label} screenshot dimensions`,
          );
          let changed = 0;
          for (let pixel = 0; pixel < before.data.length; pixel += 4)
            if (
              [0, 1, 2].some(
                (channel) =>
                  Math.abs(
                    before.data[pixel + channel] - after.data[pixel + channel],
                  ) > 12,
              )
            )
              changed++;
          const ratio = changed / (before.info.width * before.info.height);
          check(
            `${label} visual difference below 0.5% (${(ratio * 100).toFixed(3)}%)`,
            ratio < 0.005,
          );
        }
        await context.close();
      }
  check("No uncaught browser errors", errors.length === 0);
  await writeFile(
    path.join(output, `${phase}.json`),
    JSON.stringify(
      {
        phase,
        base,
        checks: results.length,
        results,
        errors,
        visuals,
        credentialsSubmitted: false,
        databaseTouched: false,
      },
      null,
      2,
    ),
  );
} finally {
  if (browser) await browser.close();
  app.kill();
}
