import fs from 'node:fs/promises';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const base=process.env.BASE_URL??'http://127.0.0.1:3115';
const output='artifacts/landing-v5';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
const results=[];

async function inspect(locale,width,height,file){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,colorScheme:'light'});
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('/_next/hmr'))errors.push(`${locale} ${width}x${height}: ${message.text()}`)});
  page.on('pageerror',error=>errors.push(`${locale} ${width}x${height}: ${error.message}`));
  await page.goto(`${base}/${locale}`,{waitUntil:'networkidle'});
  await page.locator('.cl4-hero-image').waitFor({state:'visible'});
  await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(resolve=>setTimeout(resolve,30))}});
  await page.waitForFunction(()=>[...document.images].every(image=>image.complete),null,{timeout:15000});
  await page.waitForTimeout(250);
  await page.evaluate(()=>window.scrollTo(0,0));
  const facts=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    pageHeight:document.documentElement.scrollHeight,
    dir:document.querySelector('.cl4')?.getAttribute('dir'),
    brokenImages:[...document.images].filter(image=>!image.complete||image.naturalWidth===0).map(image=>image.getAttribute('src')),
    stageCount:document.querySelectorAll('.cl4-stage').length,
    featureCount:document.querySelectorAll('.cl4-feature').length,
    storyCount:document.querySelectorAll('.cl4-story-grid>article').length,
    clipped:[...document.querySelectorAll('.cl4 h1,.cl4 h2,.cl4 h3,.cl4 a,.cl4-stage-plaque')].filter(node=>{const style=getComputedStyle(node);const clips=style.overflow==='hidden'||style.overflow==='clip'||style.overflowX==='hidden'||style.overflowY==='hidden';return clips&&(node.scrollWidth>node.clientWidth+2||node.scrollHeight>node.clientHeight+2)}).map(node=>`${node.tagName}.${node.className}`).slice(0,20),
  }));
  results.push({locale,width,height,...facts});
  if(file)await page.screenshot({path:`${output}/${file}`,fullPage:true});
  return page;
}

const sectionPage=await inspect('ar',1920,1080,'landing-full-ar-1920.png');
await sectionPage.locator('.cl4-hero').screenshot({path:`${output}/hero-reference-match-ar-1920.png`});
await sectionPage.locator('.cl4-journey').screenshot({path:`${output}/journey-reference-match-ar-1920.png`});
await sectionPage.locator('.cl4-features').screenshot({path:`${output}/features-reference-match-ar-1920.png`});
await sectionPage.locator('.cl4-stories').screenshot({path:`${output}/stories-reference-match-ar-1920.png`});
await sectionPage.locator('.cl4-final').screenshot({path:`${output}/final-cta-reference-match-ar-1920.png`});
await sectionPage.close();

for(const item of [
  ['en',1920,1080,'landing-full-en-1920.png'],
  ['ar',1600,900],['en',1600,900],
  ['ar',1440,900,'landing-ar-1440.png'],['en',1440,900],
  ['ar',1366,768,'landing-ar-1366.png'],['en',1366,768],
  ['ar',430,932],['en',430,932],
  ['ar',390,844,'landing-ar-mobile-390.png'],['en',390,844],
]){
  const page=await inspect(...item);
  await page.close();
}

await browser.close();
console.log(JSON.stringify({results,errors},null,2));
const failed=errors.length||results.some(result=>result.overflow!==0||result.brokenImages.length||result.stageCount!==5||result.featureCount!==3||result.storyCount!==3||(result.locale==='ar'&&result.dir!=='rtl')||(result.locale==='en'&&result.dir!=='ltr'));
if(failed)process.exitCode=1;
