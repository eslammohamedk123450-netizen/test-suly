/// Holds the access token for the current authenticated app session.
/// Persistence, when enabled by a platform-specific session store, is owned
/// by the presentation/auth bootstrap layer; this class never writes secrets.
class AuthSession {
  AuthSession._();

  static String? accessToken;

  static void clear() => accessToken = null;
}
