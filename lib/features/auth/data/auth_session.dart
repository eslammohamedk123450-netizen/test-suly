/// Holds the short-lived access token only for the current app process.
/// The token is intentionally not persisted in plain local storage.
class AuthSession {
  AuthSession._();

  static String? accessToken;

  static void clear() => accessToken = null;
}
