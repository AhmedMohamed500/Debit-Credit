# مراجعة Backend/Auth وتجهيز اختبار مستخدمين — المرحلتان A وB

التاريخ: 2026-10-08. هذا تقرير مرحلي؛ ليس إعلانًا باكتمال اختبار أحمد ومحمد أو Google أو لوحة الإدارة أو المنافسة. التوقف التالي هو إعداد قاعدة الاختبار في المرحلة C، ثم انتظار `Neon configured` قبل المهاجرات واختبارات المرحلة D.

## نقطة البداية وحماية العمل السابق

- المستودع: `AhmedMohamed500/Debit-Credit`، الفرع الحالي `codex/career-league`.
- Starting commit: `199fc6ac2d8cd98add1e2020d17dbe5cef66f38d`.
- HEAD عند إنهاء A/B ما زال commit البداية؛ تعديلات هذه المرحلة محلية، ولم يتم commit/push/deploy جديد.
- راجعت `git status` واسم الفرع وآخر خمسة commits قبل التعديل. لم تكن هناك تعديلات tracked في البداية؛ الملفات untracked القديمة محفوظة ولم تدخل أي نشر.
- لم تتم إعادة بناء backend، أو إزالة Better Auth، أو تعديل المحاسبة أو التصميم أو البيانات المحلية القديمة.
- لم يتم إنشاء قاعدة ثانية أو تفعيل فواتير أو تغيير أسرار الإنتاج أو حساباته في هذه المرحلة.

## تصحيح افتراض قاعدة البيانات

الطلب يفترض عدم وجود PostgreSQL، لكن الخطوة السابقة كانت قد فعّلت موردًا مستقلًا للمشروع: `debit-credit-auth-db`، Prisma Postgres، resource `store_Pfu28TDUl8CcxFIs`. إعادة فحص المورد في هذه المرحلة أكدت `available` وخطة `free` / `Free`.

فحص Vercel قراءة فقط أكد وجود `DATABASE_URL` و`DATABASE_DRIVER` و`BETTER_AUTH_SECRET` و`BETTER_AUTH_URL` في production. متغيرات Google و`ADMIN_EMAILS` وخدمة البريد الاختيارية و`DIRECT_URL` غير موجودة. لا قيم سرية في هذا التقرير.

تم اختبار الاتصال الحالي من خلال **عميل التطبيق نفسه `db()` / Prisma ORM**، باستخدام `DATABASE_DRIVER=postgres` و`PrismaPg`، داخل معاملة PostgreSQL `READ ONLY`. اتصال القاعدة مُرّر في ذاكرة العملية فقط. مفتاح auth مؤقت عشوائي استُخدم لتلبية تحقق الإعدادات الخاص بتهيئة عميل القراءة فقط؛ لا تسجيل دخول باستخدامه، ولا استرجاع أو تعديل لمفتاح الإنتاج. وجود مفتاح الإنتاج تأكد من metadata منفصلًا.

نتيجة القراءة عند `2026-10-08T19:28:38.704Z`:

| المؤشر | القيمة الحقيقية |
| --- | ---: |
| المستخدمون | 2 |
| الملفات السحابية | 2 |
| مستخدمون بلا ملف | 0 |
| حسابات credential | 2 |
| حسابات Google | 0 |
| مسؤولون ADMIN | 0 |
| مستخدمون باسم Ahmed أو Mohamed | 0 |
| مستخدمو الاختبار السابق باسم Auth Activation QA | 2 |
| مباريات | 0 |

هذه حسابات QA موجودة فعلًا في PostgreSQL، وليست حسابي القبول المطلوبين. لم يتم حذفها أو إعادة تسميتها أو استخراج كلمات مرورها. إنشاء أحمد ومحمد في نفس قاعدة الإنتاج يرفع العدد إلى 4، وليس 2. الوصول إلى اختبار نظيف بعدد 2 يتطلب قاعدة اختبار منفصلة؛ ربطها بالإنتاج مستقبلًا قرار منفصل لا يُنفّذ تلقائيًا على حساب البيانات الحالية.

## الخلل الذي تم إثباته وإصلاحه

كان `configuration()` يرمي `GOOGLE_CONFIGURATION_INCOMPLETE` عند وجود أحد متغيري Google فقط. هذا يعطّل تهيئة قاعدة البيانات والمصادقة الأساسية، رغم أن البريد وكلمة المرور لا يحتاجان Google.

