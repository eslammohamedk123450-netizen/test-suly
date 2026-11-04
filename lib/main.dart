import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/theme/app_colors.dart';
import 'core/theme/app_spacing.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/suly_brand_mark.dart';
import 'features/admin/presentation/admin_screen.dart';
import 'features/chat/presentation/functional_chat_screen.dart';
import 'l10n/generated/app_localizations.dart';

void main() => runApp(const SulyAiApp());

class SulyAiApp extends StatefulWidget {
  const SulyAiApp({super.key});

  @override
  State<SulyAiApp> createState() => _SulyAiAppState();
}

class _SulyAiAppState extends State<SulyAiApp> {
  static const _localeKey = 'suly_locale';
  Locale _locale = const Locale('ar');

  @override
  void initState() {
    super.initState();
    _restoreLocale();
  }

  Future<void> _restoreLocale() async {
    try {
      final preferences = await SharedPreferences.getInstance();
      final languageCode = preferences.getString(_localeKey);
      if (mounted && (languageCode == 'ar' || languageCode == 'en')) {
        setState(() => _locale = Locale(languageCode!));
      }
    } catch (_) {
      // Keep Arabic as the default if the platform preference store is unavailable.
    }
  }

  Future<void> _changeLocale(String languageCode) async {
    if (languageCode != 'ar' && languageCode != 'en') return;
    final nextLocale = Locale(languageCode);
    if (_locale == nextLocale) return;
    setState(() => _locale = nextLocale);
    try {
      final preferences = await SharedPreferences.getInstance();
      await preferences.setString(_localeKey, languageCode);
    } catch (_) {
      // The locale still changes for this session when persistence is unavailable.
    }
  }

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'SULY AI',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(
          fontFamily: _locale.languageCode == 'ar' ? 'Tajawal' : 'Inter',
        ),
        locale: _locale,
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        home: _SulyShell(onLocaleChanged: _changeLocale),
      );
}

class _SulyShell extends StatefulWidget {
  const _SulyShell({required this.onLocaleChanged});

  final ValueChanged<String> onLocaleChanged;

  @override
  State<_SulyShell> createState() => _SulyShellState();
}

class _SulyShellState extends State<_SulyShell> {
  late int _index = switch (Uri.base.queryParameters['screen']) {
    'chat' => 1,
    'admin' => 2,
    _ => 1,
  };

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    final width = MediaQuery.sizeOf(context).width;
    final isWide = width >= 920;
    final pages = IndexedStack(
      index: _index,
      children: [
        _HomeLanding(onStartChat: () => setState(() => _index = 1)),
        FunctionalChatScreen(onLocaleChanged: widget.onLocaleChanged),
        const AdminScreen(),
      ],
    );

    if (isWide) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Row(
            children: [
              _DesktopSidebar(
                selectedIndex: _index,
                strings: strings,
                onSelect: (index) => setState(() => _index = index),
                onLocaleChanged: widget.onLocaleChanged,
              ),
              const VerticalDivider(width: 1, color: AppColors.border),
              Expanded(child: pages),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _MobileHeader(
              strings: strings,
              onLocaleChanged: widget.onLocaleChanged,
            ),
            Expanded(child: pages),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (index) => setState(() => _index = index),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home_rounded),
            label: strings.navHome,
          ),
          NavigationDestination(
            icon: const Icon(Icons.chat_bubble_outline_rounded),
            selectedIcon: const Icon(Icons.chat_bubble_rounded),
            label: strings.navChat,
          ),
          NavigationDestination(
            icon: const Icon(Icons.admin_panel_settings_outlined),
            selectedIcon: const Icon(Icons.admin_panel_settings_rounded),
            label: strings.navAdmin,
          ),
        ],
      ),
    );
  }
}

class _DesktopSidebar extends StatelessWidget {
  const _DesktopSidebar({
    required this.selectedIndex,
    required this.strings,
    required this.onSelect,
    required this.onLocaleChanged,
  });

  final int selectedIndex;
  final AppLocalizations strings;
  final ValueChanged<int> onSelect;
  final ValueChanged<String> onLocaleChanged;

