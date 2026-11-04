import 'package:flutter/material.dart';

import '../../core/routing/app_routes.dart';
import '../../core/constants/app_strings.dart';

/// A single navigation destination in the SULY AI application shell.
class SulyNavItem {
  const SulyNavItem({
    required this.id,
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.route,
    this.available = false,
  });

  final String id;
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final String route;

  /// Whether the underlying module is implemented in the current step.
  final bool available;
}

/// Source of truth for the main application navigation.
///
/// Only [home] is operational in STEP 02. Every other entry is explicitly
/// marked as unavailable so the UI never implies a working feature.
const List<SulyNavItem> sulyNavItems = <SulyNavItem>[
  SulyNavItem(
    id: 'home',
    icon: Icons.home_outlined,
    selectedIcon: Icons.home,
    label: AppStrings.navHome,
    route: AppRoutes.home,
    available: true,
  ),
  SulyNavItem(
    id: 'new_chat',
    icon: Icons.add_comment_outlined,
    selectedIcon: Icons.add_comment,
    label: AppStrings.navNewChat,
    route: AppRoutes.chat,
    available: true,
  ),
  SulyNavItem(
    id: 'agents',
    icon: Icons.smart_toy_outlined,
    selectedIcon: Icons.smart_toy,
    label: AppStrings.navAgents,
    route: AppRoutes.agents,
    available: false,
  ),
  SulyNavItem(
    id: 'projects',
    icon: Icons.folder_outlined,
    selectedIcon: Icons.folder,
    label: AppStrings.navProjects,
    route: AppRoutes.projects,
    available: false,
  ),
  SulyNavItem(
    id: 'files',
    icon: Icons.insert_drive_file_outlined,
    selectedIcon: Icons.insert_drive_file,
    label: AppStrings.navFiles,
    route: AppRoutes.files,
    available: false,
  ),
  SulyNavItem(
    id: 'studio',
    icon: Icons.auto_awesome_outlined,
    selectedIcon: Icons.auto_awesome,
    label: AppStrings.navStudio,
    route: AppRoutes.studio,
    available: false,
  ),
  SulyNavItem(
    id: 'connectors',
    icon: Icons.link_outlined,
    selectedIcon: Icons.link,
    label: AppStrings.navConnectors,
    route: AppRoutes.connectors,
    available: false,
  ),
  SulyNavItem(
    id: 'settings',
    icon: Icons.settings_outlined,
    selectedIcon: Icons.settings,
    label: AppStrings.navSettings,
    route: AppRoutes.settings,
    available: false,
  ),
  SulyNavItem(
    id: 'admin',
    icon: Icons.admin_panel_settings_outlined,
    selectedIcon: Icons.admin_panel_settings,
    label: AppStrings.navAdmin,
    route: AppRoutes.admin,
    available: true,
  ),
];

/// Convenience lookup for the index of a navigation item by id.
int sulyNavIndex(String id) =>
    sulyNavItems.indexWhere((SulyNavItem item) => item.id == id);
