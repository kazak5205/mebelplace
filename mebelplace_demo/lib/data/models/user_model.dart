import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  final String username;
  final String? email;
  final String? phone;
  final String? firstName;
  final String? lastName;
  final String? avatar;
  final String role;
  final bool? isActive;    // NULLABLE - сервер не всегда присылает
  final bool? isVerified;  // NULLABLE - сервер не всегда присылает
  final DateTime? createdAt; // NULLABLE - может отсутствовать
  final DateTime? updatedAt;
  final double? rating;     // Рейтинг мастера
  final int? followersCount; // Количество подписчиков
  final int? subscribersCount; // Количество подписчиков (альтернативное название с бекенда)
  final int? subscriptionsCount; // Количество подписок пользователя (на кого он подписан)
  final int? ordersCount;    // Количество выполненных заказов
  final String? bio;         // Биография/описание
  
  // Поля для мастеров
  final String? companyName;        // Название компании (для мастеров)
  final String? companyAddress;     // Адрес компании
  final String? companyDescription; // Описание компании

  const UserModel({
    required this.id,
    required this.username,
    this.email,
    this.phone,
    this.firstName,
    this.lastName,
    this.avatar,
    required this.role,
    this.isActive,    // опционально
    this.isVerified,  // опционально
    this.createdAt,   // опционально
    this.updatedAt,
    this.rating,
    this.followersCount,
    this.subscribersCount,
    this.subscriptionsCount,
    this.ordersCount,
    this.bio,
    this.companyName,
    this.companyAddress,
    this.companyDescription,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  UserModel copyWith({
    String? id,
    String? username,
    String? email,
    String? phone,
    String? firstName,
    String? lastName,
    String? avatar,
    String? role,
    bool? isActive,
    bool? isVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
    double? rating,
    int? followersCount,
    int? subscribersCount,
    int? subscriptionsCount,
    int? ordersCount,
    String? bio,
    String? companyName,
    String? companyAddress,
    String? companyDescription,
  }) {
    return UserModel(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      avatar: avatar ?? this.avatar,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rating: rating ?? this.rating,
      followersCount: followersCount ?? this.followersCount,
      subscribersCount: subscribersCount ?? this.subscribersCount,
      subscriptionsCount: subscriptionsCount ?? this.subscriptionsCount,
      ordersCount: ordersCount ?? this.ordersCount,
      bio: bio ?? this.bio,
      companyName: companyName ?? this.companyName,
      companyAddress: companyAddress ?? this.companyAddress,
      companyDescription: companyDescription ?? this.companyDescription,
    );
  }

  String get displayName {
    // Для мастеров показываем название компании
    if (isMaster && companyName != null && companyName!.isNotEmpty) {
      return companyName!;
    }
    // Для клиентов показываем имя + фамилия или username
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    }
    return username;
  }

  bool get isMaster => role == 'master';
  bool get isClient => role == 'user' || role == 'client';
}
