import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/canvas_state.dart';
import '../../../../core/theme/app_colors.dart';

/// مساحة العمل التفاعلية Canvas لتحرير الأكواد والمستندات
class CanvasPanel extends StatefulWidget {
  const CanvasPanel({
    super.key,
    required this.canvas,
    required this.onClose,
    required this.onUpdateContent,
    required this.onAskAi,
    this.isRtl = true,
  });

  final CanvasState canvas;
  final VoidCallback onClose;
  final ValueChanged<String> onUpdateContent;
  final ValueChanged<String> onAskAi;
  final bool isRtl;

  @override
  State<CanvasPanel> createState() => _CanvasPanelState();
}

class _CanvasPanelState extends State<CanvasPanel> {
  late TextEditingController _controller;
  bool _copied = false;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.canvas.content);
    _controller.addListener(() {
      widget.onUpdateContent(_controller.text);
    });
  }

  @override
  void didUpdateWidget(CanvasPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.canvas.content != _controller.text) {
      _controller.text = widget.canvas.content;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _copyToClipboard() {
    Clipboard.setData(ClipboardData(text: _controller.text));
    setState(() => _copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  int get _wordCount => _controller.text.trim().isEmpty
      ? 0
      : _controller.text.trim().split(RegExp(r'\s+')).length;

  int get _lineCount => _controller.text.isEmpty ? 1 : _controller.text.split('\n').length;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final headerBg = isDark ? const Color(0xFF171717) : const Color(0xFFF9F9F9);
    final border = isDark ? const Color(0xFF2F2F2F) : const Color(0xFFE5E5E5);
    final textColor = isDark ? const Color(0xFFECECEC) : const Color(0xFF0D0D0D);

    return Container(
      decoration: BoxDecoration(
        color: bg,
        border: Border(
          left: BorderSide(color: border, width: 1),
          right: BorderSide(color: border, width: 1),
        ),
      ),
      child: Column(
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: headerBg,
              border: Border(bottom: BorderSide(color: border)),
            ),
            child: Row(
              children: [
                Icon(
                  widget.canvas.type == 'code' ? Icons.code : Icons.description,
                  size: 18,
                  color: AppColors.primaryGold,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.canvas.title,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: textColor,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                // Language / Type badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGold.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    widget.canvas.language.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryGold,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Copy Button
                IconButton(
                  tooltip: widget.isRtl ? 'نسخ المحتوى' : 'Copy',
                  icon: Icon(
                    _copied ? Icons.check : Icons.copy,
                    size: 16,
                    color: _copied ? AppColors.success : textColor,
                  ),
                  onPressed: _copyToClipboard,
                ),
                // Close Button
                IconButton(
                  tooltip: widget.isRtl ? 'إغلاق مساحة العمل' : 'Close',
                  icon: const Icon(Icons.close, size: 18),
                  onPressed: widget.onClose,
                ),
              ],
            ),
          ),

          // Code/Document Editor Area
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Line numbers
                Container(
                  width: 38,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  color: isDark ? const Color(0xFF181818) : const Color(0xFFF3F3F3),
                  child: ListView.builder(
                    itemCount: _lineCount,
                    itemBuilder: (context, index) => Text(
                      '${index + 1}',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: isDark ? const Color(0xFF6E6E6E) : const Color(0xFF9E9E9E),
                        height: 1.5,
                      ),
                    ),
                  ),
                ),
                // Text Area
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: TextField(
                      controller: _controller,
                      maxLines: null,
                      expands: true,
                      style: TextStyle(
                        fontFamily: widget.canvas.type == 'code' ? 'monospace' : 'inherit',
                        fontSize: 13.5,
                        height: 1.5,
                        color: textColor,
                      ),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                        filled: false,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // AI Quick Actions & Metrics Footer
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: headerBg,
              border: Border(top: BorderSide(color: border)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Quick Action Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildAiChip(
                        icon: Icons.auto_fix_high,
                        label: widget.isRtl ? 'تحسين' : 'Polish',
                        prompt: 'Please polish and improve the writing/code quality in this Canvas content.',
                      ),
                      const SizedBox(width: 6),
                      _buildAiChip(
                        icon: Icons.compress,
                        label: widget.isRtl ? 'تقصير' : 'Shorten',
                        prompt: 'Make this Canvas content more concise and shorter.',
                      ),
                      const SizedBox(width: 6),
                      _buildAiChip(
                        icon: Icons.unfold_more,
                        label: widget.isRtl ? 'توسيع' : 'Lengthen',
                        prompt: 'Expand this Canvas content with more details, documentation, and examples.',
                      ),
                      const SizedBox(width: 6),
                      _buildAiChip(
                        icon: Icons.bug_report,
                        label: widget.isRtl ? 'فحص الأخطاء' : 'Fix Bugs',
                        prompt: 'Review this code in Canvas, detect any bugs, and provide the fixed version.',
                      ),
                      const SizedBox(width: 6),
                      _buildAiChip(
                        icon: Icons.comment,
                        label: widget.isRtl ? 'إضافة تعليقات' : 'Add Comments',
                        prompt: 'Add helpful inline comments and docstrings to this Canvas code.',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                // Metrics
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.isRtl
                          ? 'الأسطر: $_lineCount | الكلمات: $_wordCount'
                          : 'Lines: $_lineCount | Words: $_wordCount',
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                    Text(
                      widget.canvas.type == 'code' ? 'Code Canvas' : 'Document Canvas',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryGold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiChip({
    required IconData icon,
    required String label,
    required String prompt,
  }) {
    return ActionChip(
      avatar: Icon(icon, size: 14, color: AppColors.primaryGold),
      label: Text(label, style: const TextStyle(fontSize: 12)),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 0),
      onPressed: () => widget.onAskAi(prompt),
      backgroundColor: AppColors.primaryGold.withValues(alpha: 0.08),
      side: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.2)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    );
  }
}
