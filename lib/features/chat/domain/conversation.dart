/// نموذج محادثة مستقلة تحتفظ بقائمة رسائلها الخاصة.
///
/// الكيان منفصل عن [Message] ولا يُخزّن كل المحادثات ضمن متغير واحد
/// غير منظم. كل محادثة تحمل معرفها وعنوانها وقائمة رسائلها.
class Conversation {
  /// معرف المحادثة الفريد.
  final String id;

  /// عنوان المحادثة المعروض للمستخدم.
  String title;

  /// رسائل هذه المحادثة فقط، مرتبة زمنياً (الأقدم أولاً).
  final List<Message> messages;

  /// وقت إنشاء المحادثة.
  final DateTime createdAt;

  /// وقت تحديث المحادثة آخر مرة (إضافة/تعديل/حذف رسالة).
  DateTime updatedAt;

  Conversation({
    required this.id,
    required this.title,
    this.messages = const [],
    required this.createdAt,
    DateTime? updatedAt,
  }) : updatedAt = updatedAt ?? createdAt;

  /// إضافة رسالة إلى نهاية المحادثة وتحديث وقت التعديل.
  void addMessage(Message message) {
    messages.add(message);
    updatedAt = DateTime.now();
  }

  /// استبدال رسالة موجودة بمعرفها (يُستخدم عند إعادة توليد الرد).
  bool replaceMessage(String messageId, Message newMessage) {
    final index = messages.indexWhere((m) => m.id == messageId);
    if (index == -1) return false;
    messages[index] = newMessage;
    updatedAt = DateTime.now();
    return true;
  }

  /// حذف رسالة بمعرفها.
  bool removeMessage(String messageId) {
    final initialLength = messages.length;
    messages.removeWhere((m) => m.id == messageId);
    if (messages.length != initialLength) {
      updatedAt = DateTime.now();
      return true;
    }
    return false;
  }

  /// إرجاع آخر رسالة في المحادثة أو null إذا كانت فارغة.
  Message? get lastMessage => messages.isNotEmpty ? messages.last : null;

  /// عدد الرسائل في المحادثة.
  int get messageCount => messages.length;

  /// نسخة من المحادثة مع تعديلات مختارة.
  Conversation copyWith({
    String? id,
    String? title,
    List<Message>? messages,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Conversation(
      id: id ?? this.id,
      title: title ?? this.title,
      messages: messages ?? this.messages,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Conversation &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}