/// إعدادات بيئة تطبيق SULY AI (غير سرية)
///
/// ملاحظة أمنية ومعمارية:
/// - هذا الملف مخصص للقيم العامة وغير الحساسة فقط (اسم التطبيق، رقم الإصدار، عنوان API الاختباري).
/// - لا يجوز إدراج أي مفاتيح خاصة مثل Gemini API Key أو Supabase Service Role Key هنا؛
///   حيث إن كل ما يوضع في تطبيق العميل قابل للاستخراج.
/// - يمكن تجاوز عنوان الخادم عند بناء التطبيق باستخدام:
///   `flutter build <target> --dart-define=API_BASE_URL=http://your-server:3000`
class AppEnvironment {
  AppEnvironment._();

  /// اسم التطبيق العام
  static const String appName = 'SULY AI';

  /// وصف موجز للمرحلة
  static const String phaseDescription = 'المرحلة الثانية: تأسيس منصة Flutter';

  /// عنوان الخادم الاختباري المحلي
  /// الافتراضي هو خادم Express المحلي عبر المنفذ 3000
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3000',
  );

  /// بيئة التشغيل الحالية
  static const String environmentName = String.fromEnvironment(
    'APP_ENV',
    defaultValue: 'development',
  );

  /// اللغة الافتراضية للتطبيق
  static const String defaultLanguageCode = 'ar';
}
