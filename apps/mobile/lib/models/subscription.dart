import 'user.dart';

class Subscription {
  final int id;
  final int userId;
  final int masterId;
  final DateTime createdAt;
  final User? user;  // Данные пользователя/мастера

  Subscription({
    required this.id,
    required this.userId,
    required this.masterId,
    required this.createdAt,
    this.user,
  });

  factory Subscription.fromMap(Map<String, dynamic> map) {
    return Subscription(
      id: map['id'],
      userId: map['user_id'],
      masterId: map['master_id'],
      createdAt: DateTime.parse(map['created_at']),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'master_id': masterId,
      'created_at': createdAt.toIso8601String(),
    };
  }

  Subscription copyWith({
    int? id,
    int? userId,
    int? masterId,
    DateTime? createdAt,
    User? user,
  }) {
    return Subscription(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      masterId: masterId ?? this.masterId,
      createdAt: createdAt ?? this.createdAt,
      user: user ?? this.user,
    );
  }
}
