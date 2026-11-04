import 'package:flutter/material.dart';

import '../../../core/widgets/suly_brand_mark.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../data/admin_api_service.dart';

String _adminSectionLabel(AppLocalizations strings, String section) =>
    switch (section) {
      'overview' => strings.adminOverview,
      'users' => strings.adminUsers,
      'providers' => strings.adminProviders,
      'models' => strings.adminModels,
      'plans' => strings.adminPlans,
      'settings' => strings.adminSettings,
      'audit' => strings.adminAudit,
      _ => strings.adminTitle,
    };

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});
  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final AdminApiService _api = AdminApiService();
  final TextEditingController _email = TextEditingController();
  final TextEditingController _password = TextEditingController();
  static const Map<String, String> _providerLabels = {
    'openrouter': 'OpenRouter',
    'deepseek': 'DeepSeek',
    'groq': 'Groq',
    'openai': 'OpenAI',
    'google_ai_studio': 'Google AI Studio',
  };
  String _section = 'overview';
  Object? _data;
  bool _loggedIn = false;
  bool _loading = false;
  String? _error;
  AppLocalizations get _strings => AppLocalizations.of(context);

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await _api.login(_email.text.trim(), _password.text);
      if (!mounted) return;
      setState(() => _loggedIn = true);
      await _loadSection('overview');
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _loadSection(String section) async {
    setState(() {
      _section = section;
      _loading = true;
      _error = null;
      _data = null;
    });
    try {
      final Object result = switch (section) {
        'overview' => await _api.getOverview(),
        'users' => await _api.getUsers(),
        'providers' => await _api.getProviders(),
        'models' => await _api.getModels(),
        'plans' => await _api.getPlans(),
        'settings' => await _api.getSettings(),
        'audit' => await _api.getAudit(),
        _ => <dynamic>[],
      };
      if (mounted) setState(() => _data = result);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addProviderSimple() async {
    final connectionName = TextEditingController();
    final apiKey = TextEditingController();
    final formKey = GlobalKey<FormState>();
    var providerType = 'groq';
    final payload = await showDialog<Map<String, String>>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, dialogSetState) => AlertDialog(
          backgroundColor: AppColors.surface,
          title: Text(_strings.addProviderTitle),
          content: SizedBox(
            width: 460,
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  TextFormField(
                    controller: connectionName,
                    decoration: InputDecoration(
                      labelText: _strings.connectionName,
                      hintText: _strings.connectionNameExample,
                    ),
                    validator: (value) => value == null || value.trim().isEmpty
                        ? _strings.connectionNameRequired
                        : null,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DropdownButtonFormField<String>(
                    initialValue: providerType,
                    decoration: InputDecoration(labelText: _strings.provider),
                    items: _providerLabels.entries
                        .map((entry) => DropdownMenuItem(
                              value: entry.key,
                              child: Text(entry.value),
                            ))
                        .toList(),
                    onChanged: (value) {
                      if (value != null)
                        dialogSetState(() => providerType = value);
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextFormField(
                    controller: apiKey,
                    obscureText: true,
                    autocorrect: false,
                    enableSuggestions: false,
                    decoration: InputDecoration(
                      labelText: _strings.apiKey,
                      helperText: _strings.encryptedKeyHint,
                    ),
                    validator: (value) => value == null || value.trim().isEmpty
                        ? _strings.apiKeyRequired
                        : null,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    _strings.providerSetupHelp,
                    style: const TextStyle(
                        color: AppColors.textMuted, height: 1.45),
                  ),
                ]),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(_strings.cancel),
            ),
            FilledButton(
              onPressed: () {
                if (!formKey.currentState!.validate()) return;
                Navigator.pop(dialogContext, <String, String>{
                  'name': connectionName.text.trim(),
                  'provider_type': providerType,
                  'api_key': apiKey.text.trim(),
                });
              },
              child: Text(_strings.discoverAndSave),
            ),
          ],
        ),
      ),
    );
    connectionName.dispose();
    apiKey.dispose();
    if (payload == null) return;

    try {
      setState(() {
        _loading = true;
        _error = null;
      });
      final result = await _api.setupProvider(payload);
      await _loadSection('providers');
      if (mounted) {
        final count = result['models_imported'] ?? 0;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_strings.providerSavedCount(count))),
        );
      }
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _changeModelPriority(
      Map<String, dynamic> model, int delta) async {
    final id = (model['id'] as num?)?.toInt();
    final current = (model['priority'] as num?)?.toInt() ?? 0;
    if (id == null) return;
    final next = (current + delta).clamp(0, 10000).toInt();
    try {
      await _api.updateModelPriority(id, next);
      await _loadSection('models');
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    }
  }

  Future<void> _toggleModelEnabled(Map<String, dynamic> model) async {
    final id = (model['id'] as num?)?.toInt();
    if (id == null) return;
    final enabled = model['enabled'] != true;
    try {
      await _api.setModelEnabled(id, enabled);
      await _loadSection('models');
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    }
  }

  Future<void> _deleteProvider(Map<String, dynamic> provider) async {
    final id = (provider['id'] as num?)?.toInt();
    if (id == null) return;
    final approved = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
              title: const Text('حذف مفتاح API'),
              content: Text(
                  'سيتم حذف اتصال "${provider['name'] ?? ''}" والنماذج التابعة له.'),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(ctx, false),
                    child: Text(_strings.cancel)),
                FilledButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    child: const Text('حذف'))
              ],
            ));
    if (approved != true) return;
    try {
      await _api.deleteProvider(id);
      await _loadSection('providers');
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    }
  }

  Future<void> _adjustUserCredits(Map<String, dynamic> user) async {
    final id = (user['id'] as num?)?.toInt();
    if (id == null) return;
    final amount = TextEditingController();
    final reason = TextEditingController(text: 'تعديل رصيد بواسطة الإدارة');
    final values = await showDialog<(int, String)>(
        context: context,
        builder: (ctx) => AlertDialog(
              title: Text('تعديل رصيد ${user['email'] ?? ''}'),
              content: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(
                    controller: amount,
                    keyboardType:
                        const TextInputType.numberWithOptions(signed: true),
                    decoration: const InputDecoration(
                        labelText: 'المبلغ (+ إضافة، - خصم)')),
                TextField(
                    controller: reason,
                    decoration: const InputDecoration(labelText: 'السبب')),
              ]),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: Text(_strings.cancel)),
                FilledButton(
                    onPressed: () {
                      final n = int.tryParse(amount.text);
                      if (n != null && n != 0)
                        Navigator.pop(ctx, (n, reason.text.trim()));
                    },
                    child: const Text('تطبيق'))
              ],
            ));
    amount.dispose();
    reason.dispose();
    if (values == null) return;
    try {
      await _api.adjustCredits(
          id, values.$1, values.$2.isEmpty ? 'تعديل إداري' : values.$2);
      await _loadSection('users');
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _loggedIn ? _buildDashboard() : _buildLogin(),
    );
  }

  Widget _buildLogin() {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 460),
        child: Card(
          color: AppColors.surface,
          margin: const EdgeInsets.all(AppSpacing.lg),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                const SulyBrandMark(size: 58),
                const SizedBox(height: AppSpacing.md),
                Text(_strings.adminSignIn,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: AppColors.text, fontWeight: FontWeight.w800)),
                const SizedBox(height: AppSpacing.xs),
                Text(_strings.adminProtected,
                    textAlign: TextAlign.center,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: AppColors.textMuted)),
                const SizedBox(height: AppSpacing.lg),
                TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    textDirection: TextDirection.ltr,
                    decoration: InputDecoration(
                        labelText: _strings.email,
                        prefixIcon: const Icon(Icons.email_outlined))),
                const SizedBox(height: AppSpacing.md),
                TextField(
                    controller: _password,
                    obscureText: true,
                    onSubmitted: (_) => _login(),
                    decoration: InputDecoration(
                        labelText: _strings.password,
                        prefixIcon: const Icon(Icons.lock_outline))),
                if (_error != null) ...<Widget>[
                  const SizedBox(height: AppSpacing.md),
                  _ErrorBox(message: _error!),
                ],
                const SizedBox(height: AppSpacing.lg),
                FilledButton.icon(
                    onPressed: _loading ? null : _login,
                    icon: const Icon(Icons.login),
                    label:
                        Text(_loading ? _strings.checking : _strings.signIn)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDashboard() {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final sidebar =
            _AdminSidebar(selected: _section, onSelect: _loadSection);
        final content = Expanded(child: _buildContent());
        if (constraints.maxWidth >= 850) {
          return Row(children: <Widget>[
            sidebar,
            const VerticalDivider(width: 1, color: AppColors.border),
            content
          ]);
        }
        return Column(children: <Widget>[
          Container(
              color: AppColors.surface,
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                      children: _AdminSidebar.items
                          .map((item) => Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 3),
                              child: ChoiceChip(
                                  label: Text(
                                      _adminSectionLabel(_strings, item.$1)),
                                  selected: _section == item.$1,
                                  onSelected: (_) => _loadSection(item.$1))))
                          .toList()))),
          content,
        ]);
      },
    );
  }

  Widget _buildContent() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Row(children: <Widget>[
                Expanded(
                    child: Text(_adminSectionLabel(_strings, _section),
                        style: Theme.of(context)
                            .textTheme
                            .headlineSmall
                            ?.copyWith(
                                color: AppColors.text,
                                fontWeight: FontWeight.w800))),
                IconButton(
                    onPressed: _loading ? null : () => _loadSection(_section),
                    icon: const Icon(Icons.refresh),
                    tooltip: _strings.refresh),
                if (_section == 'providers')
                  IconButton(
                    onPressed: _loading ? null : _addProviderSimple,
                    icon: const Icon(Icons.add),
                    tooltip: _strings.addProviderTooltip,
                  ),
              ]),
              const SizedBox(height: AppSpacing.md),
              if (_error != null) _ErrorBox(message: _error!),
              if (_loading)
                const Expanded(
                    child: Center(
                        child: CircularProgressIndicator(
                            color: AppColors.primaryGold))),
              if (!_loading && _data == null && _error == null)
                Expanded(child: _EmptyState(message: _strings.noData)),
              if (!_loading && _data != null) Expanded(child: _sectionWidget()),
            ]),
      ),
    );
  }

  Widget _sectionWidget() {
    return switch (_section) {
      'overview' => _Overview(data: _data! as Map<String, dynamic>),
      'users' => _UsersList(
          items: _data! as List<dynamic>, onAdjust: _adjustUserCredits),
      'providers' => _SimpleList(
          items: _data! as List<dynamic>,
          empty: _strings.noProviders,
          titleKey: 'name',
          subtitleKey: 'provider_type',
          onDelete: _deleteProvider),
      'models' => _SimpleList(
          items: _data! as List<dynamic>,
          empty: _strings.noModels,
          titleKey: 'name',
          subtitleKey: 'model_identifier',
          onPriority: _changeModelPriority,
          onToggleEnabled: _toggleModelEnabled),
      'plans' => _SimpleList(
          items: _data! as List<dynamic>,
          empty: _strings.noPlans,
          titleKey: 'name',
          subtitleKey: 'billing_period'),
      'settings' => _SettingsList(values: _data! as Map<String, dynamic>),
      'audit' => _AuditList(items: _data! as List<dynamic>),
      _ => _EmptyState(message: _strings.adminModuleNotConnected),
    };
  }
}

