# تقرير العمل الكامل — Debit & Credit

**المنتج:** Debit & Credit — by Money Coder  
**الشركة داخل اللعبة:** Mizan Trading  
**المستودع:** [AhmedMohamed500/Debit-Credit](https://github.com/AhmedMohamed500/Debit-Credit)  
**فرع المراجعة:** `codex/first-day-cinematic`  
**Pull Request:** [PR #1](https://github.com/AhmedMohamed500/Debit-Credit/pull/1)  
**آخر commit وظيفي موثق:** `4260e5e` — `fix: make accounting manual responsive across laptop sizes`  
**تاريخ التقرير:** 9 سبتمبر 2026

## 1. النتيجة الحالية

تم تحويل بداية المنتج إلى تجربة محاسبة مهنية داخل عالم لعبة، والتركيز على جزأين مترابطين:

1. **Chapter 1 — First Day / First Shift:** وردية محاسبية سينمائية قابلة للعب داخل مكتب Mizan Trading.
2. **Nature of Accounts / طبيعة الحسابات:** مرجع محاسبي تفاعلي داخل اللعبة، مصمم ككتاب حقيقي فوق مكتب المدير المالي.

لا يزال PR #1 مفتوحًا للمراجعة، ولم تُدمج التغييرات في `main`. لم يبدأ تنفيذ Chapter 2، ولم يتم توسيع Arena أو Career أو Companies أو Skills ضمن هذا العمل.

## 2. اتجاه المنتج

المنتج الحالي مبني ليشعر اللاعب أنه يعمل داخل شركة حقيقية ويتخذ قرارات محاسبية تؤثر في دفاترها. الواجهة لا تعتمد على شكل LMS أو Dashboard تقليدي، ولا تمنح أرقام XP لمجرد فتح معلومات تعليمية.

حلقة اللعب الأساسية:

`Inspect → Build Entry → Consequence → Return to Desk`

ويظل المرجع المحاسبي أداة مساعدة يمكن فتحها من داخل الوردية دون فقد مسودة القيد.

## 3. Chapter 1 — First Shift

### المشهد

- مكتب محاسبي يملأ الشاشة بدل توزيع البطاقات التقليدي.
- أ/ كريم، المدير المالي، شخصية متكررة داخل القصة.
- تعليمات وحوار داخل عالم اللعبة.
- Laptop يعمل كنظام `Mizan OS` ويعرض المهمة، الوارد، حالة المستندات والتقدم.
- دفتر يومية، دفتر أستاذ، آلة حاسبة، Inbox وProcessed Tray كعناصر تفاعلية فعلية.
- دعم العربية RTL والإنجليزية LTR.
- تصميم مستقل للهاتف عند عرض 390px.

### المستندات المحاسبية

| المستند | القيد الصحيح | المبلغ |
| --- | --- | ---: |
| Supplier Invoice | Dr Office Equipment / Cr Accounts Payable | EGP 100,000 |
| Customer Receipt | Dr Bank / Cr Accounts Receivable | EGP 75,000 |
| Office Expense | Dr Office Supplies Expense / Cr Cash | EGP 2,500 |

### التفاعل المحاسبي

- فتح المستند وفحص المصدر والغرض والتاريخ والمبلغ وطريقة السداد.
- اختيار حسابين حقيقيين.
- تحديد Debit أو Credit لكل سطر.
- إدخال المبلغ ومقارنة إجمالي المدين والدائن.
- Feedback محاسبي عند الإجابة الصحيحة والخاطئة.
- الخطأ لا يرحّل قيدًا إلى الدفاتر.
- الإجابة الصحيحة تحدث أرصدة الشركة وتضيف القيد المقبول إلى اليومية.
- المستند المكتمل ينتقل بصريًا إلى Processed Tray.
- Pending Documents وPending Entries يتغيران من 3 إلى 2 ثم 1 ثم 0.

### المكافآت والنهاية

كل مستند يكتمل أول مرة يمنح:

- `+100 XP`
- `+50 Coins`

لا تتكرر المكافأة عند إعادة المستند المكتمل. بعد المستندات الثلاثة تعرض شاشة Shift Complete:

- 3/3 Documents.
- Accuracy.
- First-attempt completions.
- Hints used.
- إجمالي `+300 XP`.
- إجمالي `+150 Coins`.
- رد فعل أ/ كريم.
- Chapter 2 teaser مقفول.

### الحفظ

- التقدم، القيود المقبولة، الأخطاء، التلميحات والمكافآت محفوظة باستخدام `debit-credit-world-v2`.
- إعادة تحميل الصفحة لا تكرر الأثر المالي أو المكافأة.
- المستند المحدد يعود بعد إعادة التحميل.
- عند تعذر التخزين تظهر رسالة صريحة بدل ادعاء حفظ التقدم.

## 4. طبيعة الحسابات

### البيانات المحاسبية

مصدر البيانات المحاسبي لم يتغير خلال إعادة تصميم العرض. يحتوي الدليل على **197 حسابًا**:

| الفئة | عدد الحسابات | الطبيعة الأساسية |
| --- | ---: | --- |
| الأصول | 62 | مدينة |
| الالتزامات | 40 | دائنة |
| حقوق الملكية | 10 | دائنة |
| الإيرادات | 23 | دائنة |
| المصروفات والتكاليف | 54 | مدينة |
| الحسابات المقابلة | 8 | حسب الحساب المقابل |

كل حساب يحتفظ بالكود، الاسم العربي والإنجليزي، الفئة، الطبيعة، جهة الزيادة والنقص، تفسير الحركة، موضعه في القوائم المالية، المستندات المؤيدة، مثال القيد ومسار الدورة المستندية.

### العرض الحالي

- مكتب نهاري واضح بخلفية مدينة وخشب طبيعي.
- أ/ كريم مدمج بصريًا داخل المشهد.
- عنوان مدمج لطبيعة الحسابات.
- ستة محددات فئات ذات عمق ومنظور خفيف.
- كتاب حسابات واقعي بحواف ورق وتجليد كحلي وحلقات ذهبية.
- صفحة قائمة الحسابات على اليسار وصفحة تفاصيل الحساب على اليمين في سطح المكتب.
- اسم الحساب وطبيعته وحركة الزيادة والنقص والمستندات والقائمة المالية ومثال القيد ظاهرة بتسلسل قراءة واضح.
- البحث بالكود أو الاسم أو التصنيف.
- اختيار الفئة والحساب دون تغيير المحتوى المحاسبي.
- مسارات العربية والإنجليزية ومسارات التوافق القديمة مستمرة.

### الربط باللعبة

رابط «طبيعة الحسابات» ظاهر في:

- الشريط العلوي.
- مدخل Chapter 1.
- مكتب First Shift.
- نافذة المستند.
- شاشة بناء القيد.
- الشاشات القديمة التي تحتوي على روابط Accounting Manual.

يفتح المرجع من First Shift في تبويب مستقل. تم اختبار إدخال مبلغ `12345` في مسودة قيد، ثم فتح المرجع وتبديل اللغة والعودة؛ بقي المبلغ وحالة `debit-credit-world-v2` كما كانا.

### ملف الحسابات MD

- نسخة المستودع: [NATURE-OF-ACCOUNTS.md](NATURE-OF-ACCOUNTS.md).
- رابط الموقع: `/docs/nature-of-accounts.md`.
- الملف يولد من نفس مصدر بيانات اللعبة.
- يشمل الحسابات الـ197 وكل الحقول التعليمية المعتمدة.
- يوجد زر Download MD أعلى دليل طبيعة الحسابات.

## 5. Responsive

| المقاس | السلوك المختبر |
| --- | --- |
| 1920×1080 | كتاب صفحتين، التفاصيل الأساسية ومثال القيد ظاهرة داخل الشاشة |
| 1850×850 | الشريط والكتاب كاملان دون قطع أسفل الشاشة |
| 1366×768 | عنوان وفئات مدمجة والكتاب يستهلك الارتفاع المتبقي |
| 1024×768 | وضع تابلت بصفحة واحدة وفئات أفقية قابلة للتمرير |
| 390×844 | قائمة وتفاصيل منفصلتان مع تنقل واضح ودون تجاوز أفقي |

في الشاشات المكتبية القصيرة يتحرك المحتوى الطويل داخل ورق الكتاب بدل تمرير المشهد كله. عند فتح الدليل تعود الصفحة إلى الأعلى لمنع استعادة موضع تمرير سابق وإخفاء الشريط.

## 6. الصور

### First Shift

- [المكتب العربي](artifacts/first-shift-scene-desktop-ar.png)
- [المكتب الإنجليزي](artifacts/first-shift-scene-desktop-en.png)
- [فحص المستند](artifacts/first-shift-scene-document-ar.png)
- [الهاتف](artifacts/first-shift-scene-mobile-ar.png)
- [مستند الهاتف](artifacts/first-shift-scene-mobile-document-ar.png)
- [انتقال المستند المعالج](artifacts/first-shift-scene-processed-en.png)

### طبيعة الحسابات

- [العربية 1920×1080](artifacts/account-manual-desktop-ar.png)
- [الإنجليزية 1920×1080](artifacts/account-manual-desktop-en.png)
- [لابتوب 1850×850](artifacts/account-manual-laptop-ar.png)
- [لابتوب 1366×768](artifacts/account-manual-laptop-compact-ar.png)
- [تابلت 1024×768](artifacts/account-manual-tablet-ar.png)
- [تفاصيل الهاتف 390px](artifacts/account-manual-mobile-ar.png)
- [قائمة الهاتف](artifacts/account-manual-mobile-list-ar.png)
- [الرابط داخل اللعبة](artifacts/account-manual-game-access.png)
- [الرابط داخل لعبة الهاتف](artifacts/account-manual-game-mobile.png)

## 7. أهم الملفات

### First Shift

- `components/campaign/first-day-screen.tsx`
- `components/campaign/cinematic-chapter-intro.tsx`
- `app/first-shift-scene.css`
- `lib/campaign/first-day.ts`
- `lib/campaign/store.ts`
- `tests/campaign-ui.test.tsx`
- `tests/first-day.test.ts`
- `artifacts/verify-first-shift.mjs`

### طبيعة الحسابات

- `components/academy/account-guide.tsx`
- `app/accounting-manual.css`
- `data/account-learning-guide.ts`
- `app/[locale]/account-guide/page.tsx`
- `app/[locale]/academy/account-guide/page.tsx`
- `app/[locale]/arena/account-guide/page.tsx`
- `lib/account-manual-markdown.ts`
- `app/docs/nature-of-accounts.md/route.ts`
- `tests/account-learning-guide.test.ts`
- `tests/account-manual-markdown.test.ts`
- `tests/protected-account-nature.test.ts`
- `artifacts/verify-account-manual.mjs`

### الأصول البصرية

- `public/game/accounting-manual-office-v2.png`
- `public/game/accounting-manual-book.png`
- `public/game/first-shift-desk-v2.png`
- `public/game/first-day-cinematic.png`

## 8. التحقق النهائي

- **Vitest:** 182 اختبارًا ناجحًا في 23 ملفًا.
- **ESLint:** ناجح دون warnings.
- **TypeScript:** ناجح.
- **Next.js production build:** ناجح.
- **Browser UI verification:** ناجح للعربية والإنجليزية والبحث والفلاتر واختيار الحساب ومسارات التوافق وتنزيل MD والرجوع إلى مسودة اللعبة.
- **Responsive verification:** ناجح عند 1920×1080 و1850×850 و1366×768 و1024×768 و390×844.
- **390px horizontal overflow:** صفر.
- **Nature of Accounts protected regression:** ناجح بعد تحديث البصمات للتغييرات المقصودة في طبقة العرض فقط.

## 9. Git والـcommits الرئيسية

| Commit | الوصف |
| --- | --- |
| `f9b0fd2` | تحسين تفاعلات First Shift |
| `fd83195` | تحويل First Shift إلى مشهد مكتب سينمائي |
| `6351c10` | إعادة بناء First Shift كمكتب محاسبي قابل للعب |
| `1d582a4` | توثيق نشر First Shift والتحقق |
| `55dc688` | بناء طبيعة الحسابات كمرجع داخل اللعبة |
| `50437ea` | إعادة بناء المرجع ككتاب مادي داخل مكتب واقعي |
| `2b9107a` | توثيق نشر تصميم المرجع |
| `4260e5e` | إصلاح Responsive اللابتوب والتابلت |

## 10. GitHub وVercel

- GitHub: [https://github.com/AhmedMohamed500/Debit-Credit](https://github.com/AhmedMohamed500/Debit-Credit)
- PR المفتوح: [https://github.com/AhmedMohamed500/Debit-Credit/pull/1](https://github.com/AhmedMohamed500/Debit-Credit/pull/1)
- Vercel Preview: [https://debit-credit-3nur4qqsb-ahmed-mohameds-projects-c51bc2cc.vercel.app](https://debit-credit-3nur4qqsb-ahmed-mohameds-projects-c51bc2cc.vercel.app)
- First Shift عربي: [فتح اللعبة](https://debit-credit-3nur4qqsb-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar)
- First Shift English: [Open game](https://debit-credit-3nur4qqsb-ahmed-mohameds-projects-c51bc2cc.vercel.app/en)
- طبيعة الحسابات عربي: [فتح المرجع](https://debit-credit-3nur4qqsb-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar/account-guide)
- Nature of Accounts English: [Open manual](https://debit-credit-3nur4qqsb-ahmed-mohameds-projects-c51bc2cc.vercel.app/en/account-guide)
- تنزيل MD: [nature-of-accounts.md](https://debit-credit-3nur4qqsb-ahmed-mohameds-projects-c51bc2cc.vercel.app/docs/nature-of-accounts.md)

Vercel Preview قد يطلب تسجيل الدخول بسبب إعداد Deployment Protection في المشروع. النشر الحالي خاص بفرع المراجعة، ورابط Production لم يتغير.

## 11. الحالة قبل الخطوة التالية

- Chapter 1 ومرجع طبيعة الحسابات موجودان على فرع المراجعة.
- PR #1 ما زال Open.
- لم يتم الدمج في `main`.
- لم يبدأ Chapter 2.
- بيانات طبيعة الحسابات وقواعدها لم تتغير.
- آخر working tree تم التحقق منه نظيف قبل إنشاء هذا التقرير.
- أي توسع جديد يبدأ بعد مراجعة واعتماد الشاشة الحالية.
