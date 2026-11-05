# وثيقة تأسيس المرحلة الثانية — SULY AI (Phase 2 Foundation)

تاريخ التأسيس: 5 نوفمبر 2026  
الفرع المعتمد: `phase-2-flutter-foundation`  
الأساس المنطلق منه: Commit `0870fa0` على فرع `main` بمستودع `https://github.com/eslammohamedk123450-netizen/test-suly`.

---

## 1. المعمارية العامة وتوزيع المسؤوليات (Architecture & Responsibilities)

```
├── apps/
│   └── suly_app/          # تطبيق العميل المستقبلي بـ Flutter (Android / iOS / Web)
├── backend/
│   ├── config/env.ts      # قراءة وفحص متغيرات البيئة بأمان ودون تسريب أسرار
│   ├── routes/health.ts   # مسار فحص الجاهزية /api/health
│   ├── routes/chat.ts     # مسارات المحادثة /api/chat و/api/chat/stream مع تهيئة متأخرة لـ Gemini
│   ├── app.ts             # تهيئة تطبيق Express مع حدود الحمولة والتسجيل الآمن
│   ├── app.test.ts        # اختبارات الوحدات باستخدام node:test و node:assert
│   └── index.ts           # نقطة تشغيل الخادم وتكامل Vite middleware والملفات الثابتة
├── src/                   # تطبيق React الفعال الحالي ونموذج التصميم (محفوظ بالكامل)
│   ├── OriginalApp.tsx    # الواجهة الأصلية بكافة قدراتها وميزاتها
│   ├── design-prototype/  # نموذج تصميم المرحلة الأولى
│   └── App.tsx            # موجه الواجهة الحالية
├── supabase/
│   ├── config.toml        # إعداد Supabase المحلي فقط (غير مربوط بأي سحابة)
│   └── migrations/        # ملفات الـ Migration وجداول النواة مع سياسات RLS
├── server.ts              # طبقة توافقية خفيفة تستدعي backend/index.ts
├── package.json           # إدارة اعتماديات الخادم وواجهة React
└── docs/
    └── PHASE_2_FOUNDATION.md
```

### توزيع المسؤوليات:
1. **Flutter (`apps/suly_app/`)**:
   - واجهة المستخدم المستقبلية الموحدة لجميع المنصات (iOS, Android, Web).
   - في هذه المرحلة: **شاشة تمهيدية تأكيدية فقط** تدعم اللغة العربية افتراضياً واتجاه RTL، دون اتصال شبكي فعلي أو وظائف محاكاة مضللة.
2. **الخادم (`backend/` و`server.ts`)**:
   - الحفاظ على Express + TypeScript + Node.js.
   - إعادة التنظيم إلى وحدات مستقلة قابلة للاختبار والصيانة مع الحفاظ الدقيق على جميع عقود API الحالية (`/api/health`, `/api/chat`, `/api/chat/stream`).
   - تقديم تطبيق React و`/design-prototype` في بيئة التطوير عبر Vite middleware دون أدنى تغيير في التجربة الحالية.
3. **قاعدة البيانات (`supabase/`)**:
   - إعداد محلي بحت عبر `config.toml`.
   - ملف Migration أولي آمن (`20261105120000_initial_core.sql`) يحدد الجداول الأساسية مع حماية صارمة عبر Row Level Security (RLS) ومفاتيح أجنبية مركبة لمنع تسرب البيانات بين المستخدمين.
   - **لم تُربط بأي مشروع بعيد أو سحابي**.

---

## 2. استمرار وتشغيل تطبيق React الحالي

تطبيق React الحالي محفوظ بكامل مكوناته ومنطقه، بما في ذلك المحادثة والذاكرة التراكمية والصوت وتصدير المستندات ونموذج التصميم على `/design-prototype`.

### أمر التشغيل:
```bash
# تشغيل الخادم وواجهة React المدمجة
npm run dev
# أو عبر Bun
bun run dev
```
- يتوفر التطبيق مباشرة على: `http://localhost:3000`
- نموذج التصميم متاح على: `http://localhost:3000/design-prototype`
- نقطة الفحص الصحي: `http://localhost:3000/api/health`

---

## 3. تشغيل وبناء تطبيق Flutter (`apps/suly_app`)

تطبيق Flutter منظم ومبني باستخدام أدوات Flutter الرسمية ويدعم الأهداف الثلاثة:

### أوامر التطوير والفحص:
```bash
cd apps/suly_app

# 1. جلب الحزم
flutter pub get

# 2. الفحص الساكن (Lint & Static Analysis)
flutter analyze

# 3. تشغيل اختبارات الواجهة
flutter test
```

### التشغيل على المنصات:
```bash
# تشغيل على الويب
flutter run -d chrome

# تشغيل على أجهزة Android
flutter run -d android

# تشغيل على أجهزة iOS (يتطلب macOS و Xcode حصراً)
flutter run -d ios
```

### بناء حزم الإنتاج (Build):
```bash
# بناء الويب
flutter build web --release
# المخرجات تنتج في apps/suly_app/build/web/

# بناء Android APK
flutter build apk --debug
```

### تنبيه متطلبات iOS وأجهزة Apple:
- بناء حزم iOS (`.ipa` أو `Runner.app`) أو تشغيل محاكي iOS يتطلب نظام تشغيل **macOS** حصراً وتثبيت بيئة **Xcode** الرسمية مع رخصة المطورين.
- البيئة الحالية تعمل على حاوية Linux (Debian bookworm x86_64 / gVisor)، وبالتالي **لا يمكن بناء أو محاكاة iOS داخل هذه البيئة**. تم توثيق ذلك بشفافية دون ادعاء نجاح بناء لم يتم.

