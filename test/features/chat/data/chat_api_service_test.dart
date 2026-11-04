import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:suly_ai/features/auth/data/auth_session.dart';
import 'package:suly_ai/features/chat/data/chat_api_service.dart';

void main() {
  setUp(() => AuthSession.accessToken = 'test-access-token');
  tearDown(AuthSession.clear);

  test('sends an authenticated request and returns a valid provider response',
      () async {
    final client = MockClient((request) async {
      expect(request.method, 'POST');
      expect(request.url.path, '/api/v1/chat/');
      expect(request.headers['authorization'], 'Bearer test-access-token');
      final body = jsonDecode(request.body) as Map<String, dynamic>;
      expect(body['message'], 'مرحبا');
      expect(body['history'], [
        {'role': 'user', 'content': 'أهلًا'},
      ]);
      return http.Response.bytes(
        utf8.encode(jsonEncode({
          'reply': 'أهلًا بك',
          'provider_connected': true,
          'status': 'success',
        })),
        200,
        headers: {'content-type': 'application/json; charset=utf-8'},
      );
    });
    addTearDown(client.close);

    final result = await sendMessage(
      message: 'مرحبا',
      history: const [
        {'role': 'user', 'content': 'أهلًا'},
      ],
      client: client,
    );

    expect(result.success, isTrue);
    expect(result.reply, 'أهلًا بك');
    expect(result.providerConnected, isTrue);
    expect(result.status, 'success');
  });

  test('returns an error when reply has an invalid non-string type', () async {
    final client = MockClient((_) async => http.Response(
          jsonEncode({'reply': 123, 'provider_connected': true}),
          200,
        ));
    addTearDown(client.close);

    final result = await sendMessage(message: 'hello', client: client);

    expect(result.success, isFalse);
    expect(result.reply, isNull);
    expect(result.error, contains('ردًا صالحًا'));
  });

  test('clears the shared token and reports expiration on HTTP 401', () async {
    final client = MockClient((_) async => http.Response(
          jsonEncode({'detail': 'expired'}),
          401,
        ));
    addTearDown(client.close);

    final result = await sendMessage(message: 'hello', client: client);

    expect(result.success, isFalse);
    expect(result.error, contains('انتهت جلسة الدخول'));
    expect(AuthSession.accessToken, isNull);
  });

  test('reports network connection errors without throwing', () async {
    final client = MockClient((_) async {
      throw http.ClientException('offline');
    });
    addTearDown(client.close);

    final result = await sendMessage(message: 'hello', client: client);

    expect(result.success, isFalse);
    expect(result.error, contains('تعذر الوصول إلى السيرفر'));
  });
}
