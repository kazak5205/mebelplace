import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';

part 'order_model.g.dart';

@JsonSerializable()
class OrderModel {
  final String id;
  final String clientId;
  final String? masterId;
  final String? customerId; // Дополнительное поле для совместимости
  final String? customerName; // Имя клиента
  final String? customerPhone; // Телефон клиента
  final String title;
  final String description;
  final String category;
  final String? region;
  final String status;
  final double? price;
  final DateTime? deadline;
  final String? location;
  final List<String> images;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final UserModel? client;
  final int responseCount;
  final bool hasMyResponse;
  final List<Map<String, dynamic>>? responses; // Отклики мастеров

  const OrderModel({
    required this.id,
    required this.clientId,
    this.masterId,
    this.customerId,
    this.customerName,
    this.customerPhone,
    required this.title,
    required this.description,
    required this.category,
    this.region,
    required this.status,
    this.price,
    this.deadline,
    this.location,
    required this.images,
    required this.createdAt,
    this.updatedAt,
    this.client,
    required this.responseCount,
    required this.hasMyResponse,
    this.responses,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'].toString(),
      clientId: (json['clientId'] ?? json['client_id'] ?? '').toString(),
      masterId: json['masterId']?.toString() ?? json['master_id']?.toString(),
      customerId: json['customerId']?.toString() ?? json['customer_id']?.toString(),
      customerName: json['customerName']?.toString() ?? json['customer_name']?.toString(),
      customerPhone: json['customerPhone']?.toString() ?? json['customer_phone']?.toString(),
      title: json['title'].toString(),
      description: json['description'].toString(),
      category: json['category'].toString(),
      region: json['region']?.toString(),
      status: json['status'].toString(),
      price: _parseDoubleNullable(json['price']),
      deadline: json['deadline'] != null ? DateTime.tryParse(json['deadline'].toString()) : null,
      location: json['location']?.toString() ?? json['city']?.toString(), // ✅ Бэкенд использует 'city'
      images: (json['images'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      createdAt: DateTime.tryParse((json['createdAt'] ?? json['created_at'] ?? '').toString()) ?? DateTime.now(), // ✅ Защита от null
      updatedAt: json['updatedAt'] != null || json['updated_at'] != null
          ? DateTime.tryParse((json['updatedAt'] ?? json['updated_at']).toString())
          : null,
      client: json['client'] != null 
          ? UserModel.fromJson(json['client'] as Map<String, dynamic>)
          : (json['client_username'] != null || json['client_first_name'] != null)
              ? UserModel.fromJson({
                  'id': json['client_id'],
                  'username': json['client_username'],
                  'firstName': json['client_first_name'],
                  'lastName': json['client_last_name'],
                  'avatar': json['client_avatar'],
                  'phone': json['client_phone'],
                  'role': 'user',
                })
              : null,
      responseCount: _parseInt(json['responseCount'] ?? json['response_count'] ?? 0),
      hasMyResponse: json['hasMyResponse'] ?? json['has_my_response'] ?? false,
      responses: (json['responses'] as List<dynamic>?)
          ?.map((e) => e as Map<String, dynamic>)
          .toList(),
    );
  }
  
  Map<String, dynamic> toJson() => _$OrderModelToJson(this);

  OrderModel copyWith({
    String? id,
    String? clientId,
    String? masterId,
    String? title,
    String? description,
    String? category,
    String? region,
    String? status,
    double? price,
    DateTime? deadline,
    String? location,
    List<String>? images,
    DateTime? createdAt,
    DateTime? updatedAt,
    UserModel? client,
    int? responseCount,
    bool? hasMyResponse,
  }) {
    return OrderModel(
      id: id ?? this.id,
      clientId: clientId ?? this.clientId,
      masterId: masterId ?? this.masterId,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      region: region ?? this.region,
      status: status ?? this.status,
      price: price ?? this.price,
      deadline: deadline ?? this.deadline,
      location: location ?? this.location,
      images: images ?? this.images,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      client: client ?? this.client,
      responseCount: responseCount ?? this.responseCount,
      hasMyResponse: hasMyResponse ?? this.hasMyResponse,
    );
  }

  String get formattedPrice {
    if (price == null) return 'Договорная';
    return '${price!.toStringAsFixed(0)} ₸';
  }

  String get formattedDeadline {
    if (deadline == null) return 'Не указан';
    final now = DateTime.now();
    final difference = deadline!.difference(now);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} дней';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} часов';
    } else {
      return 'Срочно';
    }
  }

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 7) {
      return '${createdAt.day} ${_getMonthName(createdAt.month)}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}д назад';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}ч назад';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}м назад';
    } else {
      return 'только что';
    }
  }

  String _getMonthName(int month) {
    const months = [
      'янв', 'фев', 'мар', 'апр', 'май', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    return months[month - 1];
  }

  String get statusText {
    switch (status) {
      case 'pending':
        return 'Ожидает откликов';
      case 'accepted':
        return 'Принят мастером';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  }

  String get categoryText {
    switch (category) {
      case 'furniture':
        return 'Мебель';
      case 'carpentry':
        return 'Столярные работы';
      case 'upholstery':
        return 'Обивка мебели';
      case 'restoration':
        return 'Реставрация';
      case 'custom':
        return 'На заказ';
      case 'repair':
        return 'Ремонт';
      case 'other':
        return 'Другое';
      default:
        return category;
    }
  }

  // Helper для безопасного парсинга int
  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) {
      return int.tryParse(value) ?? 0;
    }
    return 0;
  }

  // Helper для безопасного парсинга nullable double
  static double? _parseDoubleNullable(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is num) return value.toDouble();
    if (value is String) {
      return double.tryParse(value);
    }
    return null;
  }
}
