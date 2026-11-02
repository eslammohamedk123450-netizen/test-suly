/// Route path constants for SULY AI.
///
/// Only [home] is implemented in STEP 01. The remaining entries are
/// reserved placeholders so future modules can be wired without
/// renaming existing routes.
abstract final class AppRoutes {
  AppRoutes._();

  static const String home = '/';

  // Reserved for future modules (STEP 02+). Kept as constants only.
  static const String chat = '/chat';
  static const String agents = '/agents';
  static const String projects = '/projects';
  static const String files = '/files';
  static const String studio = '/studio';
  static const String connectors = '/connectors';
  static const String settings = '/settings';
  static const String admin = '/admin';
}
