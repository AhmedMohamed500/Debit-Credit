const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({headless:true});
const result=[];
for(const spec of [
 {locale:'ar',theme:'dark',width:1920,height:1080,file:'beginner-game-home-ar-dark-1920.png'},
 {locale:'en',theme:'dark',width:1920,height:1080,file:'beginner-game-home-en-dark-1920.png'},
 {locale:'ar',theme:'light',width:1440,height:900,file:'beginner-game-home-ar-light-1440.png'},
 {locale:'ar',theme:'dark',width:390,height:844,file:'beginner-game-home-mobile-ar-390.png'},
]){
 const page=await browser.newPage({viewport:{width:spec.width,height:spec.height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>localStorage.setItem('debit-credit-career-league-v1',JSON.stringify({version:1,persona:'student',workEnvironment:null,goal:'first-job',placementPath:'start-basics',placementScore:null,placementRecommendation:1,targetOpportunityId:null,acceptedOfferId:null,onboardingComplete:true,assessmentResults:{},updatedAt:new Date(0).toISOString()})));
 await page.goto(`http://localhost:3109/${spec.locale}/game?theme=${spec.theme}`,{waitUntil:'networkidle'});
 await page.locator('.beginner-world').waitFor();
 await page.screenshot({path:`artifacts/career-league/${spec.file}`,fullPage:true});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 result.push({...spec,overflow,errors,companyButtons:await page.locator('.bcw-company').count(),roadmapNodes:await page.locator('.bcw-roadmap-node').count(),theme:await page.evaluate(()=>document.documentElement.dataset.theme)});
 await page.close();
}
console.log(JSON.stringify(result,null,2));await browser.close();
