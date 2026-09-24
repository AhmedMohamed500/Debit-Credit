import type {LocalizedText,RoleId,SkillEvidence,SkillId} from '@/lib/career/model';
import {evaluatePromotion} from '@/lib/career-league/engine';

const t=(en:string,ar:string):LocalizedText=>({en,ar});
export type ReconciliationTreatment='bank-add'|'bank-subtract'|'book-add'|'book-subtract';
export interface ReconciliationItem{id:string;title:LocalizedText;detail:LocalizedText;amount:number;correctTreatment:ReconciliationTreatment}
export interface PromotionAssessmentAnswers{supplierDecision:string|null;receiptDecision:string|null;treatments:Record<string,ReconciliationTreatment>;closeDecision:string|null;reviewedEvidence:string[];hintsUsed:number}
export interface PromotionAssessmentOutcome{status:'pass'|'needs-practice';score:number;developmentAreas:string[];criticalErrors:number;adjustedBank:number;adjustedLedger:number;balanced:boolean;correctAnswers:number;totalAnswers:number;reviewedEvidence:string[];performance:{accuracy:number;accountingJudgment:number;investigation:number;riskAwareness:number;independence:number;documentation:number;overall:number}}

export const promotionCase={
 id:'promotion-1-connected-control',version:1,
 company:t('Delta Commerce (simulation)','دلتا للتجارة (محاكاة)'),
 period:t('31 March 2026','31 مارس 2026'),
 supplier:{invoice:'INV-4831',vendor:t('Nile Office Supply','نايل للأدوات المكتبية'),amount:18400,poAmount:18400,receivedAmount:16400},
 receipt:{reference:'TRX-9017',amount:15400,customer:t('Madar Stores','مدار ستورز'),invoice:'AR-2208'},
 bankOpening:256900,ledgerOpening:235400,
 items:[
  {id:'deposit-transit',title:t('Deposit in transit','إيداع بالطريق'),detail:t('Recorded in the ledger on 31 March; shown by the bank on 1 April.','مسجل بالدفاتر في 31 مارس وظهر بكشف البنك في 1 أبريل.'),amount:12000,correctTreatment:'bank-add'},
  {id:'outstanding-checks',title:t('Outstanding supplier cheques','شيكات موردين معلقة'),detail:t('Issued and recorded before close; not yet presented to the bank.','صدرت وسجلت قبل الإقفال ولم تقدم للبنك بعد.'),amount:18500,correctTreatment:'bank-subtract'},
  {id:'bank-fee',title:t('Bank service fee','مصروف خدمة بنكية'),detail:t('Appears on the statement only; no ledger entry exists.','ظهر بكشف البنك فقط ولا يوجد له قيد بالدفاتر.'),amount:650,correctTreatment:'book-subtract'},
  {id:'interest',title:t('Interest income','عائد دائن'),detail:t('Credited by the bank and not yet recorded by accounting.','أضافه البنك ولم تسجله المحاسبة بعد.'),amount:250,correctTreatment:'book-add'},
  {id:'customer-transfer',title:t('Customer transfer TRX-9017','تحويل العميل TRX-9017'),detail:t('Confirmed by remittance advice; omitted from the ledger.','مؤيد بإشعار التحويل ولم يسجل بالدفاتر.'),amount:15400,correctTreatment:'book-add'},
 ] satisfies ReconciliationItem[],
 evidence:[
  {id:'purchase-order',label:t('Purchase order PO-4831','أمر الشراء PO-4831')},
  {id:'goods-receipt',label:t('Goods receipt GRN-4831','إذن الاستلام GRN-4831')},
  {id:'remittance-advice',label:t('Customer remittance TRX-9017','إشعار تحويل العميل TRX-9017')},
  {id:'bank-statement',label:t('March bank statement','كشف بنك مارس')},
 ]
};

export const emptyPromotionAnswers=():PromotionAssessmentAnswers=>({supplierDecision:null,receiptDecision:null,treatments:{},closeDecision:null,reviewedEvidence:[],hintsUsed:0});

export function reconciliationBalances(treatments:Record<string,ReconciliationTreatment>){let bank=promotionCase.bankOpening,ledger=promotionCase.ledgerOpening;for(const item of promotionCase.items){const treatment=treatments[item.id];if(treatment==='bank-add')bank+=item.amount;if(treatment==='bank-subtract')bank-=item.amount;if(treatment==='book-add')ledger+=item.amount;if(treatment==='book-subtract')ledger-=item.amount}return{adjustedBank:bank,adjustedLedger:ledger,balanced:bank===ledger}}