class _AdminSidebar extends StatelessWidget {
  const _AdminSidebar({required this.selected, required this.onSelect});
  final String selected;
  final ValueChanged<String> onSelect;
  static const items = <(String, IconData)>[
    ('overview', Icons.dashboard_outlined),
    ('users', Icons.people_outline),
    ('providers', Icons.hub_outlined),
    ('models', Icons.smart_toy_outlined),
    ('plans', Icons.card_membership_outlined),
    ('settings', Icons.settings_outlined),
    ('audit', Icons.receipt_long_outlined),
  ];
  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return Container(
        width: 230,
        color: AppColors.surface,
        child: SafeArea(
            child: Column(children: <Widget>[
          const Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Row(children: <Widget>[
                SulyBrandMark(size: 28),
                SizedBox(width: 8),
                Text('SULY ADMIN',
                    style: TextStyle(
                        color: AppColors.primaryGold,
                        fontWeight: FontWeight.w800))
              ])),
          const Divider(height: 1, color: AppColors.border),
          Expanded(
              child: ListView(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  children: items
                      .map((item) => ListTile(
                          leading: Icon(item.$2,
                              color: selected == item.$1
                                  ? AppColors.primaryGold
                                  : AppColors.textMuted),
                          title: Text(_adminSectionLabel(strings, item.$1),
                              style: TextStyle(
                                  color: selected == item.$1
                                      ? AppColors.text
                                      : AppColors.textMuted)),
                          selected: selected == item.$1,
                          selectedTileColor:
                              AppColors.primaryGold.withValues(alpha: 0.14),
                          onTap: () => onSelect(item.$1)))
                      .toList())),
        ])));
  }
}

