import 'package:flutter_test/flutter_test.dart';
import 'package:suly_app/app.dart';

void main() {
  testWidgets('SULY AI basic bootstrap and home screen test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const SulyApp());
    await tester.pumpAndSettle();

    // Verify that the title "SULY AI" is rendered in the app bar and body.
    expect(find.text('SULY AI'), findsAtLeast(1));

    // Verify that the interim foundation badge is present.
    expect(find.text('المرحلة الثانية: تأسيس واجهة Flutter'), findsOneWidget);

    // Verify RTL / text disclaimer appears without throwing or requiring network.
    expect(
      find.text('تطبيق React الأصلي يعمل بشكل مستقل ومحفوظ بالكامل'),
      findsOneWidget,
    );
  });
}
