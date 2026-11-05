import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';

/// عارض ماركداون متقدم يدعم الأكواد مع زر Canvas والتفكير المنطقي
class MarkdownMessage extends StatelessWidget {
  const MarkdownMessage({
    super.key,
    required this.text,
    required this.isRtl,
    this.thoughts,
    this.onCopy,
    this.onOpenCanvas,
  });

  final String text;
  final bool isRtl;
  final String? thoughts;
  final ValueChanged<String>? onCopy;
  final void Function(String code, String language)? onOpenCanvas;

  @override
  Widget build(BuildContext context) {
    final blocks = _parseMarkdown(text);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Thoughts / Reasoning Accordion if present
        if (thoughts != null && thoughts!.trim().isNotEmpty)
          _ThoughtsWidget(thoughts: thoughts!, isRtl: isRtl),

        ...blocks.map((block) => _buildBlock(context, block)),
      ],
    );
  }

  List<_MarkdownBlock> _parseMarkdown(String text) {
    final blocks = <_MarkdownBlock>[];
    final codeRegex = RegExp(r'```(\w+)?\n([\s\S]*?)\n```');
    int lastEnd = 0;

    for (final match in codeRegex.allMatches(text)) {
      if (match.start > lastEnd) {
        final before = text.substring(lastEnd, match.start);
        if (before.trim().isNotEmpty) {
          blocks.add(_MarkdownBlock.text(before));
        }
      }
      blocks.add(_MarkdownBlock.code(
        code: match.group(2) ?? '',
        language: match.group(1) ?? '',
      ));
      lastEnd = match.end;
    }

    if (lastEnd < text.length) {
      final after = text.substring(lastEnd);
      if (after.trim().isNotEmpty) {
        blocks.add(_MarkdownBlock.text(after));
      }
    }

    if (blocks.isEmpty) {
      blocks.add(_MarkdownBlock.text(text));
    }

    return blocks;
  }

  Widget _buildBlock(BuildContext context, _MarkdownBlock block) {
    switch (block.type) {
      case _BlockType.code:
        return _CodeBlock(
          code: block.code!,
          language: block.language ?? '',
          onCopy: onCopy,
          onOpenCanvas: onOpenCanvas,
          isRtl: isRtl,
        );
      case _BlockType.text:
        return _TextBlock(text: block.text!, isRtl: isRtl);
    }
  }
}

enum _BlockType { text, code }

class _MarkdownBlock {
  final _BlockType type;
  final String? text;
  final String? code;
  final String? language;

  _MarkdownBlock.text(this.text)
      : type = _BlockType.text,
        code = null,
        language = null;

  _MarkdownBlock.code({required this.code, required this.language})
      : type = _BlockType.code,
        text = null;
}

class _TextBlock extends StatelessWidget {
  const _TextBlock({required this.text, required this.isRtl});
  final String text;
  final bool isRtl;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? AppColors.darkText : AppColors.lightText;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: SelectableText(
        text,
        textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
        style: TextStyle(
          color: textColor,
          height: 1.6,
          fontSize: 14.5,
        ),
      ),
    );
  }
}

class _CodeBlock extends StatelessWidget {
  const _CodeBlock({
    required this.code,
    required this.language,
    this.onCopy,
    this.onOpenCanvas,
    this.isRtl = true,
  });

  final String code;
  final String language;
  final ValueChanged<String>? onCopy;
  final void Function(String code, String language)? onOpenCanvas;
  final bool isRtl;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF7F7F7);
    final headerBg = isDark ? const Color(0xFF282828) : const Color(0xFFEBEBEB);
    final border = isDark ? const Color(0xFF383838) : const Color(0xFFE0E0E0);
    final textColor = isDark ? AppColors.darkText : AppColors.lightText;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: headerBg,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(11),
                topRight: Radius.circular(11),
              ),
              border: Border(bottom: BorderSide(color: border)),
            ),
            child: Row(
              children: [
                Text(
                  language.isNotEmpty ? language : 'code',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'monospace',
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
                const Spacer(),

                // Open in Canvas Button
                if (onOpenCanvas != null)
                  InkWell(
                    onTap: () => onOpenCanvas!(code, language.isEmpty ? 'dart' : language),
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGold.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.splitscreen, size: 12, color: AppColors.primaryGold),
                          const SizedBox(width: 4),
                          Text(
                            isRtl ? 'كانفاس' : 'Canvas',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryGold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Copy button
                InkWell(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: code));
                    if (onCopy != null) onCopy!(code);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(isRtl ? 'تم نسخ الكود!' : 'Code copied!'),
                        duration: const Duration(seconds: 1),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(6),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.copy, size: 12),
                        const SizedBox(width: 4),
                        Text(isRtl ? 'نسخ' : 'Copy', style: const TextStyle(fontSize: 11)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Code text
          Padding(
            padding: const EdgeInsets.all(12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: SelectableText(
                code,
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: textColor,
                  height: 1.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ThoughtsWidget extends StatefulWidget {
  const _ThoughtsWidget({required this.thoughts, required this.isRtl});
  final String thoughts;
  final bool isRtl;

  @override
  State<_ThoughtsWidget> createState() => _ThoughtsWidgetState();
}

class _ThoughtsWidgetState extends State<_ThoughtsWidget> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF1B1B1B) : const Color(0xFFF3F3F3);
    final border = isDark ? const Color(0xFF2C2C2C) : const Color(0xFFE5E5E5);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.circular(10),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  const Icon(Icons.psychology, size: 16, color: AppColors.primaryGold),
                  const SizedBox(width: 8),
                  Text(
                    widget.isRtl ? 'طريقة التفكير والتحليل المنطقي (Thinking)' : 'Reasoning Process',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                  const Spacer(),
                  Icon(_expanded ? Icons.expand_less : Icons.expand_more, size: 18),
                ],
              ),
            ),
          ),
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: SelectableText(
                widget.thoughts,
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  height: 1.5,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