class _Overview extends StatelessWidget {
  const _Overview({required this.data});
  final Map<String, dynamic> data;
  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    final cards = <(String, String, IconData)>[
      (
        strings.metricTotalUsers,
        '${data['total_users'] ?? 0}',
        Icons.people_outline
      ),
      (
        strings.metricActiveUsers,
        '${data['active_users'] ?? 0}',
        Icons.verified_user_outlined
      ),
      (
        strings.metricNewUsers,
        '${data['new_users'] ?? 0}',
        Icons.person_add_alt_1_outlined
      ),
      (
        strings.metricProjects,
        '${data['total_projects'] ?? 0}',
        Icons.folder_open_outlined
      ),
      (
        strings.metricActiveAdmins,
        '${data['active_admins'] ?? 0}',
        Icons.admin_panel_settings_outlined
      ),
      (
        strings.metricCreditsConsumed,
        '${data['total_credits_consumed'] ?? 0}',
        Icons.account_balance_wallet_outlined
      ),
      (
        strings.metricActiveProviders,
        '${data['configured_providers'] ?? 0}',
        Icons.hub_outlined
      ),
      (
        strings.metricAvailableModels,
        '${data['available_models'] ?? 0}',
        Icons.smart_toy_outlined
      ),
    ];
    return ListView(children: <Widget>[
      GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 250,
              mainAxisExtent: 110,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12),
          itemCount: cards.length,
          itemBuilder: (_, index) => _MetricCard(
              label: cards[index].$1,
              value: cards[index].$2,
              icon: cards[index].$3)),
      const SizedBox(height: AppSpacing.lg),
      Card(
          color: AppColors.surface,
          child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    Text(strings.recentActivity,
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(
                                color: AppColors.text,
                                fontWeight: FontWeight.w700)),
                    const SizedBox(height: AppSpacing.sm),
                    if ((data['recent_activity'] as List<dynamic>? ?? [])
                        .isEmpty)
                      _EmptyState(message: strings.noRecentActivity)
                    else
                      ...((data['recent_activity'] as List<dynamic>).map(
                          (item) => ListTile(
                              dense: true,
                              leading: const Icon(Icons.history,
                                  color: AppColors.primaryGold),
                              title: Text(item['action']?.toString() ?? '',
                                  style:
                                      const TextStyle(color: AppColors.text)),
                              subtitle: Text(
                                  item['created_at']?.toString() ?? '',
                                  style: const TextStyle(
                                      color: AppColors.textMuted)))))
                  ]))),
    ]);
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard(
      {required this.label, required this.value, required this.icon});
  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.surface,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: <Widget>[
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primaryGold.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primaryGold),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Text(value,
                      style: Theme.of(context)
                          .textTheme
                          .headlineSmall
                          ?.copyWith(
                              color: AppColors.text,
                              fontWeight: FontWeight.w800)),
                  Text(label,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: AppColors.textMuted)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UsersList extends StatelessWidget {
  const _UsersList({required this.items, required this.onAdjust});
  final List<dynamic> items;
  final ValueChanged<Map<String, dynamic>> onAdjust;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    if (items.isEmpty) return _EmptyState(message: strings.noUsers);
    return ListView.separated(
      itemCount: items.length,
      separatorBuilder: (_, __) => const Divider(color: AppColors.border),
      itemBuilder: (_, index) {
        final item = items[index] as Map<String, dynamic>;
        final email = item['email']?.toString() ?? '?';
        return ListTile(
          leading: CircleAvatar(
              backgroundColor: AppColors.surfaceSecondary,
              child: Text(email.substring(0, 1).toUpperCase(),
                  style: const TextStyle(color: AppColors.primaryGold))),
          title: Text(item['full_name']?.toString() ?? email,
              style: const TextStyle(color: AppColors.text)),
          subtitle: Text(
              '${email} • ${strings.creditBalance((item['credit_balance'] as num?)?.toInt() ?? 0)}',
              style: const TextStyle(color: AppColors.textMuted)),
          trailing: IconButton(
              tooltip: 'تعديل الرصيد',
              onPressed: () => onAdjust(item),
              icon: const Icon(Icons.account_balance_wallet_outlined,
                  color: AppColors.primaryGold)),
        );
      },
    );
  }
}

