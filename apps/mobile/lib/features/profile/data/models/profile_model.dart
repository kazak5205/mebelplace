import '../../../auth/data/models/user_model.dart';
import '../../../auth/domain/entities/user_entity.dart';

class ProfileModel extends UserModel {
  final String? region;
  final double? rating;
  final bool? isVerified;

  ProfileModel({
    required super.id,
    required super.username,
    required super.email,
    super.phone,
    required super.role,
    super.avatarUrl,
    super.bio,
    required super.createdAt,
    required super.updatedAt,
    this.region,
    this.rating,
    this.isVerified,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'] as int,
      username: json['username'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      role: json['role'] as String,
      avatarUrl: json['avatar_url'] as String?,
      bio: json['bio'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      region: json['region'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      isVerified: json['is_verified'] as bool?,
    );
  }

  @override
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'phone': phone,
      'role': role,
      'avatar_url': avatarUrl,
      'bio': bio,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'region': region,
      'rating': rating,
      'is_verified': isVerified,
    };
  }

  @override
  UserEntity toEntity() => UserEntity(
    id: id,
    username: username,
    email: email,
    phone: phone,
    avatarUrl: avatarUrl,
    bio: bio,
    role: _parseRole(role),
    createdAt: createdAt,
    updatedAt: updatedAt,
  );

  UserRole _parseRole(String role) {
    switch (role.toLowerCase()) {
      case 'master':
        return UserRole.master;
      case 'admin':
        return UserRole.admin;
      default:
        return UserRole.user;
    }
  }
}
