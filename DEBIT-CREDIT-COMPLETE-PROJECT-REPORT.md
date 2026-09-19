# تقرير مشروع Debit & Credit الشامل

## 1. هوية المشروع والتسليم الحالي

| البند | القيمة |
| --- | --- |
| المنتج | Debit & Credit — by Money Coder |
| عالم المحاكاة الرئيسي | Mizan Trading |
| المستودع | `AhmedMohamed500/Debit-Credit` |
| فرع المراجعة | `codex/career-league` |
| Pull Request | [PR #4 — Career League](https://github.com/AhmedMohamed500/Debit-Credit/pull/4) |
| قاعدة PR الحالية | `codex/gamified-academy-platform` |
| رابط العربية | [Vercel Arabic Preview](https://debit-credit-git-codex-f76031-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar) |
| رابط الإنجليزية | [Vercel English Preview](https://debit-credit-git-codex-f76031-ahmed-mohameds-projects-c51bc2cc.vercel.app/en) |
| نوع التطبيق | Frontend-only |
| التخزين | Browser Local Storage عبر repositories ذات إصدارات |
| التقنيات | Next.js 16، React 19، TypeScript، Vitest، Testing Library |

المشروع لعبة مسار مهني محاسبي ثنائية اللغة. يتعلم اللاعب من خلال العمل داخل شركات محاكاة، ثم تتحول القرارات المقبولة إلى أداء قابل للتفسير، وأدلة مهنية محلية، وSkill Passport، وCareer Gap، وATS CV محافظ في ادعاءاته.

## 2. ما اسم الجزء الظاهر في الصورة؟

الجزء الظاهر في الصورة اسمه داخل المنتج:

**First Shift — أول وردية محاسبية**

وهو تجربة المكتب السينمائية في **Mizan Trading** داخل **Chapter 1 / First Day**. الاسم التقني للمكوّن الرئيسي هو:

`FirstDayScreen`

المسار:

```text
/ar/game/first-shift
/en/game/first-shift
```

السلسلة البرمجية التي تفتح الشاشة:

```text
app/[locale]/game/first-shift/page.tsx
→ GameApp view="office"
→ FirstDayScreen
→ FirstDayCaseWorkbench عند فتح مستند
```

### ملفات First Shift الأساسية

| الملف | المسؤولية |
| --- | --- |
| `app/[locale]/game/first-shift/page.tsx` | Route المحلي للشاشة |
| `components/campaign/game-app.tsx` | يوجه office view إلى FirstDayScreen |
| `components/campaign/first-day-screen.tsx` | المكتب، اللابتوب، المستندات، المدير، الأدراج، الأدوات وحالة الشركة |
| `components/campaign/first-day-case-workbench.tsx` | فحص الأدلة، قرار العمل، بناء القيد، النتيجة وأثر الشركة |
| `lib/campaign/first-day.ts` | المستندات الثلاثة، التقدم، المسودات، المكافآت وأرصدة الشركة |
| `lib/campaign/first-day-story.ts` | المقدمة السينمائية وشخصيات القصة |
| `lib/cases/first-shift-cases.ts` | تعريف الحالات والأدلة والقرارات المهنية |
| `lib/cases/engine.ts` | أحداث المحاولة وفحص الأدلة وقرارات الحالة |
| `lib/cases/performance.ts` | Accuracy، Investigation، Judgment، Risk Awareness والاستقلالية |
| `lib/campaign/store.ts` | حفظ الحالة تحت `debit-credit-world-v2` |
| `app/first-shift-scene.css` | المشهد المكتبي الحالي والـresponsive |
| `app/first-day.css` | تفاصيل التفاعل والانتقالات والمستندات |
| `tests/campaign-ui.test.tsx` | رحلة First Shift الكاملة وRTL والمسودات والقيود |
| `tests/first-day.test.ts` | منطق المستندات والمكافآت والأرصدة |
| `tests/casework.test.ts` | أحداث الحالات والأداء والمخاطر |

الحالة الظاهرة في الصورة هي تقدم `1/3`: تمت معالجة مصروف المكتب، وبقيت فاتورة المورد وسند قبض العميل. المكتب يعرض مستندين معلقين، مستندًا في Processed Tray، دفتر اليومية، دفتر الأستاذ، الآلة الحاسبة، Mizan OS، رسالة أ/ كريم، حالة الدفاتر وأرصدة الصندوق والبنك المشتقة من القيود المقبولة.

## 3. الرؤية الأساسية

التجربة المستهدفة هي:

> أنا أعمل كمحاسب داخل Mizan Trading، أفحص مستندات وأتخذ قرارًا وأشاهد أثره.

وليست:

> أنا أحل أسئلة محاسبة للحصول على XP.

الدورة الرئيسية:

```text
CURRENT LEVEL
→ TARGET ROLE
→ SKILL GAP
→ CAREER MISSION
→ REALISTIC ACCOUNTING WORK
→ DECISION
→ CONSEQUENCE
→ PERFORMANCE
→ EVIDENCE
→ SKILL PASSPORT
→ CAREER PROFILE
→ ATS CV
→ PROMOTION
→ NEXT RESPONSIBILITY
```

XP وCoins عناصر تقدم لعب فقط. لا يمثلان دليلًا مهنيًا ولا يفتحان ترقية مهنية وحدهما.

## 4. المعمارية التقنية

- Next.js App Router بمسارات محلية تبدأ بـ`/ar` أو`/en`.
- React Client Components للتفاعلات وحفظ حالة المتصفح.
- TypeScript للنماذج، المحركات، المحتوى والمستودعات.
- محركات accounting وcases وcareer مستقلة عن واجهة العرض.
- repositories مركزية تمنع توزيع استدعاءات Local Storage داخل المكونات الجديدة.
- حفظ متوافق مع الحالات القديمة عن طريق migrations دفاعية.
- لا يوجد Backend أو Firebase أو Supabase أو API مدفوع أو بوابة دفع.
- واجهات Remote مستقبلية موجودة كعقود فقط ولا تنفذ اتصالًا خارجيًا.

## 5. رحلة المستخدم الحالية

### Landing Page

تشرح الوعد المهني، عالم الشركات، المسارات الثلاثة، طريقة اللعب، First Shift، المنافسة المحلية، الأدلة، Skill Passport، Career Gap وAuto CV. التفاصيل موجودة في `docs/CAREER-LEAGUE-LANDING-PAGE.md`.

### Onboarding والشخصيات

الشخصيات:

1. Accounting Student.
2. Fresh Graduate.
3. Working Accountant.

اختيار الشخصية لا يمنح أي مهارة أو دليل. الطالب يبدأ من Bootcamp أو Placement، الخريج يبدأ من Practical Placement، والمحاسب العامل يبدأ Career Diagnostic.

### Accounting Bootcamp

عشر محطات قابلة للعب:

1. What Is a Business?
2. Why Accounting Exists.
3. What Is a Transaction?
4. Accounting Equation.
5. Account City.
6. Increase / Decrease.
7. Debit & Credit.
8. Accounting Documents.
9. First Journal Idea.
10. Boss: Start Mizan Trading.

الـBootcamp ممارسة تأسيسية ولا ينشئ professional evidence أو Verified.

### Account City

مدينة الحسابات هي الواجهة الحالية لطبيعة الحسابات. تستخدم قاعدة البيانات المحمية المكونة من 197 حسابًا دون تغييرها. تضم ست مناطق: Assets، Liabilities، Equity، Revenue، Expenses وContra Accounts، مع البحث والاستكشاف ومهمات ممارسة لا تمنح دليلًا مهنيًا.

### Mizan Trading وFirst Shift

اللاعب ينفذ ثلاثة ملفات عمل:

| المستند | القيد الصحيح |
| --- | --- |
| Supplier Invoice | Dr Office Equipment / Cr Accounts Payable — EGP 100,000 |
| Customer Receipt | Dr Bank / Cr Accounts Receivable — EGP 75,000 |
| Office Expense | Dr Office Supplies Expense / Cr Cash — EGP 2,500 |

المسار داخل كل ملف:

```text
Inspect Evidence → Choose Professional Action → Build Entry → Consequence → Return to Desk
```

المستند الصحيح ينتقل فعليًا إلى Processed Tray. المكافأة لا تتكرر عند الإعادة. الأخطاء والمسودات والمساعدة والتقدم محفوظة.

## 6. Gameplay Phase B ومحرك الحالات

First Shift يستخدم Accounting Case قابلًا لإعادة الاستخدام، مع:

- Case ID وVersion ثابتين.
- Attempt ID مستقل.
- Source document وSupporting evidence.
- Actions مثل Post، Hold، Request Information، Investigate وEscalate.
- أحداث لكل فحص أو قرار أو محاولة ترحيل.
- Accepted journal state منفصل عن المسودة الخاطئة.
- نتائج عمل ومحاسبة قابلة للتفسير.
- منع تكرار أثر القيد أو المكافأة.

Risk Awareness لا يزيد بسبب محاولة ترحيل غير آمنة تم حظرها. اللاعب الحريص الذي يفحص الأدلة أو يكتشف الفرق أو يختار Hold بطريقة مناسبة يحصل على نتيجة مساوية أو أفضل من اللاعب المتسرع.

## 7. المحاسبة وحماية الدفاتر

- القيود المقبولة وحدها تغيّر الأرصدة.
- المسودة الخاطئة لا تكتب في الدفاتر بصمت.
- كل قيد يجب أن يكون متوازنًا.
- الترحيل المكرر لا يكرر الأثر المالي.
- Journal، Ledger، Trial Balance وFinancial Statements تستمد بياناتها من الحالة المحاسبية المقبولة.
- قاعدة Nature of Accounts المحمية لم يتم تعديلها في هذه المرحلة.
- اختبار fingerprint يحمي مصدر الحسابات والواجهة الفعالة.

## 8. Career League

Career League يحول التعلم إلى مسار وظيفي داخل المحاكاة:

- Career Simulation Job Market.
- Target Role.
- Career Gap.
- Train For This Job.
- Company Ladder.
- Placement وCareer Diagnostic.
- Promotion Assessment.
- Corporate Bridge.
- Local/Demo League.

كل الشركات والفرص الوظيفية خيالية ومعلّمة بأنها Simulation. لا توجد وظائف حقيقية أو حسابات أصحاب عمل أو ضمان توظيف.

## 9. مستويات المسؤولية المهنية

| المستوى | مستوى المحاكاة | المسؤولية الرئيسية |
| --- | --- | --- |
| 0 | Accounting Beginner | Understand |
| 1 | Accounting Student | Record |
| 2 | Graduate / Trainee | Process |
| 3 | Junior Accountant | Process and Investigate |
| 4 | Functional Accountant | Reconcile and Own Process |
| 5 | General / GL Accountant | Review and Close |
| 6 | Senior Accountant | Review Others and Control |
| 7 | Chief Accountant / Supervisor | Manage Accounting Control |
| 8 | Finance Manager | Analyze, Manage and Decide |

هذه مستويات تقدم داخل اللعبة وليست منحًا تلقائيًا لمسميات وظيفية حقيقية.

## 10. محرك المحتوى والمنهج

الحالات المهنية تفهرس حسب المسؤولية، الشخصية، مستوى الشركة، التخصص، المتطلبات، المهارات، قاعدة الدليل، صلة الوظيفة، أثر الـCV وحالة المراجعة.

الحالات المعتمدة فقط تدخل اللعب المؤهل. Review Required تظهر كمعاينة، وDraft لا ينتج دليلًا أو نتيجة منافسة. التكرار لا يسمح بجمع مكافآت أو أدلة بلا حدود.

المنهج الرئيسي في `docs/COMPLETE-ACCOUNTING-CAREER-CURRICULUM.md` يغطي 53 وحدة، من Business Basics وAccounting Equation إلى GL، Month-End، Controls، FP&A، ERP، Automation، AI in Finance، Leadership، IFRS وCertification Preparation.

## 11. تقدم Mizan والحالات المترابطة

```text
First Shift
→ Supplier Control + Customer Control
→ Bank Control
→ Close Readiness
```

النتائج تنتقل بين المهمات. مشكلة مورد أو عميل غير محلولة تصبح blocker في البنك أو الإقفال. الفتح يعتمد على المهمة والأدلة والتقييم، وليس XP.

## 12. Skill Passport والأدلة

حالات المهارة:

```text
Unassessed → Practiced → Demonstrated → Verified
```

- First Shift تمهيدي، لذلك الحالة البسيطة الموجهة تبقى Practiced.
- Demonstrated يحتاج نتيجة صحيحة، تحقيقًا كافيًا، مساعدة محدودة وأدلة أقوى أو متكررة.
- كل تفسير يحتفظ بمصدر الحالة، عدد المحاولات، مساعدة المدير والمستندات المفحوصة.
- Verified مستحيل من اللعب المحلي العادي.
- الأدلة التاريخية تبقى مقروءة ولا يتم خفضها بشكل مدمر.

## 13. Player Profile وCareer Gap

الملف المهني يفصل بين:

- الهوية المهنية المبنية على الدليل.
- تقدم اللعبة مثل XP وCoins.
- الخبرة الحقيقية التي يدخلها المستخدم.
- عمل Mizan Trading الذي يظهر دائمًا كمحاكاة.

Career Gap يقارن Skill Passport بالدور المستهدف، ويحوّل المهارة الناقصة إلى خطة تدريب. اختيار الوظيفة لا يمنح المهارة.

## 14. ATS CV

الـAuto CV يبنى فقط من دليل منظم أو خبرة حقيقية أدخلها المستخدم. يدعم ترتيبًا مختلفًا لأدوار Junior، General، AP، AR، Treasury، GL، Cost Accountant وJunior Auditor دون تغيير الحقائق.

الوظائف الحالية:

- منع bullets المتكررة.
- إبقاء Mizan Trading تحت Accounting Career Simulation.
- Plain Text CV.
- JSON Export.
- Print / Save PDF.
- ATS Format Check داخلي واضح أنه ليس ATS Score.
- CV Version History محلي مع What Changed.

## 15. المنافسة المحلية وMulti Profiles

المحرك يدعم:

- إنشاء وتبديل ملفات محلية.
- عزل حالة كل لاعب.
- ترحيل اللاعب القديم إلى Default Local Profile.
- Profile export/import.
- Daily Challenge ببذرة deterministic.
- Challenge ID وVersion.
- Local Duel لنفس التحدي والإصدار.
- Offline Result Package مع checksum.
- Weekly League مقسمة بعدالة حسب المستوى والشخصية.

لا توجد منافسة عالمية حية أو عدد لاعبين متصلين أو حماية خادم من الغش. النتائج المحلية قابلة للتعديل، لذلك تظل Unverified.

## 16. الشركات والتقدم المستقبلي

| Tier | الشركة | المسؤولية | الحالة |
| --- | --- | --- | --- |
| 1 | Mizan Trading | Understand and Process | العالم الحالي المنفذ |
| 2 | Delta Commerce | Own Structured Processes | Architecture-ready |
| 3 | Horizon Industries | Close and Control | Architecture-ready |
| 4 | Orbit Regional Group | Review and Report | Planned |
| 5 | Atlas Global Simulation | Corporate/Global Simulation | Planned |

المستويات تزيد التعقيد والغموض والرقابة والمستندات الإنجليزية ومسؤولية المراجعة وضغط المواعيد، ولا تستخدم الشركات كصور مختلفة للمحتوى نفسه.

## 17. Corporate Bridge

المسار موجه للمحاسب الذي ينتقل من شركة صغيرة إلى بيئة Corporate. Week 1 وWeek 2 معرفان كمحتوى foundation معتمد للـAP المنظم والمطابقة والتسويات. Weeks 3–5 الخاصة بالتسويات والإقفال والتقارير والمراجعة وERP مخططة ومقفولة.

الواجهة الحالية Vertical Slice وليست 90 يومًا كاملًا قابلًا للعب.

## 18. Month-End

محرك Closing Week يعرف ثمانية workstreams:

1. Bank Reconciliation.
2. AP Review.
3. AR Review.
4. Accruals.
5. Prepayments.
6. Fixed Assets.
7. Adjusting Entries.
8. Trial Balance Review.

كل workstream يحدد الأدلة المطلوبة وحالته الحرجة. النتيجة تكون `CLOSE BLOCKED` مع أي عنصر غير محلول، أو `MONTH CLOSED` عند اكتمال الملف. Chapter 2 المرئي ما زال مقفولًا حتى يكتمل المحتوى القابل للعب والمراجعة المهنية.

## 19. Accounting Standards وIFRS

يوجد Roadmap معماري لـConceptual Framework، Presentation، Recognition/Measurement، Disclosure وSelected Standards. لا توجد Professional Assessment معتمدة حاليًا.

أي محتوى Standards يحتاج:

- مرجعًا رسميًا.
- Effective version.
- Review state.
- Review date.
- اعتمادًا صريحًا قبل استخدامه في professional evidence.

## 20. Certification Preparation

المسارات المخططة:

- CMA Preparation.
- ACCA-related Preparation.
- DipIFR Preparation.
- CPA-style Knowledge Preparation.

كلها Preparation/Readiness/Practice Tracks فقط. المشروع لا يدعي اعتمادًا أو شراكة أو شهادة رسمية.

## 21. أهم المسارات الحالية

| المسار | الوظيفة |
| --- | --- |
| `/[locale]` | Landing Page |
| `/[locale]/onboarding` | اختيار الشخصية والبداية |
| `/[locale]/bootcamp` | Accounting Bootcamp |
| `/[locale]/account-guide` | Account City / Nature of Accounts |
| `/[locale]/game` | Mizan Trading Game Hub أو Beginner Career World |
| `/[locale]/game/first-shift` | First Shift الظاهر في الصورة |
| `/[locale]/game/suppliers` | Supplier work foundation |
| `/[locale]/game/customers` | Customer work foundation |
| `/[locale]/game/bank` | Bank work foundation |
| `/[locale]/game/month-end` | Month-End locked route |
| `/[locale]/journal` | Journal |
| `/[locale]/ledger` | Ledger |
| `/[locale]/trial-balance` | Trial Balance |
| `/[locale]/financial-statements` | Financial Statements |
| `/[locale]/career-league/placement` | Placement / Career Diagnostic |
| `/[locale]/career-league/jobs` | Simulation Job Market |
| `/[locale]/career-league/gap` | Career Gap |
| `/[locale]/career-league/companies` | Company Ladder |
| `/[locale]/career-league/promotion` | Promotion Assessment |
| `/[locale]/career-league/corporate-bridge` | Corporate Bridge |
| `/[locale]/career-profile` | Professional Profile |
| `/[locale]/career-profile/skills` | Skill Passport |
| `/[locale]/career-profile/cv` | ATS CV |
| `/[locale]/leaderboard` | Local/Demo League |

## 22. التخزين والتوافق

أهم المخازن الحالية:

- `debit-credit-world-v2`: اللعبة وFirst Shift والقيود والأرصدة.
- `debit-credit-career-league-v1`: الشخصية والهدف والتقييمات المهنية.
- `debit-credit-bootcamp-v1`: تقدم Bootcamp.
- `debit-credit-placement-v1`: Placement وCareer Diagnostic.
- `debit-credit-career-content-v1`: محاولات المحتوى المهني.
- Company Progression repository.
- Local Competition multi-profile repository.
- Career Profile، CV preferences وCV history repositories.
- مخازن Academy، Missions، Detective، Money Flow وArena القديمة ما زالت مدعومة.

المهاجرات تحافظ على المستخدم الحالي ولا تحذف First Shift أو Skill Passport أو Academy أو CV أو الأدلة السابقة.

## 23. Remote-ready interfaces

العقود التالية موجودة بلا تنفيذ remote:

- `RemoteAuthRepository`.
- `RemoteCompetitionRepository`.
- `RemoteLeaderboardRepository`.
- `RemoteProfileRepository`.
- `RemoteEmployerRepository`.
- `VerifiedAssessmentRepository`.
- `RemoteCVSyncRepository`.

وجود هذه العقود لا يعني وجود Backend أو مزامنة أو مستخدمين حقيقيين.

## 24. العربية والإنجليزية والـResponsive

- العربية RTL والإنجليزية LTR.
- النصوص الأساسية محلية وليست ترجمة آلية وقت التشغيل.
- روابط اللغة تحافظ على الوجهة المناسبة.
- الواجهات الأساسية مدعومة على Desktop وMobile.
- فحوصات العرض شملت 1920×1080 و1440×900 و1366×768 و430×932 و390×844 عبر مراحل المشروع.
- آخر smoke check سجل صفر overflow عند 1440×900 و390×844.
- تم إصلاح Hydration mismatch الخاص بتحميل Persona المحفوظة في Placement.
- توجد focus states وبدائل click/tap وتقليل حركة عند `prefers-reduced-motion`.

## 25. الاختبارات والجودة

آخر بوابة كاملة:

```text
npm run check
```

النتيجة:

- ESLint: Passed، صفر warnings.
- TypeScript: Passed.
- Vitest: 330/330 tests.
- Test files: 47/47.
- Next.js production build: Passed.

التغطية تشمل المحاسبة، First Shift، المحاولات، المسودات، المكافآت، Risk Awareness، Skill Passport، CV، Bootcamp، Account City، Placement، Career League، الشركات، الحالات المترابطة، المنافسة المحلية، التخزين، migrations، RTL/LTR وحماية Nature of Accounts.

## 26. الصور وملفات المراجعة

| النظام | المسار |
| --- | --- |
| Account City | `artifacts/account-city/` |
| First Shift | `artifacts/first-shift-*.png` |
| Gameplay Phase B | `artifacts/gameplay-phase-b-*.png` |
| Career League | `artifacts/career-league/` |
| Career Profile وCV | `artifacts/career-profile-*.png` |
| Game Hub | `artifacts/game-hub-fix/` |
| Skill Passport وLeaderboard وAuto CV | `artifacts/gamified-academy-platform/` |

الصورة المشار إليها تمثل First Shift desktop scene، وهي نفس عائلة الصور الموجودة في `artifacts/first-shift-scene-*.png` و`artifacts/gameplay-phase-b-*.png`.

## 27. دليل التوثيق

- `COMPLETE-CAREER-GAME-IMPLEMENTATION-REPORT.md`: تقرير تنفيذ Career Game الحالي.
- `docs/COMPLETE-ACCOUNTING-CAREER-CURRICULUM.md`: المنهج الكامل من Level 0 إلى Level 8.
- `docs/CAREER-LEAGUE-LANDING-PAGE.md`: تقرير Landing Page.
- `docs/ACCOUNTING-BOOTCAMP.md`: Bootcamp.
- `docs/ACCOUNT-CITY.md`: Account City.
- `docs/GAMEPLAY-PHASE-B.md`: First Shift Case Architecture.
- `docs/PERSONA-PLACEMENT-SYSTEM.md`: الشخصيات والتحديد.
- `docs/CAREER-CONTENT-ENGINE.md`: محرك المحتوى.
- `docs/CAREER-MISSION-PROGRESSION.md`: ترابط المهمات.
- `docs/LOCAL-COMPETITION-PREVIEW.md`: المنافسة المحلية.
- `docs/MULTI-PROFILE-ARCHITECTURE.md`: ملفات اللاعبين.
- `docs/PLAYER-PROFILE-SYSTEM.md`: Player Profile.
- `docs/ATS-CV-ENGINE.md`: ATS CV.
- `docs/CORPORATE-BRIDGE.md`: Corporate Bridge.
- `docs/MONTH-END-CAREER-CHAPTER.md`: Month-End.
- `docs/ADVANCED-COMPANY-PROGRESSION.md`: مستويات الشركات.
- `docs/ACCOUNTING-STANDARDS-ROADMAP.md`: Standards وIFRS.
- `docs/CERTIFICATION-PREPARATION-ROADMAP.md`: certification tracks.

## 28. الحالة الحقيقية للمنتج

### منفذ وقابل للعب

- Landing Page.
- Onboarding.
- Accounting Bootcamp.
- Account City.
- Mizan Trading Game Hub.
- First Shift / Gameplay Phase B.
- Placement وCareer Diagnostic UI.
- Career League routes الحالية.
- Career Profile وSkill Passport وCareer Gap وATS CV.
- Journal، Ledger، Trial Balance، Financial Statements وأدوات التدريب السابقة.

### Foundations منفذة

- Professional levels 0–8 engine.
- Representative career case bank.
- Mizan progression.
- Connected consequences.
- Multi-profile/offline competition engine.
- Corporate Bridge weeks.
- Month-End orchestration.
- Advanced company metadata.

### Demo أو Local فقط

- Leaderboard والمنافسة.
- Employer preview.
- Placement results.
- Evidence export.

### مقفول أو يحتاج مراجعة

- Chapter 2 visual gameplay.
- Full Month-End workpapers.
- Advanced company case worlds.
- Professional IFRS assessments.
- Certification tracks.

### مخطط

- مكتبة حالات إنتاجية كاملة لكل مستويات 2–8.
- Finance Command Center.
- Cost/Management Accounting worlds.
- FP&A، Power BI، ERP، Automation وAI in Finance gameplay.
- Backend authoritative competition.
- حسابات المستخدمين والمزامنة.
- أصحاب العمل والفرص الحقيقية بعد الموافقات والخصوصية.

## 29. القيود المعروفة

- التخزين المحلي قابل للتعديل، لذلك لا يصلح كـVerified evidence.
- لا يوجد Backend أو Login حقيقي أو مزامنة بين الأجهزة.
- لا توجد منافسة عالمية حية أو anti-cheat server.
- لا توجد حسابات شركات أو وظائف حقيقية أو ضمان توظيف.
- بعض محركات المستويات المتقدمة أوسع من الواجهات القابلة للعب حاليًا.
- DOCX للـCV غير منفذ؛ المتاح Print/PDF وPlain Text وJSON.
- Vercel Deployment Protection قد يطلب تسجيل الدخول لفتح Preview.

## 30. المرحلة التالية الموصى بها

قبل توسيع Standards أو Certifications، الأولوية هي تحويل أحد foundations إلى vertical slice مكتمل بصريًا ومهنيًا:

1. Supplier Reconciliation أوBank Reconciliation workpaper كامل.
2. ربطه بالحالة السابقة والنتيجة التالية.
3. تحديث Skill Passport وCareer Gap وATS CV من نفس evidence stream.
4. اختبار عربي/إنجليزي وموبايل.
5. بعدها فتح أول جزء حقيقي من Closing Week بدل فتح Chapter 2 شكليًا.

مرحلة Backend المستقبلية تبدأ بالمصادقة، ملفات remote، attempt ingestion موقّع، challenge versions على الخادم، anti-replay، consent-based sharing وسياسة مستقلة قبل السماح بحالة Verified.
