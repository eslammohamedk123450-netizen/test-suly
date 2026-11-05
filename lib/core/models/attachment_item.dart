/// مرفق ملف أو صورة
class AttachmentItem {
  final String id;
  final String name;
  final String mimeType;
  final String data;
  final int? size;
  final String type; // 'image' | 'file'
  final String? textContent;
  int? serverFileId;

  AttachmentItem({
    required this.id,
    required this.name,
    required this.mimeType,
    required this.data,
    this.size,
    required this.type,
    this.textContent,
    this.serverFileId,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'mimeType': mimeType,
        'data': data,
        'size': size,
        'type': type,
        'textContent': textContent,
        'serverFileId': serverFileId,
      };

  factory AttachmentItem.fromJson(Map<String, dynamic> json) => AttachmentItem(
        id: json['id'] as String? ??
            'att-${DateTime.now().millisecondsSinceEpoch}',
        name: json['name'] as String? ?? 'file',
        mimeType: json['mimeType'] as String? ?? 'application/octet-stream',
        data: json['data'] as String? ?? '',
        size: json['size'] as int?,
        type: json['type'] as String? ?? 'file',
        textContent: json['textContent'] as String?,
        serverFileId: json['serverFileId'] as int?,
      );
}