قبل الإصلاح: اختباري client ID فقط وclient secret فقط فشلا بهذه الرسالة. بعد الإصلاح:

- Google اختيار مستقل؛ لا يتم تسجيل provider أو تفعيل الزر إلا بوجود المتغيرين.
- `googleConfigured()` هو المصدر المشترك لتهيئة Better Auth وصفحتي الدخول/التسجيل و`me.capabilities.google`.
- أصلحت أيضًا capability التي كانت تكتفي بوجود client ID وحده.
- بقيت متطلبات قاعدة البيانات ومفتاح auth بطول 32 على الأقل وأصل HTTPS في الإنتاج كما هي.
- لم يتم تفعيل Google بمفاتيح وهمية، أو تغيير سياسة التحقق من البريد، أو الادعاء بإرسال رسائل.

## نتائج مراجعة المكونات القائمة

- الإصدار المثبت: Prisma CLI/client/adapter-pg/adapter-neon **7.10.0**؛ Better Auth **1.7.7**؛ Next.js **16.4.0**. لا ترقية أو تثبيت حزم جديدة.
- Prisma 7: schema PostgreSQL؛ generator `prisma-client` ينتج إلى `lib/server/db/generated`؛ الاتصال الخاص بـCLI في `prisma.config.ts`، وليس `url` قديمًا داخل datasource.
- عميل DB server-only، singleton؛ Neon يستخدم `PrismaNeon` عبر WebSocket، وPostgreSQL TCP يستخدم `PrismaPg`. معاملات التنافس والكتابات المعتمدة تستخدم Serializable وإعادة محاولة محدودة.
- Better Auth: cookie آمنة HttpOnly/SameSite=Lax وSecure على HTTPS؛ لا تخزين session token في localStorage؛ التسجيل العام لا يقبل role=ADMIN.
- البريد وكلمة المرور مفعّلان، والحد الأدنى 12 حرفًا. `requireEmailVerification=false`، لذلك عدم وجود Resend لا يمنع الاختبار الأساسي. الاستعادة وإرسال التحقق غير متاحين دون مزوّد حقيقي، ولا ندّعي إرسال بريد.
- إنشاء المستخدم يطلق bootstrap لملفه والنشاط. قراءة/كتابة الملف والتقدم تعتمد على هوية session، وليس user ID يرسله العميل.
- localStorage يحتوي working copies/outbox محددة بالحساب، وليس هوية المصادقة؛ النظام يحفظ نسخة من تقدم الضيف ويطلب قرار الدمج ولا يحوّل legacy evidence إلى Verified بمجرد رفعها.
- الإدارة محمية من الخادم. promotion عبر `ADMIN_EMAILS` يتطلب بريدًا verified؛ matching البريد وحده ليس كافيًا، ولن تتم تزوير علامة التحقق في الإنتاج. قائمة المستخدمين paginated من الخادم؛ أرقام overview تأتي من count حقيقي.
- المنافسة تستخدم queue ومباراة مخزنتين في DB، وقفل معاملات لمنع التكرار/self-match، وعضوية session لقراءة المباراة؛ الإجابات والدرجات الرسمية تُحسب من الخادم ولا تكشف إجابة الخصم قبل الاكتمال. public identities لا تشمل البريد أو password hashes أو tokens.
- النشاط: heartbeat في المتصفح كل نحو 60 ثانية عند الظهور، مع throttle كتابة 45 ثانية على الخادم؛ Active now يعني آخر نشاط خلال 120 ثانية. هذا presence تقريبي، لا WebSocket أو ادعاء حركة حية مستمرة.
- المراجعة الكودية لهذه البنود ليست بديلًا عن اختبار مستخدمين حقيقيين في المراحل D–I؛ هذا الاختبار الجديد لم يُنفّذ بعد.

## Prisma والمهاجرات

المهاجرات الموجودة والمطابقة لقاعدة الإنتاج الحالية:

1. `202610070001_backend_foundation`
2. `202610070002_match_references`
3. `202610070003_command_and_queue_versions`

فحص القراءة: الثلاث مكتملة، pending=0، failed=0. يوجد 26 جدولًا عامًا، و25 foreign keys، و66 index. تأكد وجود unique partial index للـwaiting queue، وunique official attempt مع scoringVersion، وunique case command. لم تُشغّل migrations جديدة أو reset.

