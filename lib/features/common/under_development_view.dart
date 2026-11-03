import 'package:flutter/material.dart';

import '../../core/constants/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

/// Reusable panel shown for modules that are not implemented yet.
///
/// This never implies functionality: it clearly states the module is under
/// development and lists no fake data or activity.
class UnderDevelopmentView extends StatelessWidget {
  const UnderDevelopmentView({
    super.key,
    required this.title,
    this.description,
    this.icon = Icons.construction_outlined,
  });

  final String title;
  final String? description;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.surfaceSecondary,
                  borderRadius: BorderRadius.circular(AppRadii.xl),
                  border: Border.all(color: AppColors.border),
                ),
                child: Icon(icon, color: AppColors.primaryGold, size: 34),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                title,
                style: theme.textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.secondaryGold.withOpacity(0.14),
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                  border: Border.all(color: AppColors.secondaryGold),
                ),
                child: Text(
                  AppStrings.underDevelopment,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: AppColors.secondaryGold,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                description ??
                    'This module is not implemented yet. It will become '
                        'available in a future step.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.textMuted,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
