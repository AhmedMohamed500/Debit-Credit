const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({headless:true});
const specs=[
 {locale:'ar',theme:'dark',width:1920,height:1080,file:'account-city-ar-dark-1920.png'},
 {locale:'en',theme:'dark',width:1920,height:1080,file:'account-city-en-dark-1920.png'},
 {locale:'ar',theme:'light',width:1440,height:900,file:'account-city-ar-light-1440.png'},
 {locale:'ar',theme:'dark',width:390,height:844,file:'account-city-mobile-ar-390.png'},
 {locale:'ar',theme:'dark',width:430,height:932,file:'account-city-mobile-ar-430.png'},
];
const result=[];
for(const spec of specs){
 const page=await browser.newPage({viewport:{width:spec.width,height:spec.height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`http://localhost:3109/${spec.locale}/account-guide?theme=${spec.theme}`,{waitUntil:'networkidle'});
 await page.locator('.account-city').waitFor();
 await page.screenshot({path:`artifacts/account-city/${spec.file}`,fullPage:true});
 result.push({...spec,overflow:await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),districts:await page.locator('.ac-district').count(),mentorImage:await page.locator('.ac-kareem img').evaluate(img=>({loaded:img.complete&&img.naturalWidth>0,width:img.getBoundingClientRect().width})),errors});
 if(spec.locale==='ar'&&spec.width===1920){
  await page.getByRole('button',{name:/حي الأصول · 62 حساب/}).click();
  await page.screenshot({path:'artifacts/account-city/assets-district-ar.png',fullPage:true});
  await page.locator('.ac-building').filter({hasText:'الصندوق'}).click();
  await page.screenshot({path:'artifacts/account-city/cash-account-inspector-ar.png',fullPage:true});
  for(let step=0;step<6;step++)await page.getByRole('button',{name:/كمّل الاستكشاف/}).click();
  await page.getByRole('button',{name:/العب المهمة الصغيرة/}).click();
  await page.screenshot({path:'artifacts/account-city/cash-mini-mission-ar.png',fullPage:true});
 }
 await page.close();
}
console.log(JSON.stringify(result,null,2));
await browser.close();
if(result.some(item=>item.overflow!==0||item.errors.length||item.districts!==6||!item.mentorImage.loaded))process.exitCode=1;
