import 'package:json_annotation/json_annotation.dart';

@JsonSerializable()
class Message {
  final int id;
  final String content;
  @JsonKey(name: 'sender_id')
  final int senderId;
  @JsonKey(name: 'receiver_id')
  final int receiverId;
  @JsonKey(name: 'is_read')
  final bool isRead;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'sender_name')
  final String? senderName;
  @JsonKey(name: 'sender_avatar')
  final String? senderAvatar;
  @JsonKey(name: 'message_type')
  final String? messageType; // text, image, voice, video, file
  @JsonKey(name: 'file_url')
  final String? fileUrl;
  final bool? synced; // Для offline кэша
  @JsonKey(name: 'reply_to_id')
  final int? replyToId; // ID сообщения на которое отвечаем
  @JsonKey(name: 'reply_to_content')
  final String? replyToContent; // Текст сообщения на которое отвечаем
  @JsonKey(name: 'forwarded_from')
  final String? forwardedFrom; // Имя отправителя пересланного сообщения

  const Message({
    required this.id,
    required this.content,
    required this.senderId,
    required this.receiverId,
    required this.isRead,
    required this.createdAt,
    this.senderName,
    this.senderAvatar,
    this.messageType,
    this.fileUrl,
    this.synced,
    this.replyToId,
    this.replyToContent,
    this.forwardedFrom,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as int,
      content: json['content'] as String,
      senderId: json['sender_id'] as int,
      receiverId: json['receiver_id'] as int,
      isRead: json['is_read'] as bool,
      createdAt: DateTime.parse(json['created_at'] as String),
      senderName: json['sender_name'] as String?,
      senderAvatar: json['sender_avatar'] as String?,
      messageType: json['message_type'] as String? ?? 'text',
      fileUrl: json['file_url'] as String?,
      synced: json['synced'] as bool? ?? true,
      replyToId: json['reply_to_id'] as int?,
      replyToContent: json['reply_to_content'] as String?,
      forwardedFrom: json['forwarded_from'] as String?,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'sender_id': senderId,
      'receiver_id': receiverId,
      'is_read': isRead,
      'created_at': createdAt.toIso8601String(),
      'sender_name': senderName,
      'sender_avatar': senderAvatar,
      'message_type': messageType,
      'file_url': fileUrl,
      'synced': synced,
      'reply_to_id': replyToId,
      'reply_to_content': replyToContent,
      'forwarded_from': forwardedFrom,
    };
  }

  // Getters for compatibility
  String get text => content;

  Message copyWith({
    int? id,
    String? content,
    int? senderId,
    int? receiverId,
    bool? isRead,
    DateTime? createdAt,
    String? senderName,
    String? senderAvatar,
    String? messageType,
    String? fileUrl,
    bool? synced,
    int? replyToId,
    String? replyToContent,
    String? forwardedFrom,
  }) {
    return Message(
      id: id ?? this.id,
      content: content ?? this.content,
      senderId: senderId ?? this.senderId,
      receiverId: receiverId ?? this.receiverId,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
      senderName: senderName ?? this.senderName,
      senderAvatar: senderAvatar ?? this.senderAvatar,
      messageType: messageType ?? this.messageType,
      fileUrl: fileUrl ?? this.fileUrl,
      synced: synced ?? this.synced,
      replyToId: replyToId ?? this.replyToId,
      replyToContent: replyToContent ?? this.replyToContent,
      forwardedFrom: forwardedFrom ?? this.forwardedFrom,
    );
  }
}


@JsonSerializable()
class SendMessageRequest {
  @JsonKey(name: 'receiver_id')
  final int receiverId;
  final String content;

  const SendMessageRequest({
    required this.receiverId,
    required this.content,
  });

  factory SendMessageRequest.fromJson(Map<String, dynamic> json) {
    return SendMessageRequest(
      receiverId: json['receiver_id'] as int,
      content: json['content'] as String,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'receiver_id': receiverId,
      'content': content,
    };
  }
}
