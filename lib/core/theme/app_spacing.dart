import 'package:flutter/material.dart';

/// Centralized spacing, sizing, and radius tokens for SULY AI.
///
/// Keeping these values in one place keeps the visual rhythm consistent
/// across the design system without scattering magic numbers.
abstract final class AppSpacing {
  AppSpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;

  static const EdgeInsets pagePadding = EdgeInsets.all(md);
  static const EdgeInsets cardPadding = EdgeInsets.all(lg);
}

abstract final class AppRadii {
  AppRadii._();

  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
}

abstract final class AppSizes {
  AppSizes._();

  static const double sidebarWidth = 264;
  static const double sidebarCompactWidth = 72;
  static const double avatarSize = 36;
  static const double maxContentWidth = 1180;
}
