import type{LocalizedText}from'@/lib/career/model';
export interface CompanyEvolution{id:'mizan-trading'|'delta-commerce'|'horizon-industries'|'orbit-regional-group'|'atlas-global-simulation';tier:1|2|3|4|5;responsibility:LocalizedText;processComplexity:number;ambiguity:number;controlDepth:number;englishDocumentation:number;reviewResponsibility:number;deadlinePressure:number;status:'implemented-entry'|'architecture-ready'|'planned'}
const t=(en:string,ar:string)=>({en,ar});
export const companyEvolution:CompanyEvolution[]=[
 {id:'mizan-trading',tier:1,responsibility:t('Understand and process','افهم وعالج'),processComplexity:1,ambiguity:1,controlDepth:1,englishDocumentation:1,reviewResponsibility:1,deadlinePressure:1,status:'implemented-entry'},
 {id:'delta-commerce',tier:2,responsibility:t('Own structured processes','امتلك دورة عمل منظمة'),processComplexity:2,ambiguity:2,controlDepth:2,englishDocumentation:2,reviewResponsibility:2,deadlinePressure:2,status:'architecture-ready'},
 {id:'horizon-industries',tier:3,responsibility:t('Close and control','أقفل وراقب'),processComplexity:3,ambiguity:3,controlDepth:3,englishDocumentation:3,reviewResponsibility:3,deadlinePressure:3,status:'architecture-ready'},
 {id:'orbit-regional-group',tier:4,responsibility:t('Review and report','راجع وقدّم التقارير'),processComplexity:4,ambiguity:4,controlDepth:4,englishDocumentation:4,reviewResponsibility:4,deadlinePressure:4,status:'planned'},
 {id:'atlas-global-simulation',tier:5,responsibility:t('Corporate and global simulation','محاكاة مؤسسية وعالمية'),processComplexity:5,ambiguity:5,controlDepth:5,englishDocumentation:5,reviewResponsibility:5,deadlinePressure:5,status:'planned'},
];
export const companyEvolutionIsProgressive=()=>companyEvolution.every((item,index)=>index===0||(['processComplexity','ambiguity','controlDepth','englishDocumentation','reviewResponsibility','deadlinePressure']as const).every(key=>item[key]>companyEvolution[index-1][key]));
