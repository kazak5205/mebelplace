import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';

part 'order_response_model.g.dart';

@JsonSerializable()
class OrderResponse {
  final String id;
  final String orderId;
  final String masterId;
  final String message;
  final double? price;
  final DateTime? deadline;
  final String status; // pending, accepted, rejected
  final DateTime createdAt;
  final UserModel? master; // Полная информация о мастере
  final String? masterName; // Имя мастера
  final String? masterAvatar; // Аватар мастера
  final String? masterExperience; // Опыт мастера
  final double? masterRating; // Рейтинг мастера

  const OrderResponse({
    required this.id,
    required this.orderId,
    required this.masterId,
    required this.message,
    this.price,
    this.deadline,
    required this.status,
    required this.createdAt,
    this.master,
    this.masterName,
    this.masterAvatar,
    this.masterExperience,
    this.masterRating,
  });

  factory OrderResponse.fromJson(Map<String, dynamic> json) {
    return OrderResponse(
      id: json['id'].toString(),
      orderId: (json['orderId'] ?? json['order_id'] ?? '').toString(),
      masterId: (json['masterId'] ?? json['master_id'] ?? '').toString(),
      message: (json['message'] ?? '').toString(),
      price: json['price'] != null ? double.tryParse(json['price'].toString()) : null,
      deadline: json['deadline'] != null ? DateTime.tryParse(json['deadline'].toString()) : null,
      status: (json['status'] ?? 'pending').toString(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? json['created_at'] ?? '').toString()) ?? DateTime.now(),
      master: json['master'] != null
          ? UserModel.fromJson(json['master'] as Map<String, dynamic>)
          : (json['master_username'] != null || json['master_first_name'] != null)
              ? UserModel.fromJson({
                  'id': json['master_id'],
                  'username': json['master_username'],
                  'firstName': json['master_first_name'],
                  'lastName': json['master_last_name'],
                  'avatar': json['master_avatar'],
                  'phone': json['master_phone'],
                  'role': 'master',
                })
              : null,
      masterName: (json['masterName'] ?? json['master_username'])?.toString(),
      masterAvatar: (json['masterAvatar'] ?? json['master_avatar'])?.toString(),
      masterExperience: json['masterExperience']?.toString(),
      masterRating: json['masterRating'] != null ? double.tryParse(json['masterRating'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() => _$OrderResponseToJson(this);
}

