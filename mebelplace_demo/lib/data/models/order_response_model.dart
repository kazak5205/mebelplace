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

  factory OrderResponse.fromJson(Map<String, dynamic> json) =>
      _$OrderResponseFromJson(json);

  Map<String, dynamic> toJson() => _$OrderResponseToJson(this);
}
