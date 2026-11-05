import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class SlashCommandOption {
  final String cmd;
  final String label;
  final String description;
  final IconData icon;

  const SlashCommandOption({
    required this.cmd,
    required this.label,
    required this.description,
    required this.icon,
  });
}

/// قائمة أوامر سلاش المنبثقة
class SlashCommandsMenu extends StatelessWidget {
  const SlashCommandsMenu({
    super.key,
    required this.filter,
    required this.onSelect,
    this.isRtl = true,
  });

  final String filter;
  final ValueChanged<SlashCommandOption> onSelect;
  final bool isRtl;

  static const List<SlashCommandOption> allCommands = [
    SlashCommandOption(
      cmd: '/image',
      label: 'Image Generation',
      description: 'توليد صور فنية ورسومات بواسطة الذكاء الاصطناعي',
      icon: Icons.image,
    ),
    SlashCommandOption(
      cmd: '/canvas',
      label: 'Open Canvas',
      description: 'فتح مساحة عمل جانبية لتحرير المستندات والأكواد',
      icon: Icons.splitscreen,
    ),
    SlashCommandOption(
      cmd: '/code',
      label: 'Write Code',
      description: 'كتابة برمجيات، دوال، أو مراجعة أكواد',
      icon: Icons.code,
    ),
    SlashCommandOption(
      cmd: '/chart',
      label: 'Create Chart',
      description: 'إنشاء رسم بياني تفاعلي لعرض البيانات',
      icon: Icons.bar_chart,
    ),
    SlashCommandOption(
      cmd: '/web',
      label: 'Web Search',
      description: 'البحث عن معلومات محدثة ومباشرة من الويب',
      icon: Icons.language,
    ),
    SlashCommandOption(
      cmd: '/reason',
      label: 'Deep Reasoning',
      description: 'تفعيل التفكير المنطقي العميق خطوة بخطوة',
      icon: Icons.psychology,
    ),
    SlashCommandOption(
      cmd: '/summarize',
      label: 'Summarize',
      description: 'تلخيص سريع لنص طويل أو نقاط رئيسية',
      icon: Icons.summarize,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final query = filter.replaceFirst('/', '').toLowerCase().trim();
    final filtered = allCommands
        .where((c) =>
            c.cmd.toLowerCase().contains(query) ||
            c.label.toLowerCase().contains(query) ||
            c.description.toLowerCase().contains(query))
        .toList();

    if (filtered.isEmpty) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF2A2A2A) : Colors.white;
    final border = isDark ? const Color(0xFF383838) : const Color(0xFFE5E5E5);

    return Container(
      constraints: const BoxConstraints(maxHeight: 260, maxWidth: 360),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.08),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: ListView.separated(
          shrinkWrap: true,
          padding: const EdgeInsets.symmetric(vertical: 6),
          itemCount: filtered.length,
          separatorBuilder: (_, __) => Divider(height: 1, color: border.withValues(alpha: 0.5)),
          itemBuilder: (context, index) {
            final cmd = filtered[index];
            return ListTile(
              dense: true,
              leading: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primaryGold.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(cmd.icon, size: 16, color: AppColors.primaryGold),
              ),
              title: Text(
                cmd.cmd,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              subtitle: Text(
                cmd.description,
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              onTap: () => onSelect(cmd),
            );
          },
        ),
      ),
    );
  }
}
