import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
const errors=[];
const page=await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:1});
page.on('pageerror',error=>errors.push(error.message));
const base=process.env.FIRST_SHIFT_URL??'http://localhost:3000';
const enter=async locale=>{
 await page.goto(`${base}/${locale}`);
 await page.getByRole('button',{name:locale==='ar'?'ابدأ القصة':'START STORY',exact:true}).click();
 await page.getByRole('button',{name:locale==='ar'?/ادخل الشركة/:/ENTER COMPANY/}).click();
 await page.getByRole('button',{name:locale==='ar'?/ورّيني المكتب/:/SHOW ME THE DESK/}).click();
 await page.locator('.scene-paper').first().waitFor();
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(300);
};
try{
 await enter('ar');
 await page.screenshot({path:'artifacts/first-shift-scene-desktop-ar.png'});
 await page.getByRole('button',{name:/فاتورة مورد.*افتح المستند/}).click();
 await page.screenshot({path:'artifacts/first-shift-scene-document-ar.png'});
 await page.keyboard.press('Shift+Tab');
 assert.equal(await page.evaluate(()=>!!document.activeElement.closest('[role="dialog"]')),true);
 await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'artifacts/first-shift-scene-mobile-ar.png',fullPage:true});
 assert.equal(await page.locator('.scene-paper:visible').count(),1);
 await page.getByRole('button',{name:'المستند التالي',exact:true}).click();
 assert.equal(await page.locator('.scene-paper:visible').getAttribute('data-document'),'customer-receipt');
 await page.locator('.scene-paper:visible').evaluate(node=>{node.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:node,clientX:100})]}));node.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:node,clientX:220})]}));});
 assert.equal(await page.locator('.scene-paper:visible').getAttribute('data-document'),'office-expense');
 await page.getByRole('button',{name:/مصروف مكتب.*افتح المستند/}).click();
 assert.equal(await page.getByRole('dialog').isVisible(),true);
 const mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.equal(mobileOverflow,0);
 await page.screenshot({path:'artifacts/first-shift-scene-mobile-document-ar.png',fullPage:true});
 await page.keyboard.press('Escape');
 await page.evaluate(()=>localStorage.clear());
 await page.setViewportSize({width:1366,height:768});
 await enter('en');
 await page.screenshot({path:'artifacts/first-shift-scene-desktop-en.png'});
 for(const [index,doc] of [
  ['Supplier Invoice','Office equipment','Accounts payable','100000'],
  ['Customer Receipt','Bank','Accounts receivable','75000'],
  ['Office Expense','Office supplies expense','Cash','2500']
 ].entries()){
  await page.getByRole('button',{name:new RegExp(doc[0]+'.*Open document')}).click();
  await page.getByRole('button',{name:'Record transaction',exact:true}).click();
  if(index===0){await page.getByRole('button',{name:'Submit entry',exact:true}).click();assert.equal(await page.getByRole('dialog').getByRole('alert').isVisible(),true);}
  await page.locator('.fd-account-tokens button').filter({hasText:doc[1]}).click();
  await page.getByRole('button',{name:'DEBIT',exact:true}).click();
  await page.getByRole('spinbutton',{name:'Amount line 1'}).fill(doc[3]);
  await page.getByRole('button',{name:'Add second line'}).click();
  await page.locator('.fd-account-tokens button').filter({hasText:doc[2]}).click();
  await page.getByRole('button',{name:'CREDIT',exact:true}).nth(1).click();
  await page.getByRole('spinbutton',{name:'Amount line 2'}).fill(doc[3]);
  await page.getByRole('button',{name:'Submit entry',exact:true}).click();
  await page.getByRole('heading',{name:doc[0]+' recorded successfully'}).waitFor();
  await page.getByRole('button',{name:'Return to Desk',exact:true}).click();
  assert.equal(await page.locator('.scene-processed>b').textContent(),String(index+1));
  if(index===0){await page.waitForTimeout(1400);await page.screenshot({path:'artifacts/first-shift-scene-processed-en.png'});await page.reload();await page.locator('.scene-paper').first().waitFor();assert.equal(await page.locator('.scene-paper').count(),2);}
  if(index===2)await page.getByRole('heading',{name:'The books are balanced.'}).waitFor();
 }
 await page.getByRole('button',{name:/CONTINUE STORY/}).click();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('debit-credit-world-v2')));
 assert.equal(state.xp,300);assert.equal(state.coins,150);assert.equal(state.journal.length,3);
 assert.equal(await page.locator('.scene-paper').count(),0);
 await page.reload();await page.locator('.scene-next').waitFor();
 assert.equal(await page.locator('.scene-processed>b').textContent(),'3');
 const desktopOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.equal(desktopOverflow,0);assert.deepEqual(errors,[]);
 await writeFile('artifacts/first-shift-scene-qa.json',JSON.stringify({base,mobileOverflow,desktopOverflow,tests:['Arabic desktop and open document','Arabic mobile 390px, next/previous and swipe','Modal focus remains inside and Escape closes','English desktop 1366px','Wrong answer then correction','Three documents completed through UI','Processed tray 0 → 1 → 2 → 3','Reload persistence after first and final entry','Final 300 XP / 150 coins / 3 journal entries'],pageErrors:errors},null,2));
 console.log('PASS: both locales, mobile, all entries, tray, persistence, focus and rewards.');
}finally{await browser.close();}

