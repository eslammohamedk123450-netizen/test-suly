import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../data/auth_api_service.dart';
import '../data/auth_session.dart';

Future<bool> ensureUserSession(BuildContext context) async {
  if (AuthSession.accessToken != null) return true;
  final authenticated = await showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (_) => const _AuthGateDialog(),
  );
  return authenticated == true && AuthSession.accessToken != null;
}

class _AuthGateDialog extends StatefulWidget {
  const _AuthGateDialog();

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
    setState(() { _loading = true; _error = null; });
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
      textDirection: TextDirection.rtl,
      child: AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text(_registerMode ? 'إنشاء حساب للمحادثة' : 'سجّل الدخول للمتابعة'),
        content: SizedBox(
          width: 420,
          child: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Text(
                  'تتطلب المحادثة حسابًا حتى لا تكون مفاتيح مزودي الذكاء متاحة للاستخدام العام.',
                  style: const TextStyle(color: AppColors.textMuted),
                ),
                if (_registerMode) ...[
                  const SizedBox(height: AppSpacing.md),
                  TextFormField(
                    controller: _fullName,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(labelText: 'الاسم (اختياري)'),
                  ),
                ],
                const SizedBox(height: AppSpacing.md),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(labelText: 'البريد الإلكتروني'),
                  validator: (value) => value == null || !value.contains('@')
                      ? 'أدخل بريدًا إلكترونيًا صالحًا'
                      : null,
                ),
                const SizedBox(height: AppSpacing.md),
                TextFormField(
                  controller: _password,
                  obscureText: _obscurePassword,
                  onFieldSubmitted: (_) => _submit(),
                  decoration: InputDecoration(
                    labelText: 'كلمة المرور',
                    helperText: _registerMode ? 'ثمانية أحرف على الأقل' : null,
                    suffixIcon: IconButton(
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return 'أدخل كلمة المرور';
                    if (_registerMode && value.length < 8) return 'الحد الأدنى 8 أحرف';
                    return null;
                  },
                ),
                if (_error != null) ...[
                  const SizedBox(height: AppSpacing.md),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text(_error!, style: const TextStyle(color: AppColors.error)),
                  ),
                ],
              ]),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: _loading ? null : () => Navigator.of(context).pop(false),
            child: const Text('لاحقًا'),
          ),
          TextButton(
            onPressed: _loading
                ? null
                : () => setState(() { _registerMode = !_registerMode; _error = null; }),
            child: Text(_registerMode ? 'لدي حساب' : 'إنشاء حساب'),
          ),
          FilledButton(
            onPressed: _loading ? null : _submit,
            child: Text(_loading
                ? 'جارٍ الاتصال...'
                : _registerMode ? 'إنشاء وتسجيل الدخول' : 'تسجيل الدخول'),
          ),
        ],
      ),
    );
  }
}
