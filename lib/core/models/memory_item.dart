/// عنصر ذاكرة محفوظ لشات جي بي تي
class MemoryItem {
  final String id;
  String content;
  final DateTime createdAt;

  MemoryItem({
    required this.id,
    required this.content,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'content': content,
        'createdAt': createdAt.toIso8601String(),
      };

  factory MemoryItem.fromJson(Map<String, dynamic> json) => MemoryItem(
        id: json['id'] as String? ?? 'mem-${DateTime.now().millisecondsSinceEpoch}',
        content: json['content'] as String? ?? '',
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
            : DateTime.now(),
      );
}
