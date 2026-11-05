# SULY AI — تطبيق Flutter للويب والهاتف

يحتوي المستودع على واجهة Flutter مشتركة يمكن تشغيلها على الويب وAndroid وiOS، إضافةً إلى عميل React/Vite للويب وخادم Express مستقل. **Flutter هو مسار التطبيق المشترك**؛ عميل React ليس تطبيق هاتف.

## المنصات الموجودة

- Flutter Web موجود في `web/`.
- ملفات مشاريع Android وiOS موجودة الآن في المستودع، وتُبنى من واجهة Flutter نفسها.
- يتطلب الاتصال بخادم API تمرير `SULY_API_BASE_URL`. الافتراضيات المحلية ليست للإنتاج أو الهاتف الحقيقي.
- معرّف Android الحالي `com.suly.suly_ai` مؤقت إلى أن يُعتمد معرّف النشر النهائي. يتطلب النشر إعداد HTTPS وCORS والتوقيع ومعرّفات الحزم وسياسة الخصوصية. بناء iOS يتطلب macOS وXcode.

## الميزات الحالية في Flutter

تتضمن الواجهة تصميمًا متجاوبًا، العربية RTL والإنجليزية LTR، السمة الفاتحة والداكنة، محادثات محلية مرتبطة بخادم SULY، مجلدات، سياق ذاكرة اختياري بلا بيانات افتراضية، محادثة مؤقتة لا تُحفظ رسائلها أو مرفقاتها على الخادم، Canvas، أوامر مائلة، ومعاينة ملفات CSV والنصوص. تدعم المرفقات PDF وCSV وTXT وMarkdown وJSON وصور PNG/JPEG/WebP ضمن حد الخادم (10 MiB لكل ملف). يجب أن يكون المستخدم مسجلًا وأن يكون مزود AI مهيأ في الخادم.

تبديل النموذج في واجهة Flutter غير معروض لأن الخادم يختار المزود/النموذج المهيأ؛ لذلك أزيلت قائمة النماذج التمثيلية التي لم تكن تؤثر في الطلب. بحث الويب وتوليد الصور والصوت الحقيقي تحتاج مزودًا أو إعدادًا إضافيًا، ولا ينبغي التعامل مع الأزرار التجريبية كأنها خدمة مهيأة.

## تشغيل Flutter

```bash
flutter pub get

# Flutter Web محلي
flutter run -d chrome --dart-define=SULY_API_BASE_URL=http://localhost:8000

# محاكي Android
flutter run -d android --dart-define=SULY_API_BASE_URL=http://10.0.2.2:8000

# هاتف حقيقي أو إنتاج: عنوان يمكن للهاتف الوصول إليه (يفضل HTTPS)
flutter run -d <device-id> --dart-define=SULY_API_BASE_URL=https://api.example.com

# بناء ملفات Flutter
flutter build web --dart-define=SULY_API_BASE_URL=https://api.example.com
flutter build apk --dart-define=SULY_API_BASE_URL=https://api.example.com
flutter build appbundle --dart-define=SULY_API_BASE_URL=https://api.example.com
flutter build ios --dart-define=SULY_API_BASE_URL=https://api.example.com
```

### إعداد الخادم

راجع [`backend/README.md`](backend/README.md) و[`.env.example`](.env.example) لضبط قاعدة البيانات ومفتاح الجلسات ومزود AI. لا تضع مفاتيح الخادم داخل التطبيق أو `--dart-define` لواجهات عامة؛ هذا المتغير مخصص لعنوان الخادم فقط.

## عميل React/Vite المنفصل

```bash
npm install
npm run lint
npm run build
npm run dev
```

يحتاج الخادم إلى `GEMINI_API_KEY` على الخادم لتوليد الردود الحقيقية. لا يُستخدم React لإنتاج APK أو تطبيق iOS.

## التحقق

```bash
flutter analyze
flutter test
flutter build web --dart-define=SULY_API_BASE_URL=https://api.example.com
npm run lint
npm run build
python -m pytest -q backend/tests backend/app/tests
```

لا تحفظ أسرارًا أو ملفات `.env` في Git.
