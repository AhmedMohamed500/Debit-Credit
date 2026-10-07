# تسليم Backend Phase 1

تاريخ التحقق: 7 أكتوبر 2026، Africa/Cairo. النتيجة تنفيذ واختبار محلي، وليست تفعيلًا للخدمات على الإنتاج. الدليل المعماري والإعدادات والحدود في [BACKEND-PHASE-1.md](BACKEND-PHASE-1.md)، 29 قسمًا.

## البداية والـcommits

- الفرع: `codex/career-league`.
- نقطة البداية: `684efc11a1aecc11dbf316aa00f80cb72e5cc573`.
- commit التنفيذ والاختبارات: `ad05902858e11daf4042a520d67f2febe9c7d8da` — `feat: add authenticated cloud backend and real-user competition foundation`.
- التوثيق ولقطات QA في commit مستقل بعنوان `docs: record backend phase one validation and owner setup handoff`. اعرض رقمه باستخدام `git log -2 --oneline`.
- لا push أو نشر إنتاج أو شراء موارد. الملفات السابقة غير المتتبعة، ومنها تقارير المشروع وصور First Shift وFoundations، محفوظة ولم تُضم لهذه المرحلة.

## التنفيذ والحزم

Backend داخل Next.js كوحدات server-only، لا خادم NestJS منفصل. PostgreSQL وPrisma وBetter Auth، حسابات فعلية، جلسات سيرفر، ملف سحابي، تقدم Foundations محسوب بالسيرفر، تحقق Bank Reconciliation، ترحيل اختياري للبيانات المحلية، لوحة إدارة ومنافسة فعلية. المحركات المحاسبية الحالية ومسارات التعلم العامة محفوظة؛ لا إعادة تصميم كاملة أو تغيير اسم المستودع.

إضافات التشغيل: `better-auth`, `@prisma/client`, `@prisma/adapter-neon`, `@prisma/adapter-pg`, `@neondatabase/serverless`, `pg`, `ws`, `zod`, `dotenv`, `server-only`.

إضافات التطوير: `prisma`, `tsx`, `embedded-postgres`, `playwright-core`, `prettier`, `@types/pg`, `@types/ws`, `@testing-library/dom`. نسخ التحقق الفعلية: Prisma 7.10.0، Better Auth 1.7.7، Next.js 16.4.0، Vitest 3.2.7. ملف القفل يحفظ النسخ، و`.npmrc` يعالج تعارض optional peers.

## قاعدة البيانات

25 model محايدة الاسم: User, Account, Session, Verification, RateLimit, PlayerProfile, UserPreference, UserActivity, CloudProgress, ProgressSnapshot, LegacyImport, CareerGoal, CareerProfileCloud, SkillEvidenceCloud, CvVersionCloud, MissionAttempt, CaseAttempt, CaseEvent, AcceptedOutcome, CompetitionPlayer, CompetitionQueue, CompetitionMatch, CompetitionMatchPlayer, CompetitionAttempt, AuditLog.

الملكية بـUser.id، لا البريد. توجد foreign keys وUUIDs وفهارس الملكية والنشاط والوقت ونسخ التحديات. قيود uniqueness لهوية المصادقة والجلسة وأوامر المستخدم والنتائج المقبولة وعضوية المباراة والمحاولة الرسمية. Partial unique index يسمح بسجل WAITING واحد لكل مستخدم. سجلات الملكية تتبع cascade؛ مالك audit والفائز يستخدمان SetNull عند اللزوم. UserPreference وProgressSnapshot وCareerProfileCloud وCvVersionCloud نقاط توسع محجوزة، وليست APIs مكتملة؛ backups الحالية تستخدم CloudProgress.

المهاجرات الإضافية:

1. `202610070001_backend_foundation`.
2. `202610070002_match_references`.
3. `202610070003_command_and_queue_versions`.

بعد إعداد الاتصال: `npm run db:generate` ثم `npm run db:migrate`. تم التحقق من بناء قاعدة فارغة بالمهاجرات الثلاث دون seed. لا تستخدم migrate reset أو حذف بيانات الإنتاج.

## Auth والإدارة والأمان

