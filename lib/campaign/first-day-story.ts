import { w, type Words } from './model';

export type StoryCharacterId='finance-manager'|'player'|'cfo'|'senior-accountant'|'cashier'|'storekeeper';
export type StoryCharacter={id:StoryCharacterId;name:Words;role:Words;initials:string;dialogueTone:'mentor'|'player'|'executive'|'colleague'};
export type CinematicScene={id:string;duration:number;background:string;character?:StoryCharacterId;eyebrow:Words;title:Words;dialogue:Words;caption:Words};
export type CinematicChapter=
 | {mode:'scene';chapterId:string;chapterTitle:Words;scenes:CinematicScene[]}
 | {mode:'video';chapterId:string;chapterTitle:Words;poster:string;video:{mp4?:string;webm?:string};fallbackScenes:CinematicScene[]};

export const storyCharacters:Record<StoryCharacterId,StoryCharacter>={
 'finance-manager':{id:'finance-manager',name:w('Mr. Kareem','أ/ كريم'),role:w('Finance Manager','المدير المالي'),initials:'OK',dialogueTone:'mentor'},
 player:{id:'player',name:w('Ahmed','أحمد'),role:w('Accounting Trainee','متدرب محاسبة'),initials:'A',dialogueTone:'player'},
 cfo:{id:'cfo',name:w('Mona El-Sayed','منى السيد'),role:w('Chief Financial Officer','المدير المالي التنفيذي'),initials:'ME',dialogueTone:'executive'},
 'senior-accountant':{id:'senior-accountant',name:w('Salma Nabil','سلمى نبيل'),role:w('Senior Accountant','محاسب أول'),initials:'SN',dialogueTone:'colleague'},
 cashier:{id:'cashier',name:w('Hassan Ali','حسن علي'),role:w('Cashier','أمين الصندوق'),initials:'HA',dialogueTone:'colleague'},
 storekeeper:{id:'storekeeper',name:w('Youssef Adel','يوسف عادل'),role:w('Storekeeper','أمين المخزن'),initials:'YA',dialogueTone:'colleague'},
};

const office='/game/first-day-cinematic.png';

export const firstDayIntro={mode:'scene',chapterId:'first-day',chapterTitle:w('First Day','أول يوم'),scenes:[
 {id:'arrival',duration:2200,background:office,eyebrow:w('CHAPTER 1','الفصل ١'),title:w('FIRST DAY','أول يوم'),dialogue:w('You arrive at Mizan Trading for your first day in the finance office.','وصلت شركة ميزان للتجارة في أول يوم ليك داخل الإدارة المالية.'),caption:w('Mizan Trading · 8:45 AM','ميزان للتجارة · ٨:٤٥ صباحًا')},
 {id:'manager',duration:2400,background:office,character:'finance-manager',eyebrow:w('FINANCE OFFICE','الإدارة المالية'),title:w('Meet your manager','قابل مديرك'),dialogue:w('Welcome to Mizan Trading. Today is your first day with us.','أهلًا بيك في ميزان للتجارة. النهارده أول يوم ليك معانا.'),caption:w('Mr. Kareem · Finance Manager','أ/ كريم · المدير المالي')},
 {id:'problem',duration:2600,background:office,character:'finance-manager',eyebrow:w('YESTERDAY’S FILE','ملف امبارح'),title:w('Three entries are waiting','٣ قيود في انتظارك'),dialogue:w('Three transactions from yesterday still need to be recorded.','عندنا ٣ معاملات من امبارح لسه محتاجة تتسجل.'),caption:w('Accuracy protects the company books','الدقة بتحمي دفاتر الشركة')},
 {id:'documents',duration:2200,background:office,character:'finance-manager',eyebrow:w('TODAY’S SHIFT','وردية النهارده'),title:w('Inspect. Decide. Record.','افحص. قرر. سجّل.'),dialogue:w('Start with the document you trust yourself to handle first.','ابدأ بالمستند اللي شايف إنك تقدر تتعامل معاه الأول.'),caption:w('Invoice · Receipt · Expense','فاتورة · سند قبض · مصروف')},
 {id:'start',duration:2200,background:office,character:'finance-manager',eyebrow:w('YOUR DESK IS READY','مكتبك جاهز'),title:w('Start your first shift','ابدأ أول وردية'),dialogue:w('The desk is yours, Ahmed. Show me how you think.','المكتب بقى مسؤوليتك يا أحمد. ورّيني هتفكر إزاي.'),caption:w('Your decisions change the company state','قراراتك هتغيّر حالة الشركة')},
] } satisfies CinematicChapter;

export const firstDayOutro={mode:'scene',chapterId:'first-day-complete',chapterTitle:w('End of Day','نهاية اليوم'),scenes:[
 {id:'books-closed',duration:2600,background:office,character:'finance-manager',eyebrow:w('END OF DAY','نهاية اليوم'),title:w('The books are balanced','الدفاتر اتزنت'),dialogue:w('Good work, Ahmed. Every document is now in the right place.','شغل كويس يا أحمد. كل مستند بقى في مكانه الصح.'),caption:w('3 documents recorded · 0 ledger errors','٣ مستندات اتسجلت · صفر أخطاء بالدفتر')},
 {id:'manager-result',duration:2600,background:office,character:'finance-manager',eyebrow:w('MANAGER REVIEW','تقييم المدير'),title:w('Better than expected','أفضل من المتوقع'),dialogue:w('You handled your first day better than expected.','أديت في أول يوم أحسن مما توقعت.'),caption:w('Journal Entries skill improved','مهارة القيود اليومية اتحسنت')},
 {id:'tomorrow',duration:3000,background:office,character:'finance-manager',eyebrow:w('CHAPTER 2 · TEASER','الفصل ٢ · لمحة'),title:w('THE FIRST SHIFT','الوردية الأولى'),dialogue:w('Tomorrow, things get real. Customer payments, supplier invoices, cash expenses—and your first mistake to investigate.','بكرة الشغل هيبقى حقيقي: مدفوعات عملاء، فواتير موردين، مصروفات نقدية، وأول خطأ هتبدأ تحقّق فيه.'),caption:w('Chapter 2 remains locked until review','الفصل ٢ يفضل مقفول لحد المراجعة')},
] } satisfies CinematicChapter;
