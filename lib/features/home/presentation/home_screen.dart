import 'package:flutter/material.dart';

import '../../../core/constants/app_strings.dart';
import '../../../core/navigation/app_nav_item.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../chat/presentation/chat_screen.dart' hide AppRadii;
import 'home_dashboard.dart';
import '../../common/under_development_view.dart';
import '../../admin/presentation/admin_screen.dart';

/// Professional responsive application shell for SULY AI.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  void _onSelected(int index) {
    if (index < 0 || index >= sulyNavItems.length) return;
    setState(() => _selectedIndex = index);
  }

  void _startConversation() => _onSelected(sulyNavIndex('new_chat'));

  Widget _buildContent() {
    if (_selectedIndex == 0) {
      return HomeDashboard(onStartConversation: _startConversation);
    }
    if (_selectedIndex == 1) {
      return const ChatScreen();
    }
    final item = sulyNavItems[_selectedIndex];
    if (item.route == AppRoutes.admin) {
      return const AdminScreen();
    }
    return UnderDevelopmentView(
      title: item.label,
      icon: item.selectedIcon,
      description: item.available
          ? null
          : '${item.label} is ${AppStrings.underDevelopment.toLowerCase()}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final width = constraints.maxWidth;
        final content = _buildContent();
        if (width >= 900) {
          return _AppShell(
            compact: false,
            selectedIndex: _selectedIndex,
            onSelected: _onSelected,
            content: content,
          );
        }
        if (width >= 600) {
          return _AppShell(
            compact: true,
            selectedIndex: _selectedIndex,
            onSelected: _onSelected,
            content: content,
          );
        }
        return _NarrowShell(
          selectedIndex: _selectedIndex,
          onSelected: _onSelected,
          content: content,
        );
      },
    );
  }
}

/// Persistent sidebar shell for medium/wide viewports.
class _AppShell extends StatelessWidget {
  const _AppShell({
    required this.compact,
    required this.selectedIndex,
    required this.onSelected,
    required this.content,
  });

  final bool compact;
  final int selectedIndex;
  final ValueChanged<int> onSelected;
  final Widget content;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Row(
        children: <Widget>[
          _Sidebar(
            compact: compact,
            selectedIndex: selectedIndex,
            onSelected: onSelected,
          ),
          const VerticalDivider(width: 1, color: AppColors.border),
          Expanded(child: content),
        ],
      ),
    );
  }
}

/// Drawer-based shell for narrow viewports.
class _NarrowShell extends StatelessWidget {
  const _NarrowShell({
    required this.selectedIndex,
    required this.onSelected,
    required this.content,
  });

  final int selectedIndex;
  final ValueChanged<int> onSelected;
  final Widget content;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(AppStrings.appName),
        leading: Builder(
          builder: (BuildContext context) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(context).openDrawer(),
            tooltip: MaterialLocalizations.of(context).openAppDrawerTooltip,
          ),
        ),
      ),
      drawer: Drawer(
        child: _Sidebar(
          compact: false,
          selectedIndex: selectedIndex,
          onSelected: (int index) {
            Navigator.of(context).pop();
            onSelected(index);
          },
        ),
      ),
      body: content,
    );
  }
}

class _Sidebar extends StatelessWidget {
  const _Sidebar({
    required this.compact,
    required this.selectedIndex,
    required this.onSelected,
  });

  final bool compact;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: compact ? AppSizes.sidebarCompactWidth : AppSizes.sidebarWidth,
      color: AppColors.surface,
      child: Column(
        children: <Widget>[
          _SidebarHeader(compact: compact),
          const Divider(height: 1, color: AppColors.border),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
              itemCount: sulyNavItems.length,
              itemBuilder: (BuildContext context, int index) {
                final item = sulyNavItems[index];
                return _SidebarItem(
                  item: item,
                  selected: index == selectedIndex,
                  compact: compact,
                  onTap: () => onSelected(index),
                );
              },
            ),
          ),
          const Divider(height: 1, color: AppColors.border),
          _ProfileArea(compact: compact),
        ],
      ),
    );
  }
}

class _SidebarHeader extends StatelessWidget {
  const _SidebarHeader({required this.compact});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.all(compact ? AppSpacing.sm : AppSpacing.lg),
      child: Row(
        children: <Widget>[
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primaryGold.withOpacity(0.16),
              borderRadius: BorderRadius.circular(AppRadii.md),
              border: Border.all(color: AppColors.primaryGold),
            ),
            child: const Icon(
              Icons.auto_awesome,
              color: AppColors.primaryGold,
              size: 20,
            ),
          ),
          if (!compact) ...<Widget>[
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                AppStrings.appName,
                style: theme.textTheme.titleLarge?.copyWith(
                  color: AppColors.primaryGold,
                  fontWeight: FontWeight.w800,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  const _SidebarItem({
    required this.item,
    required this.selected,
    required this.compact,
    required this.onTap,
  });

  final SulyNavItem item;
  final bool selected;
  final bool compact;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final itemWidget = Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      child: Material(
        color: selected
            ? AppColors.primaryGold.withOpacity(0.14)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadii.md),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadii.md),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            child: Row(
              children: <Widget>[
                Icon(
                  selected ? item.selectedIcon : item.icon,
                  color: selected ? AppColors.primaryGold : AppColors.textMuted,
                  size: 22,
                ),
                if (!compact) ...<Widget>[
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      item.label,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: selected ? AppColors.text : AppColors.textMuted,
                        fontWeight:
                            selected ? FontWeight.w600 : FontWeight.w400,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (!item.available)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.xs,
                        vertical: 2,
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
                          fontSize: 10,
                        ),
                      ),
                    ),
                ],
              ],
            ),
          ),
        ),
      ),
    );

    if (compact) {
      return Tooltip(
        message: item.available
            ? item.label
            : '${item.label} (${AppStrings.underDevelopment})',
        child: itemWidget,
      );
    }
    return itemWidget;
  }
}

class _ProfileArea extends StatelessWidget {
  const _ProfileArea({required this.compact});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.all(compact ? AppSpacing.sm : AppSpacing.md),
      child: Row(
        children: <Widget>[
          CircleAvatar(
            radius: AppSizes.avatarSize / 2,
            backgroundColor: AppColors.surfaceSecondary,
            child: const Icon(
              Icons.person_outline,
              color: AppColors.textMuted,
            ),
          ),
          if (!compact) ...<Widget>[
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(
                    AppStrings.guestUser,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: AppColors.text,
                      fontWeight: FontWeight.w600,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    AppStrings.profileUnavailable,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.textMuted,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
