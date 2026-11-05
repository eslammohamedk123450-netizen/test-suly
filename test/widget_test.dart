import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:suly_ai/main.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
  });

  testWidgets('SULY opens in Arabic and requires sign-in before sending', (
    WidgetTester tester,
  ) async {
    tester.view.physicalSize = const Size(400, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const SulyAiApp());
    await tester.pumpAndSettle();

    expect(find.byTooltip('SULY AI'), findsOneWidget);
    final heading = find.text('بماذا يمكنني مساعدتك اليوم؟');
    expect(heading, findsOneWidget);
    expect(Directionality.of(tester.element(heading)), TextDirection.rtl);
    expect(find.byTooltip('تغيير اللغة'), findsOneWidget);

    await tester.enterText(find.byType(TextField).first, 'مرحبًا');
    await tester.tap(find.byIcon(Icons.arrow_upward));
    await tester.pumpAndSettle();
    expect(find.text('سجّل الدخول للمتابعة'), findsOneWidget);
  });

  testWidgets('the language menu switches content and direction to English', (
    WidgetTester tester,
  ) async {
    tester.view.physicalSize = const Size(400, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(const SulyAiApp());
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('تغيير اللغة'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('English'));
    await tester.pumpAndSettle();

    final heading = find.text('What can I help with today?');
    expect(heading, findsOneWidget);
    expect(Directionality.of(tester.element(heading)), TextDirection.ltr);
    expect(find.byTooltip('Change language'), findsOneWidget);
  });
}
