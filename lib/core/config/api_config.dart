/// إعداد مركزي لعنوان Backend الخاص بـ SULY AI.
///
/// عدل قيمة [baseUrl] حسب بيئة التشغيل المستهدفة:
/// - محاكي أندرويد: 'http://10.0.2.2:8000'
/// - هاتف أندرويد حقيقي: عنوان IP المحلي للكمبيوتر على نفس شبكة Wi-Fi،
///   مثال: 'http://192.168.1.XX:8000' (لا تخترع عنوان IP).
/// - Flutter Web: العنوان الذي يمكن الوصول إليه من المتصفح، مع مراعاة
///   إعدادات CORS في FastAPI.
///
/// لا تُستخدم القيمة "localhost" كعنوان صالح لكل المنplas폼ات.
class ApiConfig {
  ApiConfig._();

  /// عنوان القاعدة للسيرفر (بدون شرطة مائلة في النهاية).
  static const String baseUrl = String.fromEnvironment(
    'SULY_API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  /// مسار نقطة نهاية المحادثة الكامل.
  static const String chatEndpoint = '/api/v1/chat/';
}