class _SimpleList extends StatelessWidget {
  const _SimpleList(
      {required this.items,
      required this.empty,
      required this.titleKey,
      required this.subtitleKey,
      this.onDelete,
      this.onPriority,
      this.onToggleEnabled});
  final List<dynamic> items;
  final String empty;
  final String titleKey;
  final String subtitleKey;
  final ValueChanged<Map<String, dynamic>>? onDelete;
  final void Function(Map<String, dynamic>, int)? onPriority;
  final ValueChanged<Map<String, dynamic>>? onToggleEnabled;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    if (items.isEmpty) return _EmptyState(message: empty);
    final hasModelReport = onPriority != null;
    final autoDisabledCount = items
        .where(
            (value) => (value as Map<String, dynamic>)['auto_disabled'] == true)
        .length;
    final locale = Localizations.localeOf(context).languageCode;
    return ListView.separated(
      itemCount: items.length + (hasModelReport ? 1 : 0),
      separatorBuilder: (_, __) => const Divider(color: AppColors.border),
      itemBuilder: (_, index) {
        if (hasModelReport && index == 0) {
          final summary = locale == 'ar'
              ? 'تقرير النماذج: $autoDisabledCount معطّل تلقائيًا بعد 3 إخفاقات متتالية. راجع سبب البطء واختر إعادة التفعيل يدويًا.'
              : 'Model report: $autoDisabledCount automatically disabled after 3 consecutive misses. Review the reason and re-enable manually if appropriate.';
          return Container(
            margin: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: autoDisabledCount > 0
                  ? AppColors.error.withValues(alpha: 0.08)
                  : AppColors.surfaceSecondary,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(summary, style: const TextStyle(color: AppColors.text)),
          );
        }
        final itemIndex = index - (hasModelReport ? 1 : 0);
        final item = items[itemIndex] as Map<String, dynamic>;
        final enabled = item['enabled'] == true || item['is_active'] == true;
        final keyStatus = item['masked_key']?.toString();
        final healthStatus = item['last_response_status']?.toString();
        final latency = item['last_response_latency_ms'] as num?;
        final failures = item['consecutive_failures'] ?? 0;
        final baseSubtitle = onPriority != null
            ? '${item['provider_name'] ?? ''} • ${item[subtitleKey] ?? ''}'
            : keyStatus == null
                ? item[subtitleKey]?.toString() ?? ''
                : '${item[subtitleKey] ?? ''} • $keyStatus';
        final reportLines = <String>[];
        if (onPriority != null && healthStatus != null) {
          final statusLabel = healthStatus == 'fast'
              ? (locale == 'ar' ? 'سريع' : 'fast')
              : healthStatus == 'slow'
                  ? (locale == 'ar' ? 'متأخر' : 'slow')
                  : (locale == 'ar' ? 'فشل' : 'error');
          reportLines.add(
              '${locale == 'ar' ? 'الحالة' : 'Status'}: $statusLabel • ${locale == 'ar' ? 'أول رد' : 'first token'}: ${latency == null ? '—' : '${latency.toStringAsFixed(0)} ms'} • ${locale == 'ar' ? 'تتابع الإخفاق' : 'failure streak'}: $failures');
          if (item['auto_disabled'] == true) {
            final reason = item['last_response_error']?.toString();
            reportLines.add(
                '${locale == 'ar' ? 'معطّل تلقائيًا بعد 3 إخفاقات متتالية' : 'Auto-disabled after 3 consecutive misses'}${reason == null ? '' : ': $reason'}');
          }
        }
        final subtitle = [baseSubtitle, ...reportLines]
            .where((line) => line.isNotEmpty)
            .join('\n');
        return ListTile(
          leading: Icon(
            Icons.circle,
            size: 12,
            color: item['auto_disabled'] == true
                ? AppColors.error
                : healthStatus == 'fast'
                    ? AppColors.success
                    : AppColors.primaryGold,
          ),
          title: Text(item[titleKey]?.toString() ?? '',
              style: const TextStyle(color: AppColors.text)),
          subtitle: Text(subtitle,
              style: const TextStyle(color: AppColors.textMuted)),
          trailing: onPriority != null
              ? Row(mainAxisSize: MainAxisSize.min, children: [
                  Text('${item['priority'] ?? 0}',
                      style: const TextStyle(color: AppColors.textMuted)),
                  IconButton(
                      tooltip: 'أولوية أعلى',
                      onPressed: () => onPriority!(item, -1),
                      icon: const Icon(Icons.keyboard_arrow_up)),
                  IconButton(
                      tooltip: 'أولوية أقل',
                      onPressed: () => onPriority!(item, 1),
                      icon: const Icon(Icons.keyboard_arrow_down)),
                  if (onToggleEnabled != null)
                    IconButton(
                      tooltip: enabled
                          ? (locale == 'ar' ? 'إيقاف النموذج' : 'Disable model')
                          : (locale == 'ar'
                              ? 'إعادة تفعيل النموذج'
                              : 'Enable model'),
                      onPressed: () => onToggleEnabled!(item),
                      icon: Icon(
                          enabled
                              ? Icons.pause_circle_outline
                              : Icons.play_circle_outline,
                          color: enabled
                              ? AppColors.textMuted
                              : AppColors.success),
                    ),
                ])
              : onDelete == null
                  ? Text(enabled ? strings.active : strings.inactive,
                      style: TextStyle(
                          color: enabled ? Colors.green : AppColors.textMuted))
                  : IconButton(
                      tooltip: 'حذف اتصال API',
                      onPressed: () => onDelete!(item),
                      icon: const Icon(Icons.delete_outline,
                          color: AppColors.error)),
        );
      },
    );
  }
}

