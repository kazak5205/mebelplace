import 'dart:convert';
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
  final Map<String, dynamic>? metadata; // Метаданные для видео-превью

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
    this.metadata,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    // Формируем имя отправителя как на вебе (из sender или отдельных полей)
    String? senderName;
    if (json['sender'] != null && json['sender'] is Map) {
      final sender = json['sender'] as Map<String, dynamic>;
      final firstName = sender['first_name']?.toString().trim() ?? sender['firstName']?.toString().trim();
      final lastName = sender['last_name']?.toString().trim() ?? sender['lastName']?.toString().trim();
      final username = sender['username']?.toString().trim();
      if (firstName != null && firstName.isNotEmpty) {
        senderName = lastName != null && lastName.isNotEmpty ? '$firstName $lastName' : firstName;
      } else if (username != null && username.isNotEmpty) {
        senderName = username;
      }
    } else if (json['senderName'] != null || json['sender_name'] != null) {
      senderName = (json['senderName'] ?? json['sender_name'])?.toString();
    } else if (json['sender_first_name'] != null || json['sender_last_name'] != null || json['sender_username'] != null) {
      final firstName = json['sender_first_name']?.toString().trim();
      final lastName = json['sender_last_name']?.toString().trim();
      final username = json['sender_username']?.toString().trim();
      if (firstName != null && firstName.isNotEmpty) {
        senderName = lastName != null && lastName.isNotEmpty ? '$firstName $lastName' : firstName;
      } else if (username != null && username.isNotEmpty) {
        senderName = username;
      }
    }
    
    // Парсим metadata (может быть объект или JSON-строка как на вебе)
    Map<String, dynamic>? metadata;
    if (json['metadata'] != null) {
      if (json['metadata'] is Map) {
        metadata = Map<String, dynamic>.from(json['metadata'] as Map);
      } else if (json['metadata'] is String) {
        try {
          metadata = Map<String, dynamic>.from(jsonDecode(json['metadata'] as String) as Map);
        } catch (e) {
          // Если не парсится, оставляем null
        }
      }
    }
    
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
      senderName: senderName,
      senderAvatar: (json['senderAvatar'] ?? json['sender_avatar'])?.toString(),
      message: json['message']?.toString(),
      metadata: metadata,
    );
  }

  Map<String, dynamic> toJson() => _$MessageModelToJson(this);
}
