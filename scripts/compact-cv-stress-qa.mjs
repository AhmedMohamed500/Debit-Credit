// Render max-sized synthetic profile/course data only inside the localhost QA
// browser. No real account data changes and no production interception.
import path from "node:path";
import { tsImport } from "tsx/esm/api";
export async function compactCvStressQa({page,base,locale,label,record,screenshot,output}) {
  if(!base.startsWith("http://localhost:")) throw new Error("Local fixtures only");
  const {compactCv} = await tsImport("../lib/career/compact-cv.ts",import.meta.url);
  const pattern="**/api/v1/me/cv?*";
  await page.route(pattern,async route=>{
    const response=await route.fetch(),result=await response.json(),data=result.data;
    const profile={...data.profile,headline:"Accounting Candidate - Financial Reporting and General Ledger",summary:"Accounting training and actual experience supporting source-document controls, accurate journal entries and financial reporting. ".repeat(8),experience:Array.from({length:8},(_,i)=>({id:`stress-job-${i}`,title:"Accounting Assistant in a Real Internship",company:"Synthetic Fixture Company for Two-Page Layout Verification",startDate:"2026-01",endDate:"2026-09",current:false,description:"Reviewed accounting source documents and supported bookkeeping, journal entries and accounts payable records during an actual internship. ".repeat(15)})),education:Array.from({length:5},(_,i)=>({id:`stress-education-${i}`,institution:"Synthetic Fixture University of Commerce and Business Administration",degree:"Bachelor of Commerce",field:"Accounting and Financial Reporting",graduationYear:"2028"}))};
    const portfolio={revision:1,courses:Array.from({length:20},(_,i)=>({id:`stress-course-${i}`,title:`Accounting Course ${i} - `+"Advanced financial accounting and reporting ".repeat(3),provider:"Synthetic Fixture Training Institution - Accounting and Finance School",date:"2026-10",status:i<10 ? "completed" : "in-progress",notes:"Private notes not included in CV".repeat(30),updatedAt:"2026-10-11"})),certificates:Array.from({length:20},(_,i)=>({id:`stress-cert-${i}`,title:`Course Certificate ${i} - Financial Reporting and Accounting Practice`,issuer:"Synthetic Fixture Training Institution",date:"2026-10",credentialId:`PRIVATE-CERT-${i}`,width:1600,height:1067,updatedAt:"2026-10-11"}))};
    const cv={...data.cv,summary:profile.summary,headline:profile.headline};
    await route.fulfill({response,json:{data:{...data,profile,cv,compact:compactCv(profile,cv,portfolio)}}});
  });
  try {
    await page.goto(`${base}/${locale}/career-profile/cv`);await page.locator('.professional-cv').waitFor();
    record(label+' stress CV transparently curates full profile rather than a transcript',(await page.locator('.cv-controls').innerText()).includes('additional records remain'));
    await page.emulateMedia({media:'print'});
    record(label+' maximum profile print content fits at most two readable A4 pages',await page.locator('.cv-page').count()<=2 && await page.locator('.cv-page').evaluateAll(pages=>pages.every(page=>page.getBoundingClientRect().height<=273*96/25.4)));
    record(label+' print font remains 10.5pt without scaling or clipping',await page.locator('.cv-page p').evaluateAll(nodes=>nodes.every(node=>parseFloat(getComputedStyle(node).fontSize)>=13.9 && getComputedStyle(node).overflow!=='hidden')));
    const pdf=await page.pdf({path:path.join(output,label+'-stress-cv.pdf'),preferCSSPageSize:true,printBackground:true});
    const count=[...pdf.toString('latin1').matchAll(/\/Type\s*\/Page\b/g)].length;
    record(label+' stress PDF actual page count <=2',count>=1 && count<=2);
    await page.emulateMedia({media:'screen'});await screenshot(page,label+'-stress-cv');
  }finally{await page.unroute(pattern);await page.emulateMedia({media:'screen'});}
}