التسجيل والدخول بالبريد وكلمة المرور نجحا محليًا على PostgreSQL وفي المتصفح. Better Auth مسؤول عن hashing والجلسات وCSRF وOAuth state/PKCE؛ لا tokens في localStorage. Cookies: HttpOnly، SameSite=Lax، Secure عند HTTPS؛ إعداد الإنتاج غير المحلي يشترط HTTPS. الجلسات بقاعدة البيانات، سبعة أيام وتجديد بعد يوم، دون cookie session cache.

Google مُنفّذ لكن غير مُختبر بحساب حقيقي، والزر مخفي دون الإعدادات. Resend اختياري؛ إرسال التحقق واستعادة كلمة المرور معطلان دون المزود، ولا يظهر نجاح إرسال وهمي. Account linking الاجتماعي معطل لمنع ربط بريد غير موثّق بحساب المالك تلقائيًا.

`/[locale]/admin` محمية من السيرفر. ADMIN_EMAILS خاص ويشترط بريدًا موثّقًا قبل الترقية؛ role في التسجيل أو persona لا يمنحان صلاحيات. الاختبار المحلي استخدم verified-email fixture معزولة فقط، وليس Google/Resend حقيقيين. إزالة عنوان من allowlist ليست آلية مكتملة لسحب دور سبق منحه.

العدادات الفعلية: الإجمالي، اليوم UTC، آخر سبعة أيام، نشاط 24 ساعة وآخر دقيقتين، providers، المنتظرون، المباريات الجارية والمكتملة. بحث الاسم/البريد، filters وpagination على السيرفر، 20 افتراضيًا و50 أقصى. Heartbeat نحو 60 ثانية مع throttle كتابة 45 ثانية، وليس حضور WebSocket لحظيًا.

APIs تستخدم session ownership، strict schemas، bounded streaming JSON، origin checks وDB rate limits، مع أخطاء معقمة وno-store. X-Account-Context يرفض جلسة تبويب تغير حسابها، ولا يمنح ملكية. لا أسرار إنتاج في commit؛ `.env` والملفات الخاصة ignored، و`.env.example` placeholders. كلمات مرور/اتصالات scripts بيانات fixtures محلية فقط. لا بريد خاص في المنافسة العامة، والمستخدم العادي ممنوع من الإدارة.

## السحابة والمحلي والترحيل

السحابي المدعوم: الحساب والجلسة والملف الأساسي، Career Entry، أوامر وتقدم Foundations الجديدة، نتيجة البنك المقبولة ودليل المحاكاة، import records، النشاط والإدارة، queue/matches/official attempts/weekly standings. World وplacement وCareer Profile وتفضيلات CV لها backups خاصة، وليست إثبات صحة محاسبية أو اعتمادًا مهنيًا.

المحلي الباقي: الضيف، local multi-profile competition، وحدات التعلم القديمة غير الموصلة بالكتابة السحابية، حسابات First Shift نفسها، إنشاء PDF وتاريخ CV، والمراحل المستقبلية. لا ادعاء أن كل المنتج صار سحابيًا.

متصفح جديد يسترجع البيانات المدعومة من السيرفر. نسخة الضيف تحفظ قبل تبديل working cache وتعود عند الخروج. Outbox مستقل لكل حساب يحفظ المسودات وrevision الأصلية؛ الاستجابات المتأخرة لا تعدل حسابًا آخر. حالات saved/pending/unsynced/conflict منفصلة، ولا overwrite أو rebase صامت.

الترحيل صريح: Merge / Keep cloud / Review. Version + device UUID + checksum ثابت وuniqueness تمنع التكرار. Foundations تُدمج بالقواعد الموجودة دون إنشاء proof رسمي من اكتمال مستورد؛ backups القديمة create-only عند غياب السحابة. الدليل القديم موسوم legacy، ولا يتحول إلى Verified. لا تستورد نقاط محلية أو ledger outcomes كبيانات رسمية.

## المنافسة والـAPI

`/[locale]/competition` محمية. FIFO متوافق مع league/challenge/version/scoringVersion، بلا self-match، Serializable transactions وadvisory locks وإعادة محاولة محدودة. الانتظار 15 دقيقة. السيرفر يختار التحدي والدوري ويحسب النتيجة والفائز/التعادل. الدرجات والأجوبة مخفية حتى ينتهي الطرفان، بما في ذلك leaderboard. محاولة رسمية واحدة لكل مستخدم/تحدٍ/نسخ؛ replays ممارسة فقط. الأسبوع الاثنين UTC، ويجمع مباريات مكتملة. Polling كل 20 ثانية أثناء ظهور صفحة المنافسة ويتوقف عند unmount.

