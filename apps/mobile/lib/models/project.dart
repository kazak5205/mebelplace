class Project {
  final int id;
  final String title;
  final String description;
  final String style;
  final String roomType;
  final double price;
  final double rating;
  final String imageUrl;
  final int masterId;
  final String masterName;
  final DateTime createdAt;
  final List<String>? tags;
  final List<String>? images;
  final bool isActive;

  Project({
    required this.id,
    required this.title,
    required this.description,
    required this.style,
    required this.roomType,
    required this.price,
    required this.rating,
    required this.imageUrl,
    required this.masterId,
    required this.masterName,
    required this.createdAt,
    this.tags,
    this.images,
    this.isActive = true,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      style: json['style'],
      roomType: json['room_type'],
      price: (json['price'] as num).toDouble(),
      rating: (json['rating'] as num).toDouble(),
      imageUrl: json['image_url'],
      masterId: json['master_id'],
      masterName: json['master_name'],
      createdAt: DateTime.parse(json['created_at']),
      tags: json['tags'] != null ? List<String>.from(json['tags']) : null,
      images: json['images'] != null ? List<String>.from(json['images']) : null,
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'style': style,
      'room_type': roomType,
      'price': price,
      'rating': rating,
      'image_url': imageUrl,
      'master_id': masterId,
      'master_name': masterName,
      'created_at': createdAt.toIso8601String(),
      'tags': tags,
      'images': images,
      'is_active': isActive,
    };
  }

  Project copyWith({
    int? id,
    String? title,
    String? description,
    String? style,
    String? roomType,
    double? price,
    double? rating,
    String? imageUrl,
    int? masterId,
    String? masterName,
    DateTime? createdAt,
    List<String>? tags,
    List<String>? images,
    bool? isActive,
  }) {
    return Project(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      style: style ?? this.style,
      roomType: roomType ?? this.roomType,
      price: price ?? this.price,
      rating: rating ?? this.rating,
      imageUrl: imageUrl ?? this.imageUrl,
      masterId: masterId ?? this.masterId,
      masterName: masterName ?? this.masterName,
      createdAt: createdAt ?? this.createdAt,
      tags: tags ?? this.tags,
      images: images ?? this.images,
      isActive: isActive ?? this.isActive,
    );
  }

  @override
  String toString() {
    return 'Project(id: $id, title: $title, style: $style, roomType: $roomType, price: $price, rating: $rating)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Project &&
        other.id == id &&
        other.title == title &&
        other.description == description &&
        other.style == style &&
        other.roomType == roomType &&
        other.price == price &&
        other.rating == rating &&
        other.imageUrl == imageUrl &&
        other.masterId == masterId &&
        other.masterName == masterName &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      title,
      description,
      style,
      roomType,
      price,
      rating,
      imageUrl,
      masterId,
      masterName,
      createdAt,
    );
  }
}
