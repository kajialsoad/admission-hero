class AppContent {
  final String key;
  final String title;
  final String content;
  final String status;
  final DateTime? updatedAt;

  AppContent({
    required this.key,
    required this.title,
    required this.content,
    required this.status,
    this.updatedAt,
  });

  factory AppContent.fromJson(Map<String, dynamic> json) {
    return AppContent(
      key: json['key'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      status: json['status'] ?? 'published',
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : null,
    );
  }
}