مسارات `/api/v1`:

| المسار | العمليات |
| --- | --- |
| me | GET |
| me/profile | GET / PUT |
| me/activity | POST |
| me/progress | GET / POST / PUT |
| me/career-entry | PUT |
| me/bank | POST |
| migration/legacy | POST |
| competition/lobby | GET |
| competition/matchmake | POST |
| competition/matches/:id | GET |
| competition/matches/:id/submit | POST |
| competition/leaderboard | GET |
| admin/overview, admin/users, admin/competition | GET، ADMIN فقط |

Better Auth تحت `/api/auth/*`.

## التحقق النهائي

| الفحص | النتيجة |
| --- | --- |
| npm run check | ناجح: Lint + TypeScript + Tests + Build |
| الأصلية | 404 ناجحة؛ لا حذف أو تخفيف |
| الجديدة | 19 في backend-rules وbackend-sync |
| Vitest | 423 ناجحة / 56 ملفًا |
| Production build | ناجح، Next.js 16.4.0 |
| API / PostgreSQL | 72 فحصًا ناجحًا |
| قاعدة فارغة | 3 migrations، 25 FK على الأقل، فهارس uniqueness، صفر users |
| Browser QA | 50 فحصًا ناجحًا، صفر uncaught errors |
| git diff --check | ناجح |
| runtime audit | صفر ثغرات |
| full audit | 12 ملاحظة تطوير: 1 moderate، 9 high، 2 critical |

API QA يثبت auth/session/ownership/CAS، رفض role/score/winner المزورة، idempotency وعدم تكرار النتائج، تحقق البنك، استيراد legacy، عدم تسريب البريد/الإجابات/الدرجات المختومة، رفض نسخ تحديات غير متوافقة، أربعة joins متزامنة تنشئ مباراة واحدة، تعادل ومحاولات replay غير رسمية، وقيود auth identities/FKs/cascades. اختبار الحذف داخل transaction تم rollback له في قاعدة الاختبار فقط.

المتصفح أنشأ الحسابين من الواجهة، لعب مهمة Foundations فعلًا، عرض Total Users = 2، وفتح سياقين لمباراة بفائز محسوب من السيرفر. استرجع profile/Career Entry/Foundations في متصفح جديد، ومسح localStorage وأثبت بقاء الحساب. اختبر Keep cloud مع حفظ الأصل. لا اكتمالات أو نتائج محقونة لتزوير الاسترجاع.

AR RTL وEN LTR: 1920×1080، 1440×900، 390×844. [browser-qa.json](../artifacts/backend-phase-1/browser-qa.json) و32 لقطة نهائية. ملفات debug للفشل السابق ليست ضمن commit. Timeout سابق في UI قديم تحت حمل متزامن اختفى عند تشغيل الفحص النهائي دون متصفح متزامن؛ لم يتغير timeout الاختبار. حُفظت حدود 197 حسابًا و19 مهارة و12 دورًا و13 مهمة Foundations.

ملاحظات audit المتبقية تخص Vitest/tinypool وPrisma CLI وESLint tooling، وتحتاج تحديثًا مدروسًا. لا تعرض dev servers خارجيًا أو تشغل test/config غير موثوقة. نتيجة runtime لا تعني خلو أدوات التطوير كلها من الثغرات. أُغلق خادم الاختبار المحلي بعد QA؛ بياناته المعزولة محفوظة على قرص المشروع خارج Git.

## الملفات

commit التنفيذ: 77 ملفًا، 57 جديدة و20 معدلة. README تغير في commit التوثيق. بعض الملفات القديمة أعيد تنسيقها؛ `lib/career-league/repository.ts` تنسيق فقط، وليس تغيير قواعد. القائمة الدقيقة قابلة للاسترجاع بـ`git show --name-status ad05902`.

الجديدة:

