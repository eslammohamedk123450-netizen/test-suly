import 'package:flutter/material.dart';

/// SULY AI brand color palette — Midnight Gold Luxury identity.
///
/// Dark Mode:
///   Background: #080B14
///   Surface:    #151A27
///   Secondary:  #252B3A
///   Gold:       #D4AF37
///   Secondary Gold: #B88A2B
///   Text:       #F5F0E2
///
/// Light Mode:
///   Background: #F7F7F5
///   Surface:    #FFFFFF
///   Secondary:  #F0EEE8
///   Gold:       #B88A2B
///   Text:       #171923
///
/// Centralized here so every surface in the app references a single
/// source of truth for the visual identity.
abstract final class AppColors {
  AppColors._();

  // ---------- Dark Mode (Midnight Gold Luxury) ----------
  static const Color darkBackground = Color(0xFF080B14);
  static const Color darkSurface = Color(0xFF151A27);
  static const Color darkSurfaceSecondary = Color(0xFF252B3A);
  static const Color darkGold = Color(0xFFD4AF37);
  static const Color darkSecondaryGold = Color(0xFFB88A2B);
  static const Color darkText = Color(0xFFF5F0E2);
  static const Color darkTextMuted = Color(0xFF9A9A9A);
  static const Color darkBorder = Color(0xFF36373A);
  static const Color darkInputFill = Color(0xFF0E1424);

  // ---------- Light Mode ----------
  static const Color lightBackground = Color(0xFFF7F7F5);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceSecondary = Color(0xFFF0EEE8);
  static const Color lightGold = Color(0xFF4A6CF7);
  static const Color lightSecondaryGold = Color(0xFF3657D6);
  static const Color lightText = Color(0xFF171923);

  // Default product surface follows a light, minimal chat-first palette.
  static const Color background = lightBackground;
  static const Color surface = lightSurface;
  static const Color surfaceSecondary = lightSurfaceSecondary;
  static const Color primaryGold = lightGold;
  static const Color secondaryGold = lightSecondaryGold;
  static const Color text = lightText;

  // Derived / utility
  static const Color textMuted = Color(0xFF687083);
  static const Color border = Color(0xFFE3E7EF);
  static const Color error = Color(0xFFE06C6C);
  static const Color success = Color(0xFF86C86C);
  static const Color inputFill = Color(0xFFF3F5F9);
}
