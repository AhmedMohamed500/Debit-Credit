import {w,type Words} from '@/lib/campaign/model';

export type MonthEndWorkstream='bank_reconciliation'|'ap_review'|'ar_review'|'adjustments'|'accruals'|'prepayments'|'trial_balance'|'close_readiness';
export interface LockedChapterMetadata{id:'closing-week';chapterNumber:2;status:'locked';title:Words;subtitle:Words;entryRoute:null;supportedWorkstreams:MonthEndWorkstream[]}

export const closingWeekMetadata:LockedChapterMetadata={
 id:'closing-week',chapterNumber:2,status:'locked',
 title:w('CLOSING WEEK — THE MONTH-END CRISIS','أسبوع الإقفال — أزمة نهاية الشهر'),
 subtitle:w('Connected cases will arrive in a future tested release.','الحالات المترابطة هتوصل في إصدار مستقبلي بعد اختبارها.'),
 entryRoute:null,
 supportedWorkstreams:['bank_reconciliation','ap_review','ar_review','adjustments','accruals','prepayments','trial_balance','close_readiness']
};
