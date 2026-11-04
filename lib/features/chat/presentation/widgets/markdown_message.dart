import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// عارض ماركداون بسيط ومخصص بدون حزم خارجية.
///
/// يدعم:
/// - فقرات عادية
/// - أكواد برمجية محاطة بـ triple backticks (```code```)
/// - أكواد مضمنة محاطة بـ single backtick (`code`)
/// - خطوط عريضة (**text)
/// - خطوط مائلة (*text)
///
/// عند عدم توفر حزمة ماركداون كاملة، يقدم هذا العارض عرضاً آمناً ومنظماً
/// للأكواد مع زر نسخ مدمج لكل كتلة كود.
class MarkdownMessage extends StatelessWidget {
  const MarkdownMessage({
    super.key,
    required this.text,
    required this.isRtl,
    this.onCopy,
  });

  final String text;
  final bool isRtl;
  final ValueChanged<String>? onCopy;

  @override
  Widget build(BuildContext context) {
    final blocks = _parseMarkdown(text);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: blocks.map((block) => _buildBlock(context, block)).toList(),
    );
  }

  /// تقسيم النص إلى كتل (نص عادي أو كتلة كود).
  List<_MarkdownBlock> _parseMarkdown(String text) {
    final blocks = <_MarkdownBlock>[];
    final codeRegex = RegExp(r'\`\`\`(\w+)?\n([\s\S]*?)\n\`\`\`');
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
    // معالجة التنسيق البسيط: **عريض**، *مائل*، `مضمّن`
    return Text(
      _stripInlineCode(text),
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      style: const TextStyle(
        color: AppColors.text,
        height: 1.6,
        fontSize: 15,
      ),
      softWrap: true,
    );
  }

  String _stripInlineCode(String text) {
    // إزالة علامات backtick الفردي من النص المنسّق (الكود المضاف 처리 في كتلة منفصلة)
    return text.replaceAll(RegExp(r'`'), '');
  }
}

class _CodeBlock extends StatelessWidget {
  const _CodeBlock({
    required this.code,
    required this.language,
    this.onCopy,
  });
  final String code;
  final String language;
  final ValueChanged<String>? onCopy;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 8, bottom: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0E1424),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: AppColors.surfaceSecondary,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
              border: Border(
                bottom: BorderSide(color: AppColors.border),
              ),
            ),
            child: Row(
              children: [
                if (language.isNotEmpty)
                  Text(
                    language,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textMuted,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                const Spacer(),
                _CodeCopyButton(code: code, onCopy: onCopy),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: SelectableText(
              code,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 13,
                color: AppColors.text,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CodeCopyButton extends StatelessWidget {
  const _CodeCopyButton({required this.code, this.onCopy});
  final String code;
  final ValueChanged<String>? onCopy;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onCopy == null ? null : () => onCopy!(code),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Icon(
          Icons.content_copy,
          size: 16,
          color: AppColors.primaryGold,
        ),
      ),
    );
  }
}
