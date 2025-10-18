import 'package:equatable/equatable.dart';

/// Public User Entity для отображения информации о пользователях
/// Соответствует backend API PublicUser schema v2.4.0
class PublicUser extends Equatable {
  final int id;
  final String username;
  final String? avatarUrl;
  final String? bio;
  final bool isOnline;
  final DateTime? lastSeen;

  const PublicUser({
    required this.id,
    required this.username,
    this.avatarUrl,
    this.bio,
    this.isOnline = false,
    this.lastSeen,
  });

  @override
  List<Object?> get props => [
        id,
        username,
        avatarUrl,
        bio,
        isOnline,
        lastSeen,
      ];

  PublicUser copyWith({
    int? id,
    String? username,
    String? avatarUrl,
    String? bio,
    bool? isOnline,
    DateTime? lastSeen,
  }) {
    return PublicUser(
      id: id ?? this.id,
      username: username ?? this.username,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      isOnline: isOnline ?? this.isOnline,
      lastSeen: lastSeen ?? this.lastSeen,
    );
  }

  factory PublicUser.fromJson(Map<String, dynamic> json) {
    return PublicUser(
      id: json['id'] as int,
      username: json['username'] as String,
      avatarUrl: json['avatar_url'] as String?,
      bio: json['bio'] as String?,
      isOnline: json['is_online'] as bool? ?? false,
      lastSeen: json['last_seen'] != null
          ? DateTime.parse(json['last_seen'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'avatar_url': avatarUrl,
      'bio': bio,
      'is_online': isOnline,
      'last_seen': lastSeen?.toIso8601String(),
    };
  }
}
