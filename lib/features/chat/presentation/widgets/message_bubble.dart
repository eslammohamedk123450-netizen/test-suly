import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../domain/message.dart';
import 'markdown_message.dart';

/// فقاعة رسالة واحدة مع دعم النسخ وإظهار حالة الإرسال/إعادة التوليد.
class MessageBubble extends StatelessWidget {
  const MessageBubble({
    super.key,
    required this.message,
    required this.isRtl,
    this.onCopy,
    this.onRegenerate,
  });

  final Message message;
  final bool isRtl;
  final VoidCallback? onCopy;
  final VoidCallback? onRegenerate;

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;
    final isSending = message.status == MessageStatus.sending ||
        message.status == MessageStatus.regenerating;

    return Padding(
      padding: const EdgeInsets.symmetric(
        vertical: AppSpacing.xs,
        horizontal: AppSpacing.sm,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser) ...[
            const _Avatar(isAi: true),
            const SizedBox(width: AppSpacing.sm),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment:
                  isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.75,
                  ),
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: isUser
                        ? AppColors.primaryGold.withOpacity(0.14)
                        : AppColors.surfaceSecondary,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: Radius.circular(isUser ? 0 : 16),
                      bottomRight: Radius.circular(isUser ? 16 : 0),
                    ),
                    border: Border.all(
                      color: isUser
                          ? AppColors.primaryGold.withOpacity(0.4)
                          : AppColors.border,
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      MarkdownMessage(
                        text: message.text,
                        isRtl: isRtl,
                      ),
                      if (isSending) ...[
                        const SizedBox(height: AppSpacing.xs),
                        SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.primaryGold,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _formatTime(message.timestamp),
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted.withOpacity(0.7),
                      ),
                    ),
                    if (!isUser && !isSending) ...[
                      const SizedBox(width: AppSpacing.xs),
                      _CopyButton(
                        onPressed: onCopy,
                        tooltip: 'نسخ الرسالة',
                      ),
                      if (message.status == MessageStatus.failed &&
                          onRegenerate != null) ...[
                        const SizedBox(width: AppSpacing.xs),
                        _RegenerateButton(
                          onPressed: onRegenerate,
                          tooltip: 'إعادة التوليد',
                        ),
                      ],
                    ],
                  ],
                ),
              ],
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: AppSpacing.sm),
            const _Avatar(isAi: false),
          ],
        ],
      ),
    );
  }

  String _formatTime(DateTime time) {
    final h = time.hour.toString().padLeft(2, '0');
    final m = time.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.isAi});
  final bool isAi;

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: 16,
      backgroundColor: isAi ? AppColors.primaryGold : AppColors.border,
      child: Icon(
        isAi ? Icons.smart_toy : Icons.person,
        size: 18,
        color: isAi ? AppColors.background : AppColors.text,
      ),
    );
  }
}

class _CopyButton extends StatelessWidget {
  const _CopyButton({this.onPressed, this.tooltip});
  final VoidCallback? onPressed;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Icon(
          Icons.content_copy,
          size: 16,
          color: AppColors.textMuted,
        ),
      ),
    );
  }
}

class _RegenerateButton extends StatelessWidget {
  const _RegenerateButton({this.onPressed, this.tooltip});
  final VoidCallback? onPressed;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Icon(
          Icons.refresh,
          size: 16,
          color: AppColors.primaryGold,
        ),
      ),
    );
  }
}
