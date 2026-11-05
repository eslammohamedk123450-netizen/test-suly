import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../auth/data/auth_session.dart';
import '../../auth/presentation/auth_gate_dialog.dart';
import '../../../core/models/attachment_item.dart';
import '../../../core/models/canvas_state.dart';
import '../../../core/models/folder.dart';
import '../../../core/models/memory_item.dart';
import '../../../core/theme/app_colors.dart';
import '../data/chat_api_service.dart';
import '../data/chat_attachment_api_service.dart';
import '../data/conversation_api_service.dart';
import '../domain/conversation.dart';
import '../domain/message.dart';
import 'widgets/canvas_panel.dart';
import 'widgets/chat_drawer.dart';
import 'widgets/file_inspector_dialog.dart';
import 'widgets/markdown_message.dart';
import 'widgets/memory_settings_dialog.dart';
import 'widgets/slash_commands_menu.dart';
import 'widgets/voice_mode_dialog.dart';

class FunctionalChatScreen extends StatefulWidget {
  const FunctionalChatScreen({
    super.key,
    this.languageCode = 'ar',
    this.onLocaleChanged,
  });
  final String languageCode;
  final ValueChanged<String>? onLocaleChanged;

  @override
  State<FunctionalChatScreen> createState() => _FunctionalChatScreenState();
}

class _FunctionalChatScreenState extends State<FunctionalChatScreen> {
  final TextEditingController _message = TextEditingController();
  final ScrollController _scroll = ScrollController();

  List<Conversation> _conversations = [];
  String? _currentConvId;
  Conversation? _temporaryConversation;
  final Map<String, String> _backendConversationIds = {};
  List<Folder> _folders = [];
  List<MemoryItem> _memories = [];
  bool _memoryEnabled = true;

  bool _isWebSearch = false;
  bool _isTemporary = false;
  bool _isGenerating = false;
  bool _isDarkTheme = true;
  bool _isRtl = true;

  // Attached files
  final List<AttachmentItem> _attachments = [];

  // Canvas Workspace State
  final CanvasState _canvas = CanvasState(
    isOpen: false,
    title: 'code_snippet.dart',
    content:
        '// مرحباً بك في مساحة عمل كانفاس\nvoid main() {\n  print("Hello Canvas Workspace!");\n}',
    language: 'dart',
    type: 'code',
  );

  @override
  void initState() {
    super.initState();
    _isRtl = widget.languageCode == 'ar';
    _loadFromStorage();
  }

