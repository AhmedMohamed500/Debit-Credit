import fs from 'node:fs/promises';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const base=process.env.BASE_URL??'http://127.0.0.1:3116';
const phase=process.env.POLISH_PHASE??'after';
const colorScheme=process.env.POLISH_DARK?'dark':'light';
const root='artifacts/landing-polish';
await fs.mkdir(`${root}/${phase}`,{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
const results=[];

async function capture(locale,width,height,file){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,colorScheme});
  if(colorScheme==='dark')await page.addInitScript(()=>localStorage.setItem('debit-credit-theme-v1','dark'));
  page.on('pageerror',error=>errors.push(`${locale} ${width}: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('/_next/hmr'))errors.push(`${locale} ${width}: ${message.text()}`);
  });
  await page.goto(`${base}/${locale}`,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    for(let y=0;y<document.documentElement.scrollHeight;y+=650){
      window.scrollTo(0,y);
      await new Promise(resolve=>setTimeout(resolve,25));
    }
    window.scrollTo({top:0,behavior:'instant'});
  });
  await page.waitForTimeout(900);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  const metrics=await page.evaluate(()=>{
    const nav=document.querySelector('.marketing-nav');
    const hero=document.querySelector('.cl4-hero');
    const navBox=nav?.getBoundingClientRect();
    const heroBox=hero?.getBoundingClientRect();
    const images=[...document.querySelectorAll('.cl4 img')].map(image=>{
      const box=image.getBoundingClientRect();
      const style=getComputedStyle(image);
      return {src:image.getAttribute('src'),naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,
        renderedWidth:Math.round(box.width),renderedHeight:Math.round(box.height),fit:style.objectFit,position:style.objectPosition,
        filter:style.filter,transform:style.transform,broken:image.complete&&image.naturalWidth===0};
    });
    return {
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      theme:document.documentElement.dataset.theme,
      navHeight:Math.round(navBox?.height??0),heroTop:Math.round(heroBox?.top??0),
      menuVisible:getComputedStyle(document.querySelector('.platform-menu')).display!=='none',
      images,
      stageCount:document.querySelectorAll('.cl4-stage-hotspot').length,
      featureCount:document.querySelectorAll('.cl4-feature-hotspot').length,
      storyCount:document.querySelectorAll('.cl4-personas article').length,
    };
  });
  const anchors={};
  for(const id of ['journey','companies','competition','tools']){
    try{
      if(width<=1100)await page.locator('.platform-menu').click({timeout:2500});
      await page.locator(`.marketing-nav a[href="#${id}"]`).first().click({timeout:2500});
      await page.waitForTimeout(700);
      anchors[id]=await page.locator(`#${id}`).evaluate(el=>Math.round(el.getBoundingClientRect().top));
    }catch(error){
      anchors[id]=`FAILED: ${error.message.slice(0,220)}`;
    }
  }
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:`${root}/${phase}/${file}`,fullPage:true});
  if(phase==='after'&&['full-ar-1440.png','full-en-1440.png','mobile-ar-390.png'].includes(file)){
    await fs.copyFile(`${root}/${phase}/${file}`,`${root}/${file}`);
  }
  results.push({locale,width,height,...metrics,anchors});
  return page;
}

const sizes=[
  ['ar',1920,1080,'full-ar-1920.png'],
  ['ar',1600,900,'full-ar-1600.png'],
  ['ar',1440,900,'full-ar-1440.png'],
  ['ar',1366,768,'full-ar-1366.png'],
  ['ar',1100,800,'full-ar-1100.png'],
  ['ar',1024,768,'full-ar-1024.png'],
  ['ar',430,932,'mobile-ar-430.png'],
  ['ar',390,844,'mobile-ar-390.png'],
  ['en',1440,900,'full-en-1440.png'],
  ['en',390,844,'mobile-en-390.png'],
];
for(const [locale,width,height,file] of (process.env.POLISH_ONLY_MOBILE ? sizes.filter(([,width])=>width===390) : sizes)){
  const page=await capture(locale,width,height,file);
  if(locale==='ar'&&width===1920){
    for(const [selector,name] of [
      ['.cl4-hero','hero-ar-1920.png'],
      ['.cl4-journey','journey-ar-1920.png'],
      ['.cl4-features','features-ar-1920.png'],
      ['.cl4-stories','stories-ar-1920.png'],
      ['.cl4-final','final-cta-ar-1920.png'],
    ]){
      await page.locator(selector).screenshot({path:`${root}/${phase}/${name}`});
      if(phase==='after')await fs.copyFile(`${root}/${phase}/${name}`,`${root}/${name}`);
    }
  }
  await page.close();
}
await browser.close();
await fs.writeFile(`${root}/${phase}/metrics.json`,JSON.stringify({results,errors},null,2));
console.log(JSON.stringify({summary:results.map(({locale,width,height,overflow,navHeight,heroTop,anchors})=>({locale,width,height,overflow,navHeight,heroTop,anchors})),errors},null,2));
if(errors.length||results.some(result=>result.overflow!==0||result.theme!==colorScheme||result.images.some(image=>image.broken)||result.stageCount!==5||result.featureCount!==3||result.storyCount!==3||result.menuVisible!==(result.width<=1100)||Object.values(result.anchors).some(top=>typeof top!=='number'||top<result.navHeight)))process.exitCode=1;
