import 'package:flutter_test/flutter_test.dart';

import 'package:suly_ai/main.dart';

void main() {
  testWidgets('SULY AI home screen renders', (WidgetTester tester) async {
    await tester.pumpWidget(const SulyAiApp());
    await tester.pumpAndSettle();

    expect(find.text('SULY AI'), findsWidgets);
    expect(find.text('Start a conversation'), findsOneWidget);
  });
}
