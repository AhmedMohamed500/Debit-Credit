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
      await page.evaluate(async()=>Promise.race([Promise.all([...document.querySelectorAll('.cl4-how img,.cl4-audience img')].map(image=>image.decode?.().catch(()=>undefined))),new Promise(resolve=>setTimeout(resolve,8000))]));
      return;
    }catch(error){
      if(!String(error).includes('Execution context was destroyed')||attempt===2)throw error;
      await page.waitForLoadState('networkidle');
    }
  }
}

async function inspect(locale,width,height,{dark=false,captures=[]}={}){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,colorScheme:dark?'dark':'light'});
  page.setDefaultTimeout(12000);
  if(dark)await page.addInitScript(()=>localStorage.setItem('debit-credit-theme-v1','dark'));
  page.on('pageerror',error=>errors.push(`${locale} ${width}: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('/_next/hmr'))errors.push(`${locale} ${width}: ${message.text()}`)});
  page.on('response',response=>{if(response.status()>=400)errors.push(`${locale} ${width}: HTTP ${response.status()} ${response.url()}`)});
  await page.goto(`${base}/${locale}`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.cl4-audience-card');
  await page.locator('.cl4-audience').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await waitForImages(page);
  const facts=await page.evaluate(()=>{
    const sections=[...document.querySelectorAll('.cl4-how,.cl4-audience')];
    const readable=[...document.querySelectorAll('.cl4-how-copy p,.cl4-how-copy li,.cl4-how-mock span,.cl4-audience-rows p')].map(node=>Number.parseFloat(getComputedStyle(node).fontSize));
    const headings=[...document.querySelectorAll('.cl4-how h2,.cl4-audience h2,.cl4-how h3,.cl4-audience h3')];
    const images=[...document.querySelectorAll('.cl4-hero img,.cl4-how img,.cl4-audience img,.cl4-journey img,.cl4-features img')];
    const nav=document.querySelector('.marketing-nav nav');
    const brand=document.querySelector('.marketing-nav .platform-brand');
    const navBox=nav.getBoundingClientRect(),brandBox=brand.getBoundingClientRect();
    return {
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      brokenImages:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.src),
      steps:document.querySelectorAll('.cl4-how-step').length,
      personas:document.querySelectorAll('.cl4-audience-card').length,
      minReadableFont:Math.min(...readable),
      sectionCollisions:sections.some((section,index)=>index>0&&section.getBoundingClientRect().top<sections[index-1].getBoundingClientRect().bottom-1),
      clippedHeadings:headings.filter(heading=>heading.scrollWidth>heading.clientWidth+2).map(heading=>heading.textContent),
      upscaledSupportingImages:images.filter(image=>image.getBoundingClientRect().width>image.naturalWidth*1.05).map(image=>({src:image.getAttribute('src'),natural:image.naturalWidth,rendered:Math.round(image.getBoundingClientRect().width)})),
      narrowSteps:[...document.querySelectorAll('.cl4-how-step')].filter(step=>step.getBoundingClientRect().width<270).map(step=>Math.round(step.getBoundingClientRect().width)),
      direction:document.querySelector('.cl4')?.getAttribute('dir'),
      theme:document.documentElement.dataset.theme,
      navOverlap:getComputedStyle(nav).display!=='none' && (document.querySelector('.cl4').getAttribute('dir')==='rtl' ? navBox.right>brandBox.left-8 : navBox.left<brandBox.right+8),
    };
  });
  results.push({locale,width,height,dark,...facts});
  if(locale==='ar'&&!dark&&(width===1920||width===390)){
    for(const id of ['how','journey','companies','competition','tools']){
      if(width<=1100)await page.locator('.platform-menu').click();
      await page.locator(`.marketing-nav a[href="#${id}"]`).click();
      await page.waitForTimeout(850);
      const top=await page.locator(`#${id}`).evaluate(element=>Math.round(element.getBoundingClientRect().top));
      if(top<0||top>height)errors.push(`Arabic ${width}: #${id} landed outside the visible viewport (${top}px)`);
    }
  }
  for(const [selector,file] of captures)await page.locator(selector).screenshot({path:`${output}/${file}`});
  if(locale==='ar'&&width===1440&&!dark)await page.screenshot({path:`${output}/full-ar-1440.png`,fullPage:true});
  if(locale==='ar'&&width===390&&!dark){
    await page.screenshot({path:`${output}/new-sections-mobile-ar-390.png`,fullPage:true});
    await page.locator('.cl4-hero').screenshot({path:`${output}/hero-mobile-ar-390.png`});
    await page.locator('.cl4-how').screenshot({path:`${output}/how-it-works-mobile-ar-390.png`});
    await page.locator('.cl4-audience').screenshot({path:`${output}/audience-mobile-ar-390.png`});
    await page.locator('.cl4-journey').screenshot({path:`${output}/journey-mobile-ar-390.png`});
    await page.locator('.cl4-features').screenshot({path:`${output}/features-mobile-ar-390.png`});
    await page.locator('.cl4-final').screenshot({path:`${output}/final-mobile-ar-390.png`});
  }
  if(locale==='en'&&width===390&&!dark){
    await page.locator('.cl4-how').screenshot({path:`${output}/how-it-works-mobile-en-390.png`});
    await page.locator('.cl4-audience').screenshot({path:`${output}/audience-mobile-en-390.png`});
  }
  await page.close();
}

if(process.env.NAV_ONLY){
  await inspect('ar',1101,800);
  await inspect('ar',1100,800);
}else{
await inspect('ar',1920,1080,{captures:[['.cl4-hero','hero-ar-1920.png'],['.cl4-how','how-it-works-ar-1920.png'],['.cl4-audience','personas-ar-1920.png'],['.cl4-journey','journey-ar-1920.png'],['.cl4-features','features-ar-1920.png'],['.cl4-final','final-ar-1920.png']]});
await inspect('en',1920,1080,{captures:[['.cl4-how','how-it-works-en-1920.png'],['.cl4-audience','personas-en-1920.png']]});
for(const [width,height] of [[1600,900],[1440,900],[1366,768],[430,932],[390,844]])await inspect('ar',width,height);
await inspect('en',390,844);
await inspect('ar',1440,900,{dark:true,captures:[['.cl4-journey','journey-dark-ar-1440.png'],['.cl4-features','features-dark-ar-1440.png']]});
await inspect('ar',390,844,{dark:true,captures:[['.cl4-how','how-it-works-mobile-dark-ar-390.png'],['.cl4-audience','audience-mobile-dark-ar-390.png'],['.cl4-journey','journey-mobile-dark-ar-390.png'],['.cl4-features','features-mobile-dark-ar-390.png']]});
await inspect('en',1440,900,{dark:true});
await inspect('en',390,844,{dark:true});
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await reduced.goto(`${base}/ar`,{waitUntil:'domcontentloaded'});
const transition=await reduced.locator('.cl4-how-step').first().evaluate(element=>getComputedStyle(element).transitionDuration);
if(transition!=='0s')errors.push(`Reduced motion still animates step cards: ${transition}`);
await reduced.close();
}

await browser.close();
console.log(JSON.stringify({results,errors},null,2));
if(errors.length||results.some(result=>result.overflow!==0||result.brokenImages.length||result.steps!==4||result.personas!==3||result.minReadableFont<14||result.sectionCollisions||result.clippedHeadings.length||result.narrowSteps.length||result.upscaledSupportingImages.length||result.navOverlap||result.direction!==(result.locale==='ar'?'rtl':'ltr')||result.theme!==(result.dark?'dark':'light')))process.exitCode=1;
