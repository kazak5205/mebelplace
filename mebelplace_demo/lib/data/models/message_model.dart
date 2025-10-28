import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';

part 'message_model.g.dart';

@JsonSerializable()
class MessageModel {
  final String id;
  final String chatId;
  final String senderId;
  final String content;
  final String type; // text, image, file, video
  final String? filePath;
  final bool isRead;
  final DateTime createdAt;
  final UserModel? sender; // Полная информация об отправителе
  final String? senderName; // Имя отправителя
  final String? senderAvatar; // Аватар отправителя
  final String? message; // Альтернативное поле для content

  const MessageModel({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.content,
    required this.type,
    this.filePath,
    required this.isRead,
    required this.createdAt,
    this.sender,
    this.senderName,
    this.senderAvatar,
    this.message,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id'].toString(),
      chatId: (json['chatId'] ?? json['chat_id'] ?? '').toString(),
      senderId: (json['senderId'] ?? json['sender_id'] ?? '').toString(),
      content: (json['content'] ?? json['message'] ?? '').toString(),
      type: (json['type'] ?? 'text').toString(),
      filePath: json['filePath']?.toString() ?? json['file_path']?.toString(),
      isRead: json['isRead'] ?? json['is_read'] ?? false,
      createdAt: DateTime.parse((json['createdAt'] ?? json['created_at']).toString()),
      sender: json['sender'] != null ? UserModel.fromJson(json['sender'] as Map<String, dynamic>) : null,
      senderName: (json['senderName'] ?? json['sender_name'])?.toString(),
      senderAvatar: (json['senderAvatar'] ?? json['sender_avatar'])?.toString(),
      message: json['message']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => _$MessageModelToJson(this);
}
