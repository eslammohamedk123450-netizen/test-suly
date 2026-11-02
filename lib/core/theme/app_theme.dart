import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Centralized theme configuration for SULY AI.
///
/// Supports both light/dark but the product identity is dark-first.
/// RTL/LTR directionality is handled by [MaterialApp] locale support.
abstract final class AppTheme {
  AppTheme._();

  static ThemeData dark() {
    final colorScheme = ColorScheme.dark(
      primary: AppColors.primaryGold,
      secondary: AppColors.secondaryGold,
      surface: AppColors.surface,
      background: AppColors.background,
      error: AppColors.error,
      onPrimary: AppColors.background,
      onSecondary: AppColors.background,
      onSurface: AppColors.text,
      onBackground: AppColors.text,
      onError: AppColors.text,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.background,
      canvasColor: AppColors.surface,
      dividerColor: AppColors.border,
      textTheme: _textTheme(AppColors.text),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.text,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: const CardTheme(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: AppColors.surface,
      ),
      navigationRailTheme: const NavigationRailThemeData(
        backgroundColor: AppColors.surface,
        selectedIconTheme: IconThemeData(color: AppColors.primaryGold),
        selectedLabelTextStyle: TextStyle(color: AppColors.primaryGold),
        unselectedIconTheme: IconThemeData(color: AppColors.textMuted),
        unselectedLabelTextStyle: TextStyle(color: AppColors.textMuted),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceSecondary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primaryGold),
        ),
        labelStyle: const TextStyle(color: AppColors.textMuted),
        hintStyle: const TextStyle(color: AppColors.textMuted),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryGold,
          foregroundColor: AppColors.background,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primaryGold,
          side: const BorderSide(color: AppColors.primaryGold),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  static TextTheme _textTheme(Color baseColor) {
    // Arabic + English ready: rely on system fonts with sensible sizes.
    // Bundled fonts can be added later under assets/fonts.
    return TextTheme(
      displayLarge: TextStyle(
        fontSize: 48,
        fontWeight: FontWeight.w700,
        color: baseColor,
        height: 1.2,
      ),
      displayMedium: TextStyle(
        fontSize: 36,
        fontWeight: FontWeight.w700,
        color: baseColor,
        height: 1.2,
      ),
      headlineLarge: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: baseColor,
        height: 1.25,
      ),
      headlineMedium: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: baseColor,
        height: 1.3,
      ),
      titleLarge: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: baseColor,
        height: 1.3,
      ),
      bodyLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: baseColor,
        height: 1.5,
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: baseColor,
        height: 1.5,
      ),
      bodySmall: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: baseColor,
        height: 1.4,
      ),
      labelLarge: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: baseColor,
        height: 1.2,
      ),
    );
  }
}
