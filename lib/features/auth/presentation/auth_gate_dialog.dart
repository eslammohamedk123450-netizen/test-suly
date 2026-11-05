import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../data/auth_api_service.dart';
import '../data/auth_session.dart';

Future<bool> ensureUserSession(BuildContext context,
    {bool isRtl = true}) async {
  if (AuthSession.accessToken != null) return true;
  final authenticated = await showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (_) => _AuthGateDialog(isRtl: isRtl),
  );
  return authenticated == true && AuthSession.accessToken != null;
}

class _AuthGateDialog extends StatefulWidget {
  const _AuthGateDialog({required this.isRtl});
  final bool isRtl;

  @override
  State<_AuthGateDialog> createState() => _AuthGateDialogState();
}

class _AuthGateDialogState extends State<_AuthGateDialog> {
  final _api = AuthApiService();
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _fullName = TextEditingController();
  bool _registerMode = false;
  bool _loading = false;
  bool _obscurePassword = true;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _fullName.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (_registerMode) {
        await _api.register(
          email: _email.text,
          password: _password.text,
          fullName: _fullName.text,
        );
      }
      await _api.login(email: _email.text, password: _password.text);
      if (mounted) Navigator.of(context).pop(true);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: widget.isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text(widget.isRtl
            ? (_registerMode ? 'إنشاء حساب للمحادثة' : 'سجّل الدخول للمتابعة')
            : (_registerMode
                ? 'Create an account to chat'
                : 'Sign in to continue')),
        content: SizedBox(
          width: 420,
          child: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Text(
                  widget.isRtl
                      ? 'تتطلب المحادثة حسابًا لحماية مفاتيح مزودي الذكاء الاصطناعي.'
                      : 'A signed-in account is required to protect AI provider credentials.',
                  style: const TextStyle(color: AppColors.textMuted),
                ),
                if (_registerMode) ...[
                  const SizedBox(height: AppSpacing.md),
                  TextFormField(
                    controller: _fullName,
                    textInputAction: TextInputAction.next,
                    decoration: InputDecoration(
                      labelText:
                          widget.isRtl ? 'الاسم (اختياري)' : 'Name (optional)',
                    ),
                  ),
                ],
                const SizedBox(height: AppSpacing.md),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: widget.isRtl ? 'البريد الإلكتروني' : 'Email',
                  ),
                  validator: (value) => value == null || !value.contains('@')
                      ? (widget.isRtl
                          ? 'أدخل بريدًا إلكترونيًا صالحًا'
                          : 'Enter a valid email address')
                      : null,
                ),
                const SizedBox(height: AppSpacing.md),
                TextFormField(
                  controller: _password,
                  obscureText: _obscurePassword,
                  onFieldSubmitted: (_) => _submit(),
                  decoration: InputDecoration(
                    labelText: widget.isRtl ? 'كلمة المرور' : 'Password',
                    helperText: _registerMode
                        ? (widget.isRtl
                            ? 'ثمانية أحرف على الأقل'
                            : 'At least 8 characters')
                        : null,
                    suffixIcon: IconButton(
                      onPressed: () =>
                          setState(() => _obscurePassword = !_obscurePassword),
                      icon: Icon(_obscurePassword
                          ? Icons.visibility
                          : Icons.visibility_off),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return widget.isRtl
                          ? 'أدخل كلمة المرور'
                          : 'Enter your password';
                    }
                    if (_registerMode && value.length < 8) {
                      return widget.isRtl
                          ? 'الحد الأدنى 8 أحرف'
                          : 'Use at least 8 characters';
                    }
                    return null;
                  },
                ),
                if (_error != null) ...[
                  const SizedBox(height: AppSpacing.md),
                  Align(
                    alignment: widget.isRtl
                        ? Alignment.centerRight
                        : Alignment.centerLeft,
                    child: Text(_error!,
                        style: const TextStyle(color: AppColors.error)),
                  ),
                ],
              ]),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: _loading ? null : () => Navigator.of(context).pop(false),
            child: Text(widget.isRtl ? 'لاحقًا' : 'Later'),
          ),
          TextButton(
            onPressed: _loading
                ? null
                : () => setState(() {
                      _registerMode = !_registerMode;
                      _error = null;
                    }),
            child: Text(widget.isRtl
                ? (_registerMode ? 'لدي حساب' : 'إنشاء حساب')
                : (_registerMode ? 'I have an account' : 'Create account')),
          ),
          FilledButton(
            onPressed: _loading ? null : _submit,
            child: Text(_loading
                ? (widget.isRtl ? 'جارٍ الاتصال...' : 'Connecting...')
                : widget.isRtl
                    ? (_registerMode ? 'إنشاء وتسجيل الدخول' : 'تسجيل الدخول')
                    : (_registerMode ? 'Create & sign in' : 'Sign in')),
          ),
        ],
      ),
    );
  }
}
