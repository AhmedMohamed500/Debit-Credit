import fs from 'node:fs/promises';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
await fs.mkdir('artifacts/career-league',{recursive:true});

const cases=[
  {locale:'ar',theme:'light',width:1920,height:1080,file:'landing-competition-ar-1920.png'},
  {locale:'en',theme:'light',width:1920,height:1080,file:'landing-competition-en-1920.png'},
  {locale:'ar',theme:'light',width:390,height:844,file:'landing-competition-mobile-ar-390.png'},
  {locale:'ar',theme:'dark',width:1440,height:900,file:'landing-competition-ar-dark-1440.png'},
  {locale:'en',theme:'dark',width:430,height:932,file:'landing-competition-mobile-en-dark-430.png'},
];
const browser=await chromium.launch({headless:true});
const results=[];
const errors=[];

for(const item of cases){
  const page=await browser.newPage({viewport:{width:item.width,height:item.height},colorScheme:item.theme});
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('/_next/hmr'))errors.push(`${item.locale}-${item.width}: ${message.text()}`)});
  page.on('pageerror',error=>errors.push(`${item.locale}-${item.width}: ${error.message}`));
  await page.goto(`http://127.0.0.1:3109/${item.locale}?theme=${item.theme}`,{waitUntil:'networkidle'});
  const section=page.locator('#competition');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const image=section.locator('img');
  const imageState=await image.evaluate(element=>({complete:element.complete,naturalWidth:element.naturalWidth,naturalHeight:element.naturalHeight}));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  const direction=await page.locator('.dc-shell').getAttribute('dir');
  const supportPoints=await section.locator('.league-support-points article').count();
  const demoLabel=await section.locator('.league-preview-label').innerText();
  const figureCaption=await section.locator('figcaption').innerText();
  const sectionBox=await section.evaluate(element=>{const box=element.getBoundingClientRect();return{width:box.width}});
  const imageBox=await image.evaluate(element=>{const box=element.getBoundingClientRect();return{x:box.x,y:box.y,width:box.width,height:box.height}});
  const headingBox=await section.locator('h2').evaluate(element=>{const box=element.getBoundingClientRect();return{y:box.y}});
  const ctaBox=await section.locator('.league-competition-copy>a').evaluate(element=>{const box=element.getBoundingClientRect();return{y:box.y}});
  const href=await section.locator('.league-competition-copy>a').getAttribute('href');
  await section.screenshot({path:`artifacts/career-league/${item.file}`});
  results.push({...item,overflow,direction,imageState,supportPoints,demoLabel,figureCaption,href,imageShare:Number((imageBox.width/sectionBox.width).toFixed(2)),mobileOrder:item.width>720||headingBox.y<ctaBox.y&&ctaBox.y<imageBox.y});
  await page.close();
}

await browser.close();
console.log(JSON.stringify({results,errors},null,2));
const invalid=results.some(result=>result.overflow!==0||!result.imageState.complete||result.imageState.naturalWidth<390||Math.abs(result.imageState.naturalWidth/result.imageState.naturalHeight-1.5)>.02||result.supportPoints!==4||result.direction!==(result.locale==='ar'?'rtl':'ltr')||!result.href?.endsWith(`/${result.locale}/leaderboard`)||!result.mobileOrder||(result.width>1150&&result.imageShare<.55));
if(errors.length||invalid)process.exitCode=1;
