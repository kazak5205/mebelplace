import 'notification_types.dart';

/// Push notification payload model
class PushPayload {
  final NotificationType type;
  final String title;
  final String body;
  final Map<String, dynamic> data;
  final String? imageUrl;
  final DateTime timestamp;
  final String? deepLink;

  const PushPayload({
    required this.type,
    required this.title,
    required this.body,
    required this.data,
    this.imageUrl,
    required this.timestamp,
    this.deepLink,
  });

  factory PushPayload.fromMap(Map<String, dynamic> map) {
    return PushPayload(
      type: NotificationTypeExtension.fromKey(map['type'] as String? ?? 'system.announcement'),
      title: map['title'] as String? ?? '',
      body: map['body'] as String? ?? '',
      data: map['data'] as Map<String, dynamic>? ?? {},
      imageUrl: map['image_url'] as String?,
      timestamp: map['timestamp'] != null 
          ? DateTime.parse(map['timestamp'] as String)
          : DateTime.now(),
      deepLink: map['deep_link'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type.key,
      'title': title,
      'body': body,
      'data': data,
      'image_url': imageUrl,
      'timestamp': timestamp.toIso8601String(),
      'deep_link': deepLink,
    };
  }

  /// Generate deep link based on notification type and data
  String generateDeepLink() {
    if (deepLink != null) return deepLink!;

    switch (type) {
      case NotificationType.videoPublished:
        final videoId = data['video_id'] as String?;
        return '/video/$videoId';
        
      case NotificationType.streamStarted:
        final streamId = data['stream_id'] as String?;
        return '/stream/$streamId';
        
      case NotificationType.requestProposal:
        final requestId = data['request_id'] as String?;
        return '/request/$requestId';
        
      case NotificationType.chatMessage:
        final chatId = data['chat_id'] as String?;
        return '/chat/$chatId';
        
      case NotificationType.achievementEarned:
        return '/profile/achievements';
        
      case NotificationType.commentReply:
        final videoId = data['video_id'] as String?;
        return '/video/$videoId?comments=true';
        
      case NotificationType.storyPublished:
        final userId = data['user_id'] as String?;
        return '/stories/$userId';
        
      case NotificationType.orderStatusChanged:
        final orderId = data['order_id'] as String?;
        return '/order/$orderId';
        
      default:
        return '/';
    }
  }
}


