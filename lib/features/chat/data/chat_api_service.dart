import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/config/api_config.dart';

/// نتيجة إرسال رسالة محادثة إلى السيرفر.
class ChatApiResult {
  const ChatApiResult._({
    required this.success,
    this.reply,
    this.error,
  });

  factory ChatApiResult.success(String reply) => ChatApiResult._(
        success: true,
        reply: reply,
      );

  factory ChatApiResult.error(String error) => ChatApiResult._(
        success: false,
        error: error,
      );

  /// هل انتهت العملية بنجاح وحصلنا على رد صالح.
  final bool success;

  /// نص الرد من الحقل "reply" عند النجاح فقط.
  final String? reply;

  /// وصف الخطأ عند الفشل فقط.
  final String? error;
}

/// طبقة خدمة صغيرة للاتصال بـ API المحادثة فقط.
class ChatApiService {
  /// مهلة الاتصال القصوى.
  static const Duration _timeout = Duration(seconds: 15);

  /// ترسل رسالة المحادثة عبر POST إلى /api/v1/chat/ وترجع النتيجة المحللة.
  ///
  /// لا تُلقي استثناءات؛ تُ収録 جميع حالات الفشل في [ChatApiResult].
  Future<ChatApiResult> sendMessage(String message) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.chatEndpoint}');

      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'message': message}),
      ).timeout(_timeout, onTimeout: () {
        throw TimeoutException('انتهت مهلة الاتصال بالسيرفر.', _timeout);
      });

      // التحقق من رمز حالة HTTP.
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return ChatApiResult.error(
          'فشل الاتصال بالسيرفر (كود الاستجابة: ${response.statusCode})',
        );
      }

      // تحليل JSON والتحقق من صحته.
      Map<String, dynamic> data;
      try {
        data = jsonDecode(response.body) as Map<String, dynamic>;
      } catch (_) {
        return ChatApiResult.error('استجابة غير صالحة من السيرفر.');
      }

      // التحقق من وجود حقل "reply" وأنه نص غير فارغ.
      final reply = data['reply'];
      if (reply == null || (reply as String).trim().isEmpty) {
        return ChatApiResult.error(
          'لم يتلقى السيرفر ردًا صالحًا (حقل "reply" مفقود أو فارغ).',
        );
      }

      // لا نعتبر provider_connected: false خطأ؛ فهو رد تجريبي متوقع من Backend.
      return ChatApiResult.success(reply as String);
    } on TimeoutException {
      return ChatApiResult.error('انتهت مهلة الاتصال بالسيرفر.');
    } on http.ClientException {
      return ChatApiResult.error(
        'تعذر الوصول إلى السيرفر. تأكد من اتصال الإنترنت وعنوان API.',
      );
    } catch (_) {
      return ChatApiResult.error('حدث خطأ غير متوقع أثناء الاتصال بالسيرفر.');
    }
  }
}
