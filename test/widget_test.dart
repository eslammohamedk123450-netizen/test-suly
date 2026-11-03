import 'package:flutter_test/flutter_test.dart';

import 'package:suly_ai/main.dart';

void main() {
  testWidgets('SULY AI opens on tasks and can start a chat', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SulyAiApp());
    await tester.pumpAndSettle();

    expect(find.text('SULY AI'), findsWidgets);
    expect(find.text('المهام الأخيرة'), findsOneWidget);
    expect(find.text('test-suly GitHub repository'), findsOneWidget);
    await tester.tap(find.byTooltip('محادثة جديدة').first);
    await tester.pumpAndSettle();
    expect(find.text('مرحباً بك في محادثة SULY AI'), findsOneWidget);
  });
}
