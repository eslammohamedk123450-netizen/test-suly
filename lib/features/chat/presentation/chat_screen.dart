import 'package:flutter/material.dart';

import '../../../core/constants/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../data/chat_api_service.dart';

/// Professional AI chat interface for SULY AI.
///
/// A minimal, premium dark UI with midnight gold accents.
/// No fake AI responses — clearly indicates the AI service is not connected.
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

/// A single conversation holding its title and message list.
class Conversation {
  const Conversation({
    required this.id,
    required this.title,
    required this.messages,
    required this.createdAt,
  });

  final String id;
  final String title;
  final List<ChatMessage> messages;
  final DateTime createdAt;
}

class _ChatScreenState extends State<ChatScreen> {
  final List<Conversation> _conversations = [];
  int? _activeConversationIndex;
  bool _showConversations = false;
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _aiConnected = false;
  final ChatApiService _apiService = ChatApiService();
  String? _sendingConversationId;

  // Agent mode state — belongs to the same chat experience.
  // Switching modes never creates a new conversation: the conversation id,
  // messages and context are preserved.
  bool _agentMode = false;
  String? _selectedAgentCategory;
  bool _isSwitchingToAgent = false;

  // Conversation history panel state.
  bool _conversationCollapsed = false; // desktop sidebar collapse
  bool _showConversations = false; // mobile slide-over toggle

  /// Available agent tool categories (visual presentation only — not
  /// implemented in this phase).
  static const Map<String, IconData> _agentCategories = <String, IconData>{
    'coding': Icons.code,
    'research': Icons.search,
    'browser': Icons.public,
    'projects': Icons.folder,
    'studio': Icons.studio,
    'automation': Icons.autorenew,
  };

  /// The currently active conversation, if any.
  Conversation? get _activeConversation {
    if (_activeConversationIndex == null) return null;
    if (_activeConversationIndex! < 0 ||
        _activeConversationIndex! >= _conversations.length) return null;
    return _conversations[_activeConversationIndex!];
  }

  /// Messages of the active conversation (empty when none is active).
  List<ChatMessage> get _messages => _activeConversation?.messages ?? [];

