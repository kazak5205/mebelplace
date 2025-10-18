import 'package:equatable/equatable.dart';

class ChatEntity extends Equatable {
  final String id;
  final String name;
  final String? avatar;
  final ChatType type;
  final List<String> participants;
  final MessageEntity? lastMessage;
  final int unreadCount;
  final DateTime? lastActivityAt;
  final DateTime createdAt;

  const ChatEntity({
    required this.id,
    required this.name,
    this.avatar,
    required this.type,
    required this.participants,
    this.lastMessage,
    required this.unreadCount,
    this.lastActivityAt,
    required this.createdAt,
  });
  
  // Helper getters
  DateTime? get lastMessageTime => lastMessage?.createdAt ?? lastActivityAt;

  @override
  List<Object?> get props => [
        id,
        name,
        avatar,
        type,
        participants,
        lastMessage,
        unreadCount,
        lastActivityAt,
        createdAt,
      ];
}

enum ChatType {
  oneToOne,
  group,
  channel,
}

class MessageEntity extends Equatable {
  final String id;
  final String chatId;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String? text;
  final MessageType type;
  final List<String> attachments;
  final MessageStatus status;
  final DateTime createdAt;
  final bool isRead;

  const MessageEntity({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    this.text,
    required this.type,
    required this.attachments,
    required this.status,
    required this.createdAt,
    required this.isRead,
  });

  @override
  List<Object?> get props => [
        id,
        chatId,
        senderId,
        senderName,
        senderAvatar,
        text,
        type,
        attachments,
        status,
        createdAt,
        isRead,
      ];
}

enum MessageType {
  text,
  image,
  video,
  audio,
  file,
}

enum MessageStatus {
  sending,
  sent,
  delivered,
  read,
  failed,
}

