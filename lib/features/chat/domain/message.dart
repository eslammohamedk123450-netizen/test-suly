import '../../../core/models/attachment_item.dart';

/// حالة رسالة المحادثة
enum MessageStatus {
  sending,
  sent,
  failed,
  regenerating,
}

/// نموذج رسالة واحدة ضمن محادثة مع دعم التفكير والمرفقات
class Message {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final MessageStatus status;
  final String conversationId;
  final String? thoughts;
  final List<AttachmentItem>? attachments;
  final String? modelUsed;

  const Message({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.status = MessageStatus.sent,
    required this.conversationId,
    this.thoughts,
    this.attachments,
    this.modelUsed,
  });

  Message copyWith({
    String? id,
    String? text,
    bool? isUser,
    DateTime? timestamp,
    MessageStatus? status,
    String? conversationId,
    String? thoughts,
    List<AttachmentItem>? attachments,
    String? modelUsed,
  }) {
    return Message(
      id: id ?? this.id,
      text: text ?? this.text,
      isUser: isUser ?? this.isUser,
      timestamp: timestamp ?? this.timestamp,
      status: status ?? this.status,
      conversationId: conversationId ?? this.conversationId,
      thoughts: thoughts ?? this.thoughts,
      attachments: attachments ?? this.attachments,
      modelUsed: modelUsed ?? this.modelUsed,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'text': text,
        'isUser': isUser,
        'timestamp': timestamp.toIso8601String(),
        'status': status.name,
        'conversationId': conversationId,
        'thoughts': thoughts,
        'modelUsed': modelUsed,
        'attachments': attachments?.map((a) => a.toJson()).toList(),
      };

  factory Message.fromJson(Map<String, dynamic> json) => Message(
        id: json['id'] as String? ?? 'msg-${DateTime.now().millisecondsSinceEpoch}',
        text: json['text'] as String? ?? '',
        isUser: json['isUser'] as bool? ?? false,
        timestamp: json['timestamp'] != null
            ? DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now()
            : DateTime.now(),
        status: MessageStatus.values.firstWhere(
          (s) => s.name == (json['status'] as String? ?? 'sent'),
          orElse: () => MessageStatus.sent,
        ),
        conversationId: json['conversationId'] as String? ?? '',
        thoughts: json['thoughts'] as String?,
        modelUsed: json['modelUsed'] as String?,
        attachments: (json['attachments'] as List<dynamic>?)
            ?.map((a) => AttachmentItem.fromJson(a as Map<String, dynamic>))
            .toList(),
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Message && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
