import 'package:flutter/material.dart';
import '../../../core/config/app_environment.dart';
import '../../../core/theme/app_theme.dart';

/// الشاشة التمهيدية المؤقتة لمرحلة تأسيس تطبيق SULY AI
///
/// تنبيه معتمَد:
/// - هذه الشاشة مخصصة للتحقق من تشغيل بيئة Flutter الأساسية وهيكلها الأولي.
/// - لا تحتوي على وظائف منتج فعلية أو وهمية (لا محادثة، لا رفع ملفات، لا رصيد أو اشتراكات).
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          AppEnvironment.appName,
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 540),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryContainer,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: AppTheme.accent.withValues(alpha: 0.3),
                            width: 1.5,
                          ),
                        ),
                        child: const Icon(
                          Icons.dashboard_customize_outlined,
                          size: 40,
                          color: AppTheme.accent,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        AppEnvironment.appName,
                        style: Theme.of(context).textTheme.headlineMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceSubtle,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'المرحلة الثانية: تأسيس واجهة Flutter',
                          style: TextStyle(
                            color: AppTheme.accent,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'هذه شاشة تمهيدية معتمدة للمرحلة الحالية، تؤكد صحة إعداد مشروع Flutter '
                        'على Android وiOS والويب، وضبط اتجاه القراءة (RTL) باللغة العربية.\n\n'
                        'وظائف الذكاء الاصطناعي، وإدارة الحسابات، وقواعد البيانات مؤجلة '
                        'للمراحل القادمة بعد اعتماد تصميم الواجهة والهوية البصرية من المالك.',
                        style: Theme.of(context).textTheme.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 28),
                      const Divider(color: AppTheme.surfaceSubtle),
                      const SizedBox(height: 16),
                      Wrap(
                        crossAxisAlignment: WrapCrossAlignment.center,
                        alignment: WrapAlignment.center,
                        spacing: 8,
                        runSpacing: 4,
                        children: const [
                          Icon(
                            Icons.info_outline,
                            size: 16,
                            color: AppTheme.textMuted,
                          ),
                          Text(
                            'تطبيق React الأصلي يعمل بشكل مستقل ومحفوظ بالكامل',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppTheme.textMuted,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
