import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/theme/app_theme.dart';
import 'features/chat/presentation/functional_chat_screen.dart';
import 'l10n/generated/app_localizations.dart';

void main() => runApp(const SulyAiApp());

class SulyAiApp extends StatefulWidget {
  const SulyAiApp({super.key});

  @override
  State<SulyAiApp> createState() => _SulyAiAppState();
}

class _SulyAiAppState extends State<SulyAiApp> {
  static const _localeKey = 'suly_locale';
  static const _themeKey = 'suly_is_dark';
  Locale _locale = const Locale('ar');
  bool _isDark = true;

  @override
  void initState() {
    super.initState();
    _restorePreferences();
  }

  Future<void> _restorePreferences() async {
    try {
      final preferences = await SharedPreferences.getInstance();
      final languageCode = preferences.getString(_localeKey);
      final isDark = preferences.getBool(_themeKey);
      if (mounted) {
        setState(() {
          if (languageCode == 'ar' || languageCode == 'en') {
            _locale = Locale(languageCode!);
          }
          if (isDark != null) {
            _isDark = isDark;
          }
        });
      }
    } catch (_) {}
  }

  Future<void> _changeLocale(String languageCode) async {
    if (languageCode != 'ar' && languageCode != 'en') return;
    final nextLocale = Locale(languageCode);
    if (_locale == nextLocale) return;
    setState(() => _locale = nextLocale);
    try {
      final preferences = await SharedPreferences.getInstance();
      await preferences.setString(_localeKey, languageCode);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final fontFamily = _locale.languageCode == 'ar' ? 'Tajawal' : 'Inter';
    return MaterialApp(
      title: 'ChatGPT - SULY AI',
      debugShowCheckedModeBanner: false,
      themeMode: _isDark ? ThemeMode.dark : ThemeMode.light,
      theme: AppTheme.light(fontFamily: fontFamily),
      darkTheme: AppTheme.dark(fontFamily: fontFamily),
      locale: _locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      home: FunctionalChatScreen(
        onLocaleChanged: _changeLocale,
      ),
    );
  }
}
