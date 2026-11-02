import 'package:flutter_test/flutter_test.dart';

import 'package:suly_ai/main.dart';

void main() {
  testWidgets('SULY AI home screen opens directly into Chat', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SulyAiApp());
    await tester.pumpAndSettle();

    expect(find.text('SULY AI'), findsWidgets);
    // The default home screen is now the Chat experience (Arabic welcome).
    expect(find.text('مرحباً بك في محادثة SULY AI'), findsOneWidget);
  });
}