- الجذر: `.env.example`, `.npmrc`, `prisma.config.ts`.
- `prisma/`: schema، migration_lock وثلاثة migration.sql.
- `app/[locale]/`: account/admin/competition/login/signup/reset-password pages، career-profile/layout.
- `app/`: api/auth/[...all]/route.ts، api/v1/[...path]/route.ts، cloud.css.
- `components/cloud/`: account، admin-dashboard، auth-cta، auth-form، competition، reset-form، session-boundary، unavailable.
- `lib/auth/`: client وsafe-next. `lib/cloud/`: cache وoutbox وruntime. `lib/bank-reconciliation/repository.ts`.
- `lib/server/`: admin/service، auth/auth/email/guards/page، cases/bank، competition/service، db/client، migration/rules/service/snapshots، profiles/schemas/service، progress/foundations/service، security/env/http/json، users/service.
- `scripts/`: backend-api-qa، backend-browser-qa، backend-schema-qa، backend-test-database.
- `tests/`: backend-rules.test.ts وbackend-sync.test.ts.
- التوثيق: BACKEND-PHASE-1.md وهذا التقرير، مع صور QA النهائية.

المعدلة: `.gitignore`, `README.md`, `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `app/layout.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/leaderboard/page.tsx`, `components/bank-reconciliation/workspace.tsx`, `components/platform/accounting-bootcamp.tsx`, `components/platform/landing-career-v4.tsx`, `components/platform/landing-sections.tsx`, `components/platform/onboarding.tsx`, `components/platform/platform-nav.tsx`, `lib/campaign/store.ts`, `lib/career-league/repository.ts`, `lib/career/repository.ts`, `lib/placement/repository.ts`, `tests/platform-ui.test.tsx`.

## إعدادات المالك وحد النشر

المحلي اجتاز الاختبارات؛ Neon الحقيقية غير متصلة، وGoogle/Resend الحقيقيان غير مختبرين. Vercel والإنتاج لم يتغيرا بهذه المرحلة. لا billing أو fake production users.

المطلوب خصوصيًا: DATABASE_URL، DIRECT_URL، BETTER_AUTH_SECRET، BETTER_AUTH_URL. ADMIN_EMAILS للإدارة بعد بريد موثّق. PUBLIC_APP_NAME محجوز، ليس إعادة تسمية للواجهة. Google: GOOGLE_CLIENT_ID وGOOGLE_CLIENT_SECRET. Resend اختياري فقط: RESEND_API_KEY وEMAIL_FROM.

Google callbacks الفعلية عند الوصول لخطوة Google:

```text
http://localhost:3000/api/auth/callback/google
https://debit-credit-nine.vercel.app/api/auth/callback/google
```

الأسرار توضع من المالك في `.env.local` ثم Vercel Environment Variables لاحقًا، ولا ترسل في المحادثة. توجد طريقة توليد secret محليًا وخطوات Google في الدليل المعماري، دون عرض أي secret قائم.

الخطوة الخارجية الأولى فقط: أنشئ PostgreSQL project على Neon Free دون billing أو paid add-ons. ضع pooled URL في DATABASE_URL وdirect URL في DIRECT_URL داخل `.env.local` خصوصيًا، ثم قل «Configured» دون القيم. إن طُلب الدفع، توقف. بعدها نكمل جلسات البيئة والمهاجرات والتحقق الحقيقي، ثم Google، خطوة واحدة كل مرة. إعداد Resend ليس شرطًا لتشغيل تسجيل البريد وكلمة المرور.

## الحدود المعروفة

لا آلية مكتملة لإلغاء مباراة مهجورة/forfeit، أو conflict-resolution editor كامل، أو offline replay رسمي لكل الأوامر. Avatars جاهزة فقط. لا واجهة كاملة لحذف/تصدير الحساب أو snapshots/history APIs أو server-authoritative First Shift evidence جديد. caches/outboxes قد تحتوي مسودات خاصة على جهاز مشترك. تحديث أدوات التطوير، retention وload benchmarks أعمال لاحقة.

المسارات العامة بقيت قابلة للفهرسة، والخاصة noindex. لا AdSense أو Verified certification أو دفع. تُراجع شروط الاستضافة والحدود المجانية قبل monetization. Rollback للتطبيق مع حفظ قاعدة البيانات، لا بإسقاط/إعادة ضبط بيانات الإنتاج.
