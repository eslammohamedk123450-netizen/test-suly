import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suly_ai/features/auth/data/auth_session.dart';

void main() {
  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
    AuthSession.clear();
  });

  test('persists and restores the access token through secure storage',
      () async {
    await AuthSession.saveAccessToken('secure-token');
    AuthSession.clear();

    expect(await AuthSession.restoreAccessToken(), 'secure-token');
    expect(AuthSession.accessToken, 'secure-token');
  });

  test('clears both the in-memory and persisted token on logout', () async {
    await AuthSession.saveAccessToken('secure-token');

    await AuthSession.clearPersisted();

    expect(AuthSession.accessToken, isNull);
    expect(await AuthSession.restoreAccessToken(), isNull);
  });

  test('rejects an empty token rather than persisting an invalid session',
      () async {
    await expectLater(
      AuthSession.saveAccessToken(''),
      throwsArgumentError,
    );
    expect(AuthSession.accessToken, isNull);
  });
}
