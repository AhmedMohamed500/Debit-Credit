import fs from 'node:fs/promises';

const playwrightModule=await import(process.env.PLAYWRIGHT_MODULE);
const {chromium}=playwrightModule.default??playwrightModule;
const base=process.env.BASE_URL??'http://localhost:3107';
const output='artifacts/landing-new-sections';
await fs.mkdir(output,{recursive:true});

const browser=await chromium.launch({headless:true});
const results=[];
const errors=[];

async function waitForImages(page){
  for(let attempt=0;attempt<3;attempt+=1){
    try{
      await page.evaluate(async()=>Promise.all([...document.querySelectorAll('.cl4-how img,.cl4-audience img')].map(image=>image.decode?.().catch(()=>undefined))));
      return;
    }catch(error){
      if(!String(error).includes('Execution context was destroyed')||attempt===2)throw error;
      await page.waitForLoadState('networkidle');
    }
  }
}

async function inspect(locale,width,height,{dark=false,captures=[]}={}){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,colorScheme:dark?'dark':'light'});
  page.on('pageerror',error=>errors.push(`${locale} ${width}: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('/_next/hmr'))errors.push(`${locale} ${width}: ${message.text()}`)});
  await page.goto(`${base}/${locale}`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.cl4-audience-card');
  await page.locator('.cl4-audience').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await waitForImages(page);
  const facts=await page.evaluate(()=>{
    const sections=[...document.querySelectorAll('.cl4-how,.cl4-audience')];
    const readable=[...document.querySelectorAll('.cl4-how-copy p,.cl4-how-copy li,.cl4-audience-rows p')].map(node=>Number.parseFloat(getComputedStyle(node).fontSize));
    return {
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      brokenImages:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.src),
      steps:document.querySelectorAll('.cl4-how-step').length,
      personas:document.querySelectorAll('.cl4-audience-card').length,
      minReadableFont:Math.min(...readable),
      sectionCollisions:sections.some((section,index)=>index>0&&section.getBoundingClientRect().top<sections[index-1].getBoundingClientRect().bottom-1),
    };
  });
  results.push({locale,width,height,dark,...facts});
  for(const [selector,file] of captures)await page.locator(selector).screenshot({path:`${output}/${file}`});
  if(locale==='ar'&&width===390){
    const how=await page.locator('.cl4-how').boundingBox();
    const audience=await page.locator('.cl4-audience').boundingBox();
    await page.screenshot({path:`${output}/new-sections-mobile-ar-390.png`,clip:{x:0,y:how.y,width,height:audience.y+audience.height-how.y}});
  }
  await page.close();
}

await inspect('ar',1920,1080,{captures:[['.cl4-how','how-it-works-ar-1920.png'],['.cl4-audience','personas-ar-1920.png']]});
await inspect('en',1920,1080,{captures:[['.cl4-how','how-it-works-en-1920.png'],['.cl4-audience','personas-en-1920.png']]});
for(const [width,height] of [[1600,900],[1440,900],[1366,768],[430,932],[390,844]])await inspect('ar',width,height);
await inspect('en',390,844);
await inspect('ar',1440,900,{dark:true});

await browser.close();
console.log(JSON.stringify({results,errors},null,2));
if(errors.length||results.some(result=>result.overflow!==0||result.brokenImages.length||result.steps!==4||result.personas!==3||result.minReadableFont<13.5||result.sectionCollisions))process.exitCode=1;
