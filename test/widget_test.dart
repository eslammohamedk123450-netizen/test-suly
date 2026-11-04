import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:suly_ai/main.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('SULY opens in Arabic and routes to the existing chat', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SulyAiApp());
    await tester.pumpAndSettle();

    expect(find.text('SULY AI'), findsWidgets);
    expect(find.text('إنجاز أوضح، من مكان واحد.'), findsOneWidget);
    expect(
        find.text('More Than AI. Your Intelligent Partner.'), findsOneWidget);
    expect(find.text('لا توجد مهام تجريبية أو سجل جاهز هنا.'), findsOneWidget);

    final startConversation = find.text('ابدأ محادثة');
    await tester.ensureVisible(startConversation);
    await tester.pumpAndSettle();
    await tester.tap(startConversation);
    await tester.pumpAndSettle();

    expect(find.text('سجّل الدخول لبدء المحادثة'), findsOneWidget);
  });

  testWidgets('the language menu switches content and direction to English', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SulyAiApp());
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('تغيير اللغة'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('English'));
    await tester.pumpAndSettle();

    final heading = find.text('A clearer way to get things done.');
    expect(heading, findsOneWidget);
    expect(Directionality.of(tester.element(heading)), TextDirection.ltr);
    expect(find.text('Start a conversation'), findsOneWidget);
  });
}
