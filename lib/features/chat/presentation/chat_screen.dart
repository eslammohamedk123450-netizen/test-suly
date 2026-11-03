import 'package:flutter/material.dart';

import '../../../core/constants/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../auth/data/auth_session.dart';
import '../../auth/presentation/auth_gate_dialog.dart';
import '../data/conversation_api_service.dart';
import '../data/conversation_repository.dart';
import '../domain/conversation.dart';
import '../domain/message.dart';
import '../widgets/message_bubble.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _textController = TextEditingController();
  final _focusNode = FocusNode();
  final _scrollController = ScrollController();
  late final ConversationRepository _repository =
      AuthSession.accessToken != null
          ? ApiConversationRepository()
          : InMemoryConversationRepository();
  final _api = ConversationApiService();

  Conversation? _activeConversation;
  bool _isSubmitting = false;
  String? _errorMessage;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _initialize() async {
    await _ensureDefaultConversation();
    if (mounted) {
      setState(() => _isInitialized = true);
      _scrollToBottom();
    }
  }
  Future<void> _ensureDefaultConversation() async {
    final conversations = await _repository.getConversations();
    if (conversations.isEmpty) {
      _activeConversation = await _repository.createConversation(
        title: 'محادثة جديدة',
      );
    } else {
      _activeConversation = conversations.first;
    }
  }

  List<Message> get _messages =>
      _activeConversation?.messages ?? const [];

  List<Map<String, String>> _getHistory() {
    return _messages
        .map((m) => {
              'role': m.isUser ? 'user' : 'assistant',
              'content': m.text,
            })
        .toList();
  }

  Future<void> _sendMessage() async {
    final message = _textController.text.trim();
    if (message.isEmpty || _isSubmitting || _activeConversation == null) return;

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final userMessage = Message(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: message,
      isUser: true,
      timestamp: DateTime.now(),
      conversationId: _activeConversation!.id,
      status: MessageStatus.sent,
    );

    await _repository.addMessage(_activeConversation!.id, userMessage);
    _textController.clear();
    _scrollToBottom();

    final result = await _api.sendMessage(
      message: message,
      history: _getHistory(),
    );

    setState(() => _isSubmitting = false);

    if (result.success && result.reply != null) {
      final assistantMessage = Message(
        id: DateTime.now().add(const Duration(milliseconds: 1))
            .millisecondsSinceEpoch
            .toString(),
        text: result.reply!,
        isUser: false,
        timestamp: DateTime.now(),
        conversationId: _activeConversation!.id,
        status: MessageStatus.sent,
      );
      await _repository.addMessage(_activeConversation!.id, assistantMessage);
      _scrollToBottom();
    } else if (result.error != null) {
      setState(() => _errorMessage = result.error);
      _markLastUserMessageFailed();
      _scrollToBottom();
    }
  }
  Future<void> _regenerateResponse() async {
    if (_isSubmitting || _activeConversation == null) return;

    final messages = _activeConversation!.messages;
    int? lastUserIndex;
    for (var i = messages.length - 1; i >= 0; i--) {
      if (messages[i].isUser) {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex == null) return;

    final userMessage = messages[lastUserIndex];

    for (var i = messages.length - 1; i > lastUserIndex; i--) {
      await _repository.removeMessage(_activeConversation!.id, messages[i].id);
    }

    setState(() => _isSubmitting = true);

    final result = await _api.sendMessage(
      message: userMessage.text,
      history: _getHistory(),
    );

    setState(() => _isSubmitting = false);

    if (result.success && result.reply != null) {
      final assistantMessage = Message(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text: result.reply!,
        isUser: false,
        timestamp: DateTime.now(),
        conversationId: _activeConversation!.id,
        status: MessageStatus.sent,
      );
      await _repository.addMessage(_activeConversation!.id, assistantMessage);
      _scrollToBottom();
    } else if (result.error != null) {
      setState(() => _errorMessage = result.error);
    }
  }

  Future<void> _copyMessage(String text) async {
    await Clipboard.setData(ClipboardData(text: text));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم النسخ إلى الحافظة'),
          duration: Duration(seconds: 2),
          backgroundColor: AppColors.primaryGold,
        ),
      );
    }
  }

  Future<void> _scrollToBottom() async {
    await Future.delayed(const Duration(milliseconds: 100));
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _startNewConversation() async {
    setState(() => _errorMessage = null);
    final conversation = await _repository.createConversation(
      title: 'محادثة جديدة',
    );
    setState(() {
      _activeConversation = conversation;
    });
    _textController.clear();
    _scrollToBottom();
  }

  Future<void> _renameConversation(String newTitle) async {
    if (_activeConversation == null) return;
    await _repository.renameConversation(
      _activeConversation!.id,
      newTitle,
    );
    setState(() {});
  }

  Future<void> _deleteActiveConversation() async {
    if (_activeConversation == null) return;
    final confirmed = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('حذف المحادثة'),
        content: const Text(
          'هل أنت متأكد أنك تريد حذف هذه المحادثة وكل رسائلها؟',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: AppColors.background,
            ),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      await _repository.deleteConversation(_activeConversation!.id);
      final conversations = await _repository.getConversations();
      if (conversations.isNotEmpty) {
        setState(() => _activeConversation = conversations.first);
      } else {
        await _startNewConversation();
      }
    }
  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primaryGold),
        ),
      );
    }

    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final hasConversation = _activeConversation != null;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          _activeConversation?.title ?? 'SULY AI',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        centerTitle: false,
        actions: [
          if (hasConversation)
            IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'محادثة جديدة',
              onPressed: _isSubmitting ? null : _startNewConversation,
            ),
          if (hasConversation)
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert),
              onSelected: (value) {
                if (value == 'rename') _showRenameDialog();
                if (value == 'delete') _deleteActiveConversation();
                if (value == 'switch') _showConversationSwitcher();
              },
              itemBuilder: (_) => [
                const PopupMenuItem(
                  value: 'switch',
                  child: Text('اختيار محادثة أخرى'),
                ),
                const PopupMenuItem(
                  value: 'rename',
                  child: Text('إعادة تسمية المحادثة'),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Text('حذف المحادثة'),
                ),
              ],
            ),
        ],
      ),
      body: Column(
        children: [
          if (_errorMessage != null)
            _ErrorBanner(message: _errorMessage!),
          Expanded(
            child: _messages.isEmpty
                ? _EmptyChatState(isRtl: isRtl)
                : ListView.builder(
                    controller: _scrollController,
                    reverse: false,
                    padding: const EdgeInsets.symmetric(
                      vertical: AppSpacing.xs,
                    ),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final message = _messages[index];
                      final showRegenerate =
                          !message.isUser &&
                          message.status == MessageStatus.failed;
                      return MessageBubble(
                        message: message,
                        isRtl: isRtl,
                        onCopy: () => _copyMessage(message.text),
                        onRegenerate:
                            showRegenerate ? _regenerateResponse : null,
                      );
                    },
                  ),
          ),
          _buildBottomBar(isRtl),
        ],
  Widget _buildBottomBar(bool isRtl) {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.md,
        AppSpacing.md,
      ),
      child: SafeArea(
        top: false,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: TextField(
                controller: _textController,
                focusNode: _focusNode,
                onSubmitted: (_) => _sendMessage(),
                enabled: !_isSubmitting,
                maxLines: 4,
                minLines: 1,
                textInputAction: TextInputAction.send,
                textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
                decoration: InputDecoration(
                  hintText: isRtl
                      ? 'اكتب رسالة...'
                      : 'Type a message...',
                  hintStyle: TextStyle(
                    color: AppColors.textMuted.withOpacity(0.6),
                  ),
                  filled: true,
                  fillColor: AppColors.inputFill,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(
                      color: AppColors.primaryGold,
                      width: 1.5,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            SizedBox(
              width: 48,
              height: 48,
              child: _isSubmitting
                  ? const Center(
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                        ),
                      ),
                    )
                  : ElevatedButton.icon(
                      onPressed:
                          _textController.text.trim().isNotEmpty
                              ? _sendMessage
                              : null,
                      icon: const Icon(Icons.send, size: 18),
                      label: const SizedBox.shrink(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGold,
                        foregroundColor: AppColors.background,
                        shape: RoundedRectangleBorder(
/// شريط خطأ يعرض رسائل الخطأ بألوان واضحة.
class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xs,
      ),
      color: AppColors.error.withOpacity(0.12),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: AppColors.error, size: 20),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: AppColors.error, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  /// حالة الشاشة عندما لا توجد رسائل بعد.
  class _EmptyChatState extends StatelessWidget {
    const _EmptyChatState({required this.isRtl});
    final bool isRtl;

    @override
    Widget build(BuildContext context) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.smart_toy,
              size: 64,
              color: AppColors.textMuted.withOpacity(0.4),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'ابدأ محادثة جديدة',
              style: TextStyle(
                color: AppColors.text,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
              textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'الشات سيُفعّل عند ربط الخلفية.',
              style: TextStyle(
                color: AppColors.textMuted,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
              textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
            ),
          ],
        ),
      );
    }
  }
}
                          borderRadius: BorderRadius.circular(12),
                        ),
                        minimumSize: const Size(48, 48),
                        padding: const EdgeInsets.all(8),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

