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
  final bool? isActive;    // Статус аккаунта (активен/заблокирован)
  final bool? isOnline;    // Онлайн статус в чате
  final DateTime? lastSeen; // Время последней активности
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
  final String? companyType;        // Тип компании (master/company/shop)

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
    this.isOnline,    // опционально
    this.lastSeen,    // опционально
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
    this.companyType,
  });

  // ✅ Ручной парсинг для поддержки snake_case с бэкенда
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'].toString(),
      username: (json['username'] ?? '').toString(),
      email: json['email']?.toString(),
      phone: json['phone']?.toString(),
      firstName: (json['firstName'] ?? json['first_name'])?.toString(),
      lastName: (json['lastName'] ?? json['last_name'])?.toString(),
      avatar: json['avatar']?.toString(),
      role: (json['role'] ?? 'user').toString(),
      isActive: json['isActive'] ?? json['is_active'],
      isOnline: json['isOnline'] ?? json['is_online'],
      lastSeen: json['lastSeen'] != null || json['last_seen'] != null
          ? DateTime.tryParse((json['lastSeen'] ?? json['last_seen']).toString())
          : null,
      isVerified: json['isVerified'] ?? json['is_verified'],
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
      updatedAt: json['updatedAt'] != null || json['updated_at'] != null
          ? DateTime.tryParse((json['updatedAt'] ?? json['updated_at']).toString())
          : null,
      rating: json['rating'] != null ? _parseDouble(json['rating']) : null,
      followersCount: json['followersCount'] != null || json['followers_count'] != null
          ? _parseIntNullable(json['followersCount'] ?? json['followers_count'])
          : null,
      subscribersCount: json['subscribersCount'] != null || json['subscribers_count'] != null
          ? _parseIntNullable(json['subscribersCount'] ?? json['subscribers_count'])
          : null,
      subscriptionsCount: json['subscriptionsCount'] != null || json['subscriptions_count'] != null
          ? _parseIntNullable(json['subscriptionsCount'] ?? json['subscriptions_count'])
          : null,
      ordersCount: json['ordersCount'] != null || json['orders_count'] != null
          ? _parseIntNullable(json['ordersCount'] ?? json['orders_count'])
          : null,
      bio: json['bio']?.toString(),
      companyName: (json['companyName'] ?? json['company_name'])?.toString(),
      companyAddress: (json['companyAddress'] ?? json['company_address'])?.toString(),
      companyDescription: (json['companyDescription'] ?? json['company_description'])?.toString(),
      companyType: (json['companyType'] ?? json['company_type'])?.toString(),
    );
  }

  // Helper для безопасного парсинга int
  static int? _parseIntNullable(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) {
      return int.tryParse(value);
    }
    return null;
  }

  // Helper для безопасного парсинга double
  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is num) return value.toDouble();
    if (value is String) {
      return double.tryParse(value);
    }
    return null;
  }

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
    bool? isOnline,
    DateTime? lastSeen,
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
    String? companyType,
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
      isOnline: isOnline ?? this.isOnline,
      lastSeen: lastSeen ?? this.lastSeen,
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
      companyType: companyType ?? this.companyType,
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
