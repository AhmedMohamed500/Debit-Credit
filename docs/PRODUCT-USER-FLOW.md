# مسار المستخدم الفعلي — Phase A/B

## الزائر الجديد

Landing (`/{locale}`) → «ابدأ» → Career Entry (`/onboarding`) → اختيار واحدة من أربع شخصيات وهدف/دور → Placement Diagnostic (`/career-league/placement`) → النتيجة → Career Map (`/career-league/map`) → نشاط متاح حسب الهدف → Game Hub أو Bootcamp → حالة محاسبية → نتيجة → Skill Passport → Career Gap → ATS CV → المهمة التالية. المنافسة المحلية اختيارية بعد ذلك.

زر كل شخصية في Landing يمرر `?persona=student|graduate|working-accountant|experienced-accountant`. الاختيار المبدئي يظهر في Career Entry، لكن لا يُحفظ ولا يمنح XP أو دليلًا مهنيًا حتى يكمل المستخدم الخطوات المقصودة.

## العائد إلى اللعبة

Game Hub يقرأ الهدف المحفوظ، نتيجة التشخيص، أدلة المرشح المحلي وحالات Skill Passport. إن لم يكتمل Career Entry فالتوصية هي إكماله؛ إن غاب التشخيص فالتوصية هي إجراؤه. بعد ذلك يُستعمل نفس `personalCareerMap` لتحديد أول نشاط متاح بدل ابتكار مسار منافس. إذا كان النشاط التالي مقفولًا أو مخططًا له، يعود المستخدم للخريطة بدل عرض زر لعب وهمي. يظهر بجانب التوصية الهدف، الشركة الحالية وتقدم خطوات الخريطة. تظل Daily Challenge وصلة ثانوية اختيارية.

مسار الطالب المبتدئ يحتفظ بعالم Account City ومهمته الحالية المنفصلة؛ لم يُستبدل بلوحة Mizan المتقدمة.

## أثر الحالة المحاسبية

الحالات المؤهلة فقط → Professional Evidence محفوظ محليًا → Skill Passport (`Practiced` أو `Demonstrated` وفق القاعدة) → Career Gap وفق الدور المستهدف → ATS CV تحت **Accounting Simulation Experience**. لا تمنح إجابة التشخيص أو نقرة Landing حالة `Verified`. ولا تدخل XP أو الفوز بالمبارزة أو ترتيب الدوري في هذا المسار.

`/game/bank` القديم يعيد التوجيه إلى `/game/bank-reconciliation` المتاحة؛ لا تُمس سجلات العمل أو الأدلة المحفوظة. Bank Track متعدد الحالات وإقفال الشهر الكامل مؤجلان إلى Phase C.