الأمر الآمن المحضّر، **بعد التأكد من قاعدة الاختبار وبعد `Neon configured` فقط**:

```sh
npm run db:generate
npm run db:migrate
npm run db:preflight
```

`db:migrate` ينفّذ `prisma migrate deploy` للمهاجرات الموجودة؛ لا `migrate reset` ولا `db push`. `db:preflight` يجري قراءة فقط داخل `SET TRANSACTION READ ONLY` عبر عميل التطبيق، ويعرض versions/migration metadata/counts، لا البريد أو credentials أو hashes أو tokens. عند نقص الإعدادات يتوقف برسالة آمنة.

على Windows هذا المشروع موجود بمسار يحتوي `&`؛ إذا تعطّل npm.cmd، الأوامر المكافئة:

```powershell
node node_modules/prisma/build/index.js generate
node node_modules/prisma/build/index.js migrate deploy
node --conditions=react-server --import tsx scripts/backend-auth-preflight.mjs
```

### هل DIRECT_URL مطلوب هنا؟

كوديًا ليس متغيرًا إلزاميًا: `prisma.config.ts` يستخدم `DIRECT_URL || DATABASE_URL`. الإنتاج الحالي يعمل بـTCP URL من Prisma Postgres دون `DIRECT_URL`، والمهاجرات مطبّقة بالفعل.

