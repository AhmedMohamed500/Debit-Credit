import {describe,expect,it} from 'vitest';
import {assessConnectedPromotion,emptyPromotionAnswers,promotionCase,promotionEvidence,reconciliationBalances,type PromotionAssessmentAnswers} from '@/lib/promotion-assessment';

const successfulAnswers=():PromotionAssessmentAnswers=>({
 supplierDecision:'hold-difference',
 receiptDecision:'record-supported-transfer',
 treatments:Object.fromEntries(promotionCase.items.map(item=>[item.id,item.correctTreatment])),
 closeDecision:'document-and-submit',
 reviewedEvidence:promotionCase.evidence.map(item=>item.id),
 hintsUsed:0,
});

describe('Connected promotion assessment',()=>{
 it('reconciles the statement and ledger to the same controlled balance',()=>{
  expect(reconciliationBalances(successfulAnswers().treatments)).toEqual({adjustedBank:250400,adjustedLedger:250400,balanced:true});
 });

 it('passes a fully investigated connected file without critical errors',()=>{
  const outcome=assessConnectedPromotion(successfulAnswers());
  expect(outcome).toMatchObject({status:'pass',score:100,criticalErrors:0,correctAnswers:8,totalAnswers:8,balanced:true});
  expect(outcome.developmentAreas).toEqual([]);
 });

 it('flags forced balances and unsupported posting as critical control errors',()=>{
  const answers={...successfulAnswers(),supplierDecision:'post-full-invoice',closeDecision:'force-ledger-balance'};
  const outcome=assessConnectedPromotion(answers);
  expect(outcome.status).toBe('needs-practice');
  expect(outcome.criticalErrors).toBe(2);
  expect(outcome.developmentAreas).toEqual(expect.arrayContaining(['accountingJudgment','riskAwareness']));
 });

 it('creates local demonstrated evidence without claiming external verification',()=>{
  const evidence=promotionEvidence(assessConnectedPromotion(successfulAnswers()),'candidate-1','2026-03-31T12:00:00.000Z');
  expect(evidence.map(item=>item.skillId)).toEqual(['document-analysis','journal-entries','bank-reconciliation']);
  expect(evidence.every(item=>item.source==='boss_case'&&item.assessmentIntegrity==='demonstrated')).toBe(true);
  expect(evidence.every(item=>item.activityType==='assessment'&&item.difficulty===2)).toBe(true);
  expect(evidence[2].rationaleEn).toContain('not external professional verification');
 });

 it('keeps an unanswered file non-passing',()=>{
  const outcome=assessConnectedPromotion(emptyPromotionAnswers());
  expect(outcome.status).toBe('needs-practice');
  expect(outcome.balanced).toBe(false);
  expect(outcome.score).toBeLessThan(78);
 });
});
