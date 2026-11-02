import 'package:flutter/material.dart';

/// SULY AI brand color palette.
///
/// Centralized here so every surface in the app references a single
/// source of truth for the visual identity.
abstract final class AppColors {
  AppColors._();

  // Backgrounds
  static const Color background = Color(0xFF080B14);
  static const Color surface = Color(0xFF151A27);
  static const Color surfaceSecondary = Color(0xFF252B3A);

  // Accents
  static const Color primaryGold = Color(0xFFD4AF37);
  static const Color secondaryGold = Color(0xFFB88A2B);

  // Text
  static const Color text = Color(0xFFF5F0E2);

  // Derived / utility
  static const Color textMuted = Color(0xFFB8B0A0);
  static const Color border = Color(0xFF2E3446);
  static const Color error = Color(0xFFE06C6C);
}
