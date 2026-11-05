/// حالة مساحة عمل كانفاس (Canvas) التفاعلية
class CanvasState {
  bool isOpen;
  String title;
  String content;
  String language;
  String type; // 'code' | 'document'

  CanvasState({
    this.isOpen = false,
    this.title = 'main.dart',
    this.content = '',
    this.language = 'dart',
    this.type = 'code',
  });

  CanvasState copyWith({
    bool? isOpen,
    String? title,
    String? content,
    String? language,
    String? type,
  }) =>
      CanvasState(
        isOpen: isOpen ?? this.isOpen,
        title: title ?? this.title,
        content: content ?? this.content,
        language: language ?? this.language,
        type: type ?? this.type,
      );
}
