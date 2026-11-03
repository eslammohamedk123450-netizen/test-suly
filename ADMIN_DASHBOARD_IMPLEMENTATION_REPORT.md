# SULY AI — تقرير تنفيذ لوحة الإدارة

**الحالة:** تنفيذ مرحلة Backend آمنة وواجهة Flutter متصلة بالـ API.
**التاريخ:** 2026-11-03
**حالة Git:** هذه النسخة تتضمن التعديلات المحلية التي سيجري رفعها بعد اجتياز التحقق النهائي، بناءً على طلب المستخدم الحالي.

## 1. البنية الحالية التي تم فحصها

- Flutter Web يستخدم `MaterialApp` وRouter بسيطًا عبر `onGenerateRoute`.
- الهوية البصرية مركزة في `lib/core/theme/app_colors.dart` و`app_theme.dart`.
- FastAPI يستخدم Router مركزيًا تحت `/api/v1`.
- SQLAlchemy يستخدم SQLite افتراضيًا عبر `DATABASE_URL`.
- نموذج المستخدم الحالي يحتوي البريد والاسم وكلمة المرور المشفرة وحالة الحساب والمشاريع.
- المصادقة السابقة كانت bearer token مخصصًا وغير كافية لصلاحيات الإدارة.
- لا يوجد نظام migrations مستقل أو نظام دفع أو سجل طلبات AI/توكنات قبل هذه المرحلة.

## 2. الملفات الجديدة

### Backend

- `backend/app/db/models/admin.py`
  - خطط الاشتراك.
  - اشتراكات المستخدمين.
  - سجل معاملات الائتمان.
  - مزودو الذكاء الاصطناعي.
  - النماذج.
  - إعدادات النظام.
  - سجل النشاط الإداري.
- `backend/app/db/migrate.py`
  - Bootstrap غير مدمر لجداول الإدارة.
  - يضيف `is_admin` و`credit_balance` إلى SQLite الموجود فقط إذا لم يكونا موجودين.
- `backend/app/schemas/admin.py`
  - مخططات الطلبات والاستجابات مع validation.
- `backend/app/routes/admin.py`
  - المسارات المحمية للوحة الإدارة.
- `backend/app/services/admin_security.py`
  - تشفير Fernet server-side، بصمة المفتاح، وإخفاء الأسرار.

### Flutter

- `lib/features/admin/data/admin_api_service.dart`
  - عميل HTTP فعلي لتسجيل دخول المدير وتحميل بيانات اللوحة.
- `lib/features/admin/presentation/admin_screen.dart`
  - شاشة تسجيل الدخول.
  - لوحة نظرة عامة.
  - قوائم المستخدمين والمزودين والنماذج والخطط والإعدادات وسجل النشاط.
  - حالات تحميل، خطأ، وفراغ.
  - RTL عربي وتصميم SULY المتجاوب.

## 3. الملفات المعدلة

- `backend/app/auth/service.py`
  - الانتقال إلى JWT عبر PyJWT.
  - claim باسم `kind` يميز admin عن user.
  - انتهاء صلاحية منفصل لتوكن الإدارة.
  - فشل صريح عند غياب `SECRET_KEY`.
- `backend/app/auth/router.py`
  - إضافة `/auth/admin/login`.
  - إضافة `/auth/admin/bootstrap` لتهيئة أول مدير فقط عبر متغيرات بيئة صريحة.
  - إضافة `get_current_admin` للتحقق من الدور على Backend.
- `backend/app/auth/schemas.py`
  - إضافة `is_admin` إلى استجابة المستخدم.
- `backend/app/db/models/user.py`
  - إضافة `is_admin` و`credit_balance`.
- `backend/app/db/models/__init__.py`
  - تسجيل نماذج الإدارة مع SQLAlchemy metadata.
- `backend/app/core/config.py`
  - إضافة إعدادات `SECRET_KEY` و`CREDENTIAL_ENCRYPTION_KEY` و`ADMIN_BOOTSTRAP_TOKEN` و`ADMIN_BOOTSTRAP_EMAIL`.
- `backend/app/main.py`
  - تشغيل schema bootstrap غير المدمر.
- `backend/app/api/router.py`
  - تسجيل `/api/v1/admin/*`.
- `backend/requirements.txt`
  - إضافة PyJWT وcryptography فقط بعد موافقة المستخدم.
- `lib/core/routing/app_router.dart`
  - ربط `/admin` بـ AdminScreen.
- `lib/core/navigation/app_nav_item.dart`
  - إضافة Admin إلى القائمة.
- `lib/core/constants/app_strings.dart`
  - إضافة تسمية Admin.
- `lib/features/home/presentation/home_screen.dart`
  - فتح AdminScreen من shell الرئيسي.

## 4. مسارات Backend المنفذة

### المصادقة

- `POST /api/v1/auth/admin/bootstrap`
  - لا يعمل إلا عند ضبط `ADMIN_BOOTSTRAP_TOKEN`.
  - يقبل بريدًا محددًا اختياريًا عبر `ADMIN_BOOTSTRAP_EMAIL`.
  - يرفض إنشاء مدير ثانٍ.
  - لا توجد كلمة مرور افتراضية عامة.
- `POST /api/v1/auth/admin/login`
  - يتحقق من الحساب النشط و`is_admin`.
- `GET /api/v1/auth/me`
  - يعرض `is_admin` دون كلمة المرور أو hash.

### الإدارة

