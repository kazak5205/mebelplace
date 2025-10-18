import 'request.dart';
import 'user.dart';

// Константы статусов заказов
class OrderStatus {
  static const String pending = 'pending';
  static const String accepted = 'accepted';
  static const String inProgress = 'in_progress';
  static const String completed = 'completed';
  static const String cancelled = 'cancelled';
  static const String revision = 'revision';
}

class Order {
  final int id;
  final int videoId;
  final int userId;
  final int masterId;
  final String productName;
  final double price;
  final String? comment;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int? itemsCount;
  final double? totalPrice;
  final String? deliveryDate;
  final String? revisionNotes;
  final Request request;

  const Order({
    required this.id,
    required this.videoId,
    required this.userId,
    required this.masterId,
    required this.productName,
    required this.price,
    this.comment,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.itemsCount,
    this.totalPrice,
    this.deliveryDate,
    this.revisionNotes,
    required this.request,
  });

  factory Order.fromMap(Map<String, dynamic> map) {
    return Order(
      id: map['id'] as int,
      videoId: map['video_id'] as int,
      userId: map['user_id'] as int,
      masterId: map['master_id'] as int,
      productName: map['product_name'] as String,
      price: (map['price'] as num).toDouble(),
      comment: map['comment'] as String?,
      status: map['status'] as String,
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: DateTime.parse(map['updated_at'] as String),
      itemsCount: map['items_count'] as int?,
      totalPrice: map['total_price'] != null ? (map['total_price'] as num).toDouble() : null,
      deliveryDate: map['delivery_date'] as String?,
      revisionNotes: map['revision_notes'] as String?,
      request: map['request'] != null ? Request.fromJson(map['request'] as Map<String, dynamic>) : Request(
        id: 0,
        title: map['product_name'] as String,
        description: map['comment'] ?? '',
        status: map['status'] as String,
        region: '',
        budget: (map['price'] as num).toDouble(),
        userId: map['user_id'] as int,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'video_id': videoId,
      'user_id': userId,
      'master_id': masterId,
      'product_name': productName,
      'price': price,
      'comment': comment,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'items_count': itemsCount,
      'total_price': totalPrice,
      'delivery_date': deliveryDate,
      'revision_notes': revisionNotes,
      'request': request.toJson(),
    };
  }

  Order copyWith({
    int? id,
    int? videoId,
    int? userId,
    int? masterId,
    String? productName,
    double? price,
    String? comment,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? itemsCount,
    double? totalPrice,
    String? deliveryDate,
    String? revisionNotes,
    Request? request,
  }) {
    return Order(
      id: id ?? this.id,
      videoId: videoId ?? this.videoId,
      userId: userId ?? this.userId,
      masterId: masterId ?? this.masterId,
      productName: productName ?? this.productName,
      price: price ?? this.price,
      comment: comment ?? this.comment,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      itemsCount: itemsCount ?? this.itemsCount,
      totalPrice: totalPrice ?? this.totalPrice,
      deliveryDate: deliveryDate ?? this.deliveryDate,
      revisionNotes: revisionNotes ?? this.revisionNotes,
      request: request ?? this.request,
    );
  }
}

class CreateOrderRequest {
  final int videoId;
  final int masterId;
  final String productName;
  final double price;
  final String? comment;

  const CreateOrderRequest({
    required this.videoId,
    required this.masterId,
    required this.productName,
    required this.price,
    this.comment,
  });

  Map<String, dynamic> toMap() {
    return {
      'video_id': videoId,
      'master_id': masterId,
      'product_name': productName,
      'price': price,
      'comment': comment,
    };
  }
}