عند تجهيز Neon وفق المسار المقترح: ضع pooled URL في `DATABASE_URL`، وunpooled/direct URL في **`DIRECT_URL`** للمهاجرات، مع `DATABASE_DRIVER=neon`. هذا اسم المشروع الحالي للمتغير المباشر؛ لا تستخدم اسمًا آخر غير موصول بـconfig. دليل Neon الحالي لـPrisma 7 يوصي بفصل اتصال CLI المباشر عن اتصال التطبيق pooled. [دليل Neon الرسمي](https://neon.com/docs/guides/prisma).

كل القيم الفعلية تُحفظ محليًا في `.env.local` الخاص والمستثنى من Git، لا في المحادثة. `BETTER_AUTH_URL=http://localhost:3000` محليًا، ومفتاح auth محلي قوي مستقل عن الإنتاج. يمكن توليده داخل جلسة PowerShell ثم وضعه في الملف الخاص دون إرساله:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

لا تنفّذ سكربتات `backend-api-qa.mjs` أو `backend-browser-qa.mjs` القديمة على حسابات المستخدم: بها reset لfixtures محلية مقيّدة بـlocalhost وقاعدة `app_phase1_test`. لا تُستخدم لاختبار القبول الدائم أو قاعدة production. سيتم تجهيز الاختبار غير المدمر للمراحل التالية بعد حسم قاعدة الاختبار.

## المسارات الفعلية وGoogle

- `app/[locale]/login/page.tsx` و`signup/page.tsx` موجودان وظهرَا في build route table، مع `onboarding`.
- Production HTTP: `/ar/login` و`/ar/signup` و`/en/login` و`/en/signup` كلها **200**.
- Better Auth API: `app/api/auth/[...all]/route.ts` يمرر GET/POST إلى `auth().handler(request)` المتوافق مع الحزمة المثبتة؛ endpoint `/api/auth/get-session` أعاد **200 JSON**.
- لا middleware/proxy أو rewrites locale في المشروع الحالي؛ `/api/*` و`/_next/*` والأصول لا تمر بآلية locale rewriting أصلًا. لا حاجة لإضافة middleware جديد. smoke تحقق أيضًا من sitemap وmanifest وملف public docs، كلها 200.
- callback بلا OAuth state أعاد **302** إلى `/api/auth/error?error=state_not_found`، وليس generic Next 404. هذا لا يثبت نجاح تسجيل Google.
- callback الإنتاج: `https://debit-credit-nine.vercel.app/api/auth/callback/google`؛ المحلي: `http://localhost:3000/api/auth/callback/google`، دون `/ar` أو `/en`.
- الزر يستخدم `authClient.signIn.social({ provider: "google", callbackURL: destination })`؛ الوجهة داخل التطبيق safe/localized وليست provider callback. الإعداد مطابق [لتوثيق Better Auth](https://better-auth.com/docs/authentication/google) ولمسار الحزمة المثبتة.
- في هذه المرحلة لم يتكرر generic 404، ولم يغيّر الإصلاح الحالي URL تاريخيًا؛ أصل المشكلة الحالية المثبتة هو optional Google config dependency، وليس قاعدة البيانات أو صفحة مفقودة.

## التحقق المنفّذ في هذه المرحلة

- regression قبل الإصلاح: 2 فشل / 8 نجح، لعزل الخطأ المذكور.
- بعد الإصلاح: 38 اختبارًا مركّزًا نجحت: backend-env=12، backend-rules=14، auth-routing=12.
- `npm run check`: **PASS**، lint بلا warnings، typecheck ناجح، **463 اختبارًا / 59 ملفًا**، ويشمل build ناجحًا.
- production build: **PASS**؛ صفحات `[locale]/login` و`[locale]/signup` و`api/auth/[...all]` موجودة. endpoints اللغتين تحققت HTTP أيضًا؛ ليست ملفات حرفية `[locale]` تُرسل في URL.
- production route smoke: **9 PASS**.
- production browser read-only: **160 PASS**، 10 browser contexts منفصلة للغتين، بمقاسات 1920×1080 و1440×900 و1366×768 و430×932 و390×844، ولا uncaught browser errors.
- Landing → localized Signup → Login يحفظ `next=/{locale}/onboarding`، ولا malformed locale links أو horizontal overflow. ملفات النموذج قابلة للاستخدام بالتمرير ولوحة المفاتيح.
- الأدلة: `artifacts/auth-redesign/production-qa.json`؛ أعيد تصوير صفحات الاختبار فقط، بلا تعديل الصورة الأصلية أو UI. تغيرت بعض PNGs الناتجة عن التشغيل.
- فحص الإنتاج هنا على النسخة المنشورة سابقًا، **ليس نشرًا للإصلاح المحلي الجديد**. لم يتم إرسال credentials أو إنشاء مستخدمين في تشغيل QA الحالي.
- فحص سابق مستقل للبريد في `artifacts/auth-activation/production-auth-qa.json`: 44 PASS للتسجيل والخروج وإعادة الدخول من fresh mobile context بنفس IDs ورفض كلمة مرور خاطئة. هذا دليل سابق للحسابين QA، وليس اختبار أحمد/محمد أو استعادة كل supported progress.

## ملفات التعديل الحالية

- `lib/server/security/env.ts`: فصل توفر Google عن backend الأساسي.
- `lib/server/auth/auth.ts`: استخدام فحص Google المشترك.
- `app/[locale]/login/page.tsx` و`app/[locale]/signup/page.tsx`: نفس فحص توفر Google.
- `app/api/v1/[...path]/route.ts`: capability صحيحة عند اكتمال المتغيرين فقط.
- `tests/backend-env.test.ts`: 12 اختبار regression، دون إضعاف أي اختبار قائم.
- `scripts/backend-auth-preflight.mjs` و`package.json`: أمر قراءة آمن عبر عميل Prisma الفعلي.
- `.env.example`: توضيح DIRECT_URL وNeon، دون قيم حقيقية.
- هذا التقرير، وبعض captures PNG في `artifacts/auth-redesign/` أعيد توليدها بواسطة QA.

## قائمة الحالة المطلوبة — تقرير مرحلي، لا قبول نهائي

1. Starting commit: `199fc6ac2d8cd98add1e2020d17dbe5cef66f38d`.
2. Final commit للتطبيق: لم يُنشأ بعد؛ HEAD نفسه والتعديلات محلية. تشغيل CI المنفصل له commit `89b5d484eb007a482d7333a86b141df67a99a618`، دون تغيير main أو نشر التطبيق.
3. الملفات: مذكورة أعلاه؛ untracked السابق محفوظ.
4. Database provider: Prisma Postgres Free للإنتاج دون تغيير؛ Neon Free منفصل للاختبار متصل محليًا، كما في تحديث المرحلة C أدناه.
5. Migrations: 3/3 مطبّقة على الإنتاج الحالي سابقًا؛ **3/3 طُبّقت وتحققت على Neon التجريبي عبر GitHub Actions** في تحديث المرحلة D السحابي أدناه.
6. Email/password: دليل اختبار إنتاج سابق 44 PASS؛ لا تسجيل جديد في هذه المرحلة.
7. Google OAuth: غير مجهّز وغير مختبر فعليًا.
8. Callback: `/api/auth/callback/google` على origin الصحيح، دون locale.
9. Admin: لا ADMIN حاليًا ولا allowlist؛ ينتظر تحديد بريد المسؤول حين تأتي مرحلته والتحقق الحقيقي من ملكيته.
10. Cloud profile: صفّان فعليان بلا user مفقود الملف؛ اختبار تعديل/استعادة أحمد لم يُنفّذ بعد.
11. Cross-device: إثبات هوية QA سابق بنفس IDs؛ اختبار تقدم أحمد الكامل مؤجل.
12. Isolation: تمت مراجعة القيود والكود واختبارات القواعد؛ القبول الجديد بمستخدمين حقيقيين مؤجل.
13. Real test users: 2 QA موجودان؛ أحمد/محمد=0، لا seed أو مستخدم جديد الآن.
14. Admin Total Users: DB count=2، لكن لم تفتح لوحة الإدارة بجلسة مسؤول، وليس نجاح قبول أحمد ومحمد.
15. Competition: DB matches=0؛ لم يُنفّذ match جديد.
16. npm run check: آخر تشغيل **PASS، 475 اختبارًا / 60 ملفًا** بعد إضافة اختبارات حراسة التشغيل السحابي.
17. Build: PASS، auth routes موجودة.
18. Production deployment: لا نشر جديد؛ تبقى النسخة السابقة runtime commit `2316fb8477a81f351bcd3ed1b95bae75e6e26548`.
19. Production auth: current read-only HTTP/browser audit ناجح؛ Google/admin/competition acceptance لم ينفّذ.
20. Blockers/gates: نجحت migrations من GitHub؛ اتصال الكمبيوتر المباشر ما زال متعثرًا. اختبار البريد الحقيقي يحتاج اختيار بريد حساب الاختبار ثم تنفيذه من runner السحابي، قبل Google setup والنشر. لا تُعد المهاجرات وحدها نجاحًا لتسجيل الدخول.

## المرحلة C: خطوات التجهيز السابقة

Neon يعرض Free بقيمة $0/month حاليًا؛ لا اختيار Launch/Scale أو تفعيل مدفوعات. [خطة Neon الرسمية](https://neon.com/docs/introduction/plans).

الخطوة الأولى فقط: افتح [Neon Console](https://console.neon.tech)، وسجّل الدخول أو أنشئ حسابًا مجانيًا دون إدخال بطاقة. إذا طلبت واجهة الخدمة تفعيل دفع إلزامي، توقف وأبلغني، لا تفعّله.

بعد الوصول للوحة الحساب نعطي خطوة المشروع المجاني المخصّص للاختبار، ثم خطوة حفظ القيم الخاصة في `.env.local`. لا نقل تلقائي للإنتاج ولا مشاركة connection string أو passwords أو Google secret في المحادثة. لن نشغّل مهاجرات Neon قبل `Neon configured`.

## تحديث المرحلة C — 2026-10-09: اتصال Neon المحلي نجح

- أنشأ المستخدم مشروع `accounting-auth-test` على Free plan دون تفعيل مدفوعات أو خدمات إضافية. هوية المشروع التي تأكدت عبر Neon API: `lucky-star-84433257`، والمنطقة `aws-us-east-1`.
- الفرع الافتراضي `production` داخل مشروع الاختبار فقط، وهويته `br-lingering-mode-b8ior7zu`؛ لا علاقة لهذا الاسم بقاعدة إنتاج Vercel الموجودة.
- فوّض المستخدم Neon CLI بنفسه. تم جلب اتصال pooled وdirect من واجهة Neon الرسمية بعد تعثر بعض طلبات CLI الشبكية، دون تغيير كلمات سر أو إنشاء API keys جديدة أو تعديل المشروع.
- حُفظ `DATABASE_URL` و`DIRECT_URL` في `.env.local` الخاص، مع `DATABASE_DRIVER=neon` و`BETTER_AUTH_URL=http://localhost:3000` ومفتاح auth محلي عشوائي مستقل من 48 بايت. لم تُعرض القيم ولم تُضف إلى Git.
- ملف البيئة وملف تفويض CLI كلاهما مستثنيان من Git؛ تم التحقق باستخدام `git check-ignore`. صلاحيات CLI واسعة بحسب شاشة التفويض؛ استُخدمت هنا للقراءة فقط، وملف التفويض المحلي الخاص يجب ألا يُشارك أو يُنشر.
- اختبار اتصال فعلي عبر **عميل Prisma الخاص بالتطبيق** وadapter Neon نجح: `SELECT 1 = 1`، PostgreSQL `18.6`، `transaction_read_only=on`، عدد جداول public الأساسية **0**. لا استخدام لعميل بديل لإثبات جاهزية اتصال التطبيق.
- لم تُنفّذ migrations أو signup أو seed أو تعديلات بيانات. القاعدة جاهزة للمرحلة التالية فقط، وليست جاهزة لتسجيل الدخول قبل إنشاء الجداول.
- لم تُغيّر متغيرات Vercel أو قاعدة Prisma Postgres الحالية، ولم يحدث commit أو push أو نشر جديد.
- التوقف عند بوابة طلب المستخدم: **`Neon configured`**، ثم تطبيق المهاجرات الموجودة بأمان واختبار البريد قبل Google. يبقى Google غير مهيأ، ولا ادعاء بأنه يعمل.
- نتائج check/build السابقة أعلاه لم يُعاد تشغيلها في خطوة حفظ الاتصال هذه؛ دليل هذه الخطوة هو اختبار الاتصال الفعلي للقراءة فقط وحماية الملفات الخاصة من Git.

## تحديث المرحلة D — 2026-10-09: محاولة المهاجرات متعثرة بالاتصال

- أذن المستخدم بالاستمرار (`كمل`) بعد حفظ إعدادات Neon. لم تُعتبر صورة تسجيل الدخول وحدها إذنًا لتنفيذ المهاجرات.
- بقيت Prisma CLI وClient وadapter Neon على **7.10.0**، وBetter Auth على **1.7.7**. استُخدمت مهارة `prisma-orm-setup` ومراجع Prisma 7 للحفاظ على النسخة والمهاجرات القائمة، لا إعادة إنشاء backend.
- راجعت المهاجرات الثلاث القائمة. محاولة `prisma migrate deploy` كانت محاطة بتحقق صريح من hostname قاعدة الاختبار واسم `neondb` وdriver Neon، وتحميل `.env.local` الخاص في العملية التابعة. لم يُستخدم `migrate reset` أو `db push` أو أي أمر حذف.
- فشل migrate deploy مرتين برسالة `Schema engine error` دون تشخيص مفصل؛ ليس PASS ولم يُعلن تطبيق أي migration. جرت المحاولة الثانية بعد تأكيد بدء نقطة الاتصال نفسها، لا بعد إنشاء مورد إضافي.
- أدلة الاتصال: `Test-NetConnection` إلى direct وpooled على منفذ **5432** أعاد false؛ اختبار pg المباشر أعاد **ETIMEDOUT**؛ اختبار IPv4 مع تحقق TLS كامل فشل أيضًا. لم تُعطّل TLS أو إعدادات الأمان ولم يُستخدم proxy مخصص.
- قراءة Neon Console API نجحت وأكدت أن endpoint غير معطّل. كان `idle`، فتم إيقاظ **نقطة الاتصال الموجودة** بعملية `start_compute`؛ قراءة الحالة بعدها أكدت `active` و`pending_state=null`. لم تتغير الخطة أو الحجم أو موارد المشروع؛ يبقى autosuspend الحالي كما هو.
- رغم حالة `active`، إعادة اختبار عميل Prisma الفعلي أعادت **ETIMEDOUT**. استعلام قراءة بديل عبر واجهة SQL HTTPS الرسمية تعثّر أيضًا بمهلة اتصال. إذًا الخمول وحده لا يفسر الفشل. الموضع الدقيق للحجب/التعثر بين الشبكة المحلية ونقطة خدمة Neon لم يُحسم.
- [صفحة حالة Neon](https://neonstatus.com/) عرضت All Systems Operational عند الفحص؛ هذا لا يستبعد مشكلة هذه الشبكة أو نقطة الاتصال الفردية.
- آخر حالة جداول مثبتة باستعلام ناجح كانت **0** في المرحلة C. تعذّر إعادة قراءة الجداول في هذه المحاولة، فلا تُقدّم الحالة الحالية على أنها تحقق جديد. لم تُنشأ حسابات اختبار أو sessions ولم يبدأ قبول signup/login.
- `npm run check` أعيد تشغيله في هذه المرحلة وانتهى برمز **0**: lint/typecheck/unit tests/build PASS. ظهرت `[locale]/login` و`[locale]/signup` و`api/auth/[...all]` في جدول build؛ نجاح البناء لا يثبت نجاح اتصال قاعدة البيانات أو تسجيل الدخول.
- لم تُغيّر قاعدة إنتاج Prisma Postgres أو متغيرات Vercel. لم يحدث commit أو push أو نشر جديد، ولم يبدأ إعداد Google أو اختبار الإدارة أو المنافسة.
- الخطوة المطلوبة الآن: اختبار شبكة أخرى على الكمبيوتر (مثل نقطة اتصال الهاتف) ثم إعادة فحص الاتصال والمهاجرات. لا طلب لأي password أو connection string في المحادثة، ولا تعطيل firewall أو تغيير إعدادات أمان.

## إعادة فحص المرحلة D بعد طلب «كمل» — 2026-10-09

- أعيد اختبار الاتصال المباشر عبر pg وعميل Prisma الفعلي بالقراءة فقط: كلاهما فشل بـ`ETIMEDOUT`. لم تُعد محاولة migrations مع فشل فحص الاتصال المسبق.
- فحص TCP المستقل على endpoint التجريبي: المنفذان **443 و5432** انتهيا بمهلة انتظار، بينما `https://console.neon.tech` أعاد **200** من الكمبيوتر نفسه. هذا يحدد مسار التعثر إلى نقطة قاعدة البيانات، ولا يثبت وحده الجهة التي تمنع/تفشل الاتصال.
- قرئت إعدادات المشروع عبر Neon API: `block_public_connections=false`، `block_vpc_connections=false`، وقائمة IP المسموحة فارغة (لا تقييد IP مفعل). لم تُغيّر أي إعدادات أمان.
- DNS المحلي وعناوين A من Google Public DNS تطابقا؛ لا دليل على DNS قديم أو hostname خطأ. لم تُغيّر إعدادات DNS في الجهاز.
- أُعيد جلب مخطط الفرع من Neon API الرسمي بصيغة SQL والتحقق من نوع حقل `sql`: الاستجابة 1032 حرفًا، **0 CREATE TABLE**، ولا `_prisma_migrations`. هذا دليل حالي من واجهة Neon على أن المخطط لم تُطبّق عليه المهاجرات؛ ليس ادعاء نجاح استعلام Prisma المحلي.
- جُدّدت جلسة Neon CLI الحالية تلقائيًا عند انتهاء access token، دون إنشاء API key أو تفويض صلاحيات جديدة أو مشاركة credential.
- لم تُنشأ حسابات، ولم يبدأ اختبار signup/logout/login أو Google. لم تُنفّذ reset أو حذف أو نقل للإنتاج أو نشر. آخر check/build الناجحين هما تشغيل المرحلة D السابق؛ لا تغييرات كود جديدة تستلزم ادعاء تشغيل جديد.
- طُلب من المستخدم تحديد ما إذا كان الكمبيوتر ما زال على الشبكة السابقة أم انتقل بالفعل إلى hotspot. هذه المعلومة لازمة لتحديد الخطوة الخارجية التالية بدل تكرار المحاولات أو افتراض تغيير الشبكة.

## تحديث المرحلة D السحابي — 2026-10-09: المهاجرات نجحت

- قال المستخدم إنه لا يملك باقة بيانات، ثم وافق صراحة على بديل GitHub Actions لقاعدة Neon التجريبية وحفظ اتصالها داخل GitHub Secrets. لم يُطلب شراء اتصال أو تفعيل مدفوعات.
- المستودع Public؛ استخدم التشغيل standard runner `ubuntu-24.04` فقط. التشغيل العادي لمستودع public مجاني بحسب [توثيق GitHub](https://docs.github.com/en/billing/concepts/product-billing/github-actions)، لا larger runner ولا رفع artifacts أو تفعيل خطة مدفوعة.
- أُنشئت بيئة `neon-auth-test` وأسراراها `NEON_TEST_DATABASE_URL` و`NEON_TEST_DIRECT_URL` فقط. القيم رُفعت عبر stdin الخاص دون سطر أوامر يحتويها، ودون نشر `.env.local`. policy يسمح باستخدام البيئة من فرع `codex/neon-test-migrations` وحده.
- لم يُحفظ secret إنتاج أو Google أو password مستخدم في GitHub. مفتاح auth المستخدم لفحص عميل التطبيق يُولّد داخل runner لهذه العملية فقط ولا يُعرض.
- الفرع السحابي بُني من starting commit `199fc6ac2d8cd98add1e2020d17dbe5cef66f38d`، بcommit مستقل **`89b5d484eb007a482d7333a86b141df67a99a618`** يشمل ملفات التشغيل الخمسة فقط. بقي checkout المحلي على `codex/career-league`؛ لم تُدمج التعديلات المحلية الأخرى أو ملفات QA أو ملفات المهارات أو الأسرار في ذلك commit.
- workflow يبدأ عند دفع ملفات التشغيل إلى الفرع المخصص؛ يدعم `workflow_dispatch` أيضًا إذا أُضيف لاحقًا للفرع الافتراضي. لم نضع workflow على main فقط لإتاحة dispatch؛ الرفع المقصود لفرع الاختبار بدأ التشغيل الأول مع بقاء main دون تغيير.
- Actions مثبتة إلى commit SHA، و`GITHUB_TOKEN` بصلاحية `contents:read` فقط وcheckout دون حفظ credentials. الأسرار تُتاح لخطوة المهاجرات فقط، لا npm install أو الاختبارات. لا trigger من pull requests أو schedule.
- حراسة runtime تتحقق من exact Neon host/direct+pooled، الدور، اسم database، TLS، تطابق passwords، repository وbranch. أُضيفت 12 حالة اختبار للرفض والتنقيح؛ لا طباعة لقيم خاصة، ولا custom proxy أو تعطيل TLS.
- ملف `vercel.json` في commit الاختبار يعطّل git deployments **لهذا الفرع فقط** باستخدام `git.deploymentEnabled` وفق [توثيق Vercel](https://vercel.com/docs/project-configuration/git-configuration). لم تُغيّر إعدادات إنتاج Vercel أو متغيراته.
- التشغيل: [GitHub Actions run 37939817218](https://github.com/AhmedMohamed500/Debit-Credit/actions/runs/37939817218)، job `113851025623`، conclusion **success**.
- استعلام قبل المهاجرات عبر **عميل التطبيق الفعلي وPrismaNeon**: اتصال ناجح، 0 جدول، ولا migration history.
- `prisma migrate deploy` على **Prisma 7.10.0** طبّق المهاجرات الثلاث الموجودة فقط: `202610070001_backend_foundation` و`202610070002_match_references` و`202610070003_command_and_queue_versions`.
- استعلام بعد التنفيذ بtransaction **READ ONLY** تحقّق من finished/checksum لكل migration، وأثبت **26 جدولًا، 25 foreign key، 66 index، 0 مستخدم، 0 ملف لاعب**.
- أُعيد `migrate deploy` داخل نفس التشغيل: **No pending migrations to apply**؛ إعادة فحص تاريخ المهاجرات والأعداد مطابقة، إثبات idempotency فعلي دون reset أو حذف.
- `npm run check` المحلي بعد ملفات الحراسة: exit **0**؛ lint/typecheck و**475 اختبارًا / 60 ملفًا** وbuild PASS. مسارات login/signup/API ظاهرة في build كما سبق.
- مراجعة remote refs بعد التشغيل: main بقي `cf9648e2b4f7c108485a5b1fed400538430fdbfa`، و`codex/career-league` بقي `199fc6ac2d8cd98add1e2020d17dbe5cef66f38d`؛ التغيير الوحيد المرفوع هو فرع CI. commit status لا يحتوي Vercel status. محاولتا قراءة deployment list من Vercel CLI وHTTPS API تعثرتا شبكيًا، لذلك لا يُدّعى تحقق جديد من آخر deploymentId؛ لم نستدعِ أي أمر نشر أو تغيير env إنتاج.
- لم يبدأ قبول email signup/login أو Google؛ صفر المستخدمين نتيجة صحيحة، وليس fake count أو ادعاء قبول لوحة Admin. الخطوة التالية تحديد بريد حقيقي للاختبار فقط، دون طلب كلمة مرور في المحادثة، ثم إكمال المرحلة D قبل E.

## أثر مهارات Prisma المستخدمة

استخدمت `prisma-postgres-setup` و`prisma-orm-setup`: وجّهتا المراجعة لإعادة استخدام اتصال الإنتاج الموجود للفحص، والإبقاء على Prisma 7 وحزمه المتطابقة، والتحقق عبر عميل التطبيق دون كتابة أو كشف secrets. قاعدة Neon المنفصلة — إن جُهّزت — ستكون اختبارًا نظيفًا محدد الغرض لتحقيق شرط العدد 2، لا استبدالًا أو إعادة تهيئة صامتة لقاعدة الإنتاج.