class _SettingsList extends StatelessWidget {
  const _SettingsList({required this.values});
  final Map<String, dynamic> values;
  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return values.isEmpty
        ? _EmptyState(message: strings.noSettings)
        : ListView(
            children: values.entries
                .map((entry) => ListTile(
                    title: Text(entry.key,
                        style: const TextStyle(color: AppColors.text)),
                    subtitle: Text(entry.value.toString(),
                        style: const TextStyle(color: AppColors.textMuted))))
                .toList());
  }
}

class _AuditList extends StatelessWidget {
  const _AuditList({required this.items});
  final List<dynamic> items;
  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return items.isEmpty
        ? _EmptyState(message: strings.noAudit)
        : ListView.separated(
            itemCount: items.length,
            separatorBuilder: (_, __) => const Divider(color: AppColors.border),
            itemBuilder: (_, index) {
              final item = items[index] as Map<String, dynamic>;
              return ListTile(
                  leading:
                      const Icon(Icons.history, color: AppColors.primaryGold),
                  title: Text(item['action']?.toString() ?? '',
                      style: const TextStyle(color: AppColors.text)),
                  subtitle: Text(
                      '${item['target_type'] ?? ''} ${item['target_id'] ?? ''} • ${item['created_at'] ?? ''}',
                      style: const TextStyle(color: AppColors.textMuted)));
            });
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});
  final String message;
  @override
  Widget build(BuildContext context) => Center(
      child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Text(message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textMuted))));
}

class _ErrorBox extends StatelessWidget {
  const _ErrorBox({required this.message});
  final String message;
  @override
  Widget build(BuildContext context) => Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
          color: AppColors.error.withValues(alpha: 0.12),
          border: Border.all(color: AppColors.error),
          borderRadius: BorderRadius.circular(10)),
      child: Text(message, style: const TextStyle(color: AppColors.error)));
}
