import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../../../core/config/api_config.dart';
import '../../../core/models/attachment_item.dart';
import '../../auth/data/auth_session.dart';

/// يرفع مرفقًا إلى مساحة المستخدم الخاصة في الخادم ويعيد معرّفه.
/// لا يرسل ملفًا من دون جلسة دخول أو إذا تجاوز حد الخادم البالغ 10 MiB.
class ChatAttachmentApiService {
  Future<int> upload(AttachmentItem attachment) async {
    final token = AuthSession.accessToken;
    if (token == null || token.isEmpty) {
      throw StateError('يلزم تسجيل الدخول قبل رفع الملفات.');
    }
    if (attachment.size != null && attachment.size! > 10 * 1024 * 1024) {
      throw StateError('حجم الملف يتجاوز الحد المسموح به (10 ميغابايت).');
    }

    final bytes = attachment.textContent != null
        ? utf8.encode(attachment.textContent!)
        : base64Decode(attachment.data);
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('${ApiConfig.baseUrl}/api/v1/files/upload'),
    )
      ..headers['Authorization'] = 'Bearer $token'
      ..files.add(
        http.MultipartFile.fromBytes(
          'upload',
          bytes,
          filename: attachment.name,
          contentType: MediaType.parse(attachment.mimeType),
        ),
      );

    final streamed = await request.send().timeout(const Duration(seconds: 60));
    final response = await http.Response.fromStream(streamed);
    if (response.statusCode != 201) {
      String detail = 'تعذر رفع الملف (HTTP ${response.statusCode}).';
      try {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        if (data['detail'] is String) detail = data['detail'] as String;
      } catch (_) {}
      throw StateError(detail);
    }

    final payload = jsonDecode(response.body) as Map<String, dynamic>;
    final id = payload['id'];
    if (id is! int)
      throw const FormatException('معرّف الملف غير صالح من الخادم.');
    return id;
  }
}
