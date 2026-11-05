import 'message.dart';

/// نموذج محادثة مستقلة تحتفظ بقائمة رسائلها الخاصة مع دعم المجلدات والتثبيت
class Conversation {
  final String id;
  String title;
  final List<Message> messages;
  final DateTime createdAt;
  DateTime updatedAt;
  String? folderId;
  bool isPinned;
  String model;

  Conversation({
    required this.id,
    required this.title,
    this.messages = const [],
    required this.createdAt,
    DateTime? updatedAt,
    this.folderId,
    this.isPinned = false,
    this.model = 'gpt-4o',
  }) : updatedAt = updatedAt ?? createdAt;

  void addMessage(Message message) {
    messages.add(message);
    updatedAt = DateTime.now();
  }

  bool replaceMessage(String messageId, Message newMessage) {
    final index = messages.indexWhere((m) => m.id == messageId);
    if (index == -1) return false;
    messages[index] = newMessage;
    updatedAt = DateTime.now();
    return true;
  }

  bool removeMessage(String messageId) {
    final initialLength = messages.length;
    messages.removeWhere((m) => m.id == messageId);
    if (messages.length != initialLength) {
      updatedAt = DateTime.now();
      return true;
    }
    return false;
  }

  Message? get lastMessage => messages.isNotEmpty ? messages.last : null;
  int get messageCount => messages.length;

  Conversation copyWith({
    String? id,
    String? title,
    List<Message>? messages,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? folderId,
    bool? isPinned,
    String? model,
  }) {
    return Conversation(
      id: id ?? this.id,
      title: title ?? this.title,
      messages: messages ?? this.messages,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      folderId: folderId ?? this.folderId,
      isPinned: isPinned ?? this.isPinned,
      model: model ?? this.model,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'folderId': folderId,
        'isPinned': isPinned,
        'model': model,
        'messages': messages.map((m) => m.toJson()).toList(),
      };

  factory Conversation.fromJson(Map<String, dynamic> json) => Conversation(
        id: json['id'] as String? ?? 'conv-${DateTime.now().millisecondsSinceEpoch}',
        title: json['title'] as String? ?? 'New Chat',
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
            : DateTime.now(),
        updatedAt: json['updatedAt'] != null
            ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime.now()
            : DateTime.now(),
        folderId: json['folderId'] as String?,
        isPinned: json['isPinned'] as bool? ?? false,
        model: json['model'] as String? ?? 'gpt-4o',
        messages: (json['messages'] as List<dynamic>?)
                ?.map((m) => Message.fromJson(m as Map<String, dynamic>))
                .toList() ??
            [],
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Conversation &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}
