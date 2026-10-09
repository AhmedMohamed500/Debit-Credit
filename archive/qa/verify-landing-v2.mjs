import fs from 'node:fs/promises';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const base=process.env.BASE_URL??'http://127.0.0.1:3112';
const output='artifacts/landing-v2';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
const results=[];

async function inspect(locale,width,height){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,colorScheme:'light'});
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('/_next/hmr'))errors.push(`${locale} ${width}x${height}: ${message.text()}`)});
  page.on('pageerror',error=>errors.push(`${locale} ${width}x${height}: ${error.message}`));
  await page.goto(`${base}/${locale}`,{waitUntil:'networkidle'});
  await page.locator('.cl4-hero-image').waitFor({state:'visible'});
  await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(resolve=>setTimeout(resolve,25))}window.scrollTo(0,0)});
  await page.locator('.cl4-final img').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.images].every(image=>image.complete),null,{timeout:15000});
  await page.waitForTimeout(250);
  await page.evaluate(()=>window.scrollTo(0,0));
  const facts=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    pageHeight:document.documentElement.scrollHeight,
    dir:document.querySelector('.cl4')?.getAttribute('dir'),
    heroHeight:Math.round(document.querySelector('.cl4-hero')?.getBoundingClientRect().height??0),
    journeyHeight:Math.round(document.querySelector('.cl4-journey')?.getBoundingClientRect().height??0),
    brokenImages:[...document.images].filter(image=>!image.complete||image.naturalWidth===0).map(image=>image.getAttribute('src')),
    navLabels:[...document.querySelectorAll('.marketing-nav nav>a')].map(link=>link.textContent?.trim()),
    stageCount:document.querySelectorAll('.cl4-stage').length,
    featureCount:document.querySelectorAll('.cl4-feature').length,
  }));
  results.push({locale,width,height,...facts});
  return page;
}

const heroPage=await inspect('ar',1920,1080);
await heroPage.locator('.cl4-hero').screenshot({path:`${output}/01-hero-ar-1920.png`});
await heroPage.close();

const arPage=await inspect('ar',1440,900);
await arPage.locator('.cl4-journey').screenshot({path:`${output}/02-career-journey-ar.png`});
await arPage.locator('.cl4-features').screenshot({path:`${output}/03-feature-worlds-ar.png`});
await arPage.locator('.cl4-stories').screenshot({path:`${output}/04-player-journeys-ar.png`});
await arPage.locator('.cl4-final').screenshot({path:`${output}/05-final-cta-ar.png`});
await arPage.screenshot({path:`${output}/landing-full-ar-1440.png`,fullPage:true});
await arPage.close();

const enPage=await inspect('en',1440,900);
await enPage.screenshot({path:`${output}/landing-full-en-1440.png`,fullPage:true});
await enPage.close();

const mobilePage=await inspect('ar',390,844);
await mobilePage.screenshot({path:`${output}/landing-mobile-ar-390.png`,fullPage:true});
await mobilePage.close();

for(const [locale,width,height] of [
  ['en',1920,1080],['ar',1600,900],['en',1600,900],['ar',1366,768],['en',1366,768],['ar',430,932],['en',430,932],['en',390,844],
]){
  const page=await inspect(locale,width,height);
  await page.close();
}

await browser.close();
console.log(JSON.stringify({results,errors},null,2));
const failed=results.some(result=>result.overflow!==0||result.brokenImages.length||result.stageCount!==5||result.featureCount!==3||result.pageHeight>9000||(result.locale==='ar'&&result.dir!=='rtl')||(result.locale==='en'&&result.dir!=='ltr'));
if(errors.length||failed)process.exitCode=1;
