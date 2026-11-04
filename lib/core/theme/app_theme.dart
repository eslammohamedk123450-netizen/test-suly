import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_spacing.dart';

/// Centralized Midnight Gold Luxury theme shared by the existing app surfaces.
abstract final class AppTheme {
  AppTheme._();

  static ThemeData dark({String fontFamily = 'Tajawal'}) {
    const colorScheme = ColorScheme.dark(
      primary: AppColors.darkGold,
      secondary: AppColors.darkSecondaryGold,
      surface: AppColors.darkSurface,
      error: AppColors.error,
      onPrimary: AppColors.darkBackground,
      onSecondary: AppColors.darkBackground,
      onSurface: AppColors.darkText,
      onError: AppColors.darkText,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: fontFamily,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.darkBackground,
      canvasColor: AppColors.darkSurface,
      dividerColor: AppColors.darkBorder,
      textTheme: _textTheme(AppColors.darkText, fontFamily),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkSurface,
        foregroundColor: AppColors.darkText,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
      ),
      cardTheme: CardThemeData(
        color: AppColors.darkSurface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.lg),
          side: const BorderSide(color: AppColors.darkBorder),
        ),
      ),
      drawerTheme: const DrawerThemeData(backgroundColor: AppColors.darkSurface),
      navigationRailTheme: const NavigationRailThemeData(
        backgroundColor: AppColors.darkSurface,
        selectedIconTheme: IconThemeData(color: AppColors.darkGold),
        selectedLabelTextStyle: TextStyle(color: AppColors.darkGold),
        unselectedIconTheme: IconThemeData(color: AppColors.darkTextMuted),
        unselectedLabelTextStyle: TextStyle(color: AppColors.darkTextMuted),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.darkSurface,
        indicatorColor: AppColors.darkGold.withValues(alpha: 0.16),
        elevation: 0,
        height: 70,
        labelTextStyle: WidgetStateProperty.resolveWith((states) => TextStyle(
              fontFamily: fontFamily,
              fontSize: 12,
              fontWeight: states.contains(WidgetState.selected)
                  ? FontWeight.w700
                  : FontWeight.w500,
              color: states.contains(WidgetState.selected)
                  ? AppColors.darkGold
                  : AppColors.darkTextMuted,
            )),
        iconTheme: WidgetStateProperty.resolveWith((states) => IconThemeData(
              color: states.contains(WidgetState.selected)
                  ? AppColors.darkGold
                  : AppColors.darkTextMuted,
            )),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkInputFill,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide:
              const BorderSide(color: AppColors.darkGold, width: 1.4),
        ),
        labelStyle: const TextStyle(color: AppColors.darkTextMuted),
        hintStyle: const TextStyle(color: AppColors.darkTextMuted),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.darkGold,
          foregroundColor: AppColors.darkBackground,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadii.md),
          ),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.darkGold,
          foregroundColor: AppColors.darkBackground,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadii.md),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.darkGold,
          side: const BorderSide(color: AppColors.darkGold),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadii.md),
          ),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.darkSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.xl),
          side: const BorderSide(color: AppColors.darkBorder),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.darkSurfaceSecondary,
        contentTextStyle:
            TextStyle(color: AppColors.darkText, fontFamily: fontFamily),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
        ),
      ),
      textSelectionTheme: const TextSelectionThemeData(
        cursorColor: AppColors.darkGold,
        selectionColor: Color(0x554A6CF7),
        selectionHandleColor: AppColors.darkGold,
      ),
    );
  }

  static ThemeData light({String fontFamily = 'Inter'}) {
    const colorScheme = ColorScheme.light(
      primary: AppColors.lightGold,
      secondary: AppColors.lightSecondaryGold,
      surface: AppColors.lightSurface,
      error: AppColors.error,
      onPrimary: AppColors.lightBackground,
      onSecondary: AppColors.lightBackground,
      onSurface: AppColors.lightText,
      onError: AppColors.lightText,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      fontFamily: fontFamily,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.lightBackground,
      canvasColor: AppColors.lightSurface,
      dividerColor: AppColors.border,
      textTheme: _textTheme(AppColors.lightText, fontFamily),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.lightSurface,
        foregroundColor: AppColors.lightText,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: AppColors.lightSurface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.lg),
          side: const BorderSide(color: AppColors.border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightSurfaceSecondary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.lightGold, width: 1.4),
        ),
      ),
    );
  }

  static TextTheme _textTheme(Color baseColor, String fontFamily) => TextTheme(
        displayLarge: _style(baseColor, fontFamily, 48, FontWeight.w700, 1.2),
        displayMedium: _style(baseColor, fontFamily, 36, FontWeight.w700, 1.2),
        displaySmall: _style(baseColor, fontFamily, 32, FontWeight.w700, 1.2),
        headlineLarge: _style(baseColor, fontFamily, 28, FontWeight.w600, 1.25),
        headlineMedium: _style(baseColor, fontFamily, 22, FontWeight.w600, 1.3),
        headlineSmall: _style(baseColor, fontFamily, 20, FontWeight.w600, 1.3),
        titleLarge: _style(baseColor, fontFamily, 18, FontWeight.w600, 1.3),
        titleMedium: _style(baseColor, fontFamily, 16, FontWeight.w600, 1.3),
        titleSmall: _style(baseColor, fontFamily, 14, FontWeight.w600, 1.3),
        bodyLarge: _style(baseColor, fontFamily, 16, FontWeight.w400, 1.55),
        bodyMedium: _style(baseColor, fontFamily, 14, FontWeight.w400, 1.5),
        bodySmall: _style(baseColor, fontFamily, 12, FontWeight.w400, 1.45),
        labelLarge: _style(baseColor, fontFamily, 14, FontWeight.w600, 1.2),
        labelMedium: _style(baseColor, fontFamily, 12, FontWeight.w500, 1.2),
        labelSmall: _style(baseColor, fontFamily, 11, FontWeight.w500, 1.2),
      );

  static TextStyle _style(
    Color color,
    String fontFamily,
    double size,
    FontWeight weight,
    double height,
  ) =>
      TextStyle(
        color: color,
        fontFamily: fontFamily,
        fontSize: size,
        fontWeight: weight,
        height: height,
      );
}
