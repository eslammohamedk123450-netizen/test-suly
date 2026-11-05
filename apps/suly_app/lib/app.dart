import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/config/app_environment.dart';
import 'core/theme/app_theme.dart';
import 'features/home/presentation/home_screen.dart';

/// تطبيق SULY AI الأساسي
///
/// يدعم اللغة العربية افتراضياً مع ضبط اتجاه القراءة والكتابة من اليمين لليسار (RTL).
class SulyApp extends StatelessWidget {
  const SulyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppEnvironment.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.interimDarkTheme,
      // اللغة الافتراضية هي العربية مع توفير الإنجليزية كلغة بديلة
      locale: const Locale('ar'),
      supportedLocales: const [
        Locale('ar'),
        Locale('en'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const HomeScreen(),
    );
  }
}
