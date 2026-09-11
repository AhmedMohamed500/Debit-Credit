# التقرير الشامل للمشروع — Debit & Credit

**العلامة:** Debit & Credit — by Money Coder

**صاحب المشروع:** أحمد محمد

**عالم اللعبة الأساسي:** Mizan Trading

**المستودع:** [AhmedMohamed500/Debit-Credit](https://github.com/AhmedMohamed500/Debit-Credit)

**فرع المراجعة:** `codex/first-day-cinematic`

**Pull Request:** [PR #1](https://github.com/AhmedMohamed500/Debit-Credit/pull/1)

**الـcommit الذي بُني عليه التقرير:** `0bbaa1d013d5a6265188ba93a1dade3e4ed790ea`

**آخر commit وظيفي لـPhase A:** `b8bd85346a5631f82a63b15562657ef9a9a2e689`

**تاريخ التحديث:** 11 سبتمبر 2026

## 1. ملخص المنتج

Debit & Credit منصة محاسبة ثنائية اللغة مبنية كلعبة مهنية. التجربة الأساسية تضع اللاعب داخل شركة افتراضية، وتربط المستند المحاسبي بالقرار، ثم بالقيد، ثم بأثر واضح على دفاتر الشركة. الهدف الحالي أن يشعر اللاعب بأنه يؤدي عمل محاسب داخل قصة تقدم وظيفي، وليس أنه يتصفح LMS أو لوحة SaaS تحمل أرقام XP فقط.

وعد المنتج الحالي:

> اشتغل يوم محاسب داخل شركة افتراضية، افهم أثر قراراتك، واخرج بدليل يوضح المهارات التي مارستها.

المشروع Frontend فقط في وضعه الحالي. البيانات والتقدم والأدلة المهنية التجريبية محفوظة محليًا في المتصفح. لا يوجد Backend للتوظيف، أو حسابات حقيقية للشركات، أو تحقق خادمي من هوية اللاعب ونتائجه.

## 2. اتجاه المنتج وحدود النسخة الحالية

التركيز المعتمد حاليًا هو:

1. تثبيت **Chapter 1 — First Day / First Shift** كتجربة مكتب محاسبي سينمائية قابلة للعب.
2. توفير **Nature of Accounts** كمرجع محاسبي حي يمكن الرجوع إليه من داخل اللعبة.
3. ربط الأداء بطبقة مهنية محلية تشمل Career Profile وSkill Passport وCV تجريبي.
4. الحفاظ على العربية RTL والإنجليزية LTR وعلى تجربة هاتف حقيقية بدل تصغير سطح المكتب.

الحدود المهمة:

- Chapter 2 لم يبدأ، والـteaser الخاص به ما زال مقفولًا.
- `main` لم يُحدّث؛ العمل ما زال على فرع المراجعة وPR #1 مفتوح.
- نتائج Skill Passport محلية وتجريبية ولا تحمل صفة Verified.
- Employer Preview معاينة محلية وليست بوابة توظيف عامة.
- XP وCoins تخص اللعب ولا تدخل في السيرة الذاتية المهنية.
- الوحدات الأقدم مثل Academy وArena وCompanies موجودة في المستودع، لكنها ليست مركز اتجاه المنتج الحالي.

## 3. تجربة Chapter 1 — First Shift

### 3.1 المدخل السينمائي

يبدأ Chapter 1 بشاشة First Day تحافظ على الخلفية السينمائية والشخصية، وتعرض النصوص كتكوين DOM حي قابل للقراءة والتكبير. يتكون المدخل من:

- HUD مدمج يجمع شعار Debit & Credit واسم العالم والوردية واللغة ومرجع طبيعة الحسابات.
- رقم الفصل، عنوان اليوم الأول، وصف المهمة ووعد أثر القرار داخل كتلة قراءة واحدة.
- زر Start Story واضح داخل نفس مسار القراءة.
- تخطيط مستقل للهاتف يجعل الزر داخل الجزء المفيد من أول viewport.
- دعم `prefers-reduced-motion` ونص بديل عند غياب الوسائط.

### 3.2 مكتب Mizan Trading

بعد لقاء أ/ كريم يدخل اللاعب مكتبًا محاسبيًا تفاعليًا يملأ الشاشة، ويحتوي على:

- أ/ كريم بصفته المدير المالي والشخصية الموجهة داخل العالم.
- Laptop يعمل كنظام `Mizan OS` ويعرض تقدم الوردية وحالة المستندات.
- Inbox وProcessed Tray يتغيران وفق حالة العمل الفعلية.
- دفتر يومية ودفتر أستاذ وآلة حاسبة كأدوات مكتب قابلة للاستخدام.
- أرصدة الشركة وحالة الدفاتر وتقدم إقفال الشهر.
- تحكم هاتف لاختيار المستند السابق أو التالي، مع swipe وأدوات مخصصة للشاشة الصغيرة.

حلقة اللعب الأساسية:

`Inspect → Build Entry → Consequence → Return to Desk`

### 3.3 المستندات والقيود

| المستند | المدين | الدائن | المبلغ |
|---|---|---|---:|
| Supplier Invoice | Office Equipment | Accounts Payable | EGP 100,000 |
| Customer Receipt | Bank | Accounts Receivable | EGP 75,000 |
| Office Expense | Office Supplies Expense | Cash | EGP 2,500 |

كل مستند يعرض المصدر والجهة والتاريخ والمبلغ والبيانات المؤيدة. اللاعب يختار الحسابات، يحدد Debit/Credit، يدخل المبلغ ويراجع تساوي الطرفين. تساوي المدين والدائن وحده لا يكفي؛ يجب أن يطابق القيد المعنى المحاسبي المتوقع للمستند.

### 3.4 الأثر المحاسبي والمكافآت

- القرار الخاطئ يسجل محاولة تعلم ويعرض أثر الخطأ، لكنه لا يضيف قيدًا مقبولًا ولا يغير أرصدة الدفاتر المعتمدة.
- القرار الصحيح يضيف القيد إلى اليومية ويحدث أرصدة الشركة وينقل المستند بصريًا إلى Processed Tray.
- المستند الصحيح يمنح `+100 XP` و`+50 Coins` مرة واحدة.
- الإرسال المزدوج، إعادة التحميل أو callback مكرر لا ينشئ قيدًا أو مكافأة أو دليلًا ناجحًا ثانيًا.
- بعد المستندات الثلاثة تصبح المكافأة الكلية `+300 XP` و`+150 Coins`.

شاشة Shift Complete تعرض:

- `3/3 Documents`.
- Accuracy.
- First-attempt completions.
- Hints used.
- الأدلة المهنية التي أضيفت.
- رد أ/ كريم.
- Chapter 2 teaser مقفول.

### 3.5 الحفظ والاستئناف

- مسودة كل مستند محفوظة داخل حالة اللعبة الحالية.
- الحساب والطرف والمبلغ والتلميح يعودون بعد إغلاق المستند أو refresh.
- المستند المحدد والتقدم والقيود والأرصدة والمكافآت تبقى محفوظة.
- بيانات الحفظ القديمة التي لا تحتوي على حقول المسودات تُحمّل بقيم افتراضية متوافقة.
- JSON تالف ينتقل إلى جلسة آمنة تحمل تحذيرًا بدل إظهار reset صامت على أنه تحميل ناجح.
- فشل الكتابة إلى Local Storage يبقي الحالة في ذاكرة التبويب ويعرض تحذيرًا بأن إغلاق الصفحة قد يفقد التقدم.

## 4. Nature of Accounts — طبيعة الحسابات

### 4.1 المحتوى

الدليل يحتوي على **197 حسابًا** من مصدر بيانات واحد داخل المشروع:

| الفئة | العدد | الطبيعة العامة |
|---|---:|---|
| الأصول | 62 | مدينة |
| الالتزامات | 40 | دائنة |
| حقوق الملكية | 10 | دائنة |
| الإيرادات | 23 | دائنة |
| المصروفات والتكاليف | 54 | مدينة |
| الحسابات المقابلة | 8 | حسب الحساب الأصلي الذي تقابله |

كل حساب يتضمن:

- الكود والاسم العربي والإنجليزي.
- الفئة والطبيعة المعتادة.
- جهة الزيادة وجهة النقص وتفسير الحركة.
- موضع الحساب في القوائم المالية.
- المستندات المؤيدة.
- مثال قيد يومية.
- مساره في الدورة المستندية.

### 4.2 واجهة الدليل

يحافظ الدليل على فكرة الكتاب المفتوح داخل مكتب Mizan، مع إصلاح قابلية القراءة:

- Header مختصر للهوية والعودة والبحث واللغة وتنزيل MD.
- عنوان واضح وست فئات داخل selector موحد أقل تشبعًا وضوضاء.
- كتاب ذو ارتفاع مرن في document flow بدل إجباره داخل ارتفاع الشاشة.
- gutter مركزي حقيقي للحلقات الذهبية يمنع وضع النص أو الأزرار خلفها.
- صفحة للحسابات وصفحة لتفاصيل الحساب على سطح المكتب.
- قائمة داخلية قابلة للتمرير وصفوف أكثف مع نص مقروء وشريط تمرير ظاهر.
- شبكة ثابتة لعنوان الحساب والطبيعة وحركة الزيادة والنقص والمستندات والقوائم ومثال القيد.
- على الهاتف والتابلت تظهر صفحة واحدة في كل مرة مع تبويبي Accounts وAccount Behavior.
- البحث يعمل بالاسم والكود والتصنيف.

### 4.3 الربط باللعبة وملف MD

رابط طبيعة الحسابات متاح من:

- الشريط العلوي للموقع.
- HUD شاشة First Day.
- مكتب First Shift.
- نافذة فحص المستند وبناء القيد.
- الشاشات القديمة التي تحتوي على رابط Accounting Manual.

عند فتح الدليل من قيد جارٍ، يُفتح في تبويب مستقل ويحمل `return=first-day` وسياق المستند. الرجوع يغلق المرجع ويعيد اللاعب إلى القيد دون تغيير المسودة أو تخزين اللعبة.

- ملف المستودع الكامل: [NATURE-OF-ACCOUNTS.md](NATURE-OF-ACCOUNTS.md)
- رابط الموقع: `/docs/nature-of-accounts.md`
- الملف يولد من نفس بيانات الحسابات ويحتوي على 197 قسم حساب.
- زر Download MD موجود في أعلى الدليل.

## 5. Career Profile وSkill Passport

المشروع يحتوي على أساس مهني محلي منفصل عن إحصاءات اللعبة:

- إعداد ملف مهني اختياري: الاسم، العنوان المهني، الدور المستهدف، الموقع وبيانات التواصل والتعليم والخبرة واللغات وتفضيلات العمل.
- **19 مهارة محاسبية** داخل كتالوج مهني.
- **9 أدوار مستهدفة** تشمل Junior Accountant وGeneral Accountant وAP وAR وTreasury وCost وInventory وGL وJunior Auditor.
- Skill Passport يعرض الحالة، الأدلة، المساعدة، المحاولات والتغطية الناقصة.
- أدلة First Shift تربط كل مستند بالمهارات التي مارسها فعلًا.
- حالات المهارة: Unassessed وPracticed وDemonstrated، مع حجز Verified لمصدر تقييم موثوق مستقبلًا.
- دور واحد أو مستند واحد لا يمنح ادعاء إتقان واسع تلقائيًا.
- Auto CV موجه للدور ويعيد ترتيب الوقائع والمهارات الموجودة فقط.
- Print / Save PDF عبر المتصفح بتنسيق A4.
- Export CV Data بصيغة JSON مهيكلة.
- Employer Preview وTalent Profile معاينتان محليتان مع ضوابط خصوصية.

السيرة الذاتية تفصل بين الخبرة التي أدخلها المستخدم وبين محاكاة Mizan Trading، ولا تعرض XP أو Coins أو Streak أو Rank كإنجازات مهنية.

المسارات الأساسية:

- `/[locale]/career-profile`
- `/[locale]/career-profile/edit`
- `/[locale]/career-profile/skills`
- `/[locale]/career-profile/skills/[skillId]`
- `/[locale]/career-profile/cv`
- `/[locale]/career-profile/employer-preview`
- `/[locale]/talent/[slug]`

التفاصيل الفنية في [CAREER-PROFILE-SKILL-PASSPORT.md](CAREER-PROFILE-SKILL-PASSPORT.md).

## 6. الوحدات الداعمة الموجودة في المستودع

هذه الوحدات موجودة وتعمل ضمن البنية السابقة للمشروع، لكنها ليست نطاق التوسع الحالي:

| الوحدة | وظيفتها الحالية |
|---|---|
| Academy | دروس ودورات وتدريب محاسبي ثنائي اللغة. |
| Journal Practice | تمارين قيود يومية مع اختيار الحساب والطرف والمبلغ والتحقق من التوازن. |
| Money Flow | سيناريوهات بصرية توضح حركة الحسابات والأثر المالي. |
| Missions | حالات محاسبية مع تلميحات ومحاولات ونتائج محفوظة. |
| Accounting Detective | ملفات أدلة وملاحظات وروابط واستنتاجات لاكتشاف الأخطاء. |
| Arena | مهام وتحديات ومراحل وظيفية ولوحة ترتيب تجريبية محلية. |
| Learning Map | ثمانية مستويات تربط التعليم والتطبيق والمهمات بالتقدم الموحد القديم. |
| Companies | واجهات عرض وتجربة shortlist ببيانات تجريبية؛ ليست خدمة توظيف حقيقية. |
| Offline/PWA | Manifest وصفحة Offline وهوية تثبيت للمنتج. |

وجود هذه المسارات لا يعني أنها محور الإصدار الحالي أو أنها خدمات متصلة بخادم. بيانات المنافسين والشركات في الواجهات القديمة تجريبية ويجب أن تبقى معلّمة بذلك.

## 7. البنية التقنية

| الجزء | التقنية |
|---|---|
| Framework | Next.js 16.3.4 App Router |
| UI | React 19.1 + TypeScript |
| Styling | CSS مملوك للمشاهد والوحدات + Tailwind toolchain |
| Icons | Lucide React |
| Tests | Vitest + Testing Library |
| Browser QA | Playwright باستخدام runtime المحلي المتاح |
| Hosting | GitHub + Vercel Preview integration |
| Persistence | Browser Local Storage مع repositories محلية لبعض الوحدات |

المجلدات الرئيسية:

- `app/`: المسارات المحلية، الأنماط، metadata، sitemap وPWA.
- `components/`: مشاهد اللعبة والمرجع والملف المهني والوحدات الداعمة.
- `data/`: الحسابات والحالات والمهمات والمحتوى التعليمي.
- `lib/`: منطق المحاسبة واللعب والأدلة والتخزين والترحيل.
- `tests/`: اختبارات المنطق والواجهات والتخزين والانحدار.
- `artifacts/`: لقطات المتصفح وسكربتات وتقارير QA.
- `docs/`: تدقيقات وتقارير الإصدارات الحالية.

## 8. التخزين ومصادر الحقيقة

| المفتاح | الاستخدام |
|---|---|
| `debit-credit-world-v2` | حالة First Shift والعالم والقيود والأدلة والمكافآت. |
| `debit-credit-career-profile-v1` | بيانات الملف المهني الاختيارية. |
| `debit-credit-skill-evidence-v1` | أدلة Skill Passport المحلية. |
| `debit-credit-cv-preferences-v1` | تفضيلات السيرة والدور المستهدف. |
| `debit-credit-local-candidate-id-v1` | هوية محلية ثابتة للمعاينات. |
| `debit-credit-player-v1` | نموذج تقدم اللاعب في البنية السابقة. |
| `debit-credit-progress-v1` | تقدم Academy. |
| `debit-credit-money-flow-v1` | تقدم Money Flow. |
| `debit-credit-missions-v1` | تقدم Missions. |
| `debit-credit-detective-v1` | تقدم Detective. |
| `debit-credit-arena-v1` | نتائج Arena المحلية. |

يوجد ترحيل غير هدّام من مفاتيح FINORA التعليمية القديمة إلى مفاتيح Debit & Credit. الترحيل لا يقرأ أو يعدل بيانات تشغيل مالية خارج المحتوى التعليمي.

Local Storage مناسب للممارسة المحلية والـPreview، لكنه لا يثبت هوية المستخدم أو نزاهة النتيجة، ولا يتيح مشاركة موثوقة بين الأجهزة. أي نسخة توظيف حقيقية تحتاج حفظًا خادميًا وهوية وصلاحيات وعزل بيانات وإصدارات تقييم وسجل تدقيق.

## 9. العربية والإنجليزية والـResponsive

- العربية تستخدم RTL والإنجليزية LTR.
- الأكواد والمبالغ تحفظ اتجاهًا واضحًا داخل التخطيط المختلط.
- النصوص المحاسبية المهمة DOM حي وليست مطبوعة داخل صورة.
- First Shift على الهاتف يتبع: مستند ثم قيد ثم نتيجة.
- دليل الحسابات على الهاتف يعرض صفحة قائمة أو تفاصيل بدل ضغط كتاب صفحتين.
- الأزرار الأساسية ومناطق اللمس صممت حول 44px أو أكثر حيث يلزم.
- الحوارات تدعم Escape وحصر التركيز داخل النافذة.
- الحركة تحترم إعداد reduced motion.
- المقاسات التي تم قياسها في Phase A: 360 و390 و768 و1280 و1440، إضافة إلى 1906×890 و1877×953.
- كل هذه القياسات سجلت page-wide horizontal overflow بقيمة صفر، وCTA شاشة البداية كان ظاهرًا.

## 10. الجودة والتحقق الحالي

آخر تشغيل كامل لأمر المشروع `npm run check` نجح:

- **ESLint:** ناجح دون warnings.
- **TypeScript:** ناجح.
- **Vitest:** 25 ملف اختبار و**201 اختبارًا ناجحًا**.
- **Production build:** ناجح باستخدام Next.js 16.3.4.

التحقق بالمتصفح غطى:

- العربية والإنجليزية.
- إنهاء مستندات First Shift الثلاثة.
- رفض قيد متوازن لكنه غير صحيح دلاليًا ثم تصحيحه.
- بقاء المسودة بعد refresh.
- فتح المرجع أثناء القيد والعودة دون فقد البيانات.
- منع التكرار عند double submit.
- تحديث Processed Tray من 0 إلى 3.
- بقاء القيود والمكافآت بعد إعادة التحميل.
- البحث والفئات واختيار الحساب وتبويبات الهاتف في Nature of Accounts.
- تنزيل ملف طبيعة الحسابات MD.
- عدم وجود أخطاء JavaScript في رحلات QA المنفذة.

سكربتات التحقق المهمة:

- `artifacts/verify-first-shift.mjs`
- `artifacts/verify-account-manual.mjs`
- `artifacts/verify-phase-a.mjs`
- `artifacts/verify-career-profile.mjs`

## 11. الصور وأدلة المراجعة

### Phase A قبل وبعد

| الشاشة | قبل | بعد |
|---|---|---|
| طبيعة الحسابات 1906×890 | [قبل](artifacts/phase-a-before/nature-ar-1906x890.png) | [بعد](artifacts/phase-a-after/nature-ar-1906x890.png) |
| First Day 1877×953 | [قبل](artifacts/phase-a-before/first-day-intro-ar-1877x953.png) | [بعد](artifacts/phase-a-after/first-day-intro-ar-1877x953.png) |
| دليل الهاتف 390×844 | [قبل](artifacts/phase-a-before/manual-en-390.png) | [بعد](artifacts/phase-a-after/manual-en-390.png) |
| First Day هاتف 390×844 | [قبل](artifacts/phase-a-before/intro-ar-390.png) | [بعد](artifacts/phase-a-after/intro-ar-390.png) |

### لقطات First Shift

- [المكتب العربي](artifacts/first-shift-scene-desktop-ar.png)
- [المكتب الإنجليزي](artifacts/first-shift-scene-desktop-en.png)
- [فحص المستند](artifacts/first-shift-scene-document-ar.png)
- [الهاتف](artifacts/first-shift-scene-mobile-ar.png)
- [مستند الهاتف](artifacts/first-shift-scene-mobile-document-ar.png)
- [انتقال المستند المعالج](artifacts/first-shift-scene-processed-en.png)

### لقطات طبيعة الحسابات

- [العربية Desktop](artifacts/account-manual-desktop-ar.png)
- [الإنجليزية Desktop](artifacts/account-manual-desktop-en.png)
- [لابتوب 1366×768](artifacts/account-manual-laptop-compact-ar.png)
- [تابلت](artifacts/account-manual-tablet-ar.png)
- [قائمة الهاتف](artifacts/account-manual-mobile-list-ar.png)
- [تفاصيل الهاتف](artifacts/account-manual-mobile-ar.png)
- [الوصول من اللعبة](artifacts/account-manual-game-access.png)

التدقيق المفصل: [docs/UI-AUDIT.md](docs/UI-AUDIT.md)

تقرير Phase A: [docs/PHASE-A-RELEASE.md](docs/PHASE-A-RELEASE.md)

## 12. أهم الملفات حسب الوظيفة

### First Shift

- `components/campaign/cinematic-chapter-intro.tsx`
- `components/campaign/first-day-screen.tsx`
- `app/first-day-entry.css`
- `app/first-shift-scene.css`
- `lib/campaign/first-day.ts`
- `lib/campaign/first-day-story.ts`
- `lib/campaign/store.ts`
- `lib/campaign/director.ts`

### Nature of Accounts

- `components/academy/account-guide.tsx`
- `app/accounting-manual.css`
- `data/account-learning-guide.ts`
- `lib/account-manual-markdown.ts`
- `app/docs/nature-of-accounts.md/route.ts`
- `app/[locale]/account-guide/page.tsx`

### Career Profile

- `components/career/career-profile-app.tsx`
- `app/career-profile.css`
- `app/career-profile-documents.css`
- `lib/career/model.ts`
- `lib/career/catalog.ts`
- `lib/career/evidence.ts`
- `lib/career/cv.ts`
- `lib/career/repository.ts`

### الاختبارات المحورية

- `tests/first-day.test.ts`
- `tests/campaign-ui.test.tsx`
- `tests/campaign.test.ts`
- `tests/protected-account-nature.test.ts`
- `tests/account-learning-guide.test.ts`
- `tests/account-manual-markdown.test.ts`
- `tests/career-profile.test.ts`
- `tests/career-ui.test.tsx`
- `tests/accounting-core.test.ts`

## 13. التشغيل المحلي

```bash
npm install
npm run dev
```

ثم فتح:

- `http://localhost:3000/ar`
- `http://localhost:3000/en`
- `http://localhost:3000/ar/account-guide`

بوابة الجودة الكاملة:

```bash
npm run check
```

## 14. GitHub وVercel

- GitHub: [https://github.com/AhmedMohamed500/Debit-Credit](https://github.com/AhmedMohamed500/Debit-Credit)
- PR المفتوح: [https://github.com/AhmedMohamed500/Debit-Credit/pull/1](https://github.com/AhmedMohamed500/Debit-Credit/pull/1)
- آخر Preview ناجح قبل commit هذا التقرير: [Vercel Phase A Preview](https://debit-credit-8x37e8zkr-ahmed-mohameds-projects-c51bc2cc.vercel.app)
- العربية: [فتح اللعبة](https://debit-credit-8x37e8zkr-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar)
- الإنجليزية: [Open game](https://debit-credit-8x37e8zkr-ahmed-mohameds-projects-c51bc2cc.vercel.app/en)
- طبيعة الحسابات: [فتح المرجع](https://debit-credit-8x37e8zkr-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar/account-guide)
- Career Profile: [فتح الملف المهني](https://debit-credit-8x37e8zkr-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar/career-profile)

Vercel سجّل deployment ناجحًا للـHEAD `0bbaa1d013d5a6265188ba93a1dade3e4ed790ea`. الـPreview محمي بإعداد Vercel Authentication؛ الجلسات غير المسجلة تحوّل إلى Vercel SSO. تم التحقق من النشر عبر GitHub/Vercel status، بينما نُفذت رحلات الواجهة على نفس production build محليًا.

## 15. تاريخ التنفيذ المختصر

| Commit | العمل |
|---|---|
| `f9b0fd2` | تحسين تفاعلات First Shift الأولى. |
| `fd83195` | تحويل First Shift إلى مشهد مكتب سينمائي. |
| `6351c10` | بناء مكتب محاسبي قابل للعب. |
| `55dc688` | بناء Nature of Accounts كمرجع داخل اللعبة. |
| `50437ea` | تحويل المرجع إلى كتاب مادي داخل مكتب واقعي. |
| `4260e5e` | إصلاح Responsive سابق للمرجع. |
| `d48cd2e` | بناء Career Profile وSkill Passport foundation. |
| `b8bd853` | تثبيت Phase A: responsive، المسودات، idempotency والتخزين. |
| `aef3f94` | إضافة UI Audit وتقرير Phase A. |
| `0bbaa1d` | إضافة روابط تسليم Phase A. |

## 16. القيود والمخاطر المعروفة

- لا توجد هوية أو صلاحيات أو قاعدة بيانات خادمية.
- البيانات المحلية قد تضيع عند حذف بيانات المتصفح أو تغيير الجهاز.
- الروابط المهنية العامة ليست مشاركة فعلية متعددة الأجهزة.
- لا يجوز وصف الأدلة المحلية بأنها Verified أو استخدامها كقرار توظيف موثوق.
- شركات وLeaderboard في الوحدات السابقة بيانات Demo وليست مستخدمين أو جهات حقيقية.
- طباعة CV تعتمد على Print / Save PDF في المتصفح.
- اختبارات 200% text zoom ولوحة مفاتيح هاتف فعلية تحتاج جولة أجهزة مخصصة.
- ملفات الصور الأصلية المذكورة في خطة Phase A لم تكن متاحة أثناء التنفيذ؛ استُخدمت baseline runtime captures بنفس المسارات واللغات والأبعاد.

## 17. الحالة النهائية والخطوة التالية

Chapter 1 وNature of Accounts وCareer foundation موجودة على فرع المراجعة، والفحوص الحالية ناجحة. تجربة First Shift تستطيع الآن إنهاء المستندات الثلاثة مع حفظ المسودة ومنع تكرار الأثر المحاسبي، والمرجع قابل للقراءة على سطح المكتب والهاتف.

قبل أي توسع جديد يجب الحفاظ على هذه الضمانات وعدم بدء Chapter 2 دون اعتماد Chapter 1. الخطوة التالية المحددة في خطة التطوير هي Phase B الخاصة بأحداث المحاولات وإسقاط الأدلة بصورة أكثر صرامة، ثم مراجعة مستقلة قبل الدمج في `main`.
