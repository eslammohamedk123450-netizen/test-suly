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

  // ---------- Light Mode ----------
  static const Color lightBackground = Color(0xFFF7F7F5);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceSecondary = Color(0xFFF0EEE8);
  static const Color lightGold = Color(0xFFB88A2B);
  static const Color lightSecondaryGold = Color(0xFF9A731E);
  static const Color lightText = Color(0xFF171923);

  // Backward-compatible aliases (dark-first product identity).
  static const Color background = darkBackground;
  static const Color surface = darkSurface;
  static const Color surfaceSecondary = darkSurfaceSecondary;
  static const Color primaryGold = darkGold;
  static const Color secondaryGold = darkSecondaryGold;
  static const Color text = darkText;

  // Derived / utility
  static const Color textMuted = Color(0xFF9A9A9A);
  static const Color border = Color(0xFF36373A);
  static const Color error = Color(0xFFE06C6C);
  static const Color success = Color(0xFF86C86C);
  static const Color inputFill = Color(0xFF0E1424);
}
