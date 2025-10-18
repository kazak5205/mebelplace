import '../../domain/entities/chat_entity.dart';

class ChatModel {
  final String id;
  final String participantId;
  final String participantName;
  final String? participantAvatar;
  final String? lastMessage;
  final DateTime? lastMessageTime;
  final int unreadCount;

  ChatModel({
    required this.id,
    required this.participantId,
    required this.participantName,
    this.participantAvatar,
    this.lastMessage,
    this.lastMessageTime,
    this.unreadCount = 0,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json) {
    return ChatModel(
      id: json['id']?.toString() ?? '',
      participantId: json['participant_id']?.toString() ?? '',
      participantName: json['participant_name'] ?? '',
      participantAvatar: json['participant_avatar'],
      lastMessage: json['last_message'],
      lastMessageTime: json['last_message_time'] != null 
          ? DateTime.tryParse(json['last_message_time']) 
          : null,
      unreadCount: json['unread_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'participant_id': participantId,
      'participant_name': participantName,
      'participant_avatar': participantAvatar,
      'last_message': lastMessage,
      'last_message_time': lastMessageTime?.toIso8601String(),
      'unread_count': unreadCount,
    };
  }

  ChatEntity toEntity() => ChatEntity(
    id: id,
    name: participantName,
    avatar: participantAvatar,
    type: ChatType.oneToOne,
    participants: [participantId],
    lastMessage: null,
    unreadCount: unreadCount,
    lastActivityAt: lastMessageTime,
    createdAt: lastMessageTime ?? DateTime.now(),
  );
}

class MessageModel {
  final String id;
  final String chatId;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String? content;
  final String type; // 'text', 'image', 'audio', etc
  final List<String> attachments;
  final String status; // 'sending', 'sent', 'delivered', 'read', 'failed'
  final DateTime timestamp;
  final bool isRead;

  MessageModel({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    this.content,
    this.type = 'text',
    this.attachments = const [],
    this.status = 'sent',
    required this.timestamp,
    this.isRead = false,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id']?.toString() ?? '',
      chatId: json['chat_id']?.toString() ?? '',
      senderId: json['sender_id']?.toString() ?? json['user_id']?.toString() ?? '',
      senderName: json['sender_name'] ?? json['username'] ?? 'User',
      senderAvatar: json['sender_avatar'] ?? json['avatar'],
      content: json['content'] ?? json['message'] ?? json['text'],
      type: json['type'] ?? 'text',
      attachments: (json['attachments'] as List?)?.map((e) => e.toString()).toList() ?? [],
      status: json['status'] ?? 'sent',
      timestamp: json['timestamp'] != null 
          ? (DateTime.tryParse(json['timestamp']) ?? DateTime.now())
          : json['created_at'] != null
              ? (DateTime.tryParse(json['created_at']) ?? DateTime.now())
              : DateTime.now(),
      isRead: json['is_read'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'chat_id': chatId,
      'sender_id': senderId,
      'sender_name': senderName,
      'sender_avatar': senderAvatar,
      'content': content,
      'type': type,
      'attachments': attachments,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
      'is_read': isRead,
    };
  }

  MessageEntity toEntity() => MessageEntity(
    id: id,
    chatId: chatId,
    senderId: senderId,
    senderName: senderName,
    senderAvatar: senderAvatar,
    text: content,
    type: _parseMessageType(type),
    attachments: attachments,
    status: _parseMessageStatus(status),
    createdAt: timestamp,
    isRead: isRead,
  );

  MessageType _parseMessageType(String type) {
    switch (type.toLowerCase()) {
      case 'image':
        return MessageType.image;
      case 'video':
        return MessageType.video;
      case 'audio':
        return MessageType.audio;
      case 'file':
        return MessageType.file;
      default:
        return MessageType.text;
    }
  }

  MessageStatus _parseMessageStatus(String status) {
    switch (status.toLowerCase()) {
      case 'sending':
        return MessageStatus.sending;
      case 'sent':
        return MessageStatus.sent;
      case 'delivered':
        return MessageStatus.delivered;
      case 'read':
        return MessageStatus.read;
      case 'failed':
        return MessageStatus.failed;
      default:
        return MessageStatus.sent;
    }
  }
}
