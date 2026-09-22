import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??"playwright");

const base=process.env.ACCOUNT_MANUAL_URL??"http://localhost:3001";
const browser=await chromium.launch({headless:true,channel:"msedge"});
const errors=[];
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
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
  const book=await page.locator(".manual-book").boundingBox();
  const entry=await page.locator(".manual-entry").boundingBox();
  assert.ok(book.y<370,"The book starts directly under the categories.");
  assert.ok(entry.y+entry.height<book.y+book.height,"The complete example stays inside the detail page.");
  assert.ok(await page.locator(".manual-account-list").evaluate(n=>n.scrollHeight>n.clientHeight),"The long list scrolls within its paper page.");
  await page.screenshot({path:"artifacts/account-manual-desktop-ar.png"});

  for(const [width,height,name] of [[1850,850,"account-manual-laptop-ar.png"],[1366,768,"account-manual-laptop-compact-ar.png"]]){
    await page.setViewportSize({width,height});
    await page.goto(`${base}/ar/account-guide`);
    await page.getByRole("button",{name:/الإيرادات/}).click();
    await page.locator(".manual-account-list>button").filter({hasText:"4120"}).click();
    const topbar=await page.locator(".manual-topbar").boundingBox();
    const compactBook=await page.locator(".manual-book").boundingBox();
    assert.ok(topbar&&topbar.y===0,`Top navigation is visible at ${width}x${height}.`);
    assert.ok(compactBook&&compactBook.y<height,`The book begins in the first viewport at ${width}x${height}.`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
    await page.locator(".manual-detail-page").evaluate(node=>node.scrollTo({top:node.scrollHeight}));
    assert.ok(await page.getByText("مثال على القيد المحاسبي",{exact:true}).isVisible(),"The journal example remains reachable inside the detail page.");
    await page.screenshot({path:`artifacts/${name}`});
  }

  await page.setViewportSize({width:768,height:900});
  await page.goto(`${base}/ar/account-guide`);
  assert.equal(await page.locator(".manual-list-page").isVisible(),true);
  assert.equal(await page.locator(".manual-detail-page").isVisible(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  await page.locator(".manual-account-list>button").first().click();
  assert.equal(await page.locator(".manual-list-page").isVisible(),false);
  assert.equal(await page.locator(".manual-detail-page").isVisible(),true);
  await page.screenshot({path:"artifacts/account-manual-tablet-ar.png",fullPage:true});

  await page.setViewportSize({width:1920,height:1080});
  await page.goto(`${base}/en/account-guide`);
  await page.getByRole("heading",{name:"Nature of Accounts"}).waitFor();
  await page.getByRole("button",{name:/Revenue/}).click();
  await page.getByRole("textbox",{name:"Search accounts"}).fill("4100");
  await page.locator(".manual-account-list>button").first().click();
  assert.match(await page.locator(".manual-detail-page").innerText(),/Sales revenue/);
  await page.getByRole("button",{name:"Clear search"}).click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  await page.screenshot({path:"artifacts/account-manual-desktop-en.png"});

  await page.setViewportSize({width:390,height:844});
  await page.goto(`${base}/ar/account-guide`);
  await page.getByRole("heading",{name:"طبيعة الحسابات"}).waitFor();
  assert.equal(await page.locator(".manual-list-page").isVisible(),true);
  assert.equal(await page.locator(".manual-detail-page").isVisible(),false);
  await page.screenshot({path:"artifacts/account-manual-mobile-list-ar.png",fullPage:true});
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

  await page.setViewportSize({width:1920,height:1080});
  await page.goto(`${base}/en`);
  await page.getByRole("link",{name:"Nature of Accounts",exact:true}).waitFor();
  await page.getByRole("button",{name:"START STORY",exact:true}).click();
  await page.getByRole("button",{name:/ENTER COMPANY/}).click();
  await page.getByRole("button",{name:/SHOW ME THE DESK/}).click();
  await page.locator(".scene-paper").first().waitFor();
  assert.equal(await page.locator(".scene-hud .scene-manual-link").isVisible(),true);
  await page.screenshot({path:"artifacts/account-manual-game-access.png"});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator(".scene-mobile-tools").getByRole("link",{name:"Accounts guide"}).isVisible(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  await page.screenshot({path:"artifacts/account-manual-game-mobile.png"});
  await page.setViewportSize({width:1920,height:1080});
  await page.locator(".scene-paper").first().click();
  await page.getByRole("button",{name:"Purchase Order PO-771"}).click();
  await page.getByRole("button",{name:"Goods Receipt GRN-771"}).click();
  await page.getByRole("button",{name:"Choose case action",exact:true}).click();
  await page.getByRole("button",{name:/Post the liability/}).click();
  await page.locator(".fd-account-tokens button").filter({hasText:"Office equipment"}).click();
  await page.getByRole("button",{name:"DEBIT",exact:true}).click();
  await page.getByRole("spinbutton",{name:"Amount line 1"}).fill("12345");
  const gameBefore=await page.evaluate(()=>localStorage.getItem("debit-credit-world-v2"));
  const popupPromise=page.waitForEvent("popup");
  await page.locator(".fd-workbench-manual").click();
  const manual=await popupPromise;
  await manual.getByRole("heading",{name:"Nature of Accounts"}).waitFor();
  assert.match(manual.url(),/return=first-day&document=supplier-invoice/);
  await manual.getByRole("link",{name:"Switch to Arabic"}).click();
  await manual.getByRole("heading",{name:"طبيعة الحسابات"}).waitFor();
  assert.match(manual.url(),/return=first-day&document=supplier-invoice/);
  const closing=manual.waitForEvent("close");
  await manual.getByRole("button",{name:"العودة للعبة"}).click();
  await closing;
  assert.equal(await page.getByRole("spinbutton",{name:"Amount line 1"}).inputValue(),"12345");
  assert.equal(await page.evaluate(()=>localStorage.getItem("debit-credit-world-v2")),gameBefore);
  const download=await page.request.get(`${base}/docs/nature-of-accounts.md`);
  assert.equal(download.status(),200);
  assert.match(download.headers()["content-disposition"],/attachment/);
  const markdown=await download.text();
  assert.equal((markdown.match(/^### /gm)??[]).length,197);
  await writeFile("NATURE-OF-ACCOUNTS.md",markdown,"utf8");
  assert.deepEqual(errors,[]);
  console.log("PASS: account manual desktop AR/EN, 390px, search, categories, selection, compatibility routes, and return context.");
} finally {
  await browser.close();
}
