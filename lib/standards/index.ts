import type{LocalizedText}from'@/lib/career/model';
export type StandardContentStatus='learning-preview'|'review-required'|'approved';
export interface StandardModule{id:string;title:LocalizedText;area:'framework'|'presentation'|'recognition'|'measurement'|'disclosure'|'standard';reference:string;effectiveVersion:string|null;status:StandardContentStatus;professionalAssessment:boolean;reviewedAt:string|null}
const t=(en:string,ar:string)=>({en,ar});
export const standardsRoadmap:StandardModule[]=[
 {id:'conceptual-framework',title:t('Conceptual Framework','الإطار المفاهيمي'),area:'framework',reference:'IFRS Foundation — Conceptual Framework',effectiveVersion:null,status:'learning-preview',professionalAssessment:false,reviewedAt:null},
 {id:'presentation-foundations',title:t('Presentation Foundations','أساسيات العرض'),area:'presentation',reference:'IAS 1 / IFRS 18 transition — official sources required',effectiveVersion:null,status:'review-required',professionalAssessment:false,reviewedAt:null},
 {id:'recognition-measurement',title:t('Recognition and Measurement','الاعتراف والقياس'),area:'recognition',reference:'Standard-specific official source required',effectiveVersion:null,status:'learning-preview',professionalAssessment:false,reviewedAt:null},
 {id:'disclosure-thinking',title:t('Disclosure Thinking','التفكير في الإفصاح'),area:'disclosure',reference:'Standard-specific official source required',effectiveVersion:null,status:'learning-preview',professionalAssessment:false,reviewedAt:null},
 {id:'selected-standards',title:t('Selected Standards Cases','حالات معايير مختارة'),area:'standard',reference:'Official standard references pending',effectiveVersion:null,status:'review-required',professionalAssessment:false,reviewedAt:null},
];
export const standardsEligibleForAssessment=()=>standardsRoadmap.filter(item=>item.status==='approved'&&item.professionalAssessment&&item.effectiveVersion&&item.reviewedAt);
