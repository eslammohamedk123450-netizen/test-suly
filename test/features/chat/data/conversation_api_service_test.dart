import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:suly_ai/features/auth/data/auth_session.dart';
import 'package:suly_ai/features/chat/data/conversation_api_service.dart';

void main() {
  setUp(() => AuthSession.accessToken = 'test-access-token');
  tearDown(AuthSession.clear);

  test('maps conversation records and sends the authenticated API path',
      () async {
    final client = MockClient((request) async {
      expect(request.method, 'GET');
      expect(request.url.path, '/api/v1/chat/conversations');
      expect(request.headers['authorization'], 'Bearer test-access-token');
      return http.Response.bytes(
        utf8.encode(jsonEncode([
          {
            'id': 42,
            'title': 'محادثة اختبار',
            'created_at': '2026-11-04T10:00:00Z',
            'updated_at': '2026-11-04T10:05:00Z',
          },
        ])),
        200,
        headers: {'content-type': 'application/json; charset=utf-8'},
      );
    });
    addTearDown(client.close);

    final conversations =
        await ConversationApiService(client: client).getConversationsBackend();

    expect(conversations, hasLength(1));
    expect(conversations.single.id, '42');
    expect(conversations.single.title, 'محادثة اختبار');
    expect(
        conversations.single.createdAt.toUtc(), DateTime.utc(2026, 11, 4, 10));
  });

  test('maps backend messages into user and assistant domain messages',
      () async {
    final client = MockClient((request) async {
      expect(request.url.path, '/api/v1/chat/conversations/9/messages');
      return http.Response.bytes(
        utf8.encode(jsonEncode([
          {
            'id': 1,
            'conversation_id': 9,
            'role': 'user',
            'content': 'مرحبا',
            'created_at': '2026-11-04T10:00:00Z',
          },
          {
            'id': 2,
            'conversation_id': 9,
            'role': 'assistant',
            'content': 'أهلًا',
            'created_at': '2026-11-04T10:00:01Z',
          },
        ])),
        200,
        headers: {'content-type': 'application/json; charset=utf-8'},
      );
    });
    addTearDown(client.close);

    final messages =
        await ConversationApiService(client: client).getMessagesBackend('9');

    expect(messages, hasLength(2));
    expect(messages.first.isUser, isTrue);
    expect(messages.first.text, 'مرحبا');
    expect(messages.last.isUser, isFalse);
    expect(messages.last.conversationId, '9');
  });

  test('preserves backend error detail and status code', () async {
    final client = MockClient((_) async => http.Response.bytes(
          utf8.encode(jsonEncode({'detail': 'لا تملك صلاحية الوصول'})),
          403,
          headers: {'content-type': 'application/json; charset=utf-8'},
        ));
    addTearDown(client.close);

    await expectLater(
      ConversationApiService(client: client).getConversationsBackend(),
      throwsA(
        isA<ConversationApiException>()
            .having((error) => error.statusCode, 'statusCode', 403)
            .having(
                (error) => error.message, 'message', 'لا تملك صلاحية الوصول'),
      ),
    );
  });

  test('clears the shared access token after an unauthorized response',
      () async {
    final client = MockClient((_) async => http.Response.bytes(
          utf8.encode(jsonEncode({'detail': 'انتهت الجلسة'})),
          401,
          headers: {'content-type': 'application/json; charset=utf-8'},
        ));
    addTearDown(client.close);

    await expectLater(
      ConversationApiService(client: client).getConversationsBackend(),
      throwsA(isA<ConversationApiException>().having(
        (error) => error.statusCode,
        'statusCode',
        401,
      )),
    );
    expect(AuthSession.accessToken, isNull);
  });

  test('does not send a request when the user has no access token', () async {
    AuthSession.clear();
    var requestSent = false;
    final client = MockClient((_) async {
      requestSent = true;
      return http.Response('[]', 200);
    });
    addTearDown(client.close);

    await expectLater(
      ConversationApiService(client: client).getConversationsBackend(),
      throwsA(isA<ConversationApiException>().having(
        (error) => error.message,
        'message',
        'يجب تسجيل الدخول أولًا.',
      )),
    );
    expect(requestSent, isFalse);
  });
}
