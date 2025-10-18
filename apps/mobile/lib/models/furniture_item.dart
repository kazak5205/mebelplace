import 'room.dart' show Size;

class FurnitureItem {
  final int id;
  final String name;
  final String category;
  final String style;
  final double price;
  final String imageUrl;
  final Size dimensions;
  final List<String> roomTypes;
  final Offset position;
  final double rotation;
  final bool isPlaced;

  FurnitureItem({
    required this.id,
    required this.name,
    required this.category,
    required this.style,
    required this.price,
    required this.imageUrl,
    required this.dimensions,
    required this.roomTypes,
    this.position = Offset.zero,
    this.rotation = 0.0,
    this.isPlaced = false,
  });

  factory FurnitureItem.fromJson(Map<String, dynamic> json) {
    return FurnitureItem(
      id: json['id'],
      name: json['name'],
      category: json['category'],
      style: json['style'],
      price: (json['price'] as num).toDouble(),
      imageUrl: json['image_url'],
      dimensions: Size(
        (json['width'] as num).toDouble(),
        (json['height'] as num).toDouble(),
      ),
      roomTypes: List<String>.from(json['room_types']),
      position: Offset(
        (json['position_x'] as num?)?.toDouble() ?? 0.0,
        (json['position_y'] as num?)?.toDouble() ?? 0.0,
      ),
      rotation: (json['rotation'] as num?)?.toDouble() ?? 0.0,
      isPlaced: json['is_placed'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'style': style,
      'price': price,
      'image_url': imageUrl,
      'width': dimensions.width,
      'height': dimensions.height,
      'room_types': roomTypes,
      'position_x': position.dx,
      'position_y': position.dy,
      'rotation': rotation,
      'is_placed': isPlaced,
    };
  }

  FurnitureItem copyWith({
    int? id,
    String? name,
    String? category,
    String? style,
    double? price,
    String? imageUrl,
    Size? dimensions,
    List<String>? roomTypes,
    Offset? position,
    double? rotation,
    bool? isPlaced,
  }) {
    return FurnitureItem(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      style: style ?? this.style,
      price: price ?? this.price,
      imageUrl: imageUrl ?? this.imageUrl,
      dimensions: dimensions ?? this.dimensions,
      roomTypes: roomTypes ?? this.roomTypes,
      position: position ?? this.position,
      rotation: rotation ?? this.rotation,
      isPlaced: isPlaced ?? this.isPlaced,
    );
  }

  @override
  String toString() {
    return 'FurnitureItem(id: $id, name: $name, category: $category, style: $style, price: $price)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is FurnitureItem &&
        other.id == id &&
        other.name == name &&
        other.category == category &&
        other.style == style &&
        other.price == price &&
        other.imageUrl == imageUrl &&
        other.dimensions == dimensions &&
        other.roomTypes == roomTypes &&
        other.position == position &&
        other.rotation == rotation &&
        other.isPlaced == isPlaced;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      name,
      category,
      style,
      price,
      imageUrl,
      dimensions,
      roomTypes,
      position,
      rotation,
      isPlaced,
    );
  }
}

// Offset class for position
class Offset {
  final double dx;
  final double dy;

  const Offset(this.dx, this.dy);

  static const Offset zero = Offset(0, 0);

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Offset && other.dx == dx && other.dy == dy;
  }

  @override
  int get hashCode => Object.hash(dx, dy);

  @override
  String toString() => 'Offset($dx, $dy)';
}