- `GET /api/v1/admin/overview`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{user_id}/status`
- `POST /api/v1/admin/users/{user_id}/credits`
- `GET /api/v1/admin/plans`
- `POST /api/v1/admin/plans`
- `GET /api/v1/admin/providers`
- `POST /api/v1/admin/providers`
- `GET /api/v1/admin/models`
- `POST /api/v1/admin/models`
- `GET /api/v1/admin/settings`
- `PUT /api/v1/admin/settings/{key}`
- `GET /api/v1/admin/audit`

كل هذه المسارات، عدا bootstrap/login، تتطلب Bearer JWT إداريًا ويتم التحقق من الدور على Backend، وليس في Flutter فقط.

## 5. الأمن والبيانات الحساسة

- مفاتيح مزودي AI لا تُعاد في الاستجابة؛ يعاد قناع وبصمة قصيرة فقط.
- المفاتيح تخزن مشفرة باستخدام Fernet و`CREDENTIAL_ENCRYPTION_KEY` من البيئة.
- لا يتم تسجيل كلمات المرور أو مفاتيح API في audit metadata.
- `SECRET_KEY` مطلوب لتوليد JWT؛ إذا لم يكن موجودًا يفشل login برسالة إعداد واضحة.
- لا يمكن للمدير تعطيل حسابه من endpoint الحالة.
- لا يمكن تعديل إعدادات سرية من لوحة الإعدادات؛ الأسرار تبقى في البيئة.
- تعديل الائتمان يستخدم ledger في `credit_transactions`، ويمنع الرصيد السالب.
- إنشاء أول مدير يحتاج إعدادًا صريحًا، ولا يوجد default password.

## 6. ما تم اختباره فعليًا

### Backend HTTP integration

تم تشغيل Uvicorn على قاعدة SQLite مؤقتة واختبار:

- تهيئة أول مدير: HTTP 200.
- تسجيل دخول المدير: HTTP 200 وإرجاع JWT.
- تحميل overview باستخدام توكن المدير: HTTP 200.
- إنشاء مزود بمفتاح تجريبي: HTTP 201 مع استجابة masked، دون تسريب المفتاح.
- الوصول إلى overview بدون توكن: HTTP 401.
- `python -m compileall -q backend`: ناجح.

لم يتم استخدام مفتاح AI حقيقي أو إنشاء بيانات إنتاجية.

### Flutter

- `dart format`: ناجح.
- `flutter analyze`: لا توجد أخطاء Analyzer.
- `flutter test`: `All tests passed!`.
- `flutter build web --release`: ناجح.
- تم فتح المعاينة ورؤية مدخل Admin وشاشة تسجيل الدخول العربية.

## 7. الوظائف التي تعمل الآن

- تسجيل دخول مدير عبر Backend.
- تهيئة أول مدير عبر إجراء محمي صريح.
- حماية API بصلاحية admin حقيقية.
- عرض إحصاءات overview من قاعدة البيانات.
- عرض المستخدمين وحالاتهم وأرصدة الائتمان.
- إيقاف/تفعيل مستخدم عبر API.
- تعديل الائتمان مع ledger وسبب ومسؤول العملية.
- إنشاء وعرض خطط الاشتراك.
- إنشاء وعرض مزودي AI مع تشفير المفاتيح وإخفائها.
- إنشاء وعرض النماذج.
- عرض وتعديل إعدادات غير حساسة.
- عرض سجل النشاط الإداري.
- واجهة Flutter متجاوبة بالعربية مع loading/error/empty states.

## 8. الوظائف غير المكتملة أو المؤجلة بصدق

هذه المرحلة لا تدعي اكتمال كل متطلبات المنتج النهائي:

- لا توجد عمليات Update/Delete كاملة لكل الخطط والمزودين والنماذج من الواجهة.
- لا يوجد assign plan للمستخدم أو شاشة User Details مفصلة.
- لا يوجد اختبار اتصال حقيقي بالمزود؛ لا يتم اختلاق نجاح اتصال.
- لا يوجد provider adapter أو routing/fallback engine فعلي للطلبات.
- لا يوجد request ledger لتسجيل كل طلب AI، لذلك failed requests وtoken usage وcost analytics ليست متاحة بعد.
- لا توجد رسوم بيانية حقيقية للنمو والاستخدام؛ overview يعرض أرقامًا من الجداول المتاحة فقط.
- لا يوجد دفع أو تكامل اشتراكات خارجي.
- لا توجد migrations versioned مثل Alembic؛ الموجود bootstrap غير مدمر فقط. إضافة نظام migrations تحتاج قرارًا منفصلًا.
- logout لا يبطل JWT على الخادم قبل انتهاء صلاحيته؛ يلزم token revocation أو refresh-token rotation للإنتاج.
- لا يوجد rate limiting أو MFA أو إدارة جلسات متعددة.
- التطبيق يستخدم إعدادات environment مؤقتة في المعاينة؛ يلزم إعداد أسرار إنتاجية خارج المستودع.

## 9. متغيرات البيئة المطلوبة

```text
DATABASE_URL=sqlite:///./suly_ai.db
SECRET_KEY=<random-long-server-secret>
CREDENTIAL_ENCRYPTION_KEY=<Fernet-key>
ADMIN_BOOTSTRAP_TOKEN=<one-time-secret>
ADMIN_BOOTSTRAP_EMAIL=<optional-allowed-admin-email>
```

لإنشاء Fernet key:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## 10. التوصية التالية

قبل الإنتاج، الأولوية هي إضافة migrations versioned، إدارة كاملة للخطط والمزودين والنماذج، request/usage ledger، provider adapters، routing/fallback engine، ثم MFA وrate limiting واختبارات صلاحيات شاملة. لا ينبغي ربط مفتاح AI حقيقي قبل إكمال هذه المراجعة الأمنية.
