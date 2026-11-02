import 'package:flutter/material.dart';

import '../../../core/constants/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// Home dashboard for STEP 02.
///
/// Presents branding, a welcome message, the main workspace entry point, and
/// visual previews of future capabilities. Nothing here performs AI work or
/// invents activity.
class HomeDashboard extends StatelessWidget {
  const HomeDashboard({super.key, required this.onStartConversation});

  final VoidCallback onStartConversation;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1180),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              const _HeroSection(),
              const SizedBox(height: AppSpacing.xl),
              _WorkspaceSection(onStartConversation: onStartConversation),
              const SizedBox(height: AppSpacing.xl),
              const _CapabilitiesSection(),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          AppStrings.appName,
          style: theme.textTheme.displayMedium?.copyWith(
            color: AppColors.primaryGold,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          AppStrings.tagline,
          style: theme.textTheme.titleLarge?.copyWith(
            color: AppColors.textMuted,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Text(
          AppStrings.welcomeTitle,
          style: theme.textTheme.headlineLarge,
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          AppStrings.welcomeSubtitle,
          style: theme.textTheme.bodyLarge?.copyWith(
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }
}

class _WorkspaceSection extends StatelessWidget {
  const _WorkspaceSection({required this.onStartConversation});

  final VoidCallback onStartConversation;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            AppStrings.workspaceTitle,
            style: theme.textTheme.headlineMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            AppStrings.startConversationHint,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onStartConversation,
              icon: const Icon(Icons.chat_bubble_outline),
              label: Text(AppStrings.startConversation),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.md,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
class _CapabilitiesSection extends StatelessWidget {
  const _CapabilitiesSection();

  static const List<_Capability> _capabilities = <_Capability>[
    _Capability(
      title: AppStrings.capAssistant,
      description: 'Conversational help for everyday tasks.',
      icon: Icons.chat_bubble_outline,
    ),
    _Capability(
      title: AppStrings.capAgents,
      description: 'Specialized agents for focused workflows.',
      icon: Icons.smart_toy_outlined,
    ),
    _Capability(
      title: AppStrings.capCoding,
      description: 'Code understanding, generation, and review.',
      icon: Icons.code_outlined,
    ),
    _Capability(
      title: AppStrings.capResearch,
      description: 'Deep research and source synthesis.',
      icon: Icons.search_outlined,
    ),
    _Capability(
      title: AppStrings.capProjects,
      description: 'Organize work into projects and files.',
      icon: Icons.folder_outlined,
    ),
    _Capability(
      title: AppStrings.capStudio,
      description: 'Creative tools and media generation.',
      icon: Icons.auto_awesome_outlined,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          AppStrings.futureCapabilities,
          style: theme.textTheme.headlineMedium,
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          AppStrings.futureCapabilitiesHint,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: AppColors.textMuted,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        LayoutBuilder(
          builder: (BuildContext context, BoxConstraints constraints) {
            final width = constraints.maxWidth;
            int columns = 1;
            if (width >= 900) {
              columns = 3;
            } else if (width >= 600) {
              columns = 2;
            }
            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: columns,
                crossAxisSpacing: AppSpacing.md,
                mainAxisSpacing: AppSpacing.md,
                childAspectRatio: 1.5,
              ),
              itemCount: _capabilities.length,
              itemBuilder: (BuildContext context, int index) {
                return _CapabilityCard(capability: _capabilities[index]);
              },
            );
          },
        ),
      ],
    );
  }
}

class _Capability {
  const _Capability({
    required this.title,
    required this.description,
    required this.icon,
  });

  final String title;
  final String description;
  final IconData icon;
}

class _CapabilityCard extends StatelessWidget {
  const _CapabilityCard({required this.capability});

  final _Capability capability;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(capability.icon, color: AppColors.primaryGold),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSecondary,
                  borderRadius: BorderRadius.circular(AppRadii.sm),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  AppStrings.comingSoon,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.textMuted,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            capability.title,
            style: theme.textTheme.titleLarge,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            capability.description,
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.textMuted,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

