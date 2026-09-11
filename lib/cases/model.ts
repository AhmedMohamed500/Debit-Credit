import type { Words } from '@/lib/campaign/model';

export type AccountingCaseStatus='new'|'opened'|'investigating'|'waiting'|'ready'|'resolved'|'escalated';
export type AccountingCaseAction='post'|'hold'|'reject'|'request_information'|'ask_procurement'|'ask_warehouse'|'ask_manager'|'contact_supplier'|'contact_customer'|'inspect_po'|'inspect_grn'|'inspect_bank_statement'|'escalate'|'defer'|'reconcile';
export type GameplayEventType='shift_started'|'case_received'|'case_opened'|'document_inspected'|'supporting_document_inspected'|'case_action_selected'|'entry_submitted'|'manager_help_requested'|'case_posted'|'case_resolved'|'case_escalated'|'consequence_scheduled'|'consequence_revealed'|'shift_completed';
export type GameplayEventOutcome='recorded'|'accepted'|'blocked'|'correct'|'incorrect'|'resolved';
export type GameplayPayload=Record<string,string|number|boolean|null|string[]>;

export interface CaseDocumentDefinition{id:string;kind:'source'|'purchase_order'|'goods_receipt'|'customer_invoice'|'bank_advice'|'cash_voucher'|'policy';title:Words;reference:string;summary:Words;facts:{label:Words;value:Words}[];required:boolean}
export interface CaseActionDefinition{id:AccountingCaseAction;label:Words;description:Words}
export interface CaseMessageDefinition{id:string;sender:Words;subject:Words;body:Words;required:boolean}
export interface CaseInvestigationStep{id:string;documentId?:string;action?:AccountingCaseAction;description:Words}
export interface CaseConsequenceDefinition{id:string;triggerAction?:AccountingCaseAction;triggerOutcome?:GameplayEventOutcome;timing:'immediate'|'after_case'|'shift_end';revealAfterCaseId?:string;description:Words;affectedAccounts?:string[]}
export interface ScheduledCaseConsequence{consequenceId:string;sourceCaseId:string;definition:CaseConsequenceDefinition;scheduledAt:string;revealedAt:string|null}
export interface AccountingCaseDefinition{id:string;chapterId:number;scenarioVersion:number;title:Words;businessContext:Words;managerRequest:Words;primaryDocumentId:string;documents:CaseDocumentDefinition[];messages?:CaseMessageDefinition[];investigationSteps?:CaseInvestigationStep[];actions:CaseActionDefinition[];requiresJournal:boolean;accountingReference:string;managerGuidance:Words[];connectedCaseIds?:string[];consequences?:CaseConsequenceDefinition[];currentAccountingState?:Record<string,number>}
export interface GameplayEvent{eventId:string;schemaVersion:1;scenarioVersion:number;rubricVersion:number;timestamp:string;chapterId:number;caseId:string|null;attemptId:string|null;localCandidateId:string;eventType:GameplayEventType;payload:GameplayPayload;outcome:GameplayEventOutcome;accountingReference:string|null}
export interface AccountingCaseRuntime{caseId:string;status:AccountingCaseStatus;attemptId:string;openedAt:string|null;inspectedDocumentIds:string[];selectedActions:AccountingCaseAction[];submissionCount:number;managerHelpCount:number;resolvedAt:string|null}
export interface CaseworkState{schemaVersion:1;scenarioVersion:1;rubricVersion:1;localCandidateId:string;shiftStartedAt:string|null;workMinutes:number;cases:Record<string,AccountingCaseRuntime>;events:GameplayEvent[];scheduledConsequences:ScheduledCaseConsequence[]}
export interface CaseActionResult{state:import('@/lib/campaign/model').GameState;readyToPost:boolean;missingDocumentIds:string[];outcome:GameplayEventOutcome}
export interface PerformanceDimensions{accuracy:number;independence:number;investigation:number;riskAwareness:number;documentation:number;accountingJudgment:number;overall:number}
export interface CasePerformance extends PerformanceDimensions{caseId:string;attemptId:string;submissions:number;managerAssistance:number;supportingDocumentsInspected:number;supportingDocumentsRequired:number;firstAttemptCorrect:boolean|null;resolved:boolean}
