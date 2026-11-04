import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http_parser/http_parser.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

import '../../../core/config/api_config.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/suly_brand_mark.dart';
import '../../auth/data/auth_session.dart';
import '../../../l10n/generated/app_localizations.dart';
import 'widgets/markdown_message.dart';

class _StreamResult {
  const _StreamResult({
    required this.reply,
    this.creditBalance,
    this.stopped = false,
  });

  final String reply;
  final int? creditBalance;
  final bool stopped;
}

class FunctionalChatScreen extends StatefulWidget {
  const FunctionalChatScreen({super.key, this.onLocaleChanged});

  final ValueChanged<String>? onLocaleChanged;

  @override
  State<FunctionalChatScreen> createState() => _FunctionalChatScreenState();
}

class _FunctionalChatScreenState extends State<FunctionalChatScreen> {
  static const _legacyTokenKey = 'suly_access_token';
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _message = TextEditingController();
  final _scroll = ScrollController();
  final _speech = stt.SpeechToText();
  http.Client? _streamClient;
  bool _stopRequested = false;

  String? _token;
  String? _accountEmail;
  String? _accountName;
  String? _error;
  bool _ready = false;
  bool _registering = false;
  bool _busy = false;
  bool _listening = false;
  bool _speechAvailable = false;
  bool _uploading = false;
  final List<Map<String, dynamic>> _pendingAttachments = [];
  List<Map<String, dynamic>> _conversations = [];
  int? _conversationId;
  List<Map<String, dynamic>> _messages = [];
  int _creditBalance = 0;

  Uri get _base => Uri.parse(ApiConfig.baseUrl);
  AppLocalizations get _strings => AppLocalizations.of(context);

  @override
  void initState() {
    super.initState();
    _restoreSession();
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _message.dispose();
    _scroll.dispose();
    _speech.stop();
    _streamClient?.close();
    super.dispose();
  }

  Future<void> _restoreSession() async {
    String? saved = await AuthSession.restoreAccessToken();
    try {
      final prefs = await SharedPreferences.getInstance();
      final legacyToken = prefs.getString(_legacyTokenKey);
      if ((saved == null || saved.isEmpty) &&
          legacyToken != null &&
          legacyToken.isNotEmpty) {
        await AuthSession.saveAccessToken(legacyToken);
        saved = legacyToken;
      }
      await prefs.remove(_legacyTokenKey);
    } catch (_) {
      if (saved == null || saved.isEmpty) {
        _error = _strings.connectionError;
      }
    }
    if (saved != null && saved.isNotEmpty) {
      try {
        final response = await http.get(
          _base.resolve('/api/v1/auth/me'),
          headers: _headers(saved),
        );
        if (response.statusCode == 200) {
          _token = saved;
          final profile = _decode(response.body);
          _accountEmail = profile['email']?.toString();
          _accountName = profile['full_name']?.toString();
          await _loadConversations();
          await _loadCreditBalance();
        } else {
          await _invalidateSession();
        }
      } catch (_) {
        _error = _strings.connectionError;
      }
    }
    if (mounted) setState(() => _ready = true);
  }

