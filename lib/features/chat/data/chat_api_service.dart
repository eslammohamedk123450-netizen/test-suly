/// خدمة API للمحادثة مع backend SULY AI.
///
/// ترسل الرسائل وتستقبل الردود من مزود الذكاء الاصطناعي.
/// جميع حالات الفشل تُ収録 في [ChatApiResult]؛ لا تُلقي استثناءات.
library;

import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/config/api_config.dart';
import '../../auth/data/auth_session.dart';

/// نتيجة استدعاء واجهة المحادثة، تضم حالة النجاح/الفشل والبيانات الوصفية.
class ChatApiResult {
  const ChatApiResult._({
    required this.success,
    this.reply,
    this.error,
    this.providerConnected = false,
    this.status,
  });

  /// نتيجة ناجحة تحتوي على رد المساعد.
  factory ChatApiResult.success({
    required String reply,
    required String status,
    required bool providerConnected,
  }) =>
      ChatApiResult._(
        success: true,
        reply: reply,
        status: status,
        providerConnected: providerConnected,
      );

  /// نتيجة فاشلة تحتوي على وصف الخطأ.
  factory ChatApiResult.error(
    String error, {
    bool providerConnected = false,
  }) =>
      ChatApiResult._(
        success: false,
        error: error,
        providerConnected: providerConnected,
      );

  /// هل انتهت العملية بنجاح وتم استلام رد صالح.
  final bool success;

  /// نص الرد من الحقل "reply" عند النجاح فقط.
  final String? reply;

  /// وصف الخطأ عند الفشل فقط.
  final String? error;

  /// هل أكد السيرفر أن مزود الذكاء الاصطناعي متصل وجاهز.
  final bool providerConnected;

  /// قيمة الحقل "status" من الاستجابة إن وجدت.
  final String? status;
}

/// معلمة طلب إرسال رسالة محادثة.
class ChatMessageParams {
  /// نص الرسالة المراد إرسالها.
  final String message;

  /// سجل المحادثة السابق (اختياري، أقصاه 40 دوراً).
  final List<Map<String, String>>? history;

  ChatMessageParams({
    required this.message,
    this.history,
  });
}

/// دور واحد في سجل المحادثة (role + content).
class ChatTurn {
  final String role;
  final String content;

  const ChatTurn({required this.role, required this.content});
}

/// ترسل رسالة محادثة إلى السيرفر وترجع [ChatApiResult].
///
/// الطلب يُرسل عبر POST إلى [ApiConfig.chatEndpoint] مع نص الرسالة وسجل المحادثة.
/// يتم تضمين Authorization: Bearer <token> من [AuthSession] عند توفره.
/// لا تُلقي استثناءات؛ كل أخطاء الشبكة والخادم تُرجع في النتيجة.
Future<ChatApiResult> sendMessage({
  required String message,
  List<Map<String, String>> history = const [],
}) async {
  try {
    final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.chatEndpoint}');

    final requestBody = <String, dynamic>{
      'message': message,
      'history': history,
    };

    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    if (AuthSession.accessToken != null) {
      headers['Authorization'] = 'Bearer ${AuthSession.accessToken}';
    }

    final response = await http.post(
      uri,
      headers: headers,
      body: jsonEncode(requestBody),
    ).timeout(const Duration(seconds: 65), onTimeout: () {
      throw TimeoutException('انتهت مهلة الاتصال بالسيرفر.');
    });

    // التحقق من رمز حالة HTTP
    if (response.statusCode < 200 || response.statusCode >= 300) {
      // انتهاء الجلسة (401)
      if (response.statusCode == 401) {
        AuthSession.clear();
        return ChatApiResult.error(
          'انتهت جلسة الدخول. يُرجى إعادة إرسال الرسالة وتسجيل الدخول مجددًا.',
          providerConnected: false,
        );
      }
      // عدم كفاية الرصيد (402)
      if (response.statusCode == 402) {
        return ChatApiResult.error(
          'رصيد غير كافٍ للاستمرار. يُرجى إضافة رصيد للمتابعة.',
          providerConnected: false,
        );
      }
      // عدم وجود صلاحية (403)
      if (response.statusCode == 403) {
        return ChatApiResult.error(
          'لا يوجد لديك صلاحية للقيام بهذه العملية.',
          providerConnected: false,
        );
      }
      // تجاوز حدود الاستخدام (429)
      if (response.statusCode == 429) {
        return ChatApiResult.error(
          'تم تجاوز حد الاستخدام. يُرجى المحاولة لاحقًا.',
          providerConnected: false,
        );
      }
      // أخطاء الخادم (500 وما فوق)
      return ChatApiResult.error(
        'فشل الاتصال بالسيرفر (كود الاستجابة: ${response.statusCode})',
        providerConnected: false,
      );
    }

    // تحليل استجابة JSON
    Map<String, dynamic> data;
    try {
      data = jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      return ChatApiResult.error(
        'استجابة غير صالحة من السيرفر.',
        providerConnected: false,
      );
    }

    // التحقق من وجود حقل "reply" وأنه نص غير فارغ
    final reply = data['reply'];
    if (reply == null || (reply as String).trim().isEmpty) {
      return ChatApiResult.error(
        'لم يتلق السيرفر ردًا صالحًا (حقل "reply" مفقود أو فارغ).',
        providerConnected: false,
      );
    }

    // التحقق من provider_connected
    final providerConnected = data['provider_connected'] ?? false;
    if (providerConnected != true) {
      return ChatApiResult.error(
        'خدمة الذكاء الاصطناعي غير مهيأة بعد.',
        providerConnected: false,
      );
    }

    final status = data['status'] as String?;

    return ChatApiResult.success(
      reply: reply as String,
      status: status ?? 'success',
      providerConnected: true,
    );
  } on TimeoutException {
    return ChatApiResult.error(
      'انتهت مهلة الاتصال بالسيرفر.',
      providerConnected: false,
    );
  } on http.ClientException {
    return ChatApiResult.error(
      'تعذر الوصول إلى السيرفر. تأكد من اتصال الإنترنت وعنوان API.',
      providerConnected: false,
    );
  } catch (_) {
    return ChatApiResult.error(
      'حدث خطأ غير متوقع أثناء الاتصال بالسيرفر.',
      providerConnected: false,
    );
  }
}

/// مسح رمز المصادقة المخزن.
void clearAuth() {
  AuthSession.clear();
}
��