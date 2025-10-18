import '../../domain/entities/hashtag_subscription_entity.dart';

class HashtagSubscriptionModel {
  final String id;
  final String userId;
  final String hashtag;
  final String notificationLevel;
  final DateTime createdAt;

  HashtagSubscriptionModel({
    required this.id,
    required this.userId,
    required this.hashtag,
    required this.notificationLevel,
    required this.createdAt,
  });

  factory HashtagSubscriptionModel.fromJson(Map<String, dynamic> json) {
    return HashtagSubscriptionModel(
      id: json['id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      hashtag: json['hashtag'] as String,
      notificationLevel: json['notification_level'] as String? ?? 'all',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'hashtag': hashtag,
      'notification_level': notificationLevel,
      'created_at': createdAt.toIso8601String(),
    };
  }

  HashtagSubscriptionEntity toEntity() {
    return HashtagSubscriptionEntity(
      id: id,
      userId: userId,
      hashtag: hashtag,
      notificationLevel: _parseLevel(notificationLevel),
      createdAt: createdAt,
    );
  }

  SubscriptionNotificationLevel _parseLevel(String level) {
    switch (level.toLowerCase()) {
      case 'all':
        return SubscriptionNotificationLevel.all;
      case 'highlights':
        return SubscriptionNotificationLevel.highlights;
      case 'mute':
        return SubscriptionNotificationLevel.mute;
      default:
        return SubscriptionNotificationLevel.all;
    }
  }
}


