import 'package:equatable/equatable.dart';

/// Hashtag subscription entity
class HashtagSubscriptionEntity extends Equatable {
  final String id;
  final String userId;
  final String hashtag;
  final SubscriptionNotificationLevel notificationLevel;
  final DateTime createdAt;

  const HashtagSubscriptionEntity({
    required this.id,
    required this.userId,
    required this.hashtag,
    required this.notificationLevel,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, userId, hashtag, notificationLevel, createdAt];
}

enum SubscriptionNotificationLevel {
  all,        // Все уведомления
  highlights, // Только важные
  mute,       // Без уведомлений
}


