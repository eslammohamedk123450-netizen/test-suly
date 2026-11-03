import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// Compact task-oriented landing screen inspired by the supplied reference.
class HomeDashboard extends StatefulWidget {
  const HomeDashboard({super.key, required this.onStartConversation});

  final VoidCallback onStartConversation;

  @override
  State<HomeDashboard> createState() => _HomeDashboardState();
}

class _HomeDashboardState extends State<HomeDashboard> {
  bool _tasksSelected = true;

  static const _recentItems = <({String title, IconData icon, bool starred})>[
    (title: 'test-suly GitHub repository', icon: Icons.graphic_eq, starred: false),
    (title: 'تحليل مشاكل لعبة Suly_benes واقتراح تطويرها إلى 3D', icon: Icons.pie_chart_outline, starred: false),
    (title: 'German Vocabulary Flashcard App Development Guide', icon: Icons.checklist, starred: true),
    (title: 'File Content Summary Needed', icon: Icons.description_outlined, starred: false),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Row(
                children: [
                  IconButton(onPressed: () {}, tooltip: 'بحث', icon: const Icon(Icons.search)),
                  const Spacer(),
                  _ModeSwitch(tasksSelected: _tasksSelected, onChanged: (value) => setState(() => _tasksSelected = value)),
                  const Spacer(),
                  IconButton(onPressed: () {}, tooltip: 'الحساب الشخصي', icon: const Icon(Icons.person_outline)),
                ],
              ),
            ),
            SizedBox(
              height: 104,
              child: ListView(
                scrollDirection: Axis.horizontal,
                reverse: true,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: const [
                  _CategoryCard(label: 'ترقية', icon: Icons.auto_awesome),
                  _CategoryCard(label: 'أجهزة الحاسوب', icon: Icons.desktop_windows_outlined),
                  _CategoryCard(label: 'المشاريع', icon: Icons.folder_outlined),
                  _CategoryCard(label: 'المكتبة', icon: Icons.library_books_outlined),
                  _CategoryCard(label: 'الأدوات', icon: Icons.handyman_outlined),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 88),
                itemCount: _recentItems.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final item = _recentItems[index];
                  return _RecentTaskRow(title: item.title, icon: item.icon, starred: item.starred);
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                _tasksSelected ? 'المهام الأخيرة' : 'وضع الوكيل',
                style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
              ),
            ),
          ],
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingActionButton: FloatingActionButton(
        onPressed: widget.onStartConversation,
        backgroundColor: Colors.white,
        foregroundColor: AppColors.background,
        tooltip: 'محادثة جديدة',
        child: const Icon(Icons.add_comment_outlined),
      ),
    );
  }
}

class _ModeSwitch extends StatelessWidget {
  const _ModeSwitch({required this.tasksSelected, required this.onChanged});
  final bool tasksSelected;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(28), border: Border.all(color: AppColors.border)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          _ModeOption(label: 'Agent', selected: !tasksSelected, onTap: () => onChanged(false)),
          _ModeOption(label: 'المهام', selected: tasksSelected, onTap: () => onChanged(true)),
        ]),
      );
}

class _ModeOption extends StatelessWidget {
  const _ModeOption({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: selected ? AppColors.surfaceSecondary : Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 9),
            child: Text(label, style: TextStyle(color: selected ? AppColors.text : AppColors.textMuted, fontWeight: selected ? FontWeight.w600 : FontWeight.w400)),
          ),
        ),
      );
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({required this.label, required this.icon});
  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) => Container(
        width: 160,
        margin: const EdgeInsets.symmetric(horizontal: 5),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.end, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Icon(icon, color: AppColors.textMuted, size: 25),
          Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppColors.text, fontSize: 14)),
        ]),
      );
}

class _RecentTaskRow extends StatelessWidget {
  const _RecentTaskRow({required this.title, required this.icon, required this.starred});
  final String title;
  final IconData icon;
  final bool starred;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(children: [
          if (starred) const Padding(padding: EdgeInsets.only(right: 8), child: Icon(Icons.star, color: Color(0xFFFFC928), size: 21)),
          Expanded(child: Text(title, textAlign: TextAlign.right, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.text, fontWeight: FontWeight.w400))),
          const SizedBox(width: AppSpacing.md),
          Icon(icon, color: AppColors.textMuted, size: 23),
        ]),
      );
}