  @override
  void didUpdateWidget(covariant FunctionalChatScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.languageCode != widget.languageCode) {
      setState(() => _isRtl = widget.languageCode == 'ar');
    }
  }

  @override
  void dispose() {
    _message.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _loadFromStorage() async {
    try {
      await AuthSession.restoreAccessToken();
      final prefs = await SharedPreferences.getInstance();
      _isDarkTheme = prefs.getBool('chatgpt_dark_theme') ?? true;
      _memoryEnabled = prefs.getBool('chatgpt_memory_enabled') ?? true;

      // Load folders
      final foldersRaw = prefs.getString('chatgpt_folders');
      if (foldersRaw != null) {
        final list = jsonDecode(foldersRaw) as List<dynamic>;
        _folders = list
            .map((f) => Folder.fromJson(f as Map<String, dynamic>))
            .toList();
      } else {
        _folders = [];
      }

      // Load memories
      final memoriesRaw = prefs.getString('chatgpt_memories');
      if (memoriesRaw != null) {
        final list = jsonDecode(memoriesRaw) as List<dynamic>;
        _memories = list
            .map((m) => MemoryItem.fromJson(m as Map<String, dynamic>))
            .toList();
      } else {
        _memories = [];
      }

      // Load conversations
      final convsRaw = prefs.getString('chatgpt_conversations');
      final backendIdsRaw = prefs.getString('suly_backend_conversation_ids');
      if (backendIdsRaw != null) {
        final decoded = jsonDecode(backendIdsRaw);
        if (decoded is Map<String, dynamic>) {
          _backendConversationIds
            ..clear()
            ..addAll(
                decoded.map((key, value) => MapEntry(key, value.toString())));
        }
      }
      if (convsRaw != null) {
        final list = jsonDecode(convsRaw) as List<dynamic>;
        _conversations = list
            .map((c) => Conversation.fromJson(c as Map<String, dynamic>))
            .toList();
        if (_conversations.isNotEmpty) {
          _currentConvId = _conversations.first.id;
        }
      }
    } catch (_) {}

    if (mounted) setState(() {});
  }

  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('chatgpt_dark_theme', _isDarkTheme);
      await prefs.setBool('chatgpt_memory_enabled', _memoryEnabled);
      await prefs.setString(
        'suly_backend_conversation_ids',
        jsonEncode(_backendConversationIds),
      );
      await prefs.setString('chatgpt_folders',
          jsonEncode(_folders.map((f) => f.toJson()).toList()));
      await prefs.setString('chatgpt_memories',
          jsonEncode(_memories.map((m) => m.toJson()).toList()));

      if (!_isTemporary) {
        await prefs.setString('chatgpt_conversations',
            jsonEncode(_conversations.map((c) => c.toJson()).toList()));
      }
    } catch (_) {}
  }

  Conversation? get _currentConversation {
    if (_isTemporary) return _temporaryConversation;
    if (_currentConvId == null) return null;
    final index = _conversations.indexWhere((c) => c.id == _currentConvId);
    return index == -1 ? null : _conversations[index];
  }

  void _handleNewChat() {
    setState(() {
      _currentConvId = null;
      _temporaryConversation = null;
      _attachments.clear();
      _canvas.isOpen = false;
    });
  }

  void _handleSelectConv(String id) {
    setState(() {
      _currentConvId = id;
      _isTemporary = false;
      _temporaryConversation = null;
      _attachments.clear();
    });
  }

  void _handleDeleteConv(String id) {
    setState(() {
      _conversations.removeWhere((c) => c.id == id);
      _backendConversationIds.remove(id);
      if (_currentConvId == id) {
        _currentConvId =
            _conversations.isNotEmpty ? _conversations.first.id : null;
      }
    });
    _saveToStorage();
  }

  void _handleRenameConv(String id, String newTitle) {
    setState(() {
      final idx = _conversations.indexWhere((c) => c.id == id);
      if (idx != -1) {
        _conversations[idx].title = newTitle;
        _conversations[idx].updatedAt = DateTime.now();
      }
    });
    _saveToStorage();
  }

  void _handlePinConv(String id) {
    setState(() {
      final idx = _conversations.indexWhere((c) => c.id == id);
      if (idx != -1) {
        _conversations[idx].isPinned = !_conversations[idx].isPinned;
        _conversations[idx].updatedAt = DateTime.now();
      }
    });
    _saveToStorage();
  }

  void _handleCreateFolder(String name) {
    final folder = Folder(
      id: 'folder-${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      createdAt: DateTime.now(),
    );
    setState(() => _folders.add(folder));
    _saveToStorage();
  }

  void _handleDeleteFolder(String id) {
    setState(() {
      _folders.removeWhere((f) => f.id == id);
      for (final c in _conversations) {
        if (c.folderId == id) c.folderId = null;
      }
    });
    _saveToStorage();
  }

  void _handleMoveToFolder(String convId, String? folderId) {
    setState(() {
      final idx = _conversations.indexWhere((c) => c.id == convId);
      if (idx != -1) {
        _conversations[idx].folderId = folderId;
      }
    });
    _saveToStorage();
  }

  Future<void> _handlePickFile() async {
    try {
      final f = await FilePicker.pickFile(
        type: FileType.custom,
        allowedExtensions: const [
          'csv',
          'txt',
          'md',
          'json',
          'pdf',
          'png',
          'jpg',
          'jpeg',
          'webp',
        ],
      );
      if (f != null) {
        final bytes = await f.readAsBytes();
        final fileSize = f.lengthSync() ?? bytes.length;
        if (fileSize > 10 * 1024 * 1024) {
          throw StateError(_isRtl
              ? 'حجم الملف يتجاوز 10 ميغابايت.'
              : 'The file exceeds the 10 MiB limit.');
        }
        final extension = (f.extension ?? '').toLowerCase();
        const mimeTypes = <String, String>{
          'csv': 'text/csv',
          'txt': 'text/plain',
          'md': 'text/markdown',
          'json': 'application/json',
          'pdf': 'application/pdf',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'webp': 'image/webp',
        };
        final mimeType = mimeTypes[extension];
        if (mimeType == null) {
          throw StateError(_isRtl
              ? 'نوع الملف غير مدعوم.'
              : 'This file type is not supported.');
        }
        String? textContent;
        if (const {'csv', 'txt', 'md', 'json'}.contains(extension)) {
          textContent = utf8.decode(bytes, allowMalformed: true);
        }

        final att = AttachmentItem(
          id: 'att-${DateTime.now().millisecondsSinceEpoch}',
          name: f.name,
          mimeType: mimeType,
          data: textContent ?? base64Encode(bytes),
          size: fileSize,
          type: mimeType.startsWith('image/') ? 'image' : 'file',
          textContent: textContent,
        );

        setState(() => _attachments.add(att));
      }
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(error.toString().replaceFirst('Bad state: ', ''))),
      );
    }
  }

  void _openFileInspector(AttachmentItem att) {
    showDialog(
      context: context,
      builder: (ctx) => FileInspectorDialog(
        attachment: att,
        onAskPrompt: (prompt) => _handleSendMessage(prompt, attachments: [att]),
        isRtl: _isRtl,
      ),
    );
  }

  void _openMemorySettings() {
    showDialog(
      context: context,
      builder: (ctx) => MemorySettingsDialog(
        memories: _memories,
        memoryEnabled: _memoryEnabled,
        onToggleMemory: (val) {
          setState(() => _memoryEnabled = val);
          _saveToStorage();
        },
        onAddMemory: (text) {
          final item = MemoryItem(
            id: 'mem-${DateTime.now().millisecondsSinceEpoch}',
            content: text,
            createdAt: DateTime.now(),
          );
          setState(() => _memories.add(item));
          _saveToStorage();
        },
        onDeleteMemory: (id) {
          setState(() => _memories.removeWhere((m) => m.id == id));
          _saveToStorage();
        },
        onClearAll: () {
          setState(() => _memories.clear());
          _saveToStorage();
        },
        isRtl: _isRtl,
      ),
    );
  }

  void _openVoiceMode() {
    showDialog(
      context: context,
      builder: (ctx) => VoiceModeDialog(
        onClose: () => Navigator.of(ctx).pop(),
        isRtl: _isRtl,
      ),
    );
  }

  void _openCanvas({
    String? title,
    String? content,
    String language = 'dart',
    String type = 'code',
  }) {
    setState(() {
      _canvas.isOpen = true;
      _canvas.title = title ?? 'code_snippet.dart';
      _canvas.content = content ?? _canvas.content;
      _canvas.language = language;
      _canvas.type = type;
    });
  }

  Future<int> _ensureBackendConversationId(Conversation conversation) async {
    final knownId = _backendConversationIds[conversation.id];
    final parsedKnownId = knownId == null ? null : int.tryParse(knownId);
    if (parsedKnownId != null) return parsedKnownId;

    final backendConversation = await ConversationApiService()
        .createConversationBackend(title: conversation.title);
    final backendId = int.tryParse(backendConversation.id);
    if (backendId == null) {
      throw const FormatException('تعذر قراءة معرّف المحادثة من الخادم.');
    }
    _backendConversationIds[conversation.id] = backendConversation.id;
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(
      'suly_backend_conversation_ids',
      jsonEncode(_backendConversationIds),
    );
    return backendId;
  }

  String _prepareCommand(String text) {
    final trimmed = text.trim();
    final separator = trimmed.indexOf(' ');
    final command = separator < 0 ? trimmed : trimmed.substring(0, separator);
    final content =
        separator < 0 ? '' : trimmed.substring(separator + 1).trim();
    if (!command.startsWith('/')) return text;
    switch (command) {
      case '/reason':
        return 'حلّل الطلب بعناية ثم قدّم نتيجة واضحة ومبررًا موجزًا، دون عرض سلسلة التفكير الداخلية.\n\n$content';
      case '/summarize':
        return 'لخّص النص التالي في نقاط واضحة مع الحفاظ على أهم المعلومات:\n\n$content';
      case '/code':
        return 'اكتب أو راجع الكود المطلوب، واشرح باختصار كيفية تشغيله:\n\n$content';
      case '/chart':
        return 'حلّل البيانات المطلوبة واقترح جدولًا أو رسمًا بيانيًا مناسبًا. كن صريحًا إن لم تُرفق بيانات.\n\n$content';
      case '/web':
        return 'يطلب المستخدم معلومات حديثة من الويب. إذا لم تتوفر لك أداة بحث حي، وضّح ذلك ولا تختلق مصادر.\n\n$content';
      case '/image':
        return 'يطلب المستخدم إنشاء صورة. إذا لم تكن أداة توليد الصور متاحة في هذه الجلسة، اشرح ذلك ولا تدّعِ إنشاء صورة.\n\n$content';
      default:
        return text;
    }
  }

  Future<void> _handleSendMessage(
    String text, {
    List<AttachmentItem>? attachments,
  }) async {
    if (text.trim() == '/canvas' &&
        (attachments == null || attachments.isEmpty)) {
      _openCanvas();
      return;
    }
    if (text.trim().isEmpty && (attachments == null || attachments.isEmpty))
      return;
    if (_isGenerating) return;

    await AuthSession.restoreAccessToken();
    if (!mounted) return;
    if (!await ensureUserSession(context, isRtl: _isRtl) || !mounted) return;

    final userAttachments =
        attachments ?? List<AttachmentItem>.from(_attachments);
    final current = _currentConversation;
    final timestamp = DateTime.now();
    final targetId = current?.id ?? 'conv-${timestamp.millisecondsSinceEpoch}';
    final userMsg = Message(
      id: 'msg-${timestamp.millisecondsSinceEpoch}',
      text: text,
      isUser: true,
      timestamp: timestamp,
      conversationId: targetId,
      attachments: userAttachments.isNotEmpty ? userAttachments : null,
    );

    late final Conversation targetConv;
    if (current == null) {
      final titleSource = text.trim().isNotEmpty
          ? text.trim()
          : (userAttachments.isNotEmpty ? userAttachments.first.name : '');
      final title = titleSource.length > 28
          ? '${titleSource.substring(0, 28)}...'
          : titleSource.isEmpty
              ? (_isRtl ? 'محادثة جديدة' : 'New chat')
              : titleSource;
      targetConv = Conversation(
        id: targetId,
        title: title,
        createdAt: timestamp,
        messages: [userMsg],
      );
      setState(() {
        if (_isTemporary) {
          _temporaryConversation = targetConv;
        } else {
          _conversations.insert(0, targetConv);
          _currentConvId = targetConv.id;
        }
      });
    } else {
      targetConv = current;
      setState(() => targetConv.addMessage(userMsg));
    }

    _message.clear();
    setState(() {
      _attachments.clear();
      _isGenerating = true;
    });
    _scrollToBottom();

    String reply;
    try {
      final attachmentIds = <int>[];
      for (final attachment in userAttachments) {
        attachment.serverFileId ??=
            await ChatAttachmentApiService().upload(attachment);
        attachmentIds.add(attachment.serverFileId!);
      }

      final conversationId =
          _isTemporary ? null : await _ensureBackendConversationId(targetConv);
      final history = targetConv.messages
          .where((message) => message.id != userMsg.id)
          .toList()
          .reversed
          .take(40)
          .toList()
          .reversed
          .map((message) => <String, String>{
                'role': message.isUser ? 'user' : 'assistant',
                'content': message.text,
              })
          .toList(growable: false);
      final contextParts = <String>[];
      if (_memoryEnabled) {
        contextParts.addAll(_memories.map((memory) => memory.content));
      }
      if (_isWebSearch) {
        contextParts.add(
          'The user requests up-to-date web information. If live search is not available, say so clearly and do not fabricate sources.',
        );
      }

      final result = await sendMessage(
        message: _prepareCommand(text),
        history: history,
        attachmentIds: attachmentIds,
        conversationId: conversationId,
        temporary: _isTemporary,
        systemContext: contextParts.join('\n'),
      );
      reply = result.success
          ? result.reply!
          : '⚠️ ${result.error ?? (_isRtl ? 'تعذر الحصول على رد.' : 'Could not get a response.')}';
    } catch (error) {
      reply = '⚠️ ${error.toString().replaceFirst('Bad state: ', '')}';
    }

    if (!mounted) return;
    final assistantMsg = Message(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch + 1}',
      text: reply,
      isUser: false,
      timestamp: DateTime.now(),
      conversationId: targetConv.id,
      modelUsed: 'SULY',
    );
    setState(() {
      targetConv.addMessage(assistantMsg);
      _isGenerating = false;
    });
    if (!_isTemporary) await _saveToStorage();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = _isDarkTheme;
    final bg = isDark ? AppColors.darkBackground : AppColors.lightBackground;
    final textColor = isDark ? AppColors.darkText : AppColors.lightText;
    final border = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Directionality(
      textDirection: _isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Theme(
        data: isDark ? ThemeData.dark() : ThemeData.light(),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 768;

            return Scaffold(
              backgroundColor: bg,
              drawer: isWide
                  ? null
                  : ChatDrawer(
                      conversations: _conversations,
                      currentConvId: _currentConvId,
                      folders: _folders,
                      onSelectConv: (id) {
                        Navigator.of(context).pop();
                        _handleSelectConv(id);
                      },
                      onNewChat: () {
                        Navigator.of(context).pop();
                        _handleNewChat();
                      },
                      onDeleteConv: _handleDeleteConv,
                      onRenameConv: _handleRenameConv,
                      onPinConv: _handlePinConv,
                      onCreateFolder: _handleCreateFolder,
                      onDeleteFolder: _handleDeleteFolder,
                      onMoveToFolder: _handleMoveToFolder,
                      onOpenMemory: () {
                        Navigator.of(context).pop();
                        _openMemorySettings();
                      },
                      onToggleTheme: () {
                        setState(() => _isDarkTheme = !_isDarkTheme);
                        _saveToStorage();
                      },
                      isDarkTheme: _isDarkTheme,
                      isRtl: _isRtl,
                    ),
              body: Row(
                children: [
                  // Desktop/Web Left Sidebar
                  if (isWide)
                    ChatDrawer(
                      conversations: _conversations,
                      currentConvId: _currentConvId,
                      folders: _folders,
                      onSelectConv: _handleSelectConv,
                      onNewChat: _handleNewChat,
                      onDeleteConv: _handleDeleteConv,
                      onRenameConv: _handleRenameConv,
                      onPinConv: _handlePinConv,
                      onCreateFolder: _handleCreateFolder,
                      onDeleteFolder: _handleDeleteFolder,
                      onMoveToFolder: _handleMoveToFolder,
                      onOpenMemory: _openMemorySettings,
                      onToggleTheme: () {
                        setState(() => _isDarkTheme = !_isDarkTheme);
                        _saveToStorage();
                      },
                      isDarkTheme: _isDarkTheme,
                      isRtl: _isRtl,
                    ),

                  // Central Workspace (Chat Area)
                  Expanded(
                    flex: 6,
                    child: Column(
                      children: [
                        // Top Header Bar
                        _buildTopBar(isWide, border, textColor),

                        // Message List Viewport
                        Expanded(
                          child: _currentConversation == null ||
                                  _currentConversation!.messages.isEmpty
                              ? _buildEmptyState(textColor, isDark)
                              : ListView.builder(
                                  controller: _scroll,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 12),
                                  itemCount:
                                      _currentConversation!.messages.length,
                                  itemBuilder: (context, idx) {
                                    final msg =
                                        _currentConversation!.messages[idx];
                                    return _buildMessageRow(
                                        msg, isDark, border);
                                  },
                                ),
                        ),

                        // Floating Input Bar
                        _buildInputCapsule(isDark, border, textColor),
                      ],
                    ),
                  ),

                  // Side-by-Side Canvas Panel (Desktop/Web)
                  if (isWide && _canvas.isOpen)
                    Expanded(
                      flex: 5,
                      child: CanvasPanel(
                        canvas: _canvas,
                        onClose: () => setState(() => _canvas.isOpen = false),
                        onUpdateContent: (val) => _canvas.content = val,
                        onAskAi: (prompt) {
                          _handleSendMessage(
                            '$prompt\n\n```${_canvas.language}\n${_canvas.content}\n```',
                          );
                        },
                        isRtl: _isRtl,
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  void _toggleTemporaryMode() {
    setState(() {
      _isTemporary = !_isTemporary;
      _temporaryConversation = null;
      _currentConvId = _isTemporary
          ? null
          : (_conversations.isNotEmpty ? _conversations.first.id : null);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isTemporary
            ? (_isRtl ? 'تم تفعيل المحادثة المؤقتة' : 'Temporary chat enabled')
            : (_isRtl
                ? 'تم إيقاف المحادثة المؤقتة'
                : 'Temporary chat disabled')),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  Widget _buildTopBar(bool isWide, Color border, Color textColor) {
    return Container(
      height: 54,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: border)),
      ),
      child: Row(
        children: [
          if (!isWide)
            Builder(
              builder: (ctx) => IconButton(
                tooltip: _isRtl ? 'القائمة' : 'Menu',
                icon: const Icon(Icons.menu),
                onPressed: () => Scaffold.of(ctx).openDrawer(),
              ),
            ),
          Tooltip(
            message: 'SULY AI',
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.auto_awesome,
                    color: AppColors.primaryGold, size: 22),
                if (isWide) ...[
                  const SizedBox(width: 7),
                  Text(
                    'SULY AI',
                    style: TextStyle(
                      color: textColor,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.4,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const Spacer(),
          IconButton(
            tooltip: _isRtl ? 'محادثة مؤقتة' : 'Temporary chat',
            icon: Icon(
              _isTemporary ? Icons.history_toggle_off : Icons.history,
              color: _isTemporary ? AppColors.primaryGold : null,
              size: 20,
            ),
            onPressed: _toggleTemporaryMode,
          ),
          IconButton(
            tooltip: _isRtl ? 'مساحة العمل Canvas' : 'Canvas workspace',
            icon: Icon(
              Icons.splitscreen,
              color: _canvas.isOpen ? AppColors.primaryGold : null,
              size: 20,
            ),
            onPressed: () => setState(() => _canvas.isOpen = !_canvas.isOpen),
          ),
          IconButton(
            tooltip: _isRtl ? 'الوضع الصوتي' : 'Voice mode',
            icon: const Icon(Icons.mic, color: AppColors.primaryGold, size: 20),
            onPressed: _openVoiceMode,
          ),
          PopupMenuButton<String>(
            tooltip: _isRtl ? 'تغيير اللغة' : 'Change language',
            icon: const Icon(Icons.translate, size: 20),
            onSelected: (languageCode) =>
                widget.onLocaleChanged?.call(languageCode),
            itemBuilder: (context) => const [
              PopupMenuItem<String>(value: 'ar', child: Text('العربية')),
              PopupMenuItem<String>(value: 'en', child: Text('English')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(Color textColor, bool isDark) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color:
                    isDark ? const Color(0xFF2A2A2A) : const Color(0xFFF3F3F3),
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF383838)
                      : const Color(0xFFE5E5E5),
                ),
              ),
              child: const Icon(Icons.auto_awesome,
                  color: AppColors.primaryGold, size: 28),
            ),
            const SizedBox(height: 16),
            Text(
              _isRtl
                  ? 'بماذا يمكنني مساعدتك اليوم؟'
                  : 'What can I help with today?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Starter prompt chips
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: [
                _buildStarterCard('📱 بناء شاشة Flutter لموبايل وويب', () {
                  _handleSendMessage(
                      'اكتب كود Flutter لشاشة دردشة سريعة ومتجاوبة مع الموبايل والويب.');
                }),
                _buildStarterCard('🎨 فتح مساحة العمل Canvas لتطوير كود', () {
                  _handleSendMessage('/canvas ساعدني في كتابة تطبيق مصغر.');
                }),
                _buildStarterCard('📊 استيراد وفحص ملف CSV وتحليله', () {
                  _handleSendMessage(
                      'كيف يمكنني استخدام مفتش الـ CSV لاستخراج إحصائيات دقيقة؟');
                }),
                _buildStarterCard('🧠 تحليل منطقي من SULY لمسألة', () {
                  _handleSendMessage(
                      '/reason حلل معمارية تطبيق فلاتر بمقاييس الأمان الحديثة.');
                }),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStarterCard(String title, VoidCallback onTap) {
    final isDark = _isDarkTheme;
    final cardBg = isDark ? const Color(0xFF242424) : Colors.white;
    final cardBorder =
        isDark ? const Color(0xFF333333) : const Color(0xFFE5E5E5);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 280),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: cardBorder),
        ),
        child: Text(
          title,
          style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  Widget _buildMessageRow(Message msg, bool isDark, Color border) {
    final isUser = msg.isUser;
    final bubbleBg = isUser
        ? (isDark ? const Color(0xFF2F2F2F) : const Color(0xFFF4F4F4))
        : Colors.transparent;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color:
                    isDark ? const Color(0xFF262626) : const Color(0xFFEFEFEF),
                border: Border.all(color: border),
              ),
              child: const Icon(Icons.auto_awesome,
                  size: 16, color: AppColors.primaryGold),
            ),
            const SizedBox(width: 10),
          ],
          Flexible(
            child: Container(
              padding: isUser
                  ? const EdgeInsets.symmetric(horizontal: 16, vertical: 10)
                  : EdgeInsets.zero,
              decoration: isUser
                  ? BoxDecoration(
                      color: bubbleBg,
                      borderRadius: BorderRadius.circular(18),
                    )
                  : null,
              child: Column(
                crossAxisAlignment:
                    isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  // Attachments chips if any
                  if (msg.attachments != null && msg.attachments!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: msg.attachments!.map((att) {
                          return ActionChip(
                            avatar: Icon(
                              att.mimeType.contains('csv')
                                  ? Icons.table_chart
                                  : Icons.insert_drive_file,
                              size: 14,
                              color: AppColors.primaryGold,
                            ),
                            label: Text(
                              att.name,
                              style: const TextStyle(fontSize: 11),
                            ),
                            onPressed: () => _openFileInspector(att),
                          );
                        }).toList(),
                      ),
                    ),

                  // Message Markdown Content
                  MarkdownMessage(
                    text: msg.text,
                    isRtl: _isRtl,
                    thoughts: msg.thoughts,
                    onOpenCanvas: (code, lang) {
                      _openCanvas(
                        title: 'extracted_code.$lang',
                        content: code,
                        language: lang,
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          if (isUser) const SizedBox(width: 4),
        ],
      ),
    );
  }

  Widget _buildInputCapsule(bool isDark, Color border, Color textColor) {
    final inputBg = isDark ? const Color(0xFF2F2F2F) : const Color(0xFFF4F4F4);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Slash Commands Popup
          if (_message.text.startsWith('/'))
            SlashCommandsMenu(
              filter: _message.text,
              onSelect: (cmd) {
                if (cmd.cmd == '/canvas') {
                  _message.clear();
                  _openCanvas();
                } else {
                  setState(() {
                    _message.text = '${cmd.cmd} ';
                    _message.selection = TextSelection.fromPosition(
                        TextPosition(offset: _message.text.length));
                  });
                }
              },
              isRtl: _isRtl,
            ),

          // Pending Attachments Chips
          if (_attachments.isNotEmpty)
            Container(
              padding: const EdgeInsets.only(bottom: 8),
              alignment: Alignment.centerLeft,
              child: Wrap(
                spacing: 6,
                children: _attachments.map((att) {
                  return InputChip(
                    avatar: Icon(
                      att.mimeType.contains('csv')
                          ? Icons.table_chart
                          : Icons.attach_file,
                      size: 14,
                      color: AppColors.primaryGold,
                    ),
                    label: Text(att.name, style: const TextStyle(fontSize: 11)),
                    onPressed: () => _openFileInspector(att),
                    onDeleted: () => setState(() => _attachments.remove(att)),
                  );
                }).toList(),
              ),
            ),

          // Capsule Container
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: inputBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: border),
            ),
            child: Row(
              children: [
                // Attach Button
                IconButton(
                  tooltip: _isRtl ? 'إرفاق ملف أو جدول' : 'Attach file',
                  icon: const Icon(Icons.add, size: 20),
                  onPressed: _handlePickFile,
                ),

                // Web Search Toggle Chip
                InkWell(
                  onTap: () => setState(() => _isWebSearch = !_isWebSearch),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _isWebSearch
                          ? AppColors.info.withValues(alpha: 0.2)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      Icons.language,
                      size: 18,
                      color: _isWebSearch
                          ? AppColors.info
                          : textColor.withValues(alpha: 0.6),
                    ),
                  ),
                ),
                const SizedBox(width: 4),

                // Text Field
                Expanded(
                  child: TextField(
                    controller: _message,
                    maxLines: 4,
                    minLines: 1,
                    style: TextStyle(fontSize: 14, color: textColor),
                    decoration: InputDecoration(
                      hintText: _isRtl
                          ? 'اسأل أي شيء... (اكتب / للأوامر)'
                          : 'Ask anything... (type / for commands)',
                      hintStyle: TextStyle(
                          fontSize: 13,
                          color: textColor.withValues(alpha: 0.5)),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 8),
                    ),
                    onChanged: (val) => setState(() {}),
                    onSubmitted: (val) => _handleSendMessage(val),
                  ),
                ),

                // Voice Mic
                IconButton(
                  tooltip: _isRtl ? 'محادثة صوتية' : 'Voice Mode',
                  icon: const Icon(Icons.mic, size: 20),
                  onPressed: _openVoiceMode,
                ),

                // Send Button
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _message.text.trim().isNotEmpty ||
                            _attachments.isNotEmpty
                        ? (isDark ? Colors.white : Colors.black)
                        : (isDark
                            ? const Color(0xFF404040)
                            : const Color(0xFFD6D6D6)),
                  ),
                  child: IconButton(
                    padding: EdgeInsets.zero,
                    icon: Icon(
                      Icons.arrow_upward,
                      size: 18,
                      color: isDark ? Colors.black : Colors.white,
                    ),
                    onPressed: () => _handleSendMessage(_message.text),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _isRtl
                ? 'قد يرتكب شات جي بي تي أخطاء. تحقق من المعلومات المهمة.'
                : 'SULY AI can make mistakes. Check important info.',
            style: TextStyle(
              fontSize: 10.5,
              color:
                  isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
