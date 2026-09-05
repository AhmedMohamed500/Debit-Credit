import type { GameSkillId } from "@/types/game";

export interface DemoCandidate { id:string; nameAr:string; nameEn:string; level:number; readiness:number; accuracy:number; missions:number; detective:number; arena:number; certificates:number; rank:string; skills:Partial<Record<GameSkillId,number>> }
export const demoCandidates:DemoCandidate[] = [
  {id:"ahmed-salem",nameAr:"أحمد سالم",nameEn:"Ahmed Salem",level:6,readiness:88,accuracy:92,missions:18,detective:89,arena:84,certificates:3,rank:"Top 8%",skills:{"journal-entries":94,"trial-balance":91,"error-detection":89,accuracy:92}},
  {id:"mariam-nabil",nameAr:"مريم نبيل",nameEn:"Mariam Nabil",level:5,readiness:82,accuracy:95,missions:15,detective:80,arena:76,certificates:2,rank:"Top 12%",skills:{"account-classification":96,"journal-entries":90,adjustments:84,accuracy:95}},
  {id:"omar-hassan",nameAr:"عمر حسن",nameEn:"Omar Hassan",level:7,readiness:91,accuracy:89,missions:24,detective:94,arena:91,certificates:3,rank:"Top 5%",skills:{"business-cases":93,"error-detection":94,"financial-statements":88,speed:90}},
  {id:"salma-adel",nameAr:"سلمى عادل",nameEn:"Salma Adel",level:4,readiness:74,accuracy:87,missions:11,detective:78,arena:70,certificates:1,rank:"Top 25%",skills:{fundamentals:92,"debit-credit":88,"ledger-posting":82,accuracy:87}},
];

export const demoEmployer = { ar:"بوابة شركة النمو التجريبية", en:"Growth Company Demo Portal" };

