class Ad {
  final int id;
  final String title;
  final String description;
  final String imageUrl;
  final String? link;
  final bool isActive;
  final DateTime createdAt;

  Ad({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrl,
    this.link,
    this.isActive = true,
    required this.createdAt,
  });

  factory Ad.fromJson(Map<String, dynamic> json) {
    return Ad(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      imageUrl: json['image_url'],
      link: json['link'],
      isActive: json['is_active'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'image_url': imageUrl,
      'link': link,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }
}


