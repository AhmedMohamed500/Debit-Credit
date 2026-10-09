import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const base=process.env.BASE_URL??'http://127.0.0.1:3115';
const output='artifacts/landing-final';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
const errors=[];
async function inspect(locale,width,height,file){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,colorScheme:'light'});
  page.on('pageerror',error=>errors.push(`${locale} ${width}: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('/_next/hmr'))errors.push(`${locale} ${width}: ${message.text()}`)});
  await page.goto(`${base}/${locale}`,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){window.scrollTo(0,y);await new Promise(resolve=>setTimeout(resolve,25))}});
  await page.waitForTimeout(1200);
  await page.evaluate(()=>window.scrollTo(0,0));
  const facts=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    brokenImages:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.src),
    stages:document.querySelectorAll('.cl4-stage-hotspot').length,
    features:document.querySelectorAll('.cl4-feature-hotspot').length,
    personas:document.querySelectorAll('.cl4-personas article').length,
  }));
  results.push({locale,width,height,...facts});
  if(file)await page.screenshot({path:`${output}/${file}`,fullPage:true});
  return page;
}
const desktop=await inspect('ar',1920,1080,'full-ar-1920.png');
for(const [selector,name] of [['.cl4-hero','01-hero-1920.png'],['.cl4-journey','02-journey-1920.png'],['.cl4-features','03-features-1920.png'],['.cl4-stories','04-stories-final-1920.png'],['.cl4-final','05-final-1920.png']])await desktop.locator(selector).screenshot({path:`${output}/${name}`});
await desktop.close();
for(const [locale,width,height,file] of [
  ['ar',1600,900],['ar',1440,900,'full-ar-1440.png'],['ar',1366,768],
  ['ar',430,932],['ar',390,844,'mobile-ar-390.png'],
  ['en',1920,1080],['en',390,844],
]){const page=await inspect(locale,width,height,file);await page.close()}
await browser.close();
console.log(JSON.stringify({results,errors},null,2));
if(errors.length||results.some(result=>result.overflow!==0||result.brokenImages.length||result.stages!==5||result.features!==3||result.personas!==3))process.exitCode=1;