export function assessConnectedPromotion(answers:PromotionAssessmentAnswers):PromotionAssessmentOutcome{
 const itemCorrect=promotionCase.items.filter(item=>answers.treatments[item.id]===item.correctTreatment).length;
 const supplierCorrect=answers.supplierDecision==='hold-difference',receiptCorrect=answers.receiptDecision==='record-supported-transfer',closeCorrect=answers.closeDecision==='document-and-submit';
 const correctAnswers=itemCorrect+Number(supplierCorrect)+Number(receiptCorrect)+Number(closeCorrect),totalAnswers=promotionCase.items.length+3,accuracy=Math.round(correctAnswers/totalAnswers*100),reviewed=new Set(answers.reviewedEvidence),allEvidence=promotionCase.evidence.every(item=>reviewed.has(item.id)),balances=reconciliationBalances(answers.treatments);
 const criticalErrors=Number(answers.supplierDecision==='post-full-invoice')+Number(answers.closeDecision==='force-ledger-balance');
 const performance={accuracy,accountingJudgment:Math.round((Number(supplierCorrect)+Number(receiptCorrect)+Number(closeCorrect))/3*100),investigation:Math.round(reviewed.size/promotionCase.evidence.length*100),riskAwareness:Math.round((Number(supplierCorrect)+Number(closeCorrect)+Number(balances.balanced))/3*100),independence:Math.max(40,100-answers.hintsUsed*20),documentation:allEvidence&&closeCorrect?100:reviewed.size>=3?75:50,overall:0};
 performance.overall=Math.round(Object.values(performance).slice(0,6).reduce((sum,value)=>sum+value,0)/6);
 const result=evaluatePromotion({...performance,criticalErrors});
 return{...result,criticalErrors,...balances,correctAnswers,totalAnswers,reviewedEvidence:[...reviewed],performance};
}

const evidenceSkills:Record<SkillId,{roles:RoleId[];title:LocalizedText}>={
 'document-analysis':{roles:['junior-accountant','ap-accountant','ar-accountant'],title:t('Connected control review','مراجعة رقابية مترابطة')},
 'journal-entries':{roles:['junior-accountant','general-accountant'],title:t('Supported correction decisions','قرارات تصحيح مؤيدة')},
 'bank-reconciliation':{roles:['general-accountant','treasury-accountant','junior-auditor'],title:t('Structured-company bank reconciliation','تسوية بنك في شركة منظمة')},
} as Record<SkillId,{roles:RoleId[];title:LocalizedText}>;

export function promotionEvidence(outcome:PromotionAssessmentOutcome,localCandidateId:string,completedAt:string):SkillEvidence[]{
 const trace=[`supplier:${outcome.performance.riskAwareness}`,`reconciliation:${outcome.adjustedBank}:${outcome.adjustedLedger}`,`result:${outcome.status}`];
 return(Object.entries(evidenceSkills)as[SkillId,(typeof evidenceSkills)[SkillId]][]).map(([skillId,config])=>({version:1,projectionVersion:2,evidenceId:`promotion-1:${skillId}:${completedAt}`,localCandidateId,activityId:'promotion-assessment/promotion-1',activityType:'assessment',chapterId:1,missionId:'promotion-1',skillId,roleRelevance:config.roles,difficulty:2,score:outcome.score,accuracy:outcome.performance.accuracy,firstAttemptCorrect:outcome.performance.accuracy===100&&outcome.performance.independence===100,attempts:1,hintsUsed:Math.round((100-outcome.performance.independence)/20),independentCompletion:outcome.performance.independence===100,criticalErrors:outcome.criticalErrors,completedAt,source:'boss_case',assessmentIntegrity:outcome.status==='pass'?'demonstrated':'practice',titleAr:config.title.ar,titleEn:config.title.en,caseId:promotionCase.id,attemptId:`promotion-1-${completedAt}`,scenarioVersion:promotionCase.version,rubricVersion:1,inspectedEvidence:outcome.reviewedEvidence,decisionTrace:trace,performance:outcome.performance,rationaleAr:`تقييم ترقية محلي داخل المحاكاة: ${outcome.correctAnswers}/${outcome.totalAnswers} قرارات صحيحة. لا يمثل اعتمادًا مهنيًا خارجيًا.`,rationaleEn:`Local simulation promotion assessment: ${outcome.correctAnswers}/${outcome.totalAnswers} correct decisions. This is not external professional verification.`}));
}
