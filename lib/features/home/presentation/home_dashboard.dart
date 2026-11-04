import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// Empty, user-owned landing state. Recent items are loaded only from a real
/// authenticated history source; never seed the screen with sample tasks.
class HomeDashboard extends StatelessWidget {
  const HomeDashboard({super.key, required this.onStartConversation});

  final VoidCallback onStartConversation;

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 680),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 76,
                      height: 76,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: const Icon(
                        Icons.auto_awesome,
                        size: 38,
                        color: AppColors.primaryGold,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      'مرحبًا بك في SULY AI',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            color: AppColors.text,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    const Text(
                      'اسأل عمّا تريد، وسأساعدك خطوة بخطوة.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.textMuted, height: 1.6),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    FilledButton.icon(
                      onPressed: onStartConversation,
                      icon: const Icon(Icons.add_comment_outlined),
                      label: const Text('ابدأ محادثة'),
                      style: FilledButton.styleFrom(
                        minimumSize: const Size(220, 52),
                        backgroundColor: AppColors.primaryGold,
                        foregroundColor: AppColors.background,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}
