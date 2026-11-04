/// نموذج رسالة واحدة ضمن محادثة.
///
/// الكيان مستقل عن [Conversation] ويحمل محتوى الرسالة، هوية المرسل،
/// والطابع الزمني. لا يحتوي على منطق persistent — التخزين النهائي
/// مسؤولية طبقة الخدمة/المستودع والربط المستقبلي مع Backend.
class Message {
  /// معرف الرسالة الفريد داخل التطبيق (يُنشأ محلياً حتى يتوفر معرف خلفي).
  final String id;

  /// نص الرسالة. يمكن أن يحتوي على مارك 다ون وأكواد برمجية.
  final String text;

  /// هل الرسالة من المستخدم (true) أم من الذكاء الاصطناعي (false).
  final bool isUser;

  /// وقت إنشاء الرسالة.
  final DateTime timestamp;

  /// حالة الإرسال:送、تم الإرسال، فشل، قيد المعالجة.
  final MessageStatus status;

  /// معرف المحادثة التي تنتمي إليها هذه الرسالة.
  final String conversationId;

  const Message({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.status = MessageStatus.sent,
    required this.conversationId,
  });

  /// نسخة من الرسالة مع تعديلات مختارة.
  Message copyWith({
    String? id,
    String? text,
    bool? isUser,
    DateTime? timestamp,
    MessageStatus? status,
    String? conversationId,
  }) {
    return Message(
      id: id ?? this.id,
      text: text ?? this.text,
      isUser: isUser ?? this.isUser,
      timestamp: timestamp ?? this.timestamp,
      status: status ?? this.status,
      conversationId: conversationId ?? this.conversationId,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Message && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

/// حالة رسالة المحادثة.
enum MessageStatus {
  sending, // جاري الإرسال
  sent, // تم الإرسال واستلام الرد
  failed, // فشل الإرسال
  regenerating, // جاري إعادة التوليد
}