---

## 4. نتائج الاختبارات المنفذة فعلياً

| الاختبار | الأداة | النتيجة | الملاحظات |
|---|---|---|---|
| فحص كود الخادم وTypeScript | `npm run lint` (`tsc --noEmit`) | **نجح (0 errors)** | تم استثناء مجلدات Flutter وSupabase لمنع التعارض |
| اختبارات مسارات الخادم | `npm run test` (`node:test`) | **نجح (6/6 pass)** | فحص `/api/health`، التحقق من رفض الحمولات غير الصالحة لـ `/api/chat/stream` و`/api/chat`، والتشغيل دون مفتاح Gemini |
| بناء حزم الواجهة القديمة | `npm run build` (`vite build`) | **نجح** | مخرجات `dist/` جاهزة للإنتاج |
| فحص كود Flutter الساكن | `flutter analyze` | **نجح (No issues found)** | تم باستخدام قواعد Flutter Lints القياسية |
| اختبارات واجهة Flutter | `flutter test` | **نجح (All tests passed)** | التحقق من ظهور SULY AI واللغة العربية وRTL دون طلبات شبكة |
| بناء Flutter للويب | `flutter build web --release` | **نجح** | تم توليد `build/web/` بنجاح |
| بناء Flutter لـ Android APK | `flutter build apk` | **لم يُنفّذ** | لعدم توفر Android SDK في حاوية Linux الحالية |
| بناء Flutter لـ iOS | `flutter build ios` | **لم يُنفّذ** | يتطلب بيئة macOS + Xcode غير المتوفرة على Linux |
| تطبيق Supabase Migration محلياً | `supabase db push / start` | **لم يُنفّذ** | لعدم توفر Docker Daemon داخل بيئة gVisor؛ الملفات جاهزة ومحققة وموثقة |

---

## 5. متغيرات البيئة والتكوين غير السري

تم تعريف المتغيرات الآمنة في `.env.example`:
```env
# GEMINI_API_KEY: مفتاح اختياري لخدمات الذكاء الاصطناعي (لا يمنع بدء الخادم عند غيابه)
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: عنوان استضافة التطبيق
APP_URL="MY_APP_URL"

# Supabase (محلي اختياري فقط)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=replace-with-local-placeholder
```
- تطبيق Flutter يقبل تجاوز عنوان الخادم غير السري وقت البناء عبر:
  `--dart-define=API_BASE_URL=http://127.0.0.1:3000`
- **لا توجد أي أسرار أو مفاتيح خاصة ممررة لتطبيق العميل**.

---

## 6. جداول قاعدة البيانات وسياسات الأمان (Supabase & RLS)

الملف: `supabase/migrations/20261105120000_initial_core.sql`

### الجداول المؤسسة:
1. **`profiles`**: مرتبط بـ `auth.users(id)`، يخزن الاسم والبريد والصورة الشخصية وتاريخ التحديث.
2. **`projects`**: مشاريع المستخدم، محكومة بقيد فريد `unique(id, user_id)`.
3. **`conversations`**: محادثات المستخدم، ترتبط بمشروع اختياري وقيد أجنبي مركب يمنع ربط محادثة مستخدم بمشروع مستخدم آخر.
4. **`messages`**: رسائل المحادثات، مقيدة بـ `foreign key (conversation_id, user_id)` لضمان العزل التام.
5. **`agent_tasks`**: مهام الوكلاء المستقبلية وحالاتها (`pending`, `running`, `completed`, `failed`, `cancelled`).

### معايير الأمان و RLS:
- تفعيل Row Level Security على جميع الجداول بلا استثناء.
- السياسات تعتمد على `auth.uid() = user_id`.
- سياسات الجداول الفرعية (`messages`, `agent_tasks`) تتحقق وجوباً من ملكية المحادثة الأب عبر `exists (select 1 from conversations where ...)`.
- تم حظر أي سياسات عامة متساهلة مثل `USING (true)`.
- تم ربط Trigger تلقائي لتحديث حقل `updated_at` عند أي تعديل.

---

## 7. حدود النطاق الصريحة للمرحلة الثانية (Explicit Boundaries)
- **الحسابات والمصادقة**: لم يتم تفعيل تسجيل دخول فعلي أو ربط OAuth.
- **الوكيل والذكاء الاصطناعي في Flutter**: لم يتم ربط Flutter بنموذج Gemini أو وكيل ذكي؛ هذا مؤجل للمرحلة الثالثة بعد اعتماد الواجهات.
- **إدارة الملفات والرصيد والاشتراكات**: غير منفذة في هذه المرحلة، ولا توجد أي جداول أو شيفرات تتظاهر بتنفيذها.
- **لوحة الإدارة (Admin Panel)**: لا تزال نموذج تصميم تجريبي واجهي فقط ضمن React (`/design-prototype`)، وليست جزءاً من تطبيق Flutter، وسيتم تنفيذها لاحقاً كتطبيق ويب إداري مستقل.
- **الهوية البصرية والألوان**: السمة الحالية في Flutter مؤقتة وقابلة للتبديل، وبانتظار اعتماد المالك النهائي للألوان والخطوط.
