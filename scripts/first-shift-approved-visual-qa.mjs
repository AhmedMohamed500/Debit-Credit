import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';

const base=process.env.FIRST_SHIFT_QA_BASE??'http://localhost:3117';
const output=path.resolve('artifacts/first-shift-approved-qa');
const checks=[],errors=[],guestUnauthorized=[];
const viewports=[{width:1920,height:1080},{width:1440,height:900},{width:1024,height:900},{width:390,height:844}];
function record(label,valid){checks.push({label,valid});if(!valid)throw new Error(label);console.log('PASS',label)}
async function settled(page){
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(image=>image.getClientRects().length>0).map(image=>image.complete?Promise.resolve():new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});setTimeout(resolve,3000)})))});
}
async function fit(page,label){record(label+' no page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}

await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-background-networking','--no-first-run']});
try{
  for(const locale of ['ar','en'])for(const viewport of viewports){
    const label=`${locale}-${viewport.width}`;
    const context=await browser.newContext({viewport});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(`${label}: ${error.message}`));
    page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('401 (Unauthorized)'))errors.push(`${label}: ${message.text()}`)});
    page.on('response',response=>{if(response.status()===401)guestUnauthorized.push(response.url())});
    await page.goto(`${base}/${locale}/game/first-shift`);
    await page.locator('.shift-briefing,.fsh-shell').first().waitFor();
    if(await page.locator('.shift-briefing').count()){
      record(label+' briefing uses approved office',await page.locator('.shift-briefing-heading').evaluate(node=>getComputedStyle(node).backgroundImage.includes('first-shift-approved-office')));
      await fit(page,label+' briefing');
      await page.getByRole('button',{name:/Open my desk|افتح مكتبي/}).click();
    }
    await page.locator('.fsh-shell').waitFor();
    record(label+' 5 authentic stages',await page.locator('.fsh-portal').count()===5);
    record(label+' pending case is supplier invoice',(await page.locator('.fsh-source-card').innerText()).includes('INV-1048'));
    record(label+' no unrelated journey overlay',await page.locator('.student-journey-bar').count()===0);
    await settled(page);await fit(page,label+' office');
    await page.screenshot({path:path.join(output,`${label}-office.png`),fullPage:true});
    await page.locator('.fsh-portal[data-status="active"]').first().click();
    await page.locator('.acw-workspace').waitFor();
    record(label+' real case document',(await page.locator('.acw-document-panel').innerText()).includes('INV-1048'));
    record(label+' case amount is canonical',(await page.locator('.acw-document-panel').innerText()).includes('100,000')||(await page.locator('.acw-document-panel').innerText()).includes('١٠٠٬٠٠٠'));
    record(label+' no unrelated document date',!(await page.locator('.acw-document-panel').innerText()).includes('2026/10/14'));
    await settled(page);await fit(page,label+' workbench');
    await page.screenshot({path:path.join(output,`${label}-workbench.png`),fullPage:true});
    await page.locator('.acw-exit').click();
    record(label+' closing draft returns to same office',await page.locator('.fsh-shell').count()===1);
    await context.close();
  }
  // Chromium formats an expected guest 401 as either "401 (Unauthorized)" or
  // "401 ()". Do not treat private-account API denial as a page defect; the
  // separate response assertion below still rejects 401s from other routes.
  const unexpectedErrors=errors.filter(message=>!message.includes('Failed to load resource: the server responded with a status of 401'));
  record('no browser page or unexpected console errors',unexpectedErrors.length===0);
  record('anonymous 401 responses are private-account APIs only',guestUnauthorized.every(url=>new URL(url).pathname.startsWith('/api/v1/me')));
}finally{
  await browser.close();
  await writeFile(path.join(output,'results.json'),JSON.stringify({base,checks,errors,guestUnauthorized},null,2));
}