  Map<String, String> _headers([String? token]) => {
        'Content-Type': 'application/json',
        if ((token ?? _token) != null)
          'Authorization': 'Bearer ${token ?? _token}',
      };

  Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body,
      {String? token}) async {
    final response = await http.post(
      _base.resolve(path),
      headers: _headers(token),
      body: jsonEncode(body),
    );
    final decoded = _decode(response.body);
    if (response.statusCode == 401) await _invalidateSession();
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw _friendlyError(response.statusCode, decoded);
    }
    return decoded;
  }

  Future<dynamic> _get(String path) async {
    final response = await http.get(_base.resolve(path), headers: _headers());
    final decoded = _decode(response.body);
    if (response.statusCode == 401) await _invalidateSession();
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw _friendlyError(response.statusCode, decoded);
    }
    return decoded;
  }

  Future<void> _invalidateSession() async {
    await AuthSession.clearPersisted();
    _token = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_legacyTokenKey);
    } catch (_) {
      // The in-memory session is still invalidated when storage is unavailable.
    }
  }

  Map<String, dynamic> _decode(String body) {
    try {
      final value = jsonDecode(body);
      if (value is Map<String, dynamic>) return value;
      return {'data': value};
    } catch (_) {
      return <String, dynamic>{};
    }
  }

  String _friendlyError(int status, Map<String, dynamic> body) {
    final detail = body['detail']?.toString() ?? '';
    if (status == 402) {
      return _strings.insufficientCredits;
    }
    if (status == 503) {
      return _strings.providerNotReady;
    }
    if (status == 401) return _strings.invalidCredentials;
    if (status == 409) return _strings.emailAlreadyRegistered;
    if (status == 429) return _strings.tooManyRequests;
    if (status == 0) return _strings.connectionError;
    return detail.isNotEmpty ? detail : _strings.requestFailed(status);
  }

  Future<void> _authenticate() async {
    final email = _email.text.trim();
    final password = _password.text;
    if (email.isEmpty || password.isEmpty) {
      setState(() => _error = _strings.requiredCredentials);
      return;
    }
    if (_registering && password.length < 8) {
      setState(() => _error = _strings.passwordTooShort);
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      if (_registering) {
        await _post(
            '/api/v1/auth/register',
            {
              'email': email,
              'password': password,
            },
            token: null);
      }
      final login = await _post(
          '/api/v1/auth/login',
          {
            'email': email,
            'password': password,
          },
          token: null);
      final token = login['access_token']?.toString();
      if (token == null || token.isEmpty) throw _strings.missingAccessToken;
      await AuthSession.saveAccessToken(token);
      _token = token;
      try {
        final profileResponse = await http.get(_base.resolve('/api/v1/auth/me'),
            headers: _headers());
        if (profileResponse.statusCode == 200) {
          final profile = _decode(profileResponse.body);
          _accountEmail = profile['email']?.toString();
          _accountName = profile['full_name']?.toString();
        }
      } catch (_) {}
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_legacyTokenKey);
      await _loadConversations();
      await _loadCreditBalance();
    } catch (error) {
      _error = error.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _signOut() async {
    final token = _token;
    if (token != null && token.isNotEmpty) {
      for (final attachment
          in List<Map<String, dynamic>>.from(_pendingAttachments)) {
        final id = (attachment['id'] as num?)?.toInt();
        if (id != null) {
          try {
            await http.delete(_base.resolve('/api/v1/files/$id'),
                headers: _headers(token));
          } catch (_) {}
        }
      }
    }
    if (token != null && token.isNotEmpty) {
      try {
        await http.post(
          _base.resolve('/api/v1/auth/logout'),
          headers: _headers(token),
        );
      } catch (_) {
        // Always clear local state even if the network is unavailable.
      }
    }
    await AuthSession.clearPersisted();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_legacyTokenKey);
    } catch (_) {
      // Secure storage and in-memory session have already been cleared.
    }
    setState(() {
      _token = null;
      _accountEmail = null;
      _accountName = null;
      _conversationId = null;
      _messages = [];
      _conversations = [];
      _pendingAttachments.clear();
      _creditBalance = 0;
      _error = null;
      _password.clear();
    });
  }

  Future<void> _showAccountSettings() async {
    final arabic = Localizations.localeOf(context).languageCode == 'ar';
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.surface,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(arabic ? 'الإعدادات والحساب' : 'Settings & account',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.text, fontWeight: FontWeight.bold)),
                const SizedBox(height: AppSpacing.md),
                ListTile(
                    leading: const Icon(Icons.person_outline),
                    title: Text((_accountName?.trim().isNotEmpty == true
                            ? _accountName!
                            : _accountEmail) ??
                        (arabic ? 'مستخدم' : 'User')),
                    subtitle: Text(_accountEmail ??
                        (arabic ? 'الحساب الحالي' : 'Signed-in account'))),
                ListTile(
                    leading: const Icon(Icons.language),
                    title: Text(arabic ? 'اللغة' : 'Language'),
                    trailing: SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(value: 'ar', label: Text('العربية')),
                          ButtonSegment(value: 'en', label: Text('English'))
                        ],
                        selected: {
                          Localizations.localeOf(context).languageCode
                        },
                        onSelectionChanged: (selected) {
                          widget.onLocaleChanged?.call(selected.first);
                          Navigator.pop(sheetContext);
                        })),
                ListTile(
                    leading: const Icon(Icons.info_outline),
                    title: Text(arabic ? 'الإصدار' : 'Version'),
                    trailing: const Text('1.1.0+2')),
                ListTile(
                    leading: const Icon(Icons.logout, color: AppColors.error),
                    title: Text(arabic ? 'تسجيل الخروج' : 'Sign out',
                        style: const TextStyle(color: AppColors.error)),
                    onTap: () {
                      Navigator.pop(sheetContext);
                      _signOut();
                    }),
              ]),
        ),
      ),
    );
  }

  Future<void> _loadConversations() async {
    final data = await _get('/api/v1/chat/conversations');
    final items = (data['data'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
    _conversations = items;
    if (items.isNotEmpty) {
      _conversationId ??= (items.first['id'] as num).toInt();
      await _loadMessages(_conversationId!);
    }
  }

  Future<void> _loadCreditBalance() async {
    try {
      final data = await _get('/api/v1/auth/credits/balance');
      final value = data['balance'];
      if (mounted && value is num) {
        setState(() => _creditBalance = value.toInt());
      }
    } catch (_) {
      // Keep the chat usable when a balance refresh temporarily fails.
    }
  }

  Future<void> _showCreditHistory() async {
    if (_token == null || _busy) return;
    try {
      final data = await _get('/api/v1/auth/credits/history?limit=50');
      final items = (data['data'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList(growable: false);
      if (!mounted) return;
      await showModalBottomSheet<void>(
        context: context,
        backgroundColor: AppColors.surface,
        builder: (sheetContext) => SafeArea(
          child: SizedBox(
            height: MediaQuery.sizeOf(sheetContext).height * 0.65,
            child: items.isEmpty
                ? Center(child: Text(_strings.noData))
                : ListView.separated(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: items.length,
                    separatorBuilder: (_, __) =>
                        const Divider(color: AppColors.border),
                    itemBuilder: (_, index) {
                      final item = items[index];
                      final amount = (item['amount'] as num?)?.toInt() ?? 0;
                      final balance =
                          (item['balance_after'] as num?)?.toInt() ?? 0;
                      final reason = item['reason']?.toString() ?? '';
                      final createdAt = item['created_at']?.toString() ?? '';
                      return ListTile(
                        leading: Icon(
                          amount >= 0 ? Icons.add_circle : Icons.remove_circle,
                          color: amount >= 0
                              ? AppColors.success
                              : AppColors.primaryGold,
                        ),
                        title: Text(reason),
                        subtitle: Text(createdAt),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '${amount >= 0 ? '+' : ''}$amount',
                              style: const TextStyle(
                                color: AppColors.text,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              _strings.creditBalance(balance),
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ),
      );
    } catch (error) {
      if (mounted) {
        setState(
            () => _error = error.toString().replaceFirst('Exception: ', ''));
      }
    }
  }

  Future<void> _loadMessages(int id) async {
    final response = await http.get(
      _base.resolve('/api/v1/chat/conversations/$id/messages'),
      headers: _headers(),
    );
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw _friendlyError(response.statusCode, _decode(response.body));
    }
    final body = _decode(response.body);
    _messages = (body['data'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
    if (mounted) setState(() {});
    _scrollToEnd();
  }

  Future<void> _newConversation() async {
    if (_token == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await _createConversation();
    } catch (error) {
      _error = error.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _createConversation() async {
    final result = await _post('/api/v1/chat/conversations', {});
    _conversationId = (result['id'] as num).toInt();
    _messages = [];
    _conversations.insert(0, result);
  }

  Future<void> _renameConversation(int id, String currentTitle) async {
    final controller = TextEditingController(text: currentTitle);
    final title = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text(Localizations.localeOf(context).languageCode == 'ar'
            ? 'إعادة تسمية المحادثة'
            : 'Rename conversation'),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLength: 255,
          decoration: InputDecoration(
            hintText: _strings.conversationFallback,
          ),
          onSubmitted: (value) => Navigator.pop(dialogContext, value.trim()),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(_strings.cancel),
          ),
          FilledButton(
            onPressed: () =>
                Navigator.pop(dialogContext, controller.text.trim()),
            child: Text(Localizations.localeOf(context).languageCode == 'ar'
                ? 'حفظ'
                : 'Save'),
          ),
        ],
      ),
    );
    controller.dispose();
    if (title == null || title.isEmpty || _token == null) return;
    try {
      final response = await http.patch(
        _base.resolve('/api/v1/chat/conversations/$id/rename'),
        headers: _headers(),
        body: jsonEncode({'new_title': title}),
      );
      if (response.statusCode == 401) await _invalidateSession();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw _friendlyError(response.statusCode, _decode(response.body));
      }
      await _loadConversations();
    } catch (error) {
      if (mounted)
        setState(
            () => _error = error.toString().replaceFirst('Exception: ', ''));
    }
  }

  Future<void> _deleteConversation(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text(Localizations.localeOf(context).languageCode == 'ar'
            ? 'حذف المحادثة؟'
            : 'Delete conversation?'),
        content: Text(Localizations.localeOf(context).languageCode == 'ar'
            ? 'سيتم حذف الرسائل المرتبطة بها نهائيًا.'
            : 'All messages in this conversation will be deleted.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: Text(_strings.cancel),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(dialogContext, true),
            child: Text(Localizations.localeOf(context).languageCode == 'ar'
                ? 'حذف'
                : 'Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true || _token == null) return;
    try {
      final response = await http.delete(
        _base.resolve('/api/v1/chat/conversations/$id'),
        headers: _headers(),
      );
      if (response.statusCode == 401) await _invalidateSession();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw _friendlyError(response.statusCode, _decode(response.body));
      }
      _conversations.removeWhere((item) => (item['id'] as num?)?.toInt() == id);
      if (_conversationId == id) {
        _conversationId = null;
        _messages = [];
        if (_conversations.isNotEmpty) {
          _conversationId = (_conversations.first['id'] as num).toInt();
          await _loadMessages(_conversationId!);
        }
      }
      if (mounted) setState(() {});
    } catch (error) {
      if (mounted)
        setState(
            () => _error = error.toString().replaceFirst('Exception: ', ''));
    }
  }

  MediaType? _mimeForName(String name) {
    final ext = name.split('.').last.toLowerCase();
    const types = <String, String>{
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'csv': 'text/csv',
      'json': 'application/json',
    };
    final value = types[ext];
    if (value == null) return null;
    final pieces = value.split('/');
    return MediaType(pieces[0], pieces[1]);
  }

  Future<void> _pickAndUploadFile() async {
    if (_uploading || _busy || _token == null) return;
    if (_pendingAttachments.length >= 5) {
      setState(() => _error =
          Localizations.localeOf(context).languageCode == 'ar'
              ? 'يمكن إرفاق خمسة ملفات كحد أقصى في الرسالة.'
              : 'You can attach up to five files per message.');
      return;
    }
    try {
      final file = await FilePicker.pickFile();
      if (file == null) return;
      final mime = _mimeForName(file.name);
      if (mime == null)
        throw Localizations.localeOf(context).languageCode == 'ar'
            ? 'الأنواع المدعومة: الصور وPDF وTXT وMarkdown وCSV وJSON.'
            : 'Supported: images, PDF, TXT, Markdown, CSV, and JSON.';
      final bytes = await file.readAsBytes();
      setState(() {
        _uploading = true;
        _error = null;
      });
      final request =
          http.MultipartRequest('POST', _base.resolve('/api/v1/files/upload'));
      request.headers['Authorization'] = 'Bearer $_token';
      request.files.add(http.MultipartFile.fromBytes('upload', bytes,
          filename: file.name, contentType: mime));
      final streamed = await request.send();
      final response = await http.Response.fromStream(streamed);
      final data = _decode(response.body);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw _friendlyError(response.statusCode, data);
      }
      if (mounted)
        setState(() => _pendingAttachments.add(
            {'id': data['id'], 'name': data['original_name'] ?? file.name}));
    } catch (error) {
      if (mounted)
        setState(
            () => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _removePendingAttachment(Map<String, dynamic> attachment) async {
    final id = (attachment['id'] as num?)?.toInt();
    if (id != null && _token != null) {
      try {
        await http.delete(_base.resolve('/api/v1/files/$id'),
            headers: _headers());
      } catch (_) {}
    }
    if (mounted) setState(() => _pendingAttachments.remove(attachment));
  }

  Future<_StreamResult> _streamMessage(
    int conversationId,
    String text, {
    bool regenerate = false,
    List<int> attachmentIds = const [],
  }) async {
    final request = http.Request(
      'POST',
      _base.resolve(
        '/api/v1/chat/stream?conversation_id=$conversationId'
        '${regenerate ? '&regenerate=true' : ''}',
      ),
    );
    request.headers.addAll(_headers());
    request.body =
        jsonEncode({'message': text, 'attachment_ids': attachmentIds});
    final client = http.Client();
    _streamClient = client;
    _stopRequested = false;
    final response = await client.send(request);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final body = _decode(await response.stream.bytesToString());
      if (response.statusCode == 401) await _invalidateSession();
      throw _friendlyError(response.statusCode, body);
    }

    var reply = '';
    var assistantIndex = -1;
    int? creditBalance;
    try {
      await for (final line in response.stream
          .transform(utf8.decoder)
          .transform(const LineSplitter())) {
        if (!line.startsWith('data:')) continue;
        final raw = line.substring(5).trim();
        if (raw.isEmpty) continue;
        final event = jsonDecode(raw);
        if (event is! Map<String, dynamic>) continue;
        final error = event['error']?.toString();
        if (error != null && error.isNotEmpty) throw error;
        final delta = event['delta']?.toString() ?? '';
        if (delta.isNotEmpty) {
          reply += delta;
          if (assistantIndex == -1) {
            assistantIndex = _messages.length;
            _messages.add({
              'role': 'assistant',
              'content': reply,
              'created_at': DateTime.now().toIso8601String(),
            });
          } else {
            _messages[assistantIndex]['content'] = reply;
          }
          if (mounted) setState(() {});
          _scrollToEnd();
        }
        if (event['credit_balance'] is num) {
          creditBalance = (event['credit_balance'] as num).toInt();
        }
      }
    } catch (error) {
      if (_stopRequested && reply.isNotEmpty) {
        return _StreamResult(reply: reply, stopped: true);
      }
      if (assistantIndex >= 0 && assistantIndex < _messages.length) {
        _messages.removeAt(assistantIndex);
      }
      throw error;
    } finally {
      if (identical(_streamClient, client)) _streamClient = null;
      client.close();
    }
    if (reply.trim().isEmpty) throw _strings.emptyModelReply;
    return _StreamResult(reply: reply, creditBalance: creditBalance);
  }

  void _stopStreaming() {
    if (_streamClient == null) return;
    _stopRequested = true;
    _streamClient!.close();
    if (mounted) setState(() => _error = null);
  }

  Future<void> _regenerateMessage(int assistantIndex) async {
    if (_busy || _conversationId == null || assistantIndex <= 0) return;
    var userIndex = assistantIndex - 1;
    while (userIndex >= 0 && _messages[userIndex]['role'] != 'user') {
      userIndex--;
    }
    if (userIndex < 0) return;
    final prompt = _messages[userIndex]['content']?.toString().trim() ?? '';
    if (prompt.isEmpty) return;

    setState(() {
      _messages.removeAt(assistantIndex);
      _busy = true;
      _error = null;
    });
    try {
      final streamed = await _streamMessage(
        _conversationId!,
        prompt,
        regenerate: true,
      );
      if (!streamed.stopped) await _loadConversations();
      if (streamed.creditBalance != null) {
        _creditBalance = streamed.creditBalance!;
      } else if (!streamed.stopped) {
        await _loadCreditBalance();
      }
    } catch (error) {
      if (mounted) {
        setState(
            () => _error = error.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
      _scrollToEnd();
    }
  }

  Future<void> _copyMessage(String text) async {
    await Clipboard.setData(ClipboardData(text: text));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(Localizations.localeOf(context).languageCode == 'ar'
            ? 'تم نسخ الرسالة'
            : 'Message copied'),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  Future<void> _sendMessage() async {
    final enteredText = _message.text.trim();
    if ((enteredText.isEmpty && _pendingAttachments.isEmpty) ||
        _busy ||
        _uploading ||
        _token == null) return;
    final text = enteredText.isEmpty
        ? (Localizations.localeOf(context).languageCode == 'ar'
            ? 'حلل المرفق من فضلك'
            : 'Please analyze the attachment.')
        : enteredText;
    final attachmentIds =
        _pendingAttachments.map((item) => (item['id'] as num).toInt()).toList();
    Map<String, dynamic>? optimisticUserMessage;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      if (_conversationId == null) await _createConversation();
      final id = _conversationId;
      if (id == null) throw _strings.conversationCreateFailed;
      final userMessage = <String, dynamic>{
        'role': 'user',
        'content':
            '$text${_pendingAttachments.isEmpty ? '' : '\n📎 ${_pendingAttachments.map((item) => item['name']).join(', ')}'}',
        'created_at': DateTime.now().toIso8601String(),
      };
      optimisticUserMessage = userMessage;
      setState(() {
        _messages.add(userMessage);
        _message.clear();
      });
      _scrollToEnd();
      final streamed =
          await _streamMessage(id, text, attachmentIds: attachmentIds);
      if (!streamed.stopped) {
        await _loadConversations();
        for (final attachment
            in List<Map<String, dynamic>>.from(_pendingAttachments)) {
          final fileId = (attachment['id'] as num?)?.toInt();
          if (fileId != null) {
            try {
              await http.delete(_base.resolve('/api/v1/files/$fileId'),
                  headers: _headers());
            } catch (_) {}
          }
        }
        setState(() => _pendingAttachments.clear());
      }
      if (streamed.creditBalance != null) {
        _creditBalance = streamed.creditBalance!;
      } else {
        await _loadCreditBalance();
      }
    } catch (error) {
      if (optimisticUserMessage != null &&
          _messages.isNotEmpty &&
          _messages.last == optimisticUserMessage) {
        _messages.removeLast();
      }
      _error = error.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _busy = false);
      _scrollToEnd();
    }
  }

  Future<void> _switchConversation() async {
    if (_conversations.isEmpty) return;
    var query = '';
    final selected = await showModalBottomSheet<int>(
      context: context,
      backgroundColor: AppColors.surface,
      builder: (sheetContext) => StatefulBuilder(
        builder: (context, setDialogState) {
          final visible = _conversations
              .where((item) => (item['title']?.toString() ?? '')
                  .toLowerCase()
                  .contains(query.toLowerCase()))
              .toList();
          return SafeArea(
            child: SizedBox(
              height: MediaQuery.sizeOf(context).height * 0.72,
              child: Column(children: [
                Padding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(_strings.chatHistory,
                              style: Theme.of(context).textTheme.titleLarge),
                          const SizedBox(height: AppSpacing.sm),
                          TextField(
                              decoration: InputDecoration(
                                  prefixIcon: const Icon(Icons.search),
                                  hintText: Localizations.localeOf(context)
                                              .languageCode ==
                                          'ar'
                                      ? 'ابحث باسم المحادثة'
                                      : 'Search conversations',
                                  filled: true),
                              onChanged: (value) {
                                query = value.trim();
                                setDialogState(() {});
                              }),
                        ])),
                Expanded(
                    child: visible.isEmpty
                        ? Center(child: Text(_strings.noData))
                        : ListView(
                            children: visible.map((item) {
                            final id = (item['id'] as num).toInt();
                            return ListTile(
                              leading: const Icon(Icons.chat_bubble_outline),
                              title: Text(
                                  item['title']?.toString() ??
                                      _strings.conversationFallback,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis),
                              selected: _conversationId == id,
                              trailing: PopupMenuButton<String>(
                                onSelected: (action) {
                                  if (action == 'rename')
                                    _renameConversation(
                                        id,
                                        item['title']?.toString() ??
                                            _strings.conversationFallback);
                                  if (action == 'delete')
                                    _deleteConversation(id);
                                },
                                itemBuilder: (_) => [
                                  PopupMenuItem(
                                      value: 'rename',
                                      child: Text(
                                          Localizations.localeOf(context)
                                                      .languageCode ==
                                                  'ar'
                                              ? 'إعادة تسمية'
                                              : 'Rename')),
                                  PopupMenuItem(
                                      value: 'delete',
                                      child: Text(
                                          Localizations.localeOf(context)
                                                      .languageCode ==
                                                  'ar'
                                              ? 'حذف'
                                              : 'Delete')),
                                ],
                              ),
                              onTap: () => Navigator.pop(sheetContext, id),
                            );
                          }).toList())),
              ]),
            ),
          );
        },
      ),
    );
    if (selected == null) return;
    setState(() {
      _busy = true;
      _conversationId = selected;
      _error = null;
    });
    try {
      await _loadMessages(selected);
    } catch (error) {
      _error = error.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _scrollToEnd() {
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

  Future<void> _toggleSpeech() async {
    if (_listening) {
      await _speech.stop();
      if (mounted) setState(() => _listening = false);
      return;
    }
    try {
      _speechAvailable = await _speech.initialize(
        onStatus: (status) {
          if (mounted) setState(() => _listening = status == 'listening');
        },
        onError: (error) {
          if (mounted)
            setState(() {
              _listening = false;
              _error = _strings.microphoneError(error.errorMsg);
            });
        },
      );
      if (!_speechAvailable) {
        setState(() => _error = _strings.speechUnavailable);
        return;
      }
      setState(() => _error = null);
      await _speech.listen(
        listenOptions: stt.SpeechListenOptions(
          localeId: 'ar_SA',
          listenMode: stt.ListenMode.dictation,
        ),
        onResult: (result) {
          setState(() {
            _message.value = TextEditingValue(
              text: result.recognizedWords,
              selection: TextSelection.collapsed(
                  offset: result.recognizedWords.length),
            );
          });
        },
      );
    } catch (_) {
      if (mounted) setState(() => _error = _strings.microphonePermissionDenied);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return Center(
        child: CircularProgressIndicator(
          color: AppColors.primaryGold,
          semanticsLabel: _strings.loading,
        ),
      );
    }
    if (_token == null) return _buildAuth();
    return _buildChat();
  }

  Widget _buildAuth() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 460),
          child: Card(
            color: AppColors.surface,
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SulyBrandMark(size: 58),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    _registering ? _strings.registerTitle : _strings.loginTitle,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: AppColors.text,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    textDirection: TextDirection.ltr,
                    decoration: InputDecoration(
                      labelText: _strings.email,
                      prefixIcon: const Icon(Icons.email_outlined),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextField(
                    controller: _password,
                    obscureText: true,
                    onSubmitted: (_) => _authenticate(),
                    decoration: InputDecoration(
                      labelText: _strings.password,
                      prefixIcon: const Icon(Icons.lock_outline),
                      helperText: _strings.minimumPassword,
                    ),
                  ),
                  if (_error != null) _errorBox(_error!),
                  const SizedBox(height: AppSpacing.md),
                  FilledButton.icon(
                    onPressed: _busy ? null : _authenticate,
                    icon: _busy
                        ? const SizedBox.square(
                            dimension: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.login),
                    label: Text(_registering
                        ? _strings.createAccountAndChat
                        : _strings.signIn),
                  ),
                  TextButton(
                    onPressed: _busy
                        ? null
                        : () => setState(() {
                              _registering = !_registering;
                              _error = null;
                            }),
                    child: Text(_registering
                        ? _strings.loginPrompt
                        : _strings.registerPrompt),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildChat() {
    return Column(
      children: [
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm, vertical: 4),
          child: Row(
            children: [
              IconButton(
                tooltip: _strings.chatHistory,
                onPressed: _conversations.isEmpty ? null : _switchConversation,
                icon: const Icon(Icons.history),
              ),
              IconButton(
                tooltip: _strings.newConversation,
                onPressed: _busy ? null : _newConversation,
                icon: const Icon(Icons.add_comment_outlined),
              ),
              PopupMenuButton<String>(
                tooltip: Localizations.localeOf(context).languageCode == 'ar'
                    ? 'المزيد'
                    : 'More',
                icon: const Icon(Icons.more_vert),
                onSelected: (value) {
                  if (value == 'settings') _showAccountSettings();
                  if (value == 'history') _switchConversation();
                  if (value == 'logout') _signOut();
                },
                itemBuilder: (_) => [
                  PopupMenuItem(
                      value: 'history', child: Text(_strings.chatHistory)),
                  PopupMenuItem(
                      value: 'settings',
                      child: Text(
                          Localizations.localeOf(context).languageCode == 'ar'
                              ? 'الإعدادات والحساب'
                              : 'Settings & account')),
                  PopupMenuItem(value: 'logout', child: Text(_strings.signOut)),
                ],
              ),
              const Spacer(),
              Flexible(
                  child: Text(
                      (_conversations
                                  .where((item) =>
                                      (item['id'] as num?)?.toInt() ==
                                      _conversationId)
                                  .isNotEmpty
                              ? _conversations
                                  .firstWhere((item) =>
                                      (item['id'] as num?)?.toInt() ==
                                      _conversationId)['title']
                                  ?.toString()
                              : null) ??
                          _strings.conversationLabel,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          color: AppColors.textMuted,
                          fontWeight: FontWeight.w600))),
              InkWell(
                onTap: _showCreditHistory,
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.bolt,
                          size: 16, color: AppColors.primaryGold),
                      const SizedBox(width: 3),
                      Text('$_creditBalance',
                          style: const TextStyle(
                              color: AppColors.text,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        if (_error != null) _errorBox(_error!),
        Expanded(
          child: _messages.isEmpty
              ? _emptyChat()
              : ListView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.lg,
                  ),
                  itemCount: _messages.length + (_busy ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (_busy && index == _messages.length) {
                      return const Align(
                        alignment: AlignmentDirectional.centerStart,
                        child: Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox.square(
                            dimension: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        ),
                      );
                    }
                    final message = _messages[index];
                    final isUser = message['role'] == 'user';
                    return Align(
                      alignment: isUser
                          ? AlignmentDirectional.centerEnd
                          : AlignmentDirectional.centerStart,
                      child: Container(
                        constraints: const BoxConstraints(maxWidth: 760),
                        margin: const EdgeInsets.only(bottom: AppSpacing.md),
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        decoration: BoxDecoration(
                          color: isUser
                              ? AppColors.surfaceSecondary
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            MarkdownMessage(
                              text: message['content']?.toString() ?? '',
                              isRtl: _textDirection(
                                      message['content']?.toString() ?? '') ==
                                  TextDirection.rtl,
                              onCopy: (value) {
                                _copyMessage(value);
                              },
                            ),
                            if (!isUser &&
                                (message['content']?.toString().isNotEmpty ??
                                    false))
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    tooltip: Localizations.localeOf(context)
                                                .languageCode ==
                                            'ar'
                                        ? 'نسخ'
                                        : 'Copy',
                                    onPressed: _busy
                                        ? null
                                        : () => _copyMessage(
                                            message['content']!.toString()),
                                    icon: const Icon(Icons.copy_outlined,
                                        size: 17),
                                  ),
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    tooltip: Localizations.localeOf(context)
                                                .languageCode ==
                                            'ar'
                                        ? 'إعادة التوليد'
                                        : 'Regenerate',
                                    onPressed: _busy
                                        ? null
                                        : () => _regenerateMessage(index),
                                    icon: const Icon(Icons.refresh, size: 18),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        _composer(),
      ],
    );
  }

  TextDirection _textDirection(String text) {
    final hasArabic = RegExp(r'[\u0600-\u06FF]').hasMatch(text);
    return hasArabic ? TextDirection.rtl : TextDirection.ltr;
  }

  Widget _emptyChat() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SulyBrandMark(size: 72),
            const SizedBox(height: AppSpacing.md),
            Text(_strings.emptyChatTitle,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: AppColors.text,
                      fontWeight: FontWeight.w700,
                    ),
                textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.sm),
            Text(_strings.emptyChatBody,
                style: const TextStyle(color: AppColors.textMuted),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  Widget _composer() {
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
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          if (_pendingAttachments.isNotEmpty)
            SizedBox(
                height: 42,
                child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: _pendingAttachments
                        .map((item) => Padding(
                              padding: const EdgeInsetsDirectional.only(end: 6),
                              child: InputChip(
                                  avatar:
                                      const Icon(Icons.attach_file, size: 16),
                                  label: Text(item['name'].toString(),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis),
                                  onDeleted: () =>
                                      _removePendingAttachment(item)),
                            ))
                        .toList())),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              IconButton.filledTonal(
                  onPressed: (_busy || _uploading) ? null : _pickAndUploadFile,
                  tooltip: Localizations.localeOf(context).languageCode == 'ar'
                      ? 'إرفاق ملف أو صورة'
                      : 'Attach file or image',
                  icon: _uploading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.attach_file)),
              IconButton.filledTonal(
                onPressed: _busy ? null : _toggleSpeech,
                tooltip: _listening
                    ? _strings.stopListening
                    : _strings.dictateArabic,
                icon: Icon(
                    _listening ? Icons.stop_circle_outlined : Icons.mic_none),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: TextField(
                  controller: _message,
                  minLines: 1,
                  maxLines: 5,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _sendMessage(),
                  enabled: !_busy,
                  decoration: InputDecoration(
                    hintText:
                        _listening ? _strings.listening : _strings.composerHint,
                    filled: true,
                    fillColor: AppColors.inputFill,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(18),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(18),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              IconButton.filled(
                onPressed: _busy ? _stopStreaming : _sendMessage,
                tooltip: _busy ? 'إيقاف التوليد' : _strings.send,
                icon: Icon(_busy ? Icons.stop_rounded : Icons.send),
              ),
            ],
          ),
        ]),
      ),
    );
  }

  Widget _errorBox(String message) => Container(
        width: double.infinity,
        margin: const EdgeInsets.all(AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.error.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.error.withValues(alpha: 0.45)),
        ),
        child: Text(message, style: const TextStyle(color: AppColors.error)),
      );
}