void _showConversationSwitcher() async {
    final conversations = await _repository.getConversations();
    if (conversations.isEmpty) return;
    final selected = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('اختيار محادثة'),
        content: SizedBox(
          width: 300,
          height: 300,
          child: ListView.builder(
            itemCount: conversations.length,
            itemBuilder: (context, index) {
              final c = conversations[index];
              final isActive = c.id == _activeConversation?.id;
              return ListTile(
                title: Text(
                  c.title,
                  style: TextStyle(
                    color: isActive ? AppColors.primaryGold : AppColors.text,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
                subtitle: Text(
                  '${c.messageCount} رسالة',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
                trailing: isActive
                    ? const Icon(Icons.check, color: AppColors.primaryGold)
                    : null,
                onTap: () {
                  setState(() => _activeConversation = c);
                  Navigator.of(context).pop(c.id);
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('إغلاق'),
          ),
        ],
      ),
    );
    if (selected != null && mounted) {
      final c = await _repository.getConversation(selected);
      if (c != null) setState(() => _activeConversation = c);
    }
  }

  void _showRenameDialog() {
    final controller = TextEditingController(
      text: _activeConversation?.title ?? '',
    );
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('إعادة تسمية المحادثة'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'عنوان المحادثة',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () {
              final newTitle = controller.text.trim();
              if (newTitle.isNotEmpty) {
                _renameConversation(newTitle);
              }
              Navigator.of(context).pop();
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }

  void _markLastUserMessageFailed() {
    final messages = _activeConversation!.messages;
    for (var i = messages.length - 1; i >= 0; i--) {
      if (messages[i].isUser) {
        _repository.replaceMessage(
          _activeConversation!.id,
          messages[i].id,
          messages[i].copyWith(status: MessageStatus.failed),
        );
        break;
      }
    }
  }