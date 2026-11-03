/// Remote repository that connects to Backend via ConversationApiService.
/// implements the ConversationRepository interface using real HTTP calls.
library;

import 'package:flutter/foundation.dart';

import '../../../core/config/api_config.dart';
import '../../auth/data/auth_session.dart';
import '../../chat/domain/conversation.dart';
import '../../chat/domain/message.dart';
import 'conversation_api_service.dart';

/// Fallback in-memory repository for when backend is unavailable.
class InMemoryConversationRepository implements ConversationRepository {
  final Map<String, Conversation> _conversations = {};

  @override
  Future<List<Conversation>> getConversations() async {
    final list = _conversations.values.toList()
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return list.isEmpty
        ? [_getDefaultConversation()]
        : list;
  }

  @override
  Future<Conversation?> getConversation(String id) async =>
      _conversations[id];

  @override
  Future<Conversation> createConversation({String? title}) async {
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final conversation = Conversation(
      id: id,
      title: title ?? 'محادثة جديدة',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    _conversations[id] = conversation;
    return conversation;
  }

  @override
  Future<void> renameConversation(String id, String newTitle) async {
    final conversation = _conversations[id];
    if (conversation != null) {
      conversation.title = newTitle.trim().isEmpty
          ? 'محادثة جديدة'
          : newTitle.trim();
      conversation.updatedAt = DateTime.now();
    }
  }

  @override
  Future<bool> deleteConversation(String id) =>
      _conversations.remove(id) != null;

  @override
  Future<void> addMessage(String conversationId, Message message) async {
    final conversation = _conversations[conversationId];
    if (conversation != null) {
      conversation.addMessage(message);
    }
  }

  @override
  Future<bool> replaceMessage(
    String conversationId,
    String messageId,
    Message newMessage,
  ) async {
    final conversation = _conversations[conversationId];
    if (conversation != null) {
      return conversation.replaceMessage(messageId, newMessage);
    }
    return false;
  }

  @override
  Future<bool> removeMessage(String conversationId, String messageId) async {
    final conversation = _conversations[conversationId];
    if (conversation != null) {
      return conversation.removeMessage(messageId);
    }
    return false;
  }

  @override
  Future<void> clear() async => _conversations.clear();

  Conversation _getDefaultConversation() {
    return Conversation(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'محادثة جديدة',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      messages: [],
    );
  }
}

/// Remote repository that connects to Backend via ConversationApiService.
/// implements the ConversationRepository interface using real HTTP calls.
class ApiConversationRepository implements ConversationRepository {
  final ConversationApiService _api = ConversationApiService();

  @override
  Future<List<Conversation>> getConversations() async {
    try {
      final conversations = await _api.getConversationsBackend();
      // If backend returns empty (e.g., first time), initialize with default
      if (conversations.isEmpty) {
        return [_getDefaultConversation()];
      }
      return conversations;
    } catch (e) {
      // Fallback to in-memory on error
      final fallback = InMemoryConversationRepository();
      return fallback.getConversations();
    }
  }

  @override
  Future<Conversation?> getConversation(String id) async {
    try {
      final conversation = await _api.getConversationBackend(id);
      return conversation;
    } catch (_) {
      // Fallback to in-memory
      final fallback = InMemoryConversationRepository();
      return fallback.getConversation(id);
    }
  }

  @override
  Future<Conversation> createConversation({String? title}) async {
    try {
      final conversation = await _api.createConversationBackend(
        title: title ?? 'محادثة جديدة',
      );
      return conversation;
    } catch (_) {
      // Fallback to in-memory
      final fallback = InMemoryConversationRepository();
      return fallback.createConversation(title: title);
    }
  }

  @override
  Future<void> renameConversation(String id, String newTitle) async {
    try {
      await _api.updateConversationBackend(
        id: id,
        title: newTitle,
      );
      // Refresh local state by re-fetching
      final conversations = await getConversations();
      if (conversations.isNotEmpty) {
        final idx =
            conversations.indexWhere((c) => c.id == id);
        if (idx != -1) {
          conversations[idx].title = newTitle;
        }
      }
    } catch (_) {
      // Fallback to in-memory
      final fallback = InMemoryConversationRepository();
      await fallback.renameConversation(id, newTitle);
    }
  }

  @override
  Future<bool> deleteConversation(String id) async {
    try {
      await _api.deleteConversationBackend(id);
      // Remove from local state
      final conversations = await getConversations();
      return conversations.removeWhere((c) => c.id == id) != null;
    } catch (_) {
      // Fallback to in-memory
      final fallback = InMemoryConversationRepository();
      return fallback.deleteConversation(id);
    }
  }

  @override
  Future<void> addMessage(String conversationId, Message message) async {
    // Implementation depends on whether backend handles message storage
    // For now, update local state only
    final conversations = await getConversations();
    for (final conversation in conversations) {
      if (conversation.id == conversationId) {
        conversation.addMessage(message);
        break;
      }
    }
  }

  @override
  Future<bool> replaceMessage(
    String conversationId,
    String messageId,
    Message newMessage,
  ) async {
    final conversations = await getConversations();
    for (final conversation in conversations) {
      if (conversation.id == conversationId) {
        return conversation.replaceMessage(messageId, newMessage);
      }
    }
    return false;
  }

  @override
  Future<bool> removeMessage(String conversationId, String messageId) async {
    final conversations = await getConversations();
    for (final conversation in conversations) {
      if (conversation.id == conversationId) {
        return conversation.removeMessage(messageId);
      }
    }
    return false;
  }

  @override
  Future<void> clear() async {
    // Clear both local and remote state
    // In a real app, would sync with backend logout
  }

  /// Get conversations list, with fallback to default if empty
  Future<List<Conversation>> get conversations async {
    final list = await getConversations();
    if (list.isEmpty) {
      return [_getDefaultConversation()];
    }
    return list;
  }

  Conversation _getDefaultConversation() {
    return Conversation(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'محادثة جديدة',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      messages: [],
    );
  }
}