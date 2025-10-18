class Room {
  final int id;
  final String name;
  final Size dimensions;
  final String style;
  final List<String> furniture;
  final String imageUrl;
  final DateTime createdAt;

  Room({
    required this.id,
    required this.name,
    required this.dimensions,
    required this.style,
    this.furniture = const [],
    this.imageUrl = '',
    required this.createdAt,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'],
      name: json['name'],
      dimensions: Size(
        (json['width'] as num).toDouble(),
        (json['height'] as num).toDouble(),
      ),
      style: json['style'],
      furniture: List<String>.from(json['furniture'] ?? []),
      imageUrl: json['image_url'] ?? '',
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'width': dimensions.width,
      'height': dimensions.height,
      'style': style,
      'furniture': furniture,
      'image_url': imageUrl,
      'created_at': createdAt.toIso8601String(),
    };
  }

  Room copyWith({
    int? id,
    String? name,
    Size? dimensions,
    String? style,
    List<String>? furniture,
    String? imageUrl,
    DateTime? createdAt,
  }) {
    return Room(
      id: id ?? this.id,
      name: name ?? this.name,
      dimensions: dimensions ?? this.dimensions,
      style: style ?? this.style,
      furniture: furniture ?? this.furniture,
      imageUrl: imageUrl ?? this.imageUrl,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  String toString() {
    return 'Room(id: $id, name: $name, dimensions: $dimensions, style: $style)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Room &&
        other.id == id &&
        other.name == name &&
        other.dimensions == dimensions &&
        other.style == style &&
        other.furniture == furniture &&
        other.imageUrl == imageUrl &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      name,
      dimensions,
      style,
      furniture,
      imageUrl,
      createdAt,
    );
  }
}

// Size class for dimensions
class Size {
  final double width;
  final double height;

  const Size(this.width, this.height);

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Size && other.width == width && other.height == height;
  }

  @override
  int get hashCode => Object.hash(width, height);

  @override
  String toString() => 'Size($width, $height)';
}
