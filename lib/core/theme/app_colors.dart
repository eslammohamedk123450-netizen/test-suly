import 'package:flutter/material.dart';

/// SULY AI brand color palette.
///
/// Centralized here so every surface in the app references a single
/// source of truth for the visual identity.
abstract final class AppColors {
  AppColors._();

  // Backgrounds
  static const Color background = Color(0xFF161616);
  static const Color surface = Color(0xFF202124);
  static const Color surfaceSecondary = Color(0xFF2A2B2E);

  // Accents
  static const Color primaryGold = Color(0xFFD6D6D6);
  static const Color secondaryGold = Color(0xFFB8B8B8);

  // Text
  static const Color text = Color(0xFFE4E4E4);

  // Derived / utility
  static const Color textMuted = Color(0xFF9A9A9A);
  static const Color border = Color(0xFF36373A);
  static const Color error = Color(0xFFE06C6C);
}
