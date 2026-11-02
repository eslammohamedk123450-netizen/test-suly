import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../data/admin_api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});
  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final AdminApiService _api = AdminApiService();
  final TextEditingController _email = TextEditingController();
  final TextEditingController _password = TextEditingController();
  String _section = 'overview';
  Object? _data;
  bool _loggedIn = false;
  bool _loading = false;
  String? _error;

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

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: _loggedIn ? _buildDashboard() : _buildLogin(),
      ),
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
                const Icon(Icons.admin_panel_settings,
                    color: AppColors.primaryGold, size: 54),
                const SizedBox(height: AppSpacing.md),
                Text('دخول لوحة الإدارة',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: AppColors.text, fontWeight: FontWeight.w800)),
                const SizedBox(height: AppSpacing.xs),
                Text(
                    'الوصول محمي بصلاحيات Backend. لا توجد كلمة مرور افتراضية.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: AppColors.textMuted)),
                const SizedBox(height: AppSpacing.lg),
                TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                        labelText: 'البريد الإلكتروني',
                        prefixIcon: Icon(Icons.email_outlined))),
                const SizedBox(height: AppSpacing.md),
                TextField(
                    controller: _password,
                    obscureText: true,
                    onSubmitted: (_) => _login(),
                    decoration: const InputDecoration(
                        labelText: 'كلمة المرور',
                        prefixIcon: Icon(Icons.lock_outline))),
                if (_error != null) ...<Widget>[
                  const SizedBox(height: AppSpacing.md),
                  _ErrorBox(message: _error!),
                ],
                const SizedBox(height: AppSpacing.lg),
                FilledButton.icon(
                    onPressed: _loading ? null : _login,
                    icon: const Icon(Icons.login),
                    label: Text(_loading ? 'جارٍ التحقق...' : 'تسجيل الدخول')),
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
                                  label: Text(item.$3),
                                  selected: _section == item.$1,
                                  onSelected: (_) => _loadSection(item.$1))))
                          .toList()))),
          content,
        ]);
      },
    );
  }

  Widget _buildContent() {
    final titles = <String, String>{
      'overview': 'نظرة عامة',
      'users': 'المستخدمون',
      'providers': 'مزودو الذكاء الاصطناعي',
      'models': 'النماذج',
      'plans': 'خطط الاشتراك',
      'settings': 'إعدادات النظام',
      'audit': 'سجل النشاط'
    };
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Row(children: <Widget>[
                Expanded(
                    child: Text(titles[_section] ?? 'لوحة الإدارة',
                        style: Theme.of(context)
                            .textTheme
                            .headlineSmall
                            ?.copyWith(
                                color: AppColors.text,
                                fontWeight: FontWeight.w800))),
                IconButton(
                    onPressed: _loading ? null : () => _loadSection(_section),
                    icon: const Icon(Icons.refresh),
                    tooltip: 'تحديث')
              ]),
              const SizedBox(height: AppSpacing.md),
              if (_error != null) _ErrorBox(message: _error!),
              if (_loading)
                const Expanded(
                    child: Center(
                        child: CircularProgressIndicator(
                            color: AppColors.primaryGold))),
              if (!_loading && _data == null && _error == null)
                const Expanded(
                    child: _EmptyState(message: 'لا توجد بيانات متاحة')),
              if (!_loading && _data != null) Expanded(child: _sectionWidget()),
            ]),
      ),
    );
  }

  Widget _sectionWidget() {
    return switch (_section) {
      'overview' => _Overview(data: _data! as Map<String, dynamic>),
      'users' => _UsersList(items: _data! as List<dynamic>),
      'providers' => _SimpleList(
          items: _data! as List<dynamic>,
          empty: 'لم يتم إعداد مزودين بعد',
          titleKey: 'name',
          subtitleKey: 'provider_type'),
      'models' => _SimpleList(
          items: _data! as List<dynamic>,
          empty: 'لم يتم إعداد نماذج بعد',
          titleKey: 'name',
          subtitleKey: 'model_identifier'),
      'plans' => _SimpleList(
          items: _data! as List<dynamic>,
          empty: 'لم يتم إنشاء خطط بعد',
          titleKey: 'name',
          subtitleKey: 'billing_period'),
      'settings' => _SettingsList(values: _data! as Map<String, dynamic>),
      'audit' => _AuditList(items: _data! as List<dynamic>),
      _ => const _EmptyState(message: 'هذه الوحدة لم تُربط بعد بواجهة الإدارة'),
    };
  }
}

