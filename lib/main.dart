import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/theme/app_theme.dart';
import 'core/theme/app_colors.dart';
import 'core/theme/app_spacing.dart';
import 'features/admin/presentation/admin_screen.dart';
import 'features/chat/presentation/functional_chat_screen.dart';

void main() => runApp(const SulyAiApp());

class SulyAiApp extends StatelessWidget {
  const SulyAiApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'SULY AI',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark(),
        locale: const Locale('ar'),
        supportedLocales: const [Locale('ar'), Locale('en')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        home: const _SulyShell(),
      );
}

class _SulyShell extends StatefulWidget {
  const _SulyShell();

  @override
  State<_SulyShell> createState() => _SulyShellState();
}

class _SulyShellState extends State<_SulyShell> {
  late int _index = switch (Uri.base.queryParameters['screen']) {
    'chat' => 1,
    'admin' => 2,
    _ => 0,
  };

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: IndexedStack(
            index: _index,
            children: [
              _HomeLanding(onStartChat: () => setState(() => _index = 1)),
              const FunctionalChatScreen(),
              const AdminScreen(),
            ],
          ),
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: (index) => setState(() => _index = index),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'الرئيسية',
            ),
            NavigationDestination(
              icon: Icon(Icons.chat_bubble_outline),
              selectedIcon: Icon(Icons.chat_bubble),
              label: 'محادثة',
            ),
            NavigationDestination(
              icon: Icon(Icons.admin_panel_settings_outlined),
              selectedIcon: Icon(Icons.admin_panel_settings),
              label: 'الإدارة',
            ),
          ],
        ),
      );
}

class _HomeLanding extends StatelessWidget {
  const _HomeLanding({required this.onStartChat});
  final VoidCallback onStartChat;

  @override
  Widget build(BuildContext context) => Directionality(
        textDirection: TextDirection.rtl,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              title: const Text('SULY AI',
                  style: TextStyle(fontWeight: FontWeight.w800)),
              centerTitle: false,
              actions: [
                IconButton(
                  tooltip: 'ابدأ محادثة',
                  onPressed: onStartChat,
                  icon: const Icon(Icons.chat_bubble_outline),
                ),
              ],
            ),
            SliverFillRemaining(
              hasScrollBody: false,
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
                          child: const Icon(Icons.auto_awesome,
                              size: 38, color: AppColors.primaryGold),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        Text(
                          'مرحبًا بك في SULY AI',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(
                                color: AppColors.text,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        const Text(
                          'ابدأ محادثة جديدة واكتب سؤالك أو أمْلِه بصوتك. ستظهر محادثاتك أنت فقط بعد تسجيل الدخول.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppColors.textMuted,
                            height: 1.6,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        FilledButton.icon(
                          onPressed: onStartChat,
                          icon: const Icon(Icons.add_comment_outlined),
                          label: const Text('ابدأ محادثة'),
                          style: FilledButton.styleFrom(
                            minimumSize: const Size(220, 52),
                            backgroundColor: AppColors.primaryGold,
                            foregroundColor: AppColors.background,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        const Text(
                          'لا توجد مهام تجريبية أو سجل جاهز في هذه الصفحة.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      );
}
