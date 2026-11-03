# ربط SULY AI بـSupabase

## التصميم المقصود

يستخدم هذا المستودع FastAPI كواجهة خلفية، وSupabase كقاعدة PostgreSQL فقط. تبقى مصادقة التطبيق الحالية عبر JWT الخاص بـFastAPI؛ لا تُرسل مفاتيح Supabase السرية إلى Flutter، ولا يتم استخدام Supabase Auth في هذا المسار.

تُنشأ جداول هذا الـbackend عبر Alembic، مع تفعيل RLS على الجداول التي ينشئها هذا التطبيق فقط. يتصل FastAPI بقاعدة البيانات من جهة الخادم باستخدام `DATABASE_URL` محفوظًا في مدير أسرار الاستضافة. لا تُعدّل migrations هذا المستودع الجداول القديمة `public.suly_*` أو بيانات الألعاب الموجودة في مشروع Supabase.

## الأسرار المطلوبة

من إعدادات قاعدة البيانات في مشروع Supabase، انسخ PostgreSQL connection string (يفضل Direct Connection عند دعم IPv6، أو Session Pooler عند الحاجة). ضعها كسر `DATABASE_URL` في بيئة استضافة الـbackend فقط، مع تفعيل SSL. مثال شكلي لا يحتوي على بيانات حقيقية:

```text
DATABASE_URL=postgresql+psycopg://postgres:<DB_PASSWORD>@<DB_HOST>:5432/postgres?sslmode=require
```

لا تضع كلمة مرور قاعدة البيانات أو `DATABASE_URL` أو `SERVICE_ROLE_KEY` داخل Flutter أو GitHub أو ملفات عامة. استخدم مدير أسرار بيئة الاستضافة. كذلك يجب ضبط `SECRET_KEY` و`CREDENTIAL_ENCRYPTION_KEY` و`ADMIN_BOOTSTRAP_TOKEN` بقيم قوية وفريدة؛ حافظ على مفتاح التشفير ثابتًا كي تبقى مفاتيح مزودي النماذج المخزنة قابلة للقراءة.

## ترحيل المخطط وتشغيله

من جذر المستودع بعد تثبيت `backend/requirements.txt` وضبط الأسرار على الخادم:

```bash
PYTHONPATH=. alembic upgrade head
PYTHONPATH=. alembic current
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

ينشئ Alembic جداول FastAPI في `public` من دون حذف أو إعادة تسمية الجداول السابقة. الترحيل الجديد يضيف مفتاحًا فريدًا لمنع تكرار منح الرصيد، ويُنشئ وظيفة `pg_cron` تمنح المستخدمين النشطين 200 رصيد يوميًا في منتصف الليل بتوقيت القاهرة. تُغطّى فروق التوقيت الصيفي بتشغيل آمن عبر نوافذ UTC متداخلة، وتمنع مفاتيح idempotency أي إضافة مضاعفة. كما يحاول الـbackend التحقق من المنحة عند أول طلب مصادق عليه بعد منتصف الليل إذا تأخر المجدول.

رصيد التسجيل البالغ 1000 يضاف وسجل الحركة في معاملة واحدة. حساب المدير الأول لا يحصل على منحة المستخدم الجديد. يحصل المستخدم العادي على أول منحة يومية في اليوم التالي لإنشاء حسابه، وليس فور التسجيل.

## تشغيل محلي واختبارات

يمكن إبقاء `DATABASE_URL=sqlite:///./suly_ai.db` للتطوير المحلي؛ لا يعمل مجدول PostgreSQL في SQLite، لكن اختبار الرصيد عند تسجيل الدخول والطلبات المحمية يبقى متاحًا. شغّل الاختبارات هكذا:

```bash
PYTHONPATH=. pytest -q backend/tests backend/app/tests
```

## تنبيه حول مشروع Supabase الحالي

مشروع Supabase المتاح يحتوي جداول `public.suly_*` وبيانات قائمة لا تخص مخطط Alembic الحالي مباشرة. لا تغيّرها migrations هذا المستودع. فحص Supabase أظهر أن RLS معطل على `suly_admins` و`suly_admin_sessions` و`suly_conversations` و`suly_users` و`suly_transactions`، وبعض سياساتها الحالية تسمح للجميع بالقراءة/التعديل. يجب مراجعة هذه السياسات وتأمينها منفصلًا قبل اعتبار المشروع آمنًا للإنتاج؛ لا يكفي تفعيل RLS وحده ما دامت السياسات المفتوحة موجودة.

## متطلب النشر الفعلي

Supabase يوفر PostgreSQL وEdge Functions، لكنه لا يشغّل تطبيق FastAPI هذا تلقائيًا. يجب نشر الـbackend على استضافة دائمة تدعم Python، وحفظ `DATABASE_URL` وأسرار FastAPI فيها، ثم ضبط `SULY_API_BASE_URL` في بناء Flutter إلى عنوان الـbackend المنشور. رابط المعاينة الحالي ليس عنوان إنتاج دائمًا.
