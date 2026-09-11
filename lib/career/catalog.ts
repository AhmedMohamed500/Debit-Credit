import type{LocalizedText,RoleId,SkillId}from'./model';
const t=(en:string,ar:string):LocalizedText=>({en,ar});
export const skillCatalog:Record<SkillId,{label:LocalizedText;description:LocalizedText}>={
 'accounting-fundamentals':{label:t('Accounting Fundamentals','أساسيات المحاسبة'),description:t('Applies the accounting equation and recognition principles.','يطبق المعادلة المحاسبية ومبادئ الاعتراف.')},
 'account-classification':{label:t('Account Classification','تصنيف الحسابات'),description:t('Selects the correct accounts for a transaction.','يختار الحسابات الصحيحة للعملية.')},
 'debit-credit':{label:t('Debit & Credit','المدين والدائن'),description:t('Places increases and decreases on the correct side.','يضع الزيادة والنقص في الطرف الصحيح.')},
 'document-analysis':{label:t('Document Analysis','تحليل المستندات'),description:t('Reads source documents before recording.','يحلل المستند المؤيد قبل التسجيل.')},
 'journal-entries':{label:t('Journal Entries','القيود اليومية'),description:t('Builds balanced entries from real transaction facts.','ينشئ قيودًا متوازنة من وقائع العملية.')},
 'ledger-posting':{label:t('Ledger Posting','الترحيل للأستاذ'),description:t('Posts accepted entries to account balances.','يرحل القيود المقبولة إلى الأرصدة.')},
 'trial-balance':{label:t('Trial Balance','ميزان المراجعة'),description:t('Checks debit and credit totals.','يراجع تساوي إجمالي المدين والدائن.')},
 'error-detection':{label:t('Error Detection','اكتشاف الأخطاء'),description:t('Finds accounting errors and their consequences.','يكتشف الأخطاء المحاسبية وآثارها.')},
 'bank-reconciliation':{label:t('Bank Reconciliation','تسوية البنك'),description:t('Matches bank records to the ledger.','يطابق كشف البنك مع الدفاتر.')},
 'accounts-payable':{label:t('Accounts Payable','حسابات الموردين'),description:t('Records and controls supplier obligations.','يسجل ويراقب التزامات الموردين.')},
 'accounts-receivable':{label:t('Accounts Receivable','حسابات العملاء'),description:t('Records and controls customer balances.','يسجل ويراقب أرصدة العملاء.')},
 'cash-treasury':{label:t('Cash & Treasury','النقدية والخزينة'),description:t('Handles cash, bank and payment movements.','يعالج حركات النقدية والبنوك والمدفوعات.')},
 'adjusting-entries':{label:t('Adjusting Entries','قيود التسوية'),description:t('Records accruals, deferrals and adjustments.','يسجل الاستحقاقات والتأجيلات والتسويات.')},
 'financial-statements':{label:t('Financial Statements','القوائم المالية'),description:t('Connects transactions to financial reports.','يربط العمليات بالتقارير المالية.')},
 'month-end-closing':{label:t('Month-End Closing','إقفال نهاية الشهر'),description:t('Completes controlled closing activities.','ينفذ إجراءات إقفال شهرية منضبطة.')},
 'inventory-accounting':{label:t('Inventory Accounting','محاسبة المخزون'),description:t('Records inventory movement and valuation.','يسجل حركة المخزون وتقييمه.')},
 'cost-accounting':{label:t('Cost Accounting','محاسبة التكاليف'),description:t('Classifies and analyzes product or service costs.','يصنف ويحلل تكاليف المنتج أو الخدمة.')},
 'expense-recognition':{label:t('Expense Recognition','الاعتراف بالمصروف'),description:t('Recognizes expenses in the correct period.','يثبت المصروف في الفترة الصحيحة.')},
 'supplier-documents':{label:t('Supplier Documents','مستندات الموردين'),description:t('Reviews invoices and supplier support.','يراجع الفواتير ومستندات الموردين.')},
};
export const roleCatalog:Record<RoleId,{label:LocalizedText;skills:Partial<Record<SkillId,number>>}>={
 'junior-accountant':{label:t('Junior Accountant','محاسب مبتدئ'),skills:{'accounting-fundamentals':.12,'account-classification':.16,'debit-credit':.14,'document-analysis':.14,'journal-entries':.2,'trial-balance':.12,'error-detection':.06,'bank-reconciliation':.06}},
 'general-accountant':{label:t('General Accountant','محاسب عام'),skills:{'journal-entries':.2,'ledger-posting':.17,'trial-balance':.15,'adjusting-entries':.14,'financial-statements':.13,'month-end-closing':.13,'bank-reconciliation':.08}},
 'ap-accountant':{label:t('AP Accountant','محاسب موردين'),skills:{'accounts-payable':.25,'supplier-documents':.2,'document-analysis':.15,'journal-entries':.15,'expense-recognition':.15,'bank-reconciliation':.1}},
 'ar-accountant':{label:t('AR Accountant','محاسب عملاء'),skills:{'accounts-receivable':.28,'document-analysis':.17,'journal-entries':.18,'cash-treasury':.17,'bank-reconciliation':.12,'error-detection':.08}},
 'treasury-accountant':{label:t('Treasury Accountant','محاسب خزينة'),skills:{'cash-treasury':.3,'bank-reconciliation':.25,'journal-entries':.15,'document-analysis':.12,'accounts-payable':.1,'accounts-receivable':.08}},
 'cost-accountant':{label:t('Cost Accountant','محاسب تكاليف'),skills:{'cost-accounting':.35,'inventory-accounting':.2,'account-classification':.15,'journal-entries':.12,'financial-statements':.1,'error-detection':.08}},
 'inventory-accountant':{label:t('Inventory Accountant','محاسب مخزون'),skills:{'inventory-accounting':.35,'document-analysis':.15,'journal-entries':.15,'ledger-posting':.12,'cost-accounting':.13,'error-detection':.1}},
 'gl-accountant':{label:t('GL Accountant','محاسب أستاذ عام'),skills:{'ledger-posting':.25,'journal-entries':.2,'trial-balance':.18,'adjusting-entries':.15,'month-end-closing':.12,'financial-statements':.1}},
 'junior-auditor':{label:t('Junior Auditor','مراجع مبتدئ'),skills:{'document-analysis':.2,'error-detection':.25,'trial-balance':.14,'account-classification':.12,'bank-reconciliation':.12,'financial-statements':.1,'journal-entries':.07}},
};
export const roleIds=Object.keys(roleCatalog) as RoleId[];
export const skillIds=Object.keys(skillCatalog) as SkillId[];
