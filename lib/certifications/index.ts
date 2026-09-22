import type{LocalizedText}from'@/lib/career/model';
export interface CertificationPreparationTrack{id:'cma-preparation'|'acca-related-preparation'|'dipifr-preparation'|'cpa-style-knowledge';title:LocalizedText;label:'Preparation Track'|'Readiness Track'|'Practice Track';status:'planned';official:false;accredited:false;partner:false;prerequisites:string[]}
const t=(en:string,ar:string)=>({en,ar});
export const certificationPreparationTracks:CertificationPreparationTrack[]=[
 {id:'cma-preparation',title:t('CMA Preparation','التحضير لـCMA'),label:'Preparation Track',status:'planned',official:false,accredited:false,partner:false,prerequisites:['management-accounting-foundation']},
 {id:'acca-related-preparation',title:t('ACCA-related Preparation','تحضير مرتبط بـACCA'),label:'Readiness Track',status:'planned',official:false,accredited:false,partner:false,prerequisites:['financial-accounting-foundation']},
 {id:'dipifr-preparation',title:t('DipIFR Preparation','التحضير لـDipIFR'),label:'Preparation Track',status:'planned',official:false,accredited:false,partner:false,prerequisites:['standards-world-reviewed-content']},
 {id:'cpa-style-knowledge',title:t('CPA-style Knowledge Preparation','تحضير معرفي بأسلوب CPA'),label:'Practice Track',status:'planned',official:false,accredited:false,partner:false,prerequisites:['general-accounting-practice']},
];
