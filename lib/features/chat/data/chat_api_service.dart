import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/config/api_config.dart';
import '../../auth/data/auth_session.dart';

/// نتيجة إرسال رسالة محادثة إلى السيرفر.
class ChatApiResult {
  const ChatApiResult._({
    required this.success,
    this.reply,
    this.error,
    this.providerConnected = false,
  });

  factory ChatApiResult.success(String reply) => ChatApiResult._(
        success: true,
        reply: reply,
        providerConnected: true,
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

  /// Whether the server confirmed a configured provider answered.
  final bool providerConnected;
}

/// طبقة خدمة صغيرة للاتصال بـ API المحادثة فقط.
class ChatApiService {
  /// مهلة الاتصال القصوى.
  static const Duration _timeout = Duration(seconds: 65);

  /// ترسل رسالة المحادثة عبر POST إلى /api/v1/chat/ وترجع النتيجة المحللة.
  ///
  /// لا تُلقي استثناءات؛ تُ収録 جميع حالات الفشل في [ChatApiResult].
  Future<ChatApiResult> sendMessage(
    String message, {
    List<Map<String, String>> history = const [],
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.chatEndpoint}');

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (AuthSession.accessToken != null)
            'Authorization': 'Bearer ${AuthSession.accessToken}',
        },
        body: jsonEncode({'message': message, 'history': history}),
      ).timeout(_timeout, onTimeout: () {
        throw TimeoutException('انتهت مهلة الاتصال بالسيرفر.', _timeout);
      });

      // التحقق من رمز حالة HTTP.
      if (response.statusCode < 200 || response.statusCode >= 300) {
        if (response.statusCode == 401) {
          AuthSession.clear();
          return ChatApiResult.error('انتهت جلسة الدخول. أعد إرسال الرسالة وسجّل الدخول مجددًا.');
        }
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

      if (data['provider_connected'] != true) {
        return ChatApiResult.error('خدمة الذكاء الاصطناعي غير مهيأة بعد.');
      }
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
