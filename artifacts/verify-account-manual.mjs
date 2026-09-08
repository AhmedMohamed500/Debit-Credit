import assert from "node:assert/strict";
import { chromium } from "file:///C:/Users/TRUE%20TECH/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const base=process.env.ACCOUNT_MANUAL_URL??"http://localhost:3001";
const browser=await chromium.launch({headless:true,channel:"msedge"});
const errors=[];
const page=await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:1});
page.on("pageerror",error=>errors.push(error.message));

try{
  await page.goto(`${base}/ar/account-guide`);
  await page.getByRole("heading",{name:"طبيعة الحسابات"}).waitFor();
  assert.equal(await page.locator(".manual-categories>button").count(),6);
  assert.equal(await page.locator(".manual-account-list>button").count()>0,true);
  await page.getByRole("textbox",{name:"ابحث في الحسابات"}).fill("1110");
  assert.equal(await page.locator(".manual-account-list>button").count(),1);
  assert.match(await page.locator(".manual-account-list").innerText(),/البنك/);
  await page.getByRole("button",{name:"مسح البحث"}).click();
  await page.getByRole("button",{name:/الالتزامات/}).click();
  await page.getByRole("textbox",{name:"ابحث في الحسابات"}).fill("Accounts payable");
  await page.locator(".manual-account-list>button").first().click();
  assert.match(await page.locator(".manual-detail-page").innerText(),/2100/);
  await page.getByRole("button",{name:"مسح البحث"}).click();
  await page.getByRole("button",{name:/الأصول/}).click();
  await page.locator(".manual-account-list>button").first().click();
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  await page.screenshot({path:"artifacts/account-manual-desktop-ar.png",fullPage:true});

  await page.setViewportSize({width:1366,height:768});
  await page.goto(`${base}/en/account-guide`);
  await page.getByRole("heading",{name:"Nature of Accounts"}).waitFor();
  await page.getByRole("button",{name:/Revenue/}).click();
  await page.getByRole("textbox",{name:"Search accounts"}).fill("4100");
  await page.locator(".manual-account-list>button").first().click();
  assert.match(await page.locator(".manual-detail-page").innerText(),/Sales revenue/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  await page.screenshot({path:"artifacts/account-manual-desktop-en.png",fullPage:true});

  await page.setViewportSize({width:390,height:844});
  await page.goto(`${base}/ar/account-guide`);
  await page.getByRole("heading",{name:"طبيعة الحسابات"}).waitFor();
  assert.equal(await page.locator(".manual-list-page").isVisible(),true);
  assert.equal(await page.locator(".manual-detail-page").isVisible(),false);
  await page.locator(".manual-account-list>button").first().click();
  assert.equal(await page.locator(".manual-list-page").isVisible(),false);
  assert.equal(await page.locator(".manual-detail-page").isVisible(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  await page.screenshot({path:"artifacts/account-manual-mobile-ar.png",fullPage:true});
  await page.getByRole("tab",{name:/الحسابات/}).click();
  assert.equal(await page.locator(".manual-list-page").isVisible(),true);

  await page.goto(`${base}/ar/arena/account-guide`);
  await page.waitForURL(`${base}/ar/account-guide`);
  await page.goto(`${base}/en/academy/account-guide`);
  await page.getByRole("heading",{name:"Nature of Accounts"}).waitFor();

  await page.goto(`${base}/ar`);
  await page.evaluate(()=>localStorage.setItem("manual-return-check",JSON.stringify({document:"supplier-invoice",draft:"unchanged"})));
  await page.goto(`${base}/ar/account-guide`);
  await page.getByRole("button",{name:/العودة للعبة/}).click();
  await page.waitForURL(`${base}/ar`);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem("manual-return-check"))),{document:"supplier-invoice",draft:"unchanged"});
  assert.deepEqual(errors,[]);
  console.log("PASS: account manual desktop AR/EN, 390px, search, categories, selection, compatibility routes, and return context.");
} finally {
  await browser.close();
}
