import 'package:flutter/material.dart';

import '../../core/constants/app_strings.dart';
import '../../core/theme/app_colors.dart';
import 'under_development_view.dart';

/// Neutral placeholder used by the router for modules that are not
/// implemented yet. Clearly states that the module is under development.
class ModulePlaceholderScreen extends StatelessWidget {
  const ModulePlaceholderScreen({super.key, required this.routeName});

  final String routeName;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text(routeName)),
      body: UnderDevelopmentView(
        title: routeName,
        description: AppStrings.underDevelopment,
      ),
    );
  }
}