class _AdminSidebar extends StatelessWidget {
  const _AdminSidebar({required this.selected, required this.onSelect});
  final String selected;
  final ValueChanged<String> onSelect;
  static const items = <(String, IconData, String)>[
    ('overview', Icons.dashboard_outlined, 'نظرة عامة'),
    ('users', Icons.people_outline, 'المستخدمون'),
    ('providers', Icons.hub_outlined, 'المزودون'),
    ('models', Icons.smart_toy_outlined, 'النماذج'),
    ('plans', Icons.card_membership_outlined, 'الاشتراكات'),
    ('settings', Icons.settings_outlined, 'الإعدادات'),
    ('audit', Icons.receipt_long_outlined, 'سجل النشاط'),
  ];
  @override
  Widget build(BuildContext context) => Container(
      width: 230,
      color: AppColors.surface,
      child: SafeArea(
          child: Column(children: <Widget>[
        const Padding(
            padding: EdgeInsets.all(AppSpacing.lg),
            child: Row(children: <Widget>[
              Icon(Icons.auto_awesome, color: AppColors.primaryGold),
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
                        title: Text(item.$3,
                            style: TextStyle(
                                color: selected == item.$1
                                    ? AppColors.text
                                    : AppColors.textMuted)),
                        selected: selected == item.$1,
                        selectedTileColor:
                            AppColors.primaryGold.withOpacity(0.14),
                        onTap: () => onSelect(item.$1)))
                    .toList())),
      ])));
}

class _Overview extends StatelessWidget {
  const _Overview({required this.data});
  final Map<String, dynamic> data;
  @override
  Widget build(BuildContext context) {
    final cards = <(String, String, IconData)>[
      ('المستخدمون', '${data['total_users'] ?? 0}', Icons.people_outline),
      (
        'المستخدمون النشطون',
        '${data['active_users'] ?? 0}',
        Icons.verified_user_outlined
      ),
      (
        'المستخدمون الجدد',
        '${data['new_users'] ?? 0}',
        Icons.person_add_alt_1_outlined
      ),
      (
        'المشاريع',
        '${data['total_projects'] ?? 0}',
        Icons.folder_open_outlined
      ),
      (
        'المشرفون النشطون',
        '${data['active_admins'] ?? 0}',
        Icons.admin_panel_settings_outlined
      ),
      (
        'الأرصدة المستهلكة',
        '${data['total_credits_consumed'] ?? 0}',
        Icons.account_balance_wallet_outlined
      ),
      (
        'المزودون الفعالون',
        '${data['configured_providers'] ?? 0}',
        Icons.hub_outlined
      ),
      (
        'النماذج المتاحة',
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
                    Text('آخر النشاطات',
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(
                                color: AppColors.text,
                                fontWeight: FontWeight.w700)),
                    const SizedBox(height: AppSpacing.sm),
                    if ((data['recent_activity'] as List<dynamic>? ?? [])
                        .isEmpty)
                      const _EmptyState(message: 'لا توجد نشاطات مسجلة بعد')
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
                color: AppColors.primaryGold.withOpacity(0.14),
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
  const _UsersList({required this.items});
  final List<dynamic> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty)
      return const _EmptyState(message: 'لا يوجد مستخدمون مسجلون');
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
          subtitle: Text('$email • الرصيد: ${item['credit_balance'] ?? 0}',
              style: const TextStyle(color: AppColors.textMuted)),
          trailing: Icon(
              item['is_active'] == true
                  ? Icons.check_circle_outline
                  : Icons.block_outlined,
              color:
                  item['is_active'] == true ? Colors.green : AppColors.error),
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
      required this.subtitleKey});
  final List<dynamic> items;
  final String empty;
  final String titleKey;
  final String subtitleKey;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return _EmptyState(message: empty);
    return ListView.separated(
      itemCount: items.length,
      separatorBuilder: (_, __) => const Divider(color: AppColors.border),
      itemBuilder: (_, index) {
        final item = items[index] as Map<String, dynamic>;
        final enabled = item['enabled'] == true || item['is_active'] == true;
        return ListTile(
          leading:
              const Icon(Icons.circle, size: 12, color: AppColors.primaryGold),
          title: Text(item[titleKey]?.toString() ?? '',
              style: const TextStyle(color: AppColors.text)),
          subtitle: Text(item[subtitleKey]?.toString() ?? '',
              style: const TextStyle(color: AppColors.textMuted)),
          trailing: Text(enabled ? 'فعال' : 'غير فعال',
              style: TextStyle(
                  color: enabled ? Colors.green : AppColors.textMuted)),
        );
      },
    );
  }
}

class _SettingsList extends StatelessWidget {
  const _SettingsList({required this.values});
  final Map<String, dynamic> values;
  @override
  Widget build(BuildContext context) => values.isEmpty
      ? const _EmptyState(message: 'لا توجد إعدادات مخصصة بعد')
      : ListView(
          children: values.entries
              .map((entry) => ListTile(
                  title: Text(entry.key,
                      style: const TextStyle(color: AppColors.text)),
                  subtitle: Text(entry.value.toString(),
                      style: const TextStyle(color: AppColors.textMuted))))
              .toList());
}

class _AuditList extends StatelessWidget {
  const _AuditList({required this.items});
  final List<dynamic> items;
  @override
  Widget build(BuildContext context) => items.isEmpty
      ? const _EmptyState(message: 'لا توجد سجلات إدارية بعد')
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
          color: AppColors.error.withOpacity(0.12),
          border: Border.all(color: AppColors.error),
          borderRadius: BorderRadius.circular(10)),
      child: Text(message, style: const TextStyle(color: AppColors.error)));
}
