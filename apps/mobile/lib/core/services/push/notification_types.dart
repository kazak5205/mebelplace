/// Types of push notifications in the app
enum NotificationType {
  videoPublished,      // video.published - новое видео от подписки
  streamStarted,       // stream.started - начался стрим
  requestProposal,     // request.proposal - предложение от мастера
  chatMessage,         // chat.message - новое сообщение
  achievementEarned,   // achievement.earned - получено достижение
  commentReply,        // comment.reply - ответ на комментарий
  storyPublished,      // story.published - новая история
  orderStatusChanged,  // order.status_changed - изменение статуса заказа
  systemAnnouncement,  // system.announcement - системное сообщение
  marketingPromo,      // marketing.promo - промо-рассылка
}

extension NotificationTypeExtension on NotificationType {
  String get key {
    switch (this) {
      case NotificationType.videoPublished:
        return 'video.published';
      case NotificationType.streamStarted:
        return 'stream.started';
      case NotificationType.requestProposal:
        return 'request.proposal';
      case NotificationType.chatMessage:
        return 'chat.message';
      case NotificationType.achievementEarned:
        return 'achievement.earned';
      case NotificationType.commentReply:
        return 'comment.reply';
      case NotificationType.storyPublished:
        return 'story.published';
      case NotificationType.orderStatusChanged:
        return 'order.status_changed';
      case NotificationType.systemAnnouncement:
        return 'system.announcement';
      case NotificationType.marketingPromo:
        return 'marketing.promo';
    }
  }

  static NotificationType fromKey(String key) {
    switch (key) {
      case 'video.published':
        return NotificationType.videoPublished;
      case 'stream.started':
        return NotificationType.streamStarted;
      case 'request.proposal':
        return NotificationType.requestProposal;
      case 'chat.message':
        return NotificationType.chatMessage;
      case 'achievement.earned':
        return NotificationType.achievementEarned;
      case 'comment.reply':
        return NotificationType.commentReply;
      case 'story.published':
        return NotificationType.storyPublished;
      case 'order.status_changed':
        return NotificationType.orderStatusChanged;
      case 'system.announcement':
        return NotificationType.systemAnnouncement;
      case 'marketing.promo':
        return NotificationType.marketingPromo;
      default:
        return NotificationType.systemAnnouncement;
    }
  }

  bool get isHighPriority {
    switch (this) {
      case NotificationType.streamStarted:
      case NotificationType.chatMessage:
      case NotificationType.orderStatusChanged:
        return true;
      default:
        return false;
    }
  }
}


