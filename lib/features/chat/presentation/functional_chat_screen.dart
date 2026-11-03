import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

import '../../../core/config/api_config.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

class FunctionalChatScreen extends StatefulWidget {
  const FunctionalChatScreen({super.key});

  @override
  State<FunctionalChatScreen> createState() => _FunctionalChatScreenState();
}

class _FunctionalChatScreenState extends State<FunctionalChatScreen> {
  static const _tokenKey = 'suly_access_token';
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _message = TextEditingController();
  final _scroll = ScrollController();
  final _speech = stt.SpeechToText();

  String? _token;
  String? _error;
  bool _ready = false;
  bool _registering = false;
  bool _busy = false;
  bool _listening = false;
  bool _speechAvailable = false;
  List<Map<String, dynamic>> _conversations = [];
  int? _conversationId;
  List<Map<String, dynamic>> _messages = [];
  int _creditBalance = 0;

  Uri get _base => Uri.parse(ApiConfig.baseUrl);

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
    super.dispose();
  }

  Future<void> _restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_tokenKey);
    if (saved != null && saved.isNotEmpty) {
      try {
        final response = await http.get(
          _base.resolve('/api/v1/auth/me'),
          headers: _headers(saved),
        );
        if (response.statusCode == 200) {
          _token = saved;
          await _loadConversations();
          await _loadCreditBalance();
        } else {
          await prefs.remove(_tokenKey);
        }
      } catch (_) {
        _error =
            'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم أعد المحاولة.';
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
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw _friendlyError(response.statusCode, decoded);
    }
    return decoded;
  }

  Future<dynamic> _get(String path) async {
    final response = await http.get(_base.resolve(path), headers: _headers());
    final decoded = _decode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw _friendlyError(response.statusCode, decoded);
    }
    return decoded;
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
      return 'رصيد الحساب غير كافٍ. اطلب من مدير النظام إضافة رصيد لحسابك.';
    }
    if (status == 503) {
      return 'خدمة الذكاء الاصطناعي غير جاهزة. تأكد من إضافة مزود API ونموذج مفعّل من لوحة الإدارة.';
    }
    if (status == 401) return 'بيانات الدخول غير صحيحة أو انتهت الجلسة.';
    if (status == 409)
      return 'هذا البريد مسجل بالفعل. سجّل الدخول بدل إنشاء حساب جديد.';
    if (status == 429) return 'تم تجاوز حد الطلبات مؤقتًا. حاول بعد قليل.';
    if (status == 0) return 'تعذر الاتصال بالخادم.';
    return detail.isNotEmpty ? detail : 'تعذر إكمال الطلب (رمز $status).';
  }

  Future<void> _authenticate() async {
    final email = _email.text.trim();
    final password = _password.text;
    if (email.isEmpty || password.isEmpty) {
      setState(() => _error = 'أدخل البريد الإلكتروني وكلمة المرور أولًا.');
      return;
    }
    if (_registering && password.length < 8) {
      setState(() => _error = 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
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
      if (token == null || token.isEmpty) throw 'لم يُرجع الخادم رمز الدخول.';
      _token = token;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
      await _loadConversations();
      await _loadCreditBalance();
    } catch (error) {
      _error = error.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _signOut() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    setState(() {
      _token = null;
      _conversationId = null;
      _messages = [];
      _conversations = [];
      _creditBalance = 0;
      _error = null;
      _password.clear();
    });
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

  Future<void> _sendMessage() async {
    final text = _message.text.trim();
    if (text.isEmpty || _busy || _token == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      if (_conversationId == null) await _createConversation();
      final id = _conversationId;
      if (id == null) throw 'تعذر إنشاء محادثة جديدة.';
      final userMessage = <String, dynamic>{
        'role': 'user',
        'content': text,
        'created_at': DateTime.now().toIso8601String(),
      };
      setState(() {
        _messages.add(userMessage);
        _message.clear();
      });
      _scrollToEnd();
      final response = await http.post(
        _base.resolve('/api/v1/chat/?conversation_id=$id'),
        headers: _headers(),
        body: jsonEncode({'message': text}),
      );
      final body = _decode(response.body);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        if (_messages.isNotEmpty && _messages.last == userMessage) {
          _messages.removeLast();
        }
        throw _friendlyError(response.statusCode, body);
      }
      _messages.add({
        'role': 'assistant',
        'content': body['reply']?.toString() ?? 'لم يصل رد من النموذج.',
        'created_at': DateTime.now().toIso8601String(),
      });
      await _loadConversations();
      final responseBalance = body['credit_balance'];
      if (responseBalance is num) {
        _creditBalance = responseBalance.toInt();
      } else {
        await _loadCreditBalance();
      }
    } catch (error) {
      _error = error.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _busy = false);
      _scrollToEnd();
    }
  }

  Future<void> _switchConversation() async {
    if (_conversations.isEmpty) return;
    final selected = await showModalBottomSheet<int>(
      context: context,
      backgroundColor: AppColors.surface,
      builder: (context) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            const ListTile(title: Text('محادثاتك')),
            ..._conversations.map((item) {
              final id = (item['id'] as num).toInt();
              return ListTile(
                leading: const Icon(Icons.chat_bubble_outline),
                title: Text(item['title']?.toString() ?? 'محادثة'),
                selected: _conversationId == id,
                onTap: () => Navigator.pop(context, id),
              );
            }),
          ],
        ),
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
              _error = 'تعذر استخدام الميكروفون: ${error.errorMsg}';
            });
        },
      );
      if (!_speechAvailable) {
        setState(() => _error = 'الإملاء الصوتي غير مدعوم في هذا المتصفح.');
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
      if (mounted) setState(() => _error = 'لم يُسمح بالوصول إلى الميكروفون.');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primaryGold),
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
                  const Icon(Icons.chat_bubble_outline,
                      size: 46, color: AppColors.primaryGold),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    _registering
                        ? 'إنشاء حساب للمحادثة'
                        : 'سجّل الدخول لبدء المحادثة',
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
                    decoration: const InputDecoration(
                      labelText: 'البريد الإلكتروني',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextField(
                    controller: _password,
                    obscureText: true,
                    onSubmitted: (_) => _authenticate(),
                    decoration: const InputDecoration(
                      labelText: 'كلمة المرور',
                      prefixIcon: Icon(Icons.lock_outline),
                      helperText: '8 أحرف على الأقل عند إنشاء حساب جديد',
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
                    label: Text(
                        _registering ? 'إنشاء الحساب وبدء المحادثة' : 'دخول'),
                  ),
                  TextButton(
                    onPressed: _busy
                        ? null
                        : () => setState(() {
                              _registering = !_registering;
                              _error = null;
                            }),
                    child: Text(_registering
                        ? 'لديك حساب؟ سجّل الدخول'
                        : 'مستخدم جديد؟ أنشئ حسابًا'),
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
                tooltip: 'محادثاتك',
                onPressed: _conversations.isEmpty ? null : _switchConversation,
                icon: const Icon(Icons.history),
              ),
              IconButton(
                tooltip: 'محادثة جديدة',
                onPressed: _busy ? null : _newConversation,
                icon: const Icon(Icons.add_comment_outlined),
              ),
              const Spacer(),
              const Text('محادثة جديدة',
                  style: TextStyle(color: AppColors.textMuted)),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
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
              IconButton(
                tooltip: 'تسجيل الخروج',
                onPressed: _signOut,
                icon: const Icon(Icons.logout_outlined),
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
                        child: SelectableText(
                          message['content']?.toString() ?? '',
                          style: const TextStyle(
                              color: AppColors.text, height: 1.5),
                          textDirection: _textDirection(
                              message['content']?.toString() ?? ''),
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
            const Icon(Icons.auto_awesome,
                size: 52, color: AppColors.primaryGold),
            const SizedBox(height: AppSpacing.md),
            Text('ما الذي تريد أن نعمل عليه؟',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: AppColors.text,
                      fontWeight: FontWeight.w700,
                    ),
                textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.sm),
            const Text('اكتب رسالتك أو اضغط الميكروفون للإملاء الصوتي.',
                style: TextStyle(color: AppColors.textMuted),
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
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            IconButton.filledTonal(
              onPressed: _busy ? null : _toggleSpeech,
              tooltip: _listening ? 'إيقاف الاستماع' : 'إملاء صوتي بالعربية',
              icon: Icon(
                  _listening ? Icons.stop_circle_outlined : Icons.mic_none),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: TextField(
                controller: _message,
                minLines: 1,
                maxLines: 5,
                textDirection: TextDirection.rtl,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
                enabled: !_busy,
                decoration: InputDecoration(
                  hintText: _listening ? 'أستمع إليك...' : 'اكتب رسالتك هنا...',
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
              onPressed: _busy ? null : _sendMessage,
              tooltip: 'إرسال',
              icon: const Icon(Icons.send),
            ),
          ],
        ),
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
