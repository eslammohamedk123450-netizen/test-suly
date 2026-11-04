import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:suly_ai/features/chat/presentation/chat_screen.dart';
import 'package:suly_ai/features/chat/presentation/functional_chat_screen.dart';
import 'package:suly_ai/l10n/generated/app_localizations.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('ChatScreen compatibility route uses authenticated chat',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        home: ChatScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(FunctionalChatScreen), findsOneWidget);
    expect(find.byType(TextField), findsNWidgets(2));
  });
}