  @override
  Widget build(BuildContext context) => Container(
        width: 270,
        color: AppColors.surface,
        padding: const EdgeInsetsDirectional.fromSTEB(18, 22, 18, 18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const SulyBrandMark(size: 42),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        strings.appName,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: AppColors.text,
                              letterSpacing: 1.2,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      Text(
                        strings.tagline,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppColors.textMuted,
                              fontSize: 9,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
              child: Divider(height: 1, color: AppColors.border),
            ),
            _SidebarDestination(
              icon: Icons.home_outlined,
              selectedIcon: Icons.home_rounded,
              label: strings.navHome,
              selected: selectedIndex == 0,
              onTap: () => onSelect(0),
            ),
            const SizedBox(height: AppSpacing.xs),
            _SidebarDestination(
              icon: Icons.chat_bubble_outline_rounded,
              selectedIcon: Icons.chat_bubble_rounded,
              label: strings.navChat,
              selected: selectedIndex == 1,
              onTap: () => onSelect(1),
            ),
            const SizedBox(height: AppSpacing.xs),
            _SidebarDestination(
              icon: Icons.admin_panel_settings_outlined,
              selectedIcon: Icons.admin_panel_settings_rounded,
              label: strings.navAdmin,
              selected: selectedIndex == 2,
              onTap: () => onSelect(2),
            ),
            const Spacer(),
            _LanguagePicker(
              strings: strings,
              onLocaleChanged: onLocaleChanged,
              expanded: true,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              strings.tagline,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppColors.textMuted,
                    height: 1.5,
                  ),
            ),
          ],
        ),
      );
}

class _SidebarDestination extends StatelessWidget {
  const _SidebarDestination({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: selected
            ? AppColors.primaryGold.withValues(alpha: 0.12)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadii.md),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadii.md),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
            child: Row(
              children: [
                Icon(
                  selected ? selectedIcon : icon,
                  size: 20,
                  color: selected ? AppColors.primaryGold : AppColors.textMuted,
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Text(
                    label,
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color:
                              selected ? AppColors.text : AppColors.textMuted,
                          fontWeight:
                              selected ? FontWeight.w700 : FontWeight.w500,
                        ),
                  ),
                ),
                if (selected)
                  Container(
                    width: 5,
                    height: 5,
                    decoration: const BoxDecoration(
                      color: AppColors.primaryGold,
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
          ),
        ),
      );
}

class _MobileHeader extends StatelessWidget {
  const _MobileHeader({
    required this.strings,
    required this.onLocaleChanged,
  });

  final AppLocalizations strings;
  final ValueChanged<String> onLocaleChanged;

  @override
  Widget build(BuildContext context) => Container(
        height: 66,
        padding: const EdgeInsetsDirectional.fromSTEB(18, 6, 14, 6),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(bottom: BorderSide(color: AppColors.border)),
        ),
        child: Row(
          children: [
            const SulyBrandMark(size: 38),
            const SizedBox(width: AppSpacing.sm),
            Text(
              strings.appName,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: AppColors.text,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1,
                  ),
            ),
            const Spacer(),
            _LanguagePicker(
              strings: strings,
              onLocaleChanged: onLocaleChanged,
              expanded: false,
            ),
          ],
        ),
      );
}

class _LanguagePicker extends StatelessWidget {
  const _LanguagePicker({
    required this.strings,
    required this.onLocaleChanged,
    required this.expanded,
  });

  final AppLocalizations strings;
  final ValueChanged<String> onLocaleChanged;
  final bool expanded;

  @override
  Widget build(BuildContext context) => PopupMenuButton<String>(
        tooltip: strings.languageMenuTooltip,
        onSelected: onLocaleChanged,
        itemBuilder: (context) => [
          PopupMenuItem<String>(
            value: 'ar',
            child: Row(
              children: [
                const Icon(Icons.language, size: 18),
                const SizedBox(width: AppSpacing.sm),
                Text(strings.languageArabic),
              ],
            ),
          ),
          PopupMenuItem<String>(
            value: 'en',
            child: Row(
              children: [
                const Icon(Icons.language, size: 18),
                const SizedBox(width: AppSpacing.sm),
                Text(strings.languageEnglish),
              ],
            ),
          ),
        ],
        child: Container(
          constraints: BoxConstraints(minWidth: expanded ? 0 : 54),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.surfaceSecondary,
            borderRadius: BorderRadius.circular(AppRadii.md),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            mainAxisSize: expanded ? MainAxisSize.max : MainAxisSize.min,
            children: [
              const Icon(Icons.language,
                  size: 17, color: AppColors.primaryGold),
              if (expanded) ...[
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    strings.languageMenuTooltip,
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: AppColors.text,
                        ),
                  ),
                ),
              ],
              if (!expanded) ...[
                const SizedBox(width: AppSpacing.xs),
                Text(
                  Localizations.localeOf(context).languageCode.toUpperCase(),
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: AppColors.text,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ],
            ],
          ),
        ),
      );
}

