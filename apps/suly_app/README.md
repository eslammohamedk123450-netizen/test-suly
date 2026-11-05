# SULY AI — تطبيق Flutter (المرحلة الثانية)

تطبيق متعدد المنصات يستهدف **Android** و**iOS** و**Web** من قاعدة كود موحدة، مبني وفق متطلبات المرحلة الثانية لمشروع SULY AI.

---

## 1. الأهداف والحدود الحالية (Scope & Boundaries)
- **الحالة الحالية**: مرحلة تأسيسية للواجهة فقط (UI Foundation).
- **اللغة الافتراضية**: العربية (`ar`) مع دعم كامل لاتجاه القراءة من اليمين إلى اليسار (RTL).
- **السمة البصرية (Theme)**: سمة داكنة مؤقتة قابلة للتبديل. خيارات الألوان النهائية (مثل النيلي أو الأسود والذهبي) بانتظار اعتماد المالك النهائي.
- **الحدود الصارمة**:
  - لا توجد اتصالات شبكية فعلية بالخلفية في هذا المشروع حتى اكتمال اعتماد الواجهة.
  - لا يحتوي التطبيق على أي مفاتيح سرية (مثل `GEMINI_API_KEY` أو `SUPABASE_SERVICE_ROLE_KEY`).
  - وظائف المحادثة، رفع الملفات، الرصيد، والاشتراكات غير منفذة هنا.
  - تطبيق React الأصلي هو التطبيق الفعال في مسار الويب الحالي ومحفوظ بالكامل.

---

## 2. متطلبات التشغيل والتطوير

### البيئة العامة:
- Flutter SDK 3.29+ / Dart 3.7+
- تفعيل دعم الويب: `flutter config --enable-web`

### متطلبات المنصات:
1. **الويب (Web)**:
   - متصفح حديث (Chrome / Chromium / Edge / Safari / Firefox).
2. **أندرويد (Android)**:
   - تثبيت Android SDK و Android Studio و cmdline-tools.
3. **آبل (iOS)**:
   - **يتطلب نظام macOS حصراً مع بيئة Xcode وأدوات سطر الأوامر الخاصة بآبل**.
   - لا يمكن بناء حزم iOS (`ipa`) أو تشغيل محاكي iOS في بيئة Linux أو الحاويات السحابية.

---

## 3. الأوامر المعتمدة للتشغيل والفحص

### تثبيت الحزم (Dependencies):
```bash
cd apps/suly_app
flutter pub get
```

### فحص الكود الساكن (Static Analysis):
```bash
flutter analyze
```

### تشغيل الاختبارات (Tests):
```bash
flutter test
```

### تشغيل التطبيق في وضع التطوير:
```bash
# تشغيل على الويب
flutter run -d chrome

# تشغيل على محاكي أو جهاز أندرويد
flutter run -d android

# تشغيل على محاكي iOS (يتطلب macOS + Xcode)
flutter run -d ios
```

### بناء حزم الإنتاج (Build Targets):

1. **الويب (Web)**:
   ```bash
   flutter build web --release
   ```
   تنتج مخرجات الويب في مجلد: `build/web/`.

2. **أندرويد (Android)**:
   ```bash
   # بناء حزمة تصحيح أخطاء (Debug APK)
   flutter build apk --debug

   # بناء حزمة النشر (Release Bundle)
   flutter build appbundle --release
   ```

3. **آي أو إس (iOS)**:
   ```bash
   # يتطلب بيئة macOS + Xcode
   flutter build ios --no-codesign
   ```
   *ملاحظة: بيئة Linux الحالية لا تتيح بناء حزم iOS، وتوثيق ذلك جزء من متطلبات الشفافية الهندسية.*

---

## 4. تمرير متغيرات التكوين غير السرية
يمكن تمرير عنوان الخادم الاختباري عند البناء أو التشغيل دون تخزين قيم ثابتة:
```bash
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000
```
