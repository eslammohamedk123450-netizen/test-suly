import 'package:flutter/material.dart';

/// السمة البصرية المؤقتة لتطبيق SULY AI
///
/// تنبيه معتمَد:
/// - هذه الألوان والأنماط مؤقتة وقابلة للتبديل بالكامل وليست قراراً نهائياً.
/// - خيارات الألوان والهوية البصرية قيد المراجعة وبانتظار اعتماد المالك النهائي.
class AppTheme {
  AppTheme._();

  // ألوان مؤقتة للواجهة (Interim Palette)
  static const Color primary = Color(0xFF0F172A); // Slate 900
  static const Color primaryContainer = Color(0xFF1E293B); // Slate 800
  static const Color accent = Color(0xFFD97706); // Amber 600 (Interim accent)
  static const Color background = Color(0xFF090D16);
  static const Color surface = Color(0xFF111827);
  static const Color surfaceSubtle = Color(0xFF1F2937);

  // ألوان الحالات الإرشادية
  static const Color success = Color(0xFF10B981); // Emerald 500
  static const Color warning = Color(0xFFF59E0B); // Amber 500
  static const Color error = Color(0xFFEF4444); // Red 500
  static const Color info = Color(0xFF3B82F6); // Blue 500

  // ألوان النصوص المؤقتة
  static const Color textPrimary = Color(0xFFF9FAFB);
  static const Color textSecondary = Color(0xFF9CA3AF);
  static const Color textMuted = Color(0xFF6B7280);

  // السمة الداكنة المعتمدة مؤقتاً
  static ThemeData get interimDarkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: accent,
        surface: surface,
        error: error,
        onPrimary: textPrimary,
        onSecondary: textPrimary,
        onSurface: textPrimary,
        onError: textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: true,
        foregroundColor: textPrimary,
      ),
      cardTheme: CardTheme(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: surfaceSubtle, width: 1),
        ),
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          color: textPrimary,
          fontSize: 28,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
        ),
        titleLarge: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(
          color: textPrimary,
          fontSize: 16,
          height: 1.6,
        ),
        bodyMedium: TextStyle(
          color: textSecondary,
          fontSize: 14,
          height: 1.5,
        ),
        labelSmall: TextStyle(
          color: textMuted,
          fontSize: 12,
        ),
      ),
    );
  }
}
