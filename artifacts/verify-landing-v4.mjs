import fs from 'node:fs/promises';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const base=process.env.BASE_URL??'http://127.0.0.1:3109';
await fs.mkdir('artifacts/landing',{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[],results=[];

for(const item of [
  {locale:'ar',theme:'light',width:1920,height:1080,file:'landing-home-ar-1920.png',heading:'منافسة حقيقية من أي مكان!'},
  {locale:'en',theme:'light',width:1920,height:1080,file:'landing-home-en-1920.png',heading:'Real competition. From anywhere.'},
  {locale:'ar',theme:'light',width:390,height:844,file:'landing-home-ar-mobile-390.png',heading:'منافسة حقيقية من أي مكان!'},
  {locale:'en',theme:'dark',width:1440,height:900,heading:'Real competition. From anywhere.'},
]){
  const page=await browser.newPage({viewport:{width:item.width,height:item.height},deviceScaleFactor:1,colorScheme:item.theme});
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('/_next/hmr'))errors.push(`${item.locale}: ${message.text()}`)});
  page.on('pageerror',error=>errors.push(`${item.locale}: ${error.message}`));
  await page.goto(`${base}/${item.locale}?theme=${item.theme}`,{waitUntil:'networkidle'});
  await page.waitForTimeout(250);
  const heading=await page.locator('h1').innerText();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  const dir=await page.locator('.cl4').getAttribute('dir');
  const heroLoaded=await page.locator('.cl4-hero-image').evaluate(image=>image.complete&&image.naturalWidth>0);
  const anchors=await page.locator('.marketing-nav a').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
  if(item.file)await page.screenshot({path:`artifacts/landing/${item.file}`,fullPage:true});
  results.push({...item,headingMatches:heading===item.heading,overflow,dir,heroLoaded,anchors});
  await page.close();
}

await browser.close();
console.log(JSON.stringify({results,errors},null,2));
if(errors.length||results.some(result=>!result.headingMatches||!result.heroLoaded||result.overflow!==0||(result.locale==='ar'&&result.dir!=='rtl')||(result.locale==='en'&&result.dir!=='ltr')))process.exitCode=1;
