// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderModel _$OrderModelFromJson(Map<String, dynamic> json) => OrderModel(
      id: json['id'] as String,
      clientId: json['clientId'] as String,
      masterId: json['masterId'] as String?,
      title: json['title'] as String,
      description: json['description'] as String,
      category: json['category'] as String,
      region: json['region'] as String?,
      status: json['status'] as String,
      price: (json['price'] as num?)?.toDouble(),
      deadline: json['deadline'] == null
          ? null
          : DateTime.parse(json['deadline'] as String),
      location: json['location'] as String?,
      images:
          (json['images'] as List<dynamic>).map((e) => e as String).toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      client: json['client'] == null
          ? null
          : UserModel.fromJson(json['client'] as Map<String, dynamic>),
      responseCount: (json['responseCount'] as num).toInt(),
      hasMyResponse: json['hasMyResponse'] as bool,
    );

Map<String, dynamic> _$OrderModelToJson(OrderModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'clientId': instance.clientId,
      'masterId': instance.masterId,
      'title': instance.title,
      'description': instance.description,
      'category': instance.category,
      'region': instance.region,
      'status': instance.status,
      'price': instance.price,
      'deadline': instance.deadline?.toIso8601String(),
      'location': instance.location,
      'images': instance.images,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'client': instance.client?.toJson(),
      'responseCount': instance.responseCount,
      'hasMyResponse': instance.hasMyResponse,
    };
