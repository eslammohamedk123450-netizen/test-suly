import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Holds and securely persists the access token for the authenticated session.
class AuthSession {
  AuthSession._();

  static const _storageKey = 'suly_access_token';
  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  static String? accessToken;

  static Future<String?> restoreAccessToken() async {
    try {
      final token = await _storage.read(key: _storageKey);
      accessToken = token;
      return token;
    } catch (_) {
      accessToken = null;
      return null;
    }
  }

  static Future<void> saveAccessToken(String token) async {
    if (token.isEmpty) throw ArgumentError.value(token, 'token');
    await _storage.write(key: _storageKey, value: token);
    accessToken = token;
  }

  static Future<void> clearPersisted() async {
    accessToken = null;
    try {
      await _storage.delete(key: _storageKey);
    } catch (_) {
      // The in-memory session must still be invalidated if secure storage fails.
    }
  }

  /// Clears only the in-memory copy; use [clearPersisted] when logging out.
  static void clear() => accessToken = null;
}
