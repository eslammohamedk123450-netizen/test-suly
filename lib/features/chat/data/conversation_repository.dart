import '../domain/conversation.dart';
import '../domain/message.dart';
import 'conversation_api_service.dart';

/// Contract consumed by the chat presentation layer.
abstract interface class ConversationRepository {
  Future<List<Conversation>> getConversations();
  Future<Conversation?> getConversation(String id);
  Future<Conversation> createConversation({String? title});
  Future<void> renameConversation(String id, String newTitle);
  Future<bool> deleteConversation(String id);
  Future<void> addMessage(String conversationId, Message message);
  Future<bool> replaceMessage(
    String conversationId,
    String messageId,
    Message newMessage,
  );
  Future<bool> removeMessage(String conversationId, String messageId);
  Future<void> clear();
}

/// Explicit local repository for previews and widget tests only.
class InMemoryConversationRepository implements ConversationRepository {
  final Map<String, Conversation> _conversations = <String, Conversation>{};

  @override
  Future<List<Conversation>> getConversations() async => _sortedValues();

  @override
  Future<Conversation?> getConversation(String id) async => _conversations[id];

  @override
  Future<Conversation> createConversation({String? title}) async {
    final now = DateTime.now();
    final conversation = Conversation(
      id: now.microsecondsSinceEpoch.toString(),
      title: title?.trim().isNotEmpty == true ? title!.trim() : 'محادثة جديدة',
      createdAt: now,
      updatedAt: now,
      messages: <Message>[],
    );
    _conversations[conversation.id] = conversation;
    return conversation;
  }

  @override
  Future<void> renameConversation(String id, String newTitle) async {
    final conversation = _conversations[id];
    if (conversation == null) return;
    conversation.title =
        newTitle.trim().isEmpty ? 'محادثة جديدة' : newTitle.trim();
    conversation.updatedAt = DateTime.now();
  }

  @override
  Future<bool> deleteConversation(String id) async =>
      _conversations.remove(id) != null;

  @override
  Future<void> addMessage(String conversationId, Message message) async {
    _conversations[conversationId]?.addMessage(message);
  }

  @override
  Future<bool> replaceMessage(
    String conversationId,
    String messageId,
    Message newMessage,
  ) async =>
      _conversations[conversationId]?.replaceMessage(messageId, newMessage) ??
      false;

  @override
  Future<bool> removeMessage(String conversationId, String messageId) async =>
      _conversations[conversationId]?.removeMessage(messageId) ?? false;

  @override
  Future<void> clear() async => _conversations.clear();

  List<Conversation> _sortedValues() => _conversations.values.toList()
    ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
}

/// Backend-backed repository. Network errors are propagated to the caller so
/// the UI can show an honest error instead of replacing user data with a fake
/// local conversation.
class ApiConversationRepository implements ConversationRepository {
  ApiConversationRepository({ConversationApiService? api})
      : _api = api ?? ConversationApiService();

  final ConversationApiService _api;
  final Map<String, Conversation> _cache = <String, Conversation>{};

  @override
  Future<List<Conversation>> getConversations() async {
    final conversations = await _api.getConversationsBackend();
    _cache
      ..clear()
      ..addEntries(conversations.map((item) => MapEntry(item.id, item)));
    return conversations;
  }

  @override
  Future<Conversation?> getConversation(String id) async {
    final conversation = await _api.getConversationBackend(id);
    _cache[id] = conversation;
    return conversation;
  }

  @override
  Future<Conversation> createConversation({String? title}) async {
    final conversation = await _api.createConversationBackend(title: title);
    _cache[conversation.id] = conversation;
    return conversation;
  }

  @override
  Future<void> renameConversation(String id, String newTitle) async {
    final conversation = await _api.updateConversationBackend(
      id: id,
      title: newTitle,
    );
    _cache[id] = conversation;
  }

  @override
  Future<bool> deleteConversation(String id) async {
    await _api.deleteConversationBackend(id);
    return _cache.remove(id) != null;
  }

  @override
  Future<void> addMessage(String conversationId, Message message) async {
    // Messages are persisted atomically by POST /chat/ together with the AI
    // response. Keep the in-memory view in sync for the current screen only.
    _cache[conversationId]?.addMessage(message);
  }

  @override
  Future<bool> replaceMessage(
    String conversationId,
    String messageId,
    Message newMessage,
  ) async =>
      _cache[conversationId]?.replaceMessage(messageId, newMessage) ?? false;

  @override
  Future<bool> removeMessage(String conversationId, String messageId) async =>
      _cache[conversationId]?.removeMessage(messageId) ?? false;

  @override
  Future<void> clear() async => _cache.clear();

  Future<List<Conversation>> get conversations => getConversations();
}
