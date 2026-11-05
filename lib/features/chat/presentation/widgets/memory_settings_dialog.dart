import 'package:flutter/material.dart';
import '../../../../core/models/memory_item.dart';
import '../../../../core/theme/app_colors.dart';

/// نافذة إدارة سجل ذاكرة شات جي بي تي (ChatGPT Memory Log)
class MemorySettingsDialog extends StatefulWidget {
  const MemorySettingsDialog({
    super.key,
    required this.memories,
    required this.memoryEnabled,
    required this.onToggleMemory,
    required this.onAddMemory,
    required this.onDeleteMemory,
    required this.onClearAll,
    this.isRtl = true,
  });

  final List<MemoryItem> memories;
  final bool memoryEnabled;
  final ValueChanged<bool> onToggleMemory;
  final ValueChanged<String> onAddMemory;
  final ValueChanged<String> onDeleteMemory;
  final VoidCallback onClearAll;
  final bool isRtl;

  @override
  State<MemorySettingsDialog> createState() => _MemorySettingsDialogState();
}

class _MemorySettingsDialogState extends State<MemorySettingsDialog> {
  final TextEditingController _addController = TextEditingController();

  @override
  void dispose() {
    _addController.dispose();
    super.dispose();
  }

  void _handleAdd() {
    final text = _addController.text.trim();
    if (text.isEmpty) return;
    widget.onAddMemory(text);
    _addController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final border = isDark ? const Color(0xFF333333) : const Color(0xFFE5E5E5);

    return Dialog(
      backgroundColor: bg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 560,
        height: 520,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              children: [
                const Icon(Icons.psychology, color: AppColors.primaryGold, size: 24),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    widget.isRtl ? 'سجل ذاكرة شات جي بي تي (Memory)' : 'ChatGPT Memory Log',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const Divider(height: 20),

            // Master Toggle
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(
                widget.isRtl ? 'تفعيل الذاكرة الذكية' : 'Enable Memory',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              subtitle: Text(
                widget.isRtl
                    ? 'يتذكر شات جي بي تي تفضيلاتك وتفاصيلك المحددة عبر جميع المحادثات.'
                    : 'ChatGPT will remember details and preferences across your chats.',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                ),
              ),
              activeColor: AppColors.primaryGold,
              value: widget.memoryEnabled,
              onChanged: widget.onToggleMemory,
            ),
            const SizedBox(height: 12),

            // Add Manual Memory Field
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _addController,
                    decoration: InputDecoration(
                      hintText: widget.isRtl
                          ? 'أضف معلومة يتذكرها النموذج (مثلاً: أفضّل كود Flutter بدلاً من React)'
                          : 'Add custom memory (e.g. Always explain in Arabic)',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: border),
                      ),
                    ),
                    onSubmitted: (_) => _handleAdd(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: _handleAdd,
                  icon: const Icon(Icons.add, size: 16),
                  label: Text(widget.isRtl ? 'إضافة' : 'Add'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGold,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Memory List
            Text(
              widget.isRtl
                  ? 'الذكريات المحفوظة (${widget.memories.length}):'
                  : 'Saved Memories (${widget.memories.length}):',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),

            Expanded(
              child: widget.memories.isEmpty
                  ? Center(
                      child: Text(
                        widget.isRtl ? 'لا توجد ذكريات مسجلة بعد' : 'No memories saved yet',
                        style: TextStyle(
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                    )
                  : ListView.separated(
                      itemCount: widget.memories.length,
                      separatorBuilder: (_, __) => Divider(height: 1, color: border),
                      itemBuilder: (context, index) {
                        final mem = widget.memories[index];
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          leading: const Icon(Icons.lightbulb_outline, size: 18, color: AppColors.primaryGold),
                          title: Text(mem.content, style: const TextStyle(fontSize: 13)),
                          subtitle: Text(
                            mem.createdAt.toString().split(' ')[0],
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.error),
                            onPressed: () => widget.onDeleteMemory(mem.id),
                          ),
                        );
                      },
                    ),
            ),

            if (widget.memories.isNotEmpty)
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: widget.onClearAll,
                  icon: const Icon(Icons.delete_forever, size: 16, color: AppColors.error),
                  label: Text(
                    widget.isRtl ? 'مسح كل الذكريات' : 'Clear All Memories',
                    style: const TextStyle(color: AppColors.error, fontSize: 12),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
