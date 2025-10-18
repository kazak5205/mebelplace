import 'package:equatable/equatable.dart';

/// Domain Entity для пользователя
/// Соответствует backend API schema v2.4.0
class UserEntity extends Equatable {
  final int id;
  final String username;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final String? bio;
  final UserRole role;
  final DateTime createdAt;
  final DateTime updatedAt;
  final GamificationData? gamification;

  const UserEntity({
    required this.id,
    required this.username,
    required this.email,
    this.phone,
    this.avatarUrl,
    this.bio,
    required this.role,
    required this.createdAt,
    required this.updatedAt,
    this.gamification,
  });

  @override
  List<Object?> get props => [
        id,
        username,
        email,
        phone,
        avatarUrl,
        bio,
        role,
        createdAt,
        updatedAt,
        gamification,
      ];

  UserEntity copyWith({
    int? id,
    String? username,
    String? email,
    String? phone,
    String? avatarUrl,
    String? bio,
    UserRole? role,
    DateTime? createdAt,
    DateTime? updatedAt,
    GamificationData? gamification,
  }) {
    return UserEntity(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      gamification: gamification ?? this.gamification,
    );
  }
}

/// Роль пользователя
/// Соответствует backend API enum: [buyer, seller, admin]
enum UserRole {
  guest,  // Неавторизованный пользователь (мобильное приложение)
  buyer,  // Покупатель (backend API)
  seller, // Продавец/мастер (backend API)
  admin,  // Администратор (backend API)
  
  // Legacy поддержка для мобильного приложения
  user,   // Обычный пользователь (мапится на buyer)
  master, // Мастер (мапится на seller)
}

/// Данные геймификации
/// Соответствует backend API GamificationData
class GamificationData extends Equatable {
  final int level;
  final int points;
  final List<String> achievements;

  const GamificationData({
    required this.level,
    required this.points,
    this.achievements = const [],
  });

  @override
  List<Object?> get props => [level, points, achievements];
}

