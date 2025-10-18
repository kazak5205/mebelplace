import '../../domain/entities/user_entity.dart';
import '../../domain/entities/public_user_entity.dart';

/// UserModel соответствует mobile-api.yaml User schema
class UserModel {
  final int id;
  final String username;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final String? bio;
  final String role; // backend возвращает строку: buyer, seller, admin
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.phone,
    this.avatarUrl,
    this.bio,
    required this.role,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      username: json['username'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      bio: json['bio'] as String?,
      role: json['role'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'phone': phone,
      'avatar_url': avatarUrl,
      'bio': bio,
      'role': role,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  /// Преобразование в domain entity
  UserEntity toEntity() {
    return UserEntity(
      id: id,
      username: username,
      email: email,
      phone: phone,
      avatarUrl: avatarUrl,
      bio: bio,
      role: _mapRoleFromString(role),
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  /// Преобразование в PublicUser entity
  PublicUser toPublicEntity() {
    return PublicUser(
      id: id,
      username: username,
      avatarUrl: avatarUrl,
      bio: bio,
      isOnline: false, // По умолчанию, можно обновить отдельно
    );
  }

  /// Маппинг роли из строки в enum
  UserRole _mapRoleFromString(String role) {
    switch (role.toLowerCase()) {
      case 'buyer':
        return UserRole.buyer;
      case 'seller':
        return UserRole.seller;
      case 'admin':
        return UserRole.admin;
      case 'user': // Legacy поддержка
        return UserRole.user;
      case 'master': // Legacy поддержка
        return UserRole.master;
      default:
        return UserRole.buyer; // По умолчанию
    }
  }

  /// Маппинг роли из enum в строку для API
  static String mapRoleToString(UserRole role) {
    switch (role) {
      case UserRole.buyer:
        return 'buyer';
      case UserRole.seller:
        return 'seller';
      case UserRole.admin:
        return 'admin';
      case UserRole.user: // Legacy поддержка
        return 'buyer';
      case UserRole.master: // Legacy поддержка
        return 'seller';
      case UserRole.guest: // Не должно отправляться на сервер
        return 'buyer';
    }
  }
}
