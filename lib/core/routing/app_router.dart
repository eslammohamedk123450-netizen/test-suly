import 'package:flutter/material.dart';

import '../../features/chat/presentation/chat_screen.dart';
import '../../features/common/module_placeholder_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import 'app_routes.dart';

/// Minimal router for STEP 01.
///
/// Uses [onGenerateRoute] so unimplemented (future) routes render a
/// neutral placeholder instead of crashing.
class AppRouter {
  const AppRouter._();

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.home:
      case null:
        return MaterialPageRoute<void>(
          builder: (_) => const HomeScreen(),
          settings: settings,
        );
      case AppRoutes.chat:
        return MaterialPageRoute<void>(
          builder: (_) => const ChatScreen(),
          settings: settings,
        );
      case AppRoutes.agents:
      case AppRoutes.projects:
      case AppRoutes.files:
      case AppRoutes.studio:
      case AppRoutes.connectors:
      case AppRoutes.settings:
      case AppRoutes.admin:
        return MaterialPageRoute<void>(
          builder: (_) => ModulePlaceholderScreen(routeName: settings.name!),
          settings: settings,
        );
      default:
        return MaterialPageRoute<void>(
          builder: (_) => const _NotFoundScreen(),
          settings: settings,
        );
    }
  }
}

class _NotFoundScreen extends StatelessWidget {
  const _NotFoundScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Page not found')),
    );
  }
}
