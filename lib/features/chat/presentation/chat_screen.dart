import 'package:flutter/material.dart';

import 'functional_chat_screen.dart';

/// Compatibility entry point for routes that still reference [ChatScreen].
///
/// The authenticated, backend-backed chat is implemented by
/// [FunctionalChatScreen]. Reusing it here prevents this legacy route from
/// creating local-only conversations or diverging from the active chat flow.
class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) => const FunctionalChatScreen();
}
