// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_response_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderResponse _$OrderResponseFromJson(Map<String, dynamic> json) =>
    OrderResponse(
      id: json['id'] as String,
      orderId: json['orderId'] as String,
      masterId: json['masterId'] as String,
      message: json['message'] as String,
      price: (json['price'] as num?)?.toDouble(),
      deadline: json['deadline'] == null
          ? null
          : DateTime.parse(json['deadline'] as String),
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      master: json['master'] == null
          ? null
          : UserModel.fromJson(json['master'] as Map<String, dynamic>),
      masterName: json['masterName'] as String?,
      masterAvatar: json['masterAvatar'] as String?,
      masterExperience: json['masterExperience'] as String?,
      masterRating: (json['masterRating'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$OrderResponseToJson(OrderResponse instance) =>
    <String, dynamic>{
      'id': instance.id,
      'orderId': instance.orderId,
      'masterId': instance.masterId,
      'message': instance.message,
      'price': instance.price,
      'deadline': instance.deadline?.toIso8601String(),
      'status': instance.status,
      'createdAt': instance.createdAt.toIso8601String(),
      'master': instance.master,
      'masterName': instance.masterName,
      'masterAvatar': instance.masterAvatar,
      'masterExperience': instance.masterExperience,
      'masterRating': instance.masterRating,
    };
