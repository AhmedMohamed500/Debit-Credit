import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.GAME_HUB_URL ?? "http://localhost:3109";
const output = "artifacts/game-hub-fix";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage();
const report = { base, desktop: [], routes: {}, mobile: {}, errors: [] };
page.on("pageerror", error => report.errors.push(error.message));

async function open(path, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
}

async function gameMetrics(width, height, path = "/ar/game") {
  await open(path, width, height);
  return page.evaluate(() => {
    const rect = element => {
      const value = element.getBoundingClientRect();
      return { top: Math.round(value.top), bottom: Math.round(value.bottom), height: Math.round(value.height) };
    };
    const game = document.querySelector(".command-game");
    const shell = document.querySelector(".command-shell");
    const nav = document.querySelector(".platform-nav");
    return {
      viewport: { width: innerWidth, height: innerHeight },
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      game: rect(game), shell: rect(shell), nav: rect(nav),
      headerCount: document.querySelectorAll(".platform-nav").length,
      direction: getComputedStyle(game).direction,
    };
  });
}

await mkdir(output, { recursive: true });
for (const [width, height] of [[1920, 1080], [1920, 900], [1672, 941], [1440, 900], [1366, 768]]) {
  const metrics = await gameMetrics(width, height);
  assert.equal(metrics.overflowX, 0);
  assert.equal(metrics.headerCount, 1);
  assert.equal(metrics.game.top, 0);
  assert.equal(metrics.game.bottom, height);
  assert.equal(metrics.shell.top, metrics.nav.bottom);
  assert.equal(metrics.shell.bottom, height);
  report.desktop.push(metrics);
}

await open("/ar/game", 1920, 1080);
await page.screenshot({ path: `${output}/game-hub-ar-1920x1080.png` });
await open("/ar/game", 1366, 768);
await page.screenshot({ path: `${output}/game-hub-ar-1366x768.png` });
await open("/en/game", 1440, 900);
await page.getByRole("button", { name: "dark", exact: true }).click();
await page.screenshot({ path: `${output}/game-hub-dark.png` });

await open("/ar/game", 1366, 768);
await page.getByRole("link", { name: "دفتر الأستاذ", exact: true }).click();
await page.waitForURL("**/ar/ledger");
assert.equal(await page.getByRole("heading", { name: "دفتر الأستاذ", exact: true }).count(), 1);
assert.equal(await page.getByRole("link", { name: /طبيعة الحساب/ }).getAttribute("href"), "/ar/account-guide");
report.routes.ledger = page.url();
await page.screenshot({ path: `${output}/ledger-ar.png` });

await open("/ar/game", 1366, 768);
await page.getByRole("link", { name: /البنك/ }).click();
await page.waitForURL("**/ar/game/bank");
assert.equal(await page.getByRole("link", { name: "Mizan Trading", exact: true }).getAttribute("href"), "/ar/game");
report.routes.bank = page.url();
await page.screenshot({ path: `${output}/bank-zone-ar.png` });

for (const [name, expected] of [[/الموردون/, "/ar/game/suppliers"], [/العملاء/, "/ar/game/customers"], [/اللوجستيات/, "/ar/game/logistics"], [/نهاية الشهر/, "/ar/game/month-end"]]) {
  await open("/ar/game", 1366, 768);
  await page.getByRole("link", { name }).click();
  await page.waitForURL(`**${expected}`);
  report.routes[expected.split("/").at(-1)] = page.url();
}
assert.equal(await page.getByText("مقفولة", { exact: true }).count(), 1);

for (const [width, height] of [[430, 932], [390, 844]]) {
  const metrics = await gameMetrics(width, height);
  assert.equal(metrics.overflowX, 0);
  assert.equal(metrics.headerCount, 1);
  assert.ok(metrics.scrollHeight > height);
  report.mobile[`${width}x${height}`] = metrics;
}
await open("/ar/game", 390, 844);
await page.screenshot({ path: `${output}/game-hub-mobile-ar.png` });

assert.deepEqual(report.errors, []);
await writeFile(`${output}/qa.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify({ screenshots: 6, report: `${output}/qa.json` }));