class _HomeLanding extends StatelessWidget {
  const _HomeLanding({required this.onStartChat});

  final VoidCallback onStartChat;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 900;
        final horizontalPadding = constraints.maxWidth < 520 ? 22.0 : 40.0;
        final copy = _HeroCopy(
          strings: strings,
          onStartChat: onStartChat,
          centered: !isWide,
        );

        return DecoratedBox(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: AlignmentDirectional.topStart,
              end: AlignmentDirectional.bottomEnd,
              colors: [
                AppColors.background,
                Color(0xFF0C111D),
                AppColors.background
              ],
            ),
          ),
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: horizontalPadding,
              vertical: constraints.maxHeight < 620 ? 28 : 48,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1120),
                child: isWide
                    ? Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(flex: 6, child: copy),
                          const SizedBox(width: 56),
                          const Expanded(flex: 4, child: _BrandPanel()),
                        ],
                      )
                    : Column(
                        children: [
                          copy,
                          const SizedBox(height: 30),
                          const _BrandPanel(compact: true),
                        ],
                      ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _HeroCopy extends StatelessWidget {
  const _HeroCopy({
    required this.strings,
    required this.onStartChat,
    required this.centered,
  });

  final AppLocalizations strings;
  final VoidCallback onStartChat;
  final bool centered;

  @override
  Widget build(BuildContext context) {
    final alignment =
        centered ? CrossAxisAlignment.center : CrossAxisAlignment.start;
    final textAlign = centered ? TextAlign.center : TextAlign.start;
    return Column(
      crossAxisAlignment: alignment,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: AppColors.primaryGold.withValues(alpha: 0.09),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(
                color: AppColors.primaryGold.withValues(alpha: 0.28)),
          ),
          child: Text(
            strings.welcomeEyebrow,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: AppColors.primaryGold,
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w700,
                ),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Text(
          strings.welcomeTitle,
          textAlign: textAlign,
          style: Theme.of(context).textTheme.displaySmall?.copyWith(
                color: AppColors.text,
                fontWeight: FontWeight.w800,
                height: 1.18,
                letterSpacing: -0.5,
              ),
        ),
        const SizedBox(height: AppSpacing.md),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: Text(
            strings.welcomeSubtitle,
            textAlign: textAlign,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppColors.textMuted,
                  height: 1.7,
                ),
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        FilledButton.icon(
          onPressed: onStartChat,
          icon: const Icon(Icons.arrow_forward_rounded),
          label: Text(strings.startConversation),
          style: FilledButton.styleFrom(
            minimumSize: const Size(220, 54),
            padding: const EdgeInsets.symmetric(horizontal: 22),
            backgroundColor: AppColors.primaryGold,
            foregroundColor: AppColors.background,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadii.md),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Row(
            mainAxisAlignment:
                centered ? MainAxisAlignment.center : MainAxisAlignment.start,
            children: [
              const Icon(Icons.lock_outline,
                  size: 16, color: AppColors.textMuted),
              const SizedBox(width: AppSpacing.xs),
              Flexible(
                child: Text(
                  strings.privacyNote,
                  textAlign: textAlign,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textMuted,
                        height: 1.5,
                      ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          strings.emptyActivityNote,
          textAlign: textAlign,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppColors.textMuted,
              ),
        ),
      ],
    );
  }
}

class _BrandPanel extends StatelessWidget {
  const _BrandPanel({this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return Container(
      constraints: BoxConstraints(maxWidth: compact ? 340 : 420),
      width: compact ? null : double.infinity,
      padding: EdgeInsets.all(compact ? 26 : 42),
      decoration: BoxDecoration(
        color: AppColors.surface.withValues(alpha: 0.88),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGold.withValues(alpha: 0.06),
            blurRadius: 46,
            spreadRadius: 3,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SulyBrandMark(size: 106),
          const SizedBox(height: AppSpacing.lg),
          Text(
            strings.appName,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: AppColors.text,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.4,
                ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            strings.tagline,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.primaryGold,
                  letterSpacing: 0.15,
                ),
          ),
        ],
      ),
    );
  }
}
