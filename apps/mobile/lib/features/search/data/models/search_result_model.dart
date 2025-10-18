class SearchResultModel {
  final String id;
  final String type;
  final String title;
  final String? subtitle;
  final String? imageUrl;

  SearchResultModel({
    required this.id,
    required this.type,
    required this.title,
    this.subtitle,
    this.imageUrl,
  });

  factory SearchResultModel.fromJson(Map<String, dynamic> json) {
    return SearchResultModel(
      id: json['id']?.toString() ?? '',
      type: json['type'] ?? 'video',
      title: json['title'] ?? '',
      subtitle: json['subtitle'] ?? json['description'],
      imageUrl: json['image_url'] ?? json['thumbnail_url'] ?? json['avatar_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'subtitle': subtitle,
      'image_url': imageUrl,
    };
  }

  // toEntity stub
  dynamic toEntity() => this;
}
