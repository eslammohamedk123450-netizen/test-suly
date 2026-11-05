import 'package:flutter/material.dart';

/// ChatGPT & SULY AI Color Palette
abstract final class AppColors {
  AppColors._();

  // ---------- ChatGPT Dark Theme ----------
  static const Color darkBackground = Color(0xFF212121);
  static const Color darkSurface = Color(0xFF171717);
  static const Color darkSurfaceSecondary = Color(0xFF2F2F2F);
  static const Color darkBorder = Color(0xFF383838);
  static const Color darkText = Color(0xFFECECEC);
  static const Color darkTextMuted = Color(0xFFB4B4B4);
  static const Color darkInputFill = Color(0xFF2F2F2F);
  static const Color darkAccent = Color(0xFF10A37F); // OpenAI Emerald
  static const Color darkGold = Color(0xFF10A37F);

  // ---------- ChatGPT Light Theme ----------
  static const Color lightBackground = Color(0xFFFFFFFF);
  static const Color lightSurface = Color(0xFFF9F9F9);
  static const Color lightSurfaceSecondary = Color(0xFFF4F4F4);
  static const Color lightBorder = Color(0xFFE5E5E5);
  static const Color lightText = Color(0xFF0D0D0D);
  static const Color lightTextMuted = Color(0xFF737373);
  static const Color lightInputFill = Color(0xFFF4F4F4);
  static const Color lightAccent = Color(0xFF10A37F);
  static const Color lightGold = Color(0xFF10A37F);

  // Shared
  static const Color primaryGold = Color(0xFF10A37F);
  static const Color secondaryGold = Color(0xFF10A37F);
  static const Color error = Color(0xFFEF4444);
  static const Color success = Color(0xFF10A37F);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);

  // Legacy aliases for backward compatibility
  static const Color background = darkBackground;
  static const Color surface = darkSurface;
  static const Color surfaceSecondary = darkSurfaceSecondary;
  static const Color border = darkBorder;
  static const Color text = darkText;
  static const Color textMuted = darkTextMuted;
  static const Color inputFill = darkInputFill;
}