  @override
  void initState() {
    super.initState();
    _ensureDefaultConversation();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  /// Makes sure at least one conversation exists with a default title.
  void _ensureDefaultConversation() {
    if (_conversations.isEmpty) {
      _conversations.add(Conversation(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: 'محادثة جديدة',
        messages: [],
        createdAt: DateTime.now(),
      ));
      _activeConversationIndex = 0;
    }
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    final active = _activeConversation;
    if (active == null) return;

    // لا تسمح بإرسال طلب آخر من نفس المحادثة أثناء وجود طلب جارٍ.
    if (_sendingConversationId == active.id) return;

    final sendingConversationId = active.id;

    setState(() {
      active.messages.add(ChatMessage(
        text: text,
        isUser: true,
        timestamp: DateTime.now(),
      ));
      _controller.clear();
      _sendingConversationId = sendingConversationId;
    });
    _scrollToBottom();

    final result = await _apiService.sendMessage(text);

    if (!mounted) return;

    // ابحث عن المحادثة بالمعرف، لا تعتمد على الفهرس النشط الحالي.
    final targetIndex = _conversations.indexWhere((c) => c.id == sendingConversationId);
    if (targetIndex == -1) {
        // المحادثة حُذفت، تجاهل الرد.
        if (_sendingConversationId == sendingConversationId) {
          _sendingConversationId = null;
        }
        return;
    }

    // لا让 انتهاء طلب قديم يغيّر حالة انتظار طلب أحدث.
    if (_sendingConversationId == sendingConversationId) {
      _sendingConversationId = null;
    }

    if (result.success && result.reply != null) {
      _conversations[targetIndex].messages.add(ChatMessage(
        text: result.reply!,
        isUser: false,
        timestamp: DateTime.now(),
      ));
      // تمرير إلى الأسفل فقط إذا كانت المحادثة الهدف هي النشطة حاليًا.
      if (_activeConversationIndex == targetIndex) {
        _scrollToBottom();
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.error ?? 'فشل الاتصال بالسيرفر.'),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  /// Creates a new conversation with a default title and makes it active.
  void _startNewConversation() {
    setState(() {
      _conversations.insert(0, Conversation(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: 'محادثة جديدة',
        messages: [],
        createdAt: DateTime.now(),
      ));
      _activeConversationIndex = 0;
      _controller.clear();
    });
    _scrollToBottom();
  }

  /// Switches to an existing conversation by index.
  void _selectConversation(int index) {
    if (index < 0 || index >= _conversations.length) return;
    setState(() {
      _activeConversationIndex = index;
    });
    _scrollToBottom();
  }

  /// Deletes a conversation by index and updates the active selection.
  void _deleteConversation(int index) {
    if (index < 0 || index >= _conversations.length) return;

    setState(() {
      _conversations.removeAt(index);

      if (_conversations.isEmpty) {
        _ensureDefaultConversation();
      } else if (_activeConversationIndex == index) {
        _activeConversationIndex = 0;
      } else if (_activeConversationIndex != null &&
          _activeConversationIndex! > index) {
        _activeConversationIndex = _activeConversationIndex! - 1;
      }
    });
    _scrollToBottom();
  }

  /// Prepares and performs the Chat → Agent handoff.
  ///
  /// The active conversation id, messages and context are preserved — no new
  /// conversation is created. A clear transition state is shown first so the
  /// user understands SULY is switching to Agent mode. The actual automatic
  /// intent detection is not connected yet; this is the clean callback a
  /// future AI decision can trigger.
  Future<void> _switchToAgentMode() async {
    setState(() => _isSwitchingToAgent = true);
    // Brief, visible transition state so the user understands the switch.
    await Future.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;
    setState(() {
      _isSwitchingToAgent = false;
      _agentMode = true;
      _selectedAgentCategory = null;
    });
  }

  /// Returns from Agent mode to normal Chat mode.
  void _returnToChatMode() {
    setState(() {
      _agentMode = false;
      _selectedAgentCategory = null;
    });
  }

  /// Selects (or deselects) an agent tool category. Categories are optional;
  /// the user can continue without selecting any.
  void _selectAgentCategory(String categoryId) {
    setState(() {
      _selectedAgentCategory =
          _selectedAgentCategory == categoryId ? null : categoryId;
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMobile = MediaQuery.of(context).size.width < 600;
    final textDirection = Directionality.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        titleSpacing: AppSpacing.sm,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(
              AppStrings.appName,
              style: theme.textTheme.titleMedium?.copyWith(
                color: AppColors.primaryGold,
                fontWeight: FontWeight.w800,
              ),
            ),
            Text(
              _agentMode
                  ? AppStrings.agentActive
                  : (_aiConnected
                      ? 'متصل بالذكاء الاصطناعي'
                      : 'الخدمة غير متصلة بعد'),
              style: theme.textTheme.bodySmall?.copyWith(
                color: _agentMode
                    ? AppColors.primaryGold
                    : (_aiConnected
                        ? AppColors.primaryGold
                        : AppColors.textMuted),
                fontSize: 11,
              ),
            ),
          ],
        ),
        actions: <Widget>[
          if (isMobile)
            IconButton(
              icon: Icon(
                _showConversations ? Icons.close : Icons.list,
                color: AppColors.textMuted,
              ),
              onPressed: () =>
                  setState(() => _showConversations = !_showConversations),
              tooltip: _showConversations ? 'إخفاء المحادثات' : 'إظهار المحادثات',
            ),
          // Agent mode toggle — clearly accessible next to the chat experience.
          IconButton(
            icon: Icon(
              _agentMode ? Icons.smart_toy : Icons.smart_toy_outlined,
              color: _agentMode ? AppColors.primaryGold : AppColors.textMuted,
            ),
            onPressed: _isSwitchingToAgent
                ? null
                : (_agentMode ? _returnToChatMode : _switchToAgentMode),
            tooltip: _agentMode
                ? AppStrings.returnToChat
                : AppStrings.agentModeTitle,
          ),
          // Conversation sidebar collapse/expand toggle (desktop).
          IconButton(
            icon: Icon(
              _conversationCollapsed ? Icons.chevron_right : Icons.chevron_left,
              color: _conversationCollapsed ? AppColors.primaryGold : AppColors.textMuted,
            ),
            onPressed: () => setState(() => _conversationCollapsed = !_conversationCollapsed),
            tooltip: _conversationCollapsed ? 'توسيع القائمة' : 'طي القائمة',
          ),
          // Mobile: slide-over conversation panel toggle.
          if (isMobile)
            IconButton(
              icon: Icon(
                _showConversations ? Icons.close : Icons.list,
                color: _showConversations ? AppColors.primaryGold : AppColors.textMuted,
              ),
              onPressed: () => setState(() => _showConversations = !_showConversations),
              tooltip: _showConversations ? 'إخفاء المحادثات' : 'إظهار المحادثات',
            ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          final isWide = constraints.maxWidth >= 600;

          final chatColumn = Column(
            children: <Widget>[
              Expanded(
                child: _messages.isEmpty
                    ? _WelcomePanel(theme: theme)
                    : _MessageList(
                        messages: _messages,
                        scrollController: _scrollController,
                        textDirection: textDirection,
                      ),
              ),
              // Visible transition state during the Chat → Agent handoff.
              if (_isSwitchingToAgent) _AgentTransitionBanner(),
              // Agent category selector — shown only in Agent mode. Categories
              // are optional; the user may continue without selecting any.
              if (_agentMode) _AgentCategorySelector(
                selected: _selectedAgentCategory,
                onSelect: _selectAgentCategory,
                onContinueWithout: () {
                  setState(() => _selectedAgentCategory = null);
                },
              ),
              if (_sendingConversationId == _activeConversation?.id)
                const _SendingIndicator(),
              const Divider(height: 1, color: AppColors.border),
              _InputArea(
                controller: _controller,
                onSend: _sendMessage,
                onAttach: () {},
                onNewConversation: _startNewConversation,
                onAgentToggle: _agentMode
                    ? _returnToChatMode
                    : _switchToAgentMode,
                agentMode: _agentMode,
                theme: theme,
                isMobile: isMobile,
              ),
            ],
          );

          if (isWide) {
            // Desktop: collapsible conversation list with wide chat area.
            return Row(
              children: <Widget>[
                // Conversation sidebar — collapsible.
                Expanded(
                  flex: _conversationCollapsed ? 0 : 1,
                  child: Container(
                    color: AppColors.surface,
                    child: _ConversationList(
                      conversations: _conversations,
                      activeIndex: _activeConversationIndex,
                      onSelect: _selectConversation,
                      onDelete: _deleteConversation,
                      textDirection: textDirection,
                    ),
                    width: _conversationCollapsed ? 0 : 280,
                  ),
                ),
                if (!_conversationCollapsed)
                  const VerticalDivider(width: 1, color: AppColors.border),
                Expanded(flex: _conversationCollapsed ? 3 : 2, child: chatColumn),
              ],
            );
          }

          // Mobile: chat full-screen with a slide-over conversation list.
          return Stack(
            children: <Widget>[
              chatColumn,
              if (_showConversations)
                Positioned(
                  top: 0,
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 260,
                    color: AppColors.surface,
                    child: _ConversationList(
                      conversations: _conversations,
                      activeIndex: _activeConversationIndex,
                      onSelect: (int index) {
                        _selectConversation(index);
                        setState(() => _showConversations = false);
                      },
                      onDelete: _deleteConversation,
                      textDirection: textDirection,
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

/// Welcome panel shown when no messages exist yet.
class _WelcomePanel extends StatelessWidget {
  const _WelcomePanel({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primaryGold.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(AppRadii.xl),
                  border: Border.all(
                    color: AppColors.primaryGold.withOpacity(0.35),
                  ),
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  color: AppColors.primaryGold,
                  size: 38,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                'مرحباً بك في محادثة SULY AI',
                style: theme.textTheme.headlineMedium?.copyWith(
                  color: AppColors.text,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'ابدأ بكتابة رسالتك أدناه. سيتم عرض رسائلك هنا.\n'
                'ملاحظة: خدمة الذكاء الاصطناعي غير متصلة بعد هذه النسخة.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.textMuted,
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Scrollable list of chat messages.
class _MessageList extends StatelessWidget {
  const _MessageList({
    required this.messages,
    required this.scrollController,
    required this.textDirection,
  });

  final List<ChatMessage> messages;
  final ScrollController scrollController;
  final TextDirection textDirection;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: scrollController,
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: messages.length,
      itemBuilder: (BuildContext context, int index) {
        final message = messages[index];
        return _ChatBubble(message: message);
      },
    );
  }
}

/// Single chat bubble — user messages on the right, system/info on the left.
class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUser = message.isUser;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: <Widget>[
          if (!isUser) ...<Widget>[
            _BubbleContent(
              message: message,
              isUser: false,
              theme: theme,
            ),
            const SizedBox(width: AppSpacing.sm),
            const CircleAvatar(
              radius: 10,
              backgroundColor: AppColors.surfaceSecondary,
              child: Icon(Icons.auto_awesome, color: AppColors.textMuted, size: 14),
            ),
          ] else ...<Widget>[
            const CircleAvatar(
              radius: 10,
              backgroundColor: AppColors.primaryGold,
              child: Icon(Icons.person, color: AppColors.background, size: 14),
            ),
            const SizedBox(width: AppSpacing.sm),
            _BubbleContent(
              message: message,
              isUser: true,
              theme: theme,
            ),
          ],
        ],
      ),
    );
  }
}

/// Message bubble content with styling based on sender.
class _BubbleContent extends StatelessWidget {
  const _BubbleContent({
    required this.message,
    required this.isUser,
    required this.theme,
  });

  final ChatMessage message;
  final bool isUser;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    final bubbleColor = isUser
        ? AppColors.primaryGold.withOpacity(0.14)
        : AppColors.surfaceSecondary;
    final textColor = isUser ? AppColors.primaryGold : AppColors.text;
    final borderColor = isUser
        ? AppColors.primaryGold.withOpacity(0.45)
        : AppColors.border;

    return Container(
      constraints: BoxConstraints(
        maxWidth: MediaQuery.of(context).size.width * 0.75,
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: bubbleColor,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: <Widget>[
          Text(
            message.text,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: textColor,
              height: 1.5,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            _formatTime(message.timestamp),
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.textMuted,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}

/// Bottom input area with attach, text field, send, and new chat buttons.
class _InputArea extends StatelessWidget {
  const _InputArea({
    required this.controller,
    required this.onSend,
    required this.onAttach,
    required this.onNewConversation,
    required this.onAgentToggle,
    required this.agentMode,
    required this.theme,
    required this.isMobile,
  });

  final TextEditingController controller;
  final VoidCallback onSend;
  final VoidCallback onAttach;
  final VoidCallback onNewConversation;
  final VoidCallback onAgentToggle;
  final bool agentMode;
  final ThemeData theme;
  final bool isMobile;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: <Widget>[
          // Attach file (UI only)
          _IconButton(
            icon: Icons.attach_file,
            onPressed: onAttach,
            tooltip: 'إرفاق ملف',
          ),
          const SizedBox(width: AppSpacing.sm),

          // Multi-line text field
          Expanded(
            child: TextField(
              controller: controller,
              minLines: 1,
              maxLines: 5,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AppColors.text,
              ),
              decoration: InputDecoration(
                hintText: 'اكتب رسالتك هنا...',
                hintStyle: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.textMuted,
                ),
                filled: true,
                fillColor: AppColors.surfaceSecondary,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                  borderSide: const BorderSide(color: AppColors.primaryGold),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
              ),
              onChanged: (_) {},
            ),
          ),
          const SizedBox(width: AppSpacing.sm),

          // Send button
          ValueListenableBuilder<TextEditingValue>(
            valueListenable: controller,
            builder: (BuildContext context, TextEditingValue value, Widget? child) {
              final hasText = value.text.trim().isNotEmpty;
              return Container(
                decoration: BoxDecoration(
                  color: hasText ? AppColors.primaryGold : AppColors.surfaceSecondary,
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                  border: Border.all(
                    color: hasText ? AppColors.primaryGold : AppColors.border,
                  ),
                ),
                child: IconButton(
                  icon: const Icon(Icons.send),
                  color: hasText ? AppColors.background : AppColors.textMuted,
                  onPressed: hasText ? onSend : null,
                  tooltip: 'إرسال',
                ),
              );
            },
          ),
          const SizedBox(width: AppSpacing.sm),

          // New conversation button
          _IconButton(
            icon: Icons.add_circle_outline,
            onPressed: onNewConversation,
            tooltip: 'محادثة جديدة',
            isPrimary: true,
          ),
          const SizedBox(width: AppSpacing.sm),

          // Agent mode toggle — next to the composer.
          _IconButton(
            icon: Icon(
              agentMode ? Icons.smart_toy : Icons.smart_toy_outlined,
              color: agentMode ? AppColors.primaryGold : AppColors.textMuted,
            ),
            onPressed: onAgentToggle,
            tooltip: agentMode
                ? AppStrings.returnToChat
                : AppStrings.agentModeTitle,
            isPrimary: agentMode,
          ),
        ],
      ),
    );
  }
}

/// مؤشر انتظار يُعرض أثناء الاتصال بالسيرفر.
class _SendingIndicator extends StatelessWidget {
  const _SendingIndicator();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: <Widget>[
          const SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            'جاري إرسال الرسالة...',
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

/// Visible banner shown while SULY switches from Chat to Agent mode.
class _AgentTransitionBanner extends StatelessWidget {
  const _AgentTransitionBanner();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: <Widget>[
          const SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              AppStrings.switchingToAgent,
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.primaryGold,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Optional agent tool category selector shown only in Agent mode.
///
/// Categories are purely visual in this phase. The user may select one or
/// continue without selecting any category.
class _AgentCategorySelector extends StatelessWidget {
  const _AgentCategorySelector({
    required this.selected,
    required this.onSelect,
    required this.onContinueWithout,
  });

  final String? selected;
  final ValueChanged<String> onSelect;
  final VoidCallback onContinueWithout;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: Text(
              AppStrings.availableToolCategories,
              style: theme.textTheme.labelLarge?.copyWith(
                color: AppColors.textMuted,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: _ChatScreenState._agentCategories.entries.map((entry) {
              final id = entry.key;
              final icon = entry.value;
              final isSelected = selected == id;
              return _AgentCategoryChip(
                icon: icon,
                label: _categoryLabel(id),
                selected: isSelected,
                onTap: () => onSelect(id),
              );
            }).toList(),
          ),
          const SizedBox(height: AppSpacing.sm),
          _AgentCategoryChip(
            icon: Icons.close,
            label: AppStrings.continueWithoutCategory,
            selected: selected == null,
            onTap: onContinueWithout,
            isOutline: true,
          ),
        ],
      ),
    );
  }

  String _categoryLabel(String id) {
    switch (id) {
      case 'coding':
        return AppStrings.catCoding;
      case 'research':
        return AppStrings.catResearch;
      case 'browser':
        return AppStrings.catBrowser;
      case 'projects':
        return AppStrings.catProjects;
      case 'studio':
        return AppStrings.catStudio;
      case 'automation':
        return AppStrings.catAutomation;
      default:
        return id;
    }
  }
}

/// Single selectable agent category chip.
class _AgentCategoryChip extends StatelessWidget {
  const _AgentCategoryChip({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
    this.isOutline = false,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final bool isOutline;

  @override
  Widget build(BuildContext context) {
    final active = selected && !isOutline;
    return InkWell(
      borderRadius: BorderRadius.circular(AppRadii.lg),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: active ? AppColors.primaryGold : AppColors.surfaceSecondary,
          borderRadius: BorderRadius.circular(AppRadii.lg),
          border: Border.all(
            color: active
                ? AppColors.primaryGold
                : (isOutline ? AppColors.border : AppColors.border),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(
              icon,
              color: active ? AppColors.background : AppColors.textMuted,
              size: 18,
            ),
            const SizedBox(width: AppSpacing.sm),
            Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: active
                        ? AppColors.background
                        : AppColors.text,
                    fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Formats a DateTime as HH:mm for chat display.
String _formatChatTime(DateTime time) {
  final hour = time.hour.toString().padLeft(2, '0');
  final minute = time.minute.toString().padLeft(2, '0');
  return '$hour:$minute';
}

/// A single conversation row in the conversation list.
class _ConversationItem extends StatelessWidget {
  const _ConversationItem({
    required this.conversation,
    required this.isActive,
    required this.onTap,
    required this.onDelete,
    required this.textDirection,
  });

  final Conversation conversation;
  final bool isActive;
  final VoidCallback onTap;
  final VoidCallback onDelete;
  final TextDirection textDirection;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final messageCount = conversation.messages.length;
    final lastMessage = messageCount > 0
        ? conversation.messages.last.text
        : 'لا توجد رسائل بعد';
    final lastTime = messageCount > 0
        ? _formatChatTime(conversation.messages.last.timestamp)
        : '';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadii.md),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: BoxDecoration(
            color: isActive ? AppColors.primaryGold.withOpacity(0.15) : null,
            border: isActive
                ? Border.all(color: AppColors.primaryGold, width: 1.5)
                : null,
            borderRadius: BorderRadius.circular(AppRadii.md),
          ),
          child: Row(
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text(
                      conversation.title,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isActive
                            ? AppColors.primaryGold
                            : AppColors.text,
                        fontWeight: isActive
                            ? FontWeight.w700
                            : FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      lastMessage,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.textMuted,
                        fontSize: 11,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                    if (lastTime.isNotEmpty) ...<Widget>[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        lastTime,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.textMuted,
                          fontSize: 9,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              InkWell(
                borderRadius: BorderRadius.circular(AppRadii.sm),
                onTap: () {
                  onDelete();
                },
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.xs),
                  child: Icon(
                    Icons.delete_outline,
                    color: AppColors.error,
                    size: 18,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// List of conversations shown in the sidebar or slide-over panel.
class _ConversationList extends StatelessWidget {
  const _ConversationList({
    required this.conversations,
    required this.activeIndex,
    required this.onSelect,
    required this.onDelete,
    required this.textDirection,
  });

  final List<Conversation> conversations;
  final int? activeIndex;
  final ValueChanged<int> onSelect;
  final ValueChanged<int> onDelete;
  final TextDirection textDirection;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Text(
            'محادثاتك',
            style: theme.textTheme.titleMedium?.copyWith(
              color: AppColors.primaryGold,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        const Divider(height: 1, color: AppColors.border),
        Expanded(
          child: ListView.builder(
            itemCount: conversations.length,
            itemBuilder: (BuildContext context, int index) {
              return _ConversationItem(
                conversation: conversations[index],
                isActive: activeIndex == index,
                onTap: () => onSelect(index),
                onDelete: () => onDelete(index),
                textDirection: textDirection,
              );
            },
          ),
        ),
      ],
    );
  }
}

class _IconButton extends StatelessWidget {
  const _IconButton({
    required this.icon,
    required this.onPressed,
    required this.tooltip,
    this.isPrimary = false,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final String tooltip;
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadii.md),
          onTap: onPressed,
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isPrimary
                  ? AppColors.primaryGold
                  : AppColors.surfaceSecondary,
              borderRadius: BorderRadius.circular(AppRadii.md),
              border: Border.all(
                color: isPrimary
                    ? AppColors.primaryGold
                    : AppColors.border,
              ),
            ),
            child: Icon(
              icon,
              color: isPrimary
                  ? AppColors.background
                  : AppColors.textMuted,
              size: 20,
            ),
          ),
        ),
      ),
    );
  }
}

/// Data model for a chat message.
class ChatMessage {
  const ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
  });

  final String text;
  final bool isUser;
  final DateTime timestamp;
}

/// Radius constants used locally in the chat screen.
abstract class AppRadii {
  AppRadii._();
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
}
