/// نموذج مجلد لتنظيم المحادثات والمشاريع
class Folder {
  final String id;
  String name;
  String color;
  final DateTime createdAt;
  List<String> conversationIds;

  Folder({
    required this.id,
    required this.name,
    this.color = '#10A37F',
    required this.createdAt,
    List<String>? conversationIds,
  }) : conversationIds = conversationIds ?? [];

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'color': color,
        'createdAt': createdAt.toIso8601String(),
        'conversationIds': conversationIds,
      };

  factory Folder.fromJson(Map<String, dynamic> json) => Folder(
        id: json['id'] as String? ?? 'folder-${DateTime.now().millisecondsSinceEpoch}',
        name: json['name'] as String? ?? 'Untitled Folder',
        color: json['color'] as String? ?? '#10A37F',
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
            : DateTime.now(),
        conversationIds: (json['conversationIds'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            [],
      );
}
