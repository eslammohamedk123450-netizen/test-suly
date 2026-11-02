import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/theme/app_theme.dart';
import 'core/routing/app_router.dart';
import 'core/routing/app_routes.dart';
import 'features/home/presentation/home_screen.dart';
import 'features/common/module_placeholder_screen.dart';

void main() {
  runApp(const SulyAiApp());
}

/// Root application widget for SULY AI.
///
/// Centralizes theme configuration, routing, and top-level localization.
class SulyAiApp extends StatelessWidget {
  const SulyAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SULY AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark(),
      initialRoute: AppRoutes.home,
      onGenerateRoute: AppRouter.onGenerateRoute,
      // Arabic/English-ready typography and RTL/LTR support.
      // Defaults to LTR; supported locales can be expanded as localization
      // is added in future steps.
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const <Locale>[
        Locale('ar'), // Arabic (RTL) - primary
        Locale('en'), // English (LTR) - secondary
      ],
      locale: const Locale('ar'),
    );
  }
}
