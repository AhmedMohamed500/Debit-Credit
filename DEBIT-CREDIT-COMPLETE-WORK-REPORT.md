# التقرير الشامل للمشروع — Debit & Credit

**العلامة:** Debit & Credit — by Money Coder
**عالم اللعبة الأساسي:** Mizan Trading
**المستودع:** [AhmedMohamed500/Debit-Credit](https://github.com/AhmedMohamed500/Debit-Credit)
**فرع العمل الحالي:** `codex/gameplay-phase-b`
**Pull Request الحالي:** [PR #2 — Gameplay Phase B](https://github.com/AhmedMohamed500/Debit-Credit/pull/2)
**الفرع الأساسي للمراجعة:** `codex/first-day-cinematic` عبر [PR #1](https://github.com/AhmedMohamed500/Debit-Credit/pull/1)
**آخر commit وظيفي لمعايرة المخاطر والأدلة:** `74b6bccb125cc64d8cc1d0e0cb00c296b5808cae`
**حالة النشر وقت إعداد التقرير:** PR #2 مفتوح و`CLEAN`، وVercel ناجح على رأس الفرع
**آخر تحديث:** 12 سبتمبر 2026

---

## 1. الملخص التنفيذي

Debit & Credit منصة محاسبة ثنائية اللغة تُقدّم التعلم من خلال محاكاة عمل محاسب داخل شركة افتراضية، وليست مجرد مجموعة أسئلة داخل واجهة ألعاب. اللاعب يعمل داخل **Mizan Trading**، يستقبل حالة عمل من المدير المالي أ/ كريم، يفحص المستندات، يختار قرارًا مهنيًا، يبني القيد عند الحاجة، ثم يرى أثر القرار على دفاتر الشركة وعلى سجله المهني المحلي.

الوعد الحالي للمنتج:

> اعمل كمحاسب داخل شركة افتراضية، افحص الأدلة، اتخذ قرارًا مهنيًا، وشاهد أثره المحاسبي مع سجل يشرح المهارات التي مارستها.

أهم ما هو منفذ حاليًا:

- Chapter 1 — First Day / First Shift كتجربة مكتب محاسبي سينمائية.
- ثلاث حالات محاسبية فعلية مترابطة مع مستندات مؤيدة وقيود وأثر على الشركة.
- Gameplay Phase B كأساس معماري للحالات والأحداث ومحاولة العمل والأداء المهني.
- Nature of Accounts كمرجع كامل يضم 197 حسابًا ويعمل داخل الموقع ومن داخل اللعبة.
- Career Profile وSkill Passport وAuto CV وEmployer Preview محليًا.
- دعم العربية RTL والإنجليزية LTR والشاشات الصغيرة حتى 390px.
- حفظ محلي متوافق مع البيانات السابقة مع حماية من تكرار القيود والمكافآت.
- بوابة جودة كاملة نجحت في 218 اختبارًا عبر 26 ملفًا، إضافة إلى ESLint وTypeScript وProduction Build.

المشروع حاليًا Frontend ومحلي التخزين. لا توجد هوية خادمية أو قاعدة بيانات مركزية أو تحقق مهني معياري. لذلك لا يجوز اعتبار الأدلة المحلية `Verified` أو استخدامها وحدها كإثبات توظيف رسمي.

## 2. اتجاه المنتج الحالي

التجربة الأساسية تستهدف الإحساس التالي:

> أنا أعمل كمحاسب في Mizan Trading.

حلقة اللعب المهنية هي:

```text
Case received
→ inspect source and supporting evidence
→ identify uncertainty or discrepancy
→ choose a defensible business action
→ build and submit the journal entry when appropriate
→ see the accounting and business consequence
→ generate explainable professional evidence
```

وبالعربية:

```text
استلام الحالة
→ فحص المستند والأدلة المؤيدة
→ اكتشاف النقص أو التعارض
→ اتخاذ قرار مهني قابل للدفاع
→ إعداد القيد عند ملاءمة الترحيل
→ مشاهدة الأثر على الشركة
→ إنشاء دليل مهني قابل للتفسير
```

XP وCoins ما زالا جزءًا من اقتصاد اللعبة والتوافق مع الحفظ الحالي، لكنهما ليسا دليلًا مهنيًا ولا يظهران في Skill Passport أو السيرة الذاتية كإثبات كفاءة.

## 3. حدود الإصدار الحالي

- Chapter 1 هو الفصل الجاري تنفيذه ومراجعته.
- Chapter 2 غير منفذ كلعبة، ولا يوجد له مسار قابل للدخول أو زر فتح.
- تعريف Chapter 2 الموجود في `lib/cases/chapter-two.ts` هو seam معماري مقفول فقط، وحالته `locked` ومساره `null`.
- لا يوجد Backend للحسابات أو الشركات أو التوظيف أو التحقق.
- PR #2 لم يُدمج تلقائيًا في الفرع الأساسي.
- Academy وArena وMoney Flow وDetective وCompanies موجودة وتعمل ضمن تاريخ المشروع، لكنها ليست نطاق التوسع الحالي.
- طبيعة الحسابات محمية من التعديل الداخلي باختبار انحدار مخصص.

## 4. Chapter 1 — First Day / First Shift

### 4.1 المدخل السينمائي

يبدأ الفصل بمشهد First Day يضع اللاعب داخل عالم Mizan Trading ويعرّفه على أ/ كريم ودوره في الوردية. النصوص الأساسية عناصر DOM حقيقية قابلة للقراءة والتكبير وليست نصوصًا مطبوعة داخل صورة.

المشهد يدعم العربية والإنجليزية، وRTL/LTR، وزر بداية واضح داخل أول viewport، وتخطيطًا مخصصًا للهاتف، و`prefers-reduced-motion`، وبديلًا صريحًا عند عدم توفر الوسيط البصري.

### 4.2 المكتب المحاسبي

بعد المقدمة يدخل اللاعب مكتبًا تفاعليًا يملأ الشاشة، ويشمل:

- أ/ كريم بصفته المدير المالي والشخصية المتكررة.
- Laptop يعمل كنظام `Mizan OS` ويعرض الوارد والتقدم وحالة الحالات.
- Inbox وProcessed Tray يتغيران حسب حالة المستندات الفعلية.
- دفتر يومية ودفتر أستاذ وآلة حاسبة ومرجع طبيعة الحسابات.
- أرصدة الشركة وحالة الدفاتر وتقدم الوردية.
- أدوات تنقل ولمس مناسبة للهاتف.

### 4.3 حالات First Shift

| الحالة | المستند الأساسي | القيد الصحيح | المبلغ |
|---|---|---|---:|
| Supplier Invoice | فاتورة مورد `INV-1048` | Dr Office Equipment / Cr Accounts Payable | EGP 100,000 |
| Customer Receipt | سند قبض `REC-4587` | Dr Bank / Cr Accounts Receivable | EGP 75,000 |
| Office Expense | سند مصروف `PV-2201` | Dr Office Supplies Expense / Cr Cash | EGP 2,500 |

كل حالة تحتوي على سياق عمل وطلب من المدير، ومستند مصدر، ومستندات مؤيدة مطلوبة، واختيارات مهنية مثل Post وHold وRequest Information، وقيد يومية عند ملاءمة الترحيل، ونتيجة تؤثر على بيانات الشركة.

### 4.4 المستندات المؤيدة

فاتورة المورد تعتمد على أمر الشراء `PO-771` وإذن الاستلام `GRN-771`. تحصيل العميل يعتمد على إشعار البنك `BA-312` وفاتورة المبيعات `SI-2041`. مصروف المكتب يعتمد على سند الصندوق `PC-2201` ومذكرة سياسة المصروفات `POL-OFFICE-01`.

لا يكفي أن يكون القيد متوازنًا رقميًا؛ يجب أن يطابق المعنى المحاسبي للحالة والمستندات.

### 4.5 أثر القيد والمكافآت

- القيد الخاطئ يُسجل كمحاولة ويعرض feedback، ولا يغير الدفاتر المقبولة.
- القيد الصحيح يُضاف إلى اليومية ويحدّث أرصدة الشركة وينقل المستند إلى Processed Tray.
- كل مستند صحيح يمنح `+100 XP` و`+50 Coins` مرة واحدة.
- إكمال الوردية يمنح إجمالي `+300 XP` و`+150 Coins`.
- إعادة الإرسال أو callback مكرر لا يكرر القيد أو الأثر أو المكافأة أو الدليل الناجح.
- شاشة Shift Complete تعرض المستندات والدقة والنجاح من أول محاولة والمساعدة ورد المدير وteaser الفصل التالي المقفول.

## 5. Gameplay Phase B

Gameplay Phase B يحول First Shift من سلسلة تفاعلات واجهة إلى بنية حالات عمل قابلة للتتبع والتفسير.

### 5.1 Accounting Case Architecture

البنية القابلة لإعادة الاستخدام موجودة في:

- `lib/cases/model.ts`
- `lib/cases/first-shift-cases.ts`
- `lib/cases/engine.ts`
- `lib/cases/repository.ts`
- `lib/cases/performance.ts`
- `lib/cases/consequences.ts`

تعريف الحالة يشمل الفصل، إصدار السيناريو، سياق العمل، طلب المدير، المستندات، خطوات التحقيق، الأفعال المتاحة، المرجع المحاسبي والنتائج المتصلة.

```text
new → opened → investigating → waiting/ready → resolved/escalated
```

### 5.2 Event-based Attempt Tracking

كل حالة تستخدم محاولة ثابتة حاليًا: `first-shift/{caseId}/attempt-1`.

الأحداث المسجلة تشمل:

- `shift_started` و`case_received` و`case_opened`.
- `document_inspected` و`supporting_document_inspected`.
- `case_action_selected` و`entry_submitted` و`manager_help_requested`.
- `case_posted` و`case_resolved` و`case_escalated`.
- `consequence_scheduled` و`consequence_revealed` و`shift_completed`.

الأحداث append-only ولها IDs مستقرة وإصدارات للسيناريو والـrubric. تكرار الحدث نفسه لا يضيف نسخة جديدة، ما يمنع تضخم الأداء والأدلة بسبب النقر أو callback المكرر.

### 5.3 الأداء المهني

| البعد | مصدر القياس |
|---|---|
| Accuracy | صحة الترحيل وعدد محاولات الإرسال |
| Independence | عدد طلبات مساعدة المدير |
| Investigation | الأدلة المطلوبة التي فُحصت قبل أول Post |
| Documentation | الأدلة المؤيدة التي فُحصت خلال الحالة |
| Risk Awareness | التحقيق الاستباقي والقرار الوقائي وعقوبة الترحيل غير الآمن |
| Accounting Judgment | النتيجة الصحيحة وعقوبات القرارات المبكرة أو البديلة |

الوزن الكلي: 30% Accuracy، و25% Accounting Judgment، و20% Investigation، و10% Documentation، و10% Risk Awareness، و5% Independence.

### 5.4 تصحيح Risk Awareness

القاعدة الحالية حتمية وقابلة للتفسير:

- فحص الأدلة المطلوبة قبل أول محاولة Post يبني الدرجة الأساسية.
- Hold أو Request Information أو قرار وقائي مناسب أثناء نقص الأدلة يمنح رصيدًا محدودًا.
- محاولة Post غير مدعومة تخصم ولا تمنح رصيدًا إيجابيًا.
- تكرار المحاولة غير الآمنة لا يستطيع تحسين الدرجة.
- اللاعب الحذر يحصل على نتيجة مساوية أو أعلى من المتسرع، وعادة أعلى إذا حاول المتسرع الترحيل مبكرًا.

```text
Risk Awareness
= percentage of required evidence inspected before first Post
+ up to 15 points for a protective action while evidence is missing
- 25 points per recorded blocked Post
```

ثم تُحصر النتيجة بين 0 و100.

## 6. Nature of Accounts — طبيعة الحسابات

### 6.1 المحتوى المحاسبي

المرجع يحتوي على **197 حسابًا** من مصدر بيانات واحد:

| الفئة | العدد | الطبيعة العامة |
|---|---:|---|
| الأصول | 62 | مدينة |
| الالتزامات | 40 | دائنة |
| حقوق الملكية | 10 | دائنة |
| الإيرادات | 23 | دائنة |
| المصروفات والتكاليف | 54 | مدينة |
| الحسابات المقابلة | 8 | حسب الحساب الأصلي |

كل حساب يعرض الكود والاسم بالعربية والإنجليزية، والطبيعة المعتادة، وحركة الزيادة والنقص، وموضعه في القوائم، والمستندات المؤيدة، ومثال قيد، ومساره المستندي.

### 6.2 تجربة الاستخدام

- كتاب محاسبي مفتوح داخل مكتب Mizan.
- ست فئات وبحث بالاسم والكود والمفهوم.
- قائمة حسابات وصفحة تفاصيل على سطح المكتب.
- صفحة واحدة وتبديل List/Detail على الهاتف والتابلت.
- تمرير داخلي للمحتوى الطويل دون قص الصفحة.
- دعم كامل للعربية RTL والإنجليزية LTR.
- تخطيط متجاوب عند 390px وعروض التابلت واللابتوب والشاشات الكبيرة.

### 6.3 الوصول والملف القابل للتنزيل

المرجع ظاهر في الشريط العلوي للموقع، ومدخل First Day، ومكتب First Shift، ومساحة فحص الحالة وبناء القيد. فتحه أثناء العمل يحافظ على المسودة وسياق الرجوع.

- مرجع المستودع: [NATURE-OF-ACCOUNTS.md](NATURE-OF-ACCOUNTS.md)
- مسار الويب: `/docs/nature-of-accounts.md`
- تقرير التنفيذ: [NATURE-OF-ACCOUNTS-REPORT.md](NATURE-OF-ACCOUNTS-REPORT.md)
- الملفات الداخلية محمية باختبار fingerprint لمنع التعديل العرضي.

## 7. Career Profile وSkill Passport

### 7.1 الملف المهني

الملف المهني منفصل عن Game Profile ويشمل الاسم والعنوان المهني والدور المستهدف، والموقع وبيانات التواصل الاختيارية، والتعليم والخبرة واللغات وتفضيلات العمل، وضوابط الخصوصية. الكتالوج يحتوي على تسعة أدوار محاسبية مستهدفة و19 مهارة.

### 7.2 حالات المهارة

```text
Unassessed → Practiced → Demonstrated → Verified
```

`Verified` محجوز لمصدر تقييم موثوق، ولا يمكن الوصول إليه عبر اللعب المحلي وحده.

### 7.3 معايرة Practiced وDemonstrated

- حالة تمهيدية ناجحة واحدة تبقى `Practiced`.
- حالتان تمهيديتان مؤهلتان تبقيان `Practiced`.
- `Demonstrated` يتطلب ثلاث حالات تمهيدية مؤهلة ومختلفة للمهارة نفسها.
- الحالة المؤهلة تتطلب دقة 90% أو أكثر، ونجاحًا من أول محاولة، وعدم وجود أخطاء حرجة، ومساعدة مدير لا تزيد على مرة، وتحقيقًا وحكمًا محاسبيًا لا يقلان عن 80%.
- تعدد المحاولات أو المساعدة الكبيرة أو ضعف التحقيق يبقي الدليل في نطاق الممارسة.
- الأدلة التاريخية ذات `projectionVersion: 1` تحتفظ بحسابها السابق ولا تُخفض بصورة هدامة.

### 7.4 شرح الدليل

صفحة تفاصيل المهارة تعرض الحالة المصدرية، ووقت الإكمال، ومصدر السجل، وعدد المحاولات، وحالة المحاولة الأولى، ومساعدة المدير، والمستندات المفحوصة، وأبعاد الأداء، وسبب التصنيف. XP وCoins وStreak لا تُستخدم كدليل مهني.

### 7.5 Auto CV وEmployer Preview

- Auto CV يرتب المهارات والأدلة الحقيقية حسب الدور المستهدف.
- يدعم Print / Save PDF وتصدير JSON.
- يفصل خبرة المستخدم عن محاكاة Mizan Trading.
- Employer Preview وTalent Profile يعرضان البيانات المحلية وفق الخصوصية.
- العرض المحلي لا يدّعي اكتشاف شركات أو تحققًا خادميًا.

المسارات الأساسية:

- `/[locale]/career-profile`
- `/[locale]/career-profile/edit`
- `/[locale]/career-profile/skills`
- `/[locale]/career-profile/skills/[skillId]`
- `/[locale]/career-profile/cv`
- `/[locale]/career-profile/employer-preview`
- `/[locale]/talent/[slug]`

التقرير التفصيلي: [CAREER-PROFILE-SKILL-PASSPORT.md](CAREER-PROFILE-SKILL-PASSPORT.md)

## 8. الحالة المحاسبية وضمانات الصحة

- القيود المقبولة تمر عبر محرك المحاسبة الحالي.
- الدفاتر والأرصدة مشتقة من القيود المقبولة فقط.
- القيد المتوازن وغير الصحيح دلاليًا يُرفض.
- المحاولة الفاشلة لا تغير الرصيد المعتمد.
- إعادة callback ناجح لا تكرر الأثر.
- Pending Documents وPending Entries ينتقلان من 3 إلى 0 حسب الإنجاز.
- Processed Tray مشتق من المستندات المكتملة.
- Nature of Accounts الداخلي لم يتغير بسبب Gameplay Phase B.

## 9. التخزين والتوافق

| المفتاح | الاستخدام |
|---|---|
| `debit-credit-world-v2` | العالم وFirst Shift والقيود والمسودات والأحداث والمكافآت |
| `debit-credit-career-profile-v1` | بيانات الملف المهني |
| `debit-credit-skill-evidence-v1` | أدلة Skill Passport المحلية |
| `debit-credit-cv-preferences-v1` | تفضيلات CV والدور |
| `debit-credit-local-candidate-id-v1` | هوية محلية ثابتة |
| `debit-credit-player-v1` | تقدم اللاعب في البنية الأقدم |
| `debit-credit-progress-v1` | تقدم Academy |
| `debit-credit-money-flow-v1` | تقدم Money Flow |
| `debit-credit-missions-v1` | تقدم Missions |
| `debit-credit-detective-v1` | تقدم Detective |
| `debit-credit-arena-v1` | نتائج Arena المحلية |

التوافق يشمل إضافة `casework` دون كسر الحفظ القديم، وإعادة بناء runtime للحالات المكتملة تاريخيًا دون تغيير اليومية أو الأرصدة أو المكافآت، وبقاء الأدلة القديمة قابلة للقراءة، وعرض `Unknown` عند غياب حقيقة First Attempt بدل اختراعها، والتعامل الآمن مع JSON التالف أو فشل Local Storage.

## 10. الأنظمة الأخرى الموجودة

| النظام | حالته ووظيفته |
|---|---|
| Academy | دروس ودورات وتدريب محاسبي ثنائي اللغة |
| Journal Practice | بناء قيود والتحقق من الحساب والطرف والمبلغ |
| Money Flow | سيناريوهات بصرية لحركة الحسابات |
| Missions | حالات ومحاولات وتلميحات ونتائج محفوظة |
| Accounting Detective | أدلة وملاحظات واستنتاجات لمعالجة الأخطاء |
| Arena | عشرة أنماط لعب قصيرة بنتائج شخصية محلية |
| Learning Map | خريطة تقدم للبنية السابقة |
| Companies | واجهات Demo وليست خدمة توظيف حية |
| Offline/PWA | Manifest وصفحة Offline وهوية تثبيت |

هذه الأنظمة لم تُحذف، لكنها ليست محور Gameplay Phase B وليست متصلة بخادم.

## 11. البنية التقنية

| الجزء | التقنية |
|---|---|
| Framework | Next.js 16.3.4 App Router |
| UI | React 19.1 وTypeScript 5.9 |
| Styling | CSS مخصص مع Tailwind toolchain |
| Icons | Lucide React |
| Tests | Vitest 3.2 وTesting Library |
| Hosting | GitHub وVercel Preview |
| Persistence | Browser Local Storage وrepositories محلية |

المجلدات الرئيسية: `app/` للمسارات والأنماط، و`components/` للواجهات، و`data/` للمحتوى، و`lib/` للمنطق، و`tests/` للاختبارات، و`artifacts/` للقطات وQA، و`docs/` للتوثيق.

## 12. العربية والإنجليزية والـResponsive والوصول

- العربية RTL والإنجليزية LTR.
- الأكواد والمبالغ تحافظ على اتجاه واضح.
- First Shift على الهاتف يتبع المستند ثم القيد ثم النتيجة.
- دليل الحسابات يستخدم List/Detail منفصلين على الهاتف.
- الحوارات تدعم Escape وإدارة التركيز.
- الحركة تحترم reduced motion.
- عناصر التحكم الأساسية مناسبة للمس.
- اختبارات الواجهة تغطي العربية والإنجليزية.
- قياس 390px سجل صفر overflow أفقي في جولات QA الحالية.

## 13. الاختبارات والجودة

آخر تشغيل كامل لـ`npm run check` نجح:

- ESLint: ناجح دون warnings.
- TypeScript: ناجح.
- Vitest: **218 اختبارًا ناجحًا عبر 26 ملفًا**.
- Next.js Production Build: ناجح.

التغطية تشمل صحة القيود، ومسار First Shift، وحفظ المسودة، ومنع تكرار القيد والمكافآت والأحداث، وحماية Nature of Accounts، واللغات، والتخزين والترحيل، وأحداث الحالات، ومقارنة اللاعب الحذر بالمتسرع، ومنع السلوك غير الآمن من رفع Risk Awareness، ومعايرة Practiced/Demonstrated، والتوافق التاريخي، واستحالة Verified محليًا، وشرح الأدلة دون XP أو Coins.

## 14. الصور والتقارير التفصيلية

### Gameplay Phase B

- [التوثيق الفني](docs/GAMEPLAY-PHASE-B.md)
- [التقرير العربي](GAMEPLAY-PHASE-B-REPORT-AR.md)
- `artifacts/gameplay-phase-b-desk-ar.png`
- `artifacts/gameplay-phase-b-case-ar.png`
- `artifacts/gameplay-phase-b-mobile-desk-ar.png`
- `artifacts/gameplay-phase-b-mobile-case-ar.png`
- `artifacts/gameplay-phase-b-posting-result-en.png`
- `artifacts/gameplay-phase-b-shift-complete-en.png`

### Phase A وFirst Shift

- [تقرير Phase A](docs/PHASE-A-RELEASE.md)
- [تدقيق الواجهة](docs/UI-AUDIT.md)
- [تقرير First Day](FIRST-DAY-IMPLEMENTATION-REPORT.md)
- `artifacts/first-shift-scene-desktop-ar.png`
- `artifacts/first-shift-scene-desktop-en.png`
- `artifacts/first-shift-scene-mobile-ar.png`

### Nature of Accounts

- [مرجع الحسابات](NATURE-OF-ACCOUNTS.md)
- [تقرير طبيعة الحسابات](NATURE-OF-ACCOUNTS-REPORT.md)
- `artifacts/account-manual-desktop-ar.png`
- `artifacts/account-manual-desktop-en.png`
- `artifacts/account-manual-laptop-compact-ar.png`
- `artifacts/account-manual-tablet-ar.png`
- `artifacts/account-manual-mobile-list-ar.png`
- `artifacts/account-manual-mobile-ar.png`

## 15. أهم الملفات حسب الوظيفة

### First Shift والقصّة

- `components/campaign/cinematic-chapter-intro.tsx`
- `components/campaign/first-day-screen.tsx`
- `components/campaign/first-day-case-workbench.tsx`
- `components/campaign/journal-builder.tsx`
- `lib/campaign/first-day.ts`
- `lib/campaign/first-day-story.ts`
- `lib/campaign/director.ts`
- `lib/campaign/store.ts`

### Gameplay Phase B

- `lib/cases/model.ts`
- `lib/cases/first-shift-cases.ts`
- `lib/cases/engine.ts`
- `lib/cases/performance.ts`
- `lib/cases/consequences.ts`
- `lib/cases/repository.ts`

### Nature of Accounts

- `components/academy/account-guide.tsx`
- `data/account-learning-guide.ts`
- `lib/account-manual-markdown.ts`
- `app/docs/nature-of-accounts.md/route.ts`
- `app/accounting-manual.css`

### Career Profile وSkill Passport

- `components/career/career-profile-app.tsx`
- `lib/career/model.ts`
- `lib/career/catalog.ts`
- `lib/career/evidence.ts`
- `lib/career/cv.ts`
- `lib/career/repository.ts`
- `app/career-profile.css`
- `app/career-profile-documents.css`

### الاختبارات المحورية

- `tests/accounting-core.test.ts`
- `tests/first-day.test.ts`
- `tests/campaign-ui.test.tsx`
- `tests/casework.test.ts`
- `tests/career-profile.test.ts`
- `tests/career-ui.test.tsx`
- `tests/protected-account-nature.test.ts`
- `tests/storage-migration.test.ts`

## 16. التشغيل المحلي

```bash
npm install
npm run dev
```

المسارات الأساسية:

- `http://localhost:3000/ar`
- `http://localhost:3000/en`
- `http://localhost:3000/ar/account-guide`
- `http://localhost:3000/ar/career-profile`

بوابة الجودة الكاملة: `npm run check`.

## 17. GitHub وVercel

- المستودع: [github.com/AhmedMohamed500/Debit-Credit](https://github.com/AhmedMohamed500/Debit-Credit)
- فرع Gameplay Phase B: `codex/gameplay-phase-b`
- PR الحالي: [PR #2](https://github.com/AhmedMohamed500/Debit-Credit/pull/2)
- حالة PR وقت التقرير: `OPEN` و`CLEAN`
- Vercel: [Gameplay Phase B Preview](https://debit-credit-git-codex-788967-ahmed-mohameds-projects-c51bc2cc.vercel.app)
- العربية: [فتح اللعبة](https://debit-credit-git-codex-788967-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar)
- الإنجليزية: [Open game](https://debit-credit-git-codex-788967-ahmed-mohameds-projects-c51bc2cc.vercel.app/en)
- طبيعة الحسابات: [فتح المرجع](https://debit-credit-git-codex-788967-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar/account-guide)
- Career Profile: [فتح الملف](https://debit-credit-git-codex-788967-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar/career-profile)
- MD الحسابات: [تنزيل المرجع](https://debit-credit-git-codex-788967-ahmed-mohameds-projects-c51bc2cc.vercel.app/docs/nature-of-accounts.md)

يُتحقق من كل نشر عبر Vercel commit status داخل PR #2. رابط الفرع الثابت ينتقل إلى أحدث commit ناجح بعد كل push، لذلك لا يعتمد التقرير على رابط deployment مؤقت.

## 18. تاريخ التنفيذ الرئيسي

| Commit | العمل |
|---|---|
| `f9b0fd2` | تحسين تفاعلات First Shift الأولى |
| `fd83195` | تحويل First Shift إلى مشهد مكتب سينمائي |
| `6351c10` | بناء المكتب المحاسبي القابل للعب |
| `55dc688` | بناء Nature of Accounts داخل اللعبة |
| `50437ea` | تحويل المرجع إلى كتاب مادي داخل المكتب |
| `d48cd2e` | بناء Career Profile وSkill Passport foundation |
| `b8bd853` | تثبيت Phase A والتخزين والمسودات وidempotency |
| `1f69465` | تحويل First Shift إلى accounting casework |
| `7d8a659` | توثيق واختبار Gameplay Phase B |
| `7c08f2e` | إضافة التقرير العربي لـGameplay Phase B |
| `74b6bcc` | معايرة Risk Awareness وPracticed/Demonstrated |
| `ab1d6d6` | تحديث سجل إصدار ونشر Phase B |

## 19. القيود والمخاطر المعروفة

- Local Storage يمكن حذفه أو تعديله ولا يثبت الهوية أو النزاهة المهنية.
- لا توجد مزامنة بين الأجهزة أو قاعدة بيانات أو صلاحيات خادمية.
- Employer Preview محلي ولا يمثل اكتشافًا فعليًا من الشركات.
- Companies وLeaderboard في الأنظمة القديمة يحتويان بيانات Demo.
- طباعة CV تعتمد على Print / Save PDF في المتصفح.
- الأدلة المحلية يمكن أن تكون Practiced أو Demonstrated، لكنها ليست Verified.
- الحالات الثلاث تمهيدية ولا تمثل تغطية كاملة لمهنة المحاسبة.
- قواعد التقييم حتمية ومفسرة، لكنها تحتاج playtesting قبل اعتمادها معيارًا واسعًا.

## 20. الحالة النهائية والخطوة التالية

Chapter 1 أصبح محاكاة عمل محاسبي قائمة على حالات وأحداث وأدلة وقرارات ونتائج. Risk Awareness لا يكافئ السلوك الخطر، وSkill Passport لا يبالغ في تحويل حالة تمهيدية واحدة إلى ادعاء كفاءة قوي. Nature of Accounts متاح كمرجع كامل من الموقع واللعبة، والحفظ والمحاسبة والتوافق واللغات والـResponsive محمية بالاختبارات الحالية.

الحالة الحالية جاهزة لمراجعة مستقلة وplaytest لـChapter 1 وGameplay Phase B داخل PR #2. الخطوة التالية هي مراجعة واعتماد هذا الفصل وضبطه بناءً على سلوك لاعبين فعليين. **Chapter 2 يظل مقفولًا ولا يجب بدء تنفيذه قبل اعتماد Chapter 1.**
