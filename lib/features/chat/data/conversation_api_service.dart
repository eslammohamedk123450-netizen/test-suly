import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/config/api_config.dart';
import '../../auth/data/auth_session.dart';
import '../domain/conversation.dart';
import '../domain/message.dart';

/// Error raised when the conversation API cannot complete an operation.
class ConversationApiException implements Exception {
  const ConversationApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

/// Typed client for the authenticated conversation endpoints.
///
/// The service deliberately does not create local fallback conversations. A
/// conversation belongs to the authenticated user and must remain consistent
/// with the backend record.
class ConversationApiService {
  ConversationApiService({http.Client? client}) : _client = client;

  final http.Client? _client;

  Uri _uri(String path) => Uri.parse('${ApiConfig.baseUrl}/api/v1/chat$path');

  Map<String, String> get _headers => <String, String>{
        'Content-Type': 'application/json',
        if (AuthSession.accessToken != null)
          'Authorization': 'Bearer ${AuthSession.accessToken}',
      };

  Future<List<Conversation>> getConversationsBackend() async {
    final data = await _requestList('/conversations');
    return data.map(_conversationFromJson).toList(growable: false);
  }

  Future<Conversation> getConversationBackend(String id) async {
    final data = await _requestMap('/conversations/$id');
    return _conversationFromJson(data);
  }

  Future<Conversation> createConversationBackend({String? title}) async {
    final data = await _requestMap(
      '/conversations',
      method: 'POST',
      body: <String, dynamic>{
        if (title != null && title.trim().isNotEmpty) 'title': title.trim(),
      },
    );
    return _conversationFromJson(data);
  }

  Future<Conversation> updateConversationBackend({
    required String id,
    required String title,
  }) async {
    final data = await _requestMap(
      '/conversations/$id/rename',
      method: 'PATCH',
      body: <String, dynamic>{'new_title': title.trim()},
    );
    return _conversationFromJson(data);
  }

  Future<List<Message>> getMessagesBackend(String id) async {
    final data = await _requestList('/conversations/$id/messages');
    return data.map(_messageFromJson).toList(growable: false);
  }

  Future<void> deleteConversationBackend(String id) async {
    await _requestVoid('/conversations/$id', method: 'DELETE');
  }

  Conversation _conversationFromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final title = json['title'];
    final createdAt = DateTime.tryParse('${json['created_at']}');
    final updatedAt = DateTime.tryParse('${json['updated_at']}');
    if (id == null ||
        title is! String ||
        createdAt == null ||
        updatedAt == null) {
      throw const ConversationApiException(
          'استجابة محادثة غير صالحة من الخادم.');
    }
    return Conversation(
      id: '$id',
      title: title,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  Message _messageFromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final conversationId = json['conversation_id'];
    final role = json['role'];
    final content = json['content'];
    final timestamp = DateTime.tryParse('${json['created_at']}');
    if (id == null ||
        conversationId == null ||
        (role != 'user' && role != 'assistant') ||
        content is! String ||
        timestamp == null) {
      throw const ConversationApiException(
          'استجابة رسالة غير صالحة من الخادم.');
    }
    return Message(
      id: '$id',
      conversationId: '$conversationId',
      text: content,
      isUser: role == 'user',
      timestamp: timestamp,
    );
  }

  Future<Map<String, dynamic>> _requestMap(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? body,
  }) async {
    final response = await _request(path, method: method, body: body);
    final decoded = _decode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw ConversationApiException(
        'استجابة غير صالحة من الخادم.',
        statusCode: response.statusCode,
      );
    }
    return decoded;
  }

  Future<List<Map<String, dynamic>>> _requestList(String path) async {
    final response = await _request(path);
    final decoded = _decode(response.body);
    if (decoded is! List) {
      throw ConversationApiException(
        'استجابة قائمة غير صالحة من الخادم.',
        statusCode: response.statusCode,
      );
    }
    return decoded
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }

  Future<void> _requestVoid(
    String path, {
    required String method,
  }) async {
    await _request(path, method: method);
  }

  Future<http.Response> _request(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? body,
  }) async {
    if (AuthSession.accessToken == null || AuthSession.accessToken!.isEmpty) {
      throw const ConversationApiException('يجب تسجيل الدخول أولًا.');
    }
    try {
      final uri = _uri(path);
      final encodedBody = body == null ? null : jsonEncode(body);
      final response = switch (method) {
        'POST' =>
          await (_client?.post(uri, headers: _headers, body: encodedBody) ??
              http.post(uri, headers: _headers, body: encodedBody)),
        'PATCH' =>
          await (_client?.patch(uri, headers: _headers, body: encodedBody) ??
              http.patch(uri, headers: _headers, body: encodedBody)),
        'DELETE' => await (_client?.delete(uri, headers: _headers) ??
            http.delete(uri, headers: _headers)),
        _ => await (_client?.get(uri, headers: _headers) ??
            http.get(uri, headers: _headers)),
      };
      if (response.statusCode == 401) await AuthSession.clearPersisted();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw ConversationApiException(
          _errorMessage(response),
          statusCode: response.statusCode,
        );
      }
      return response;
    } on ConversationApiException {
      rethrow;
    } on http.ClientException catch (error) {
      throw ConversationApiException('تعذر الاتصال بخادم المحادثات: $error');
    }
  }

  dynamic _decode(String body) {
    try {
      return jsonDecode(body);
    } catch (_) {
      return null;
    }
  }

  String _errorMessage(http.Response response) {
    final decoded = _decode(response.body);
    if (decoded is Map<String, dynamic> && decoded['detail'] != null) {
      return decoded['detail'].toString();
    }
    return 'تعذر تنفيذ عملية المحادثة (HTTP ${response.statusCode}).';
  }
}
