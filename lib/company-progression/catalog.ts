import type{MizanStage}from'./model';const t=(en:string,ar:string)=>({en,ar});
export const mizanStages:MizanStage[]=[
 {id:'first-shift',order:1,department:'accounting-desk',title:t('First Shift','أول وردية'),responsibility:t('Inspect and post three supported documents.','افحص ورحّل ثلاثة مستندات مؤيدة.'),route:'/game/first-shift',requiredMissionIds:[],status:'implemented'},
 {id:'supplier-control',order:2,department:'suppliers',title:t('Supplier Control','رقابة الموردين'),responsibility:t('Own invoice matching and supplier exceptions.','أدر مطابقة الفواتير واستثناءات الموردين.'),route:'/game/suppliers',requiredMissionIds:['first-shift'],status:'available-foundation'},
 {id:'customer-control',order:3,department:'customers',title:t('Customer Control','رقابة العملاء'),responsibility:t('Investigate receipts and protect allocation.','حقق في التحصيلات واحمِ التخصيص.'),route:'/game/customers',requiredMissionIds:['first-shift'],status:'available-foundation'},
 {id:'bank-control',order:4,department:'bank',title:t('Bank Control','رقابة البنك'),responsibility:t('Reconcile movements created by supplier and customer work.','سوِّ الحركات الناتجة من شغل الموردين والعملاء.'),route:'/game/bank',requiredMissionIds:['supplier-control','customer-control'],status:'locked-preview'},
 {id:'close-readiness',order:5,department:'month-end',title:t('Close Readiness','جاهزية الإقفال'),responsibility:t('Resolve open accounting risks before close.','حل المخاطر المحاسبية المفتوحة قبل الإقفال.'),route:'/game/month-end',requiredMissionIds:['bank-control'],status:'locked-preview'},
];
