import 'package:json_annotation/json_annotation.dart';

part 'chat_model.g.dart';

@JsonSerializable()
class ChatModel {
  final String id;
  final String type;
  final String? name;
  final String? description;
  final DateTime createdAt;
  final String? senderId; // ID отправителя последнего сообщения
  final String? senderName; // Имя отправителя
  final String? senderAvatar; // Аватар отправителя
  final String? message; // Последнее сообщение
  final DateTime? updatedAt; // Дата обновления

  const ChatModel({
    required this.id,
    required this.type,
    this.name,
    this.description,
    this.senderId,
    this.senderName,
    this.senderAvatar,
    this.message,
    required this.createdAt,
    this.updatedAt,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json) {
    return ChatModel(
      id: json['id'].toString(),
      type: (json['type'] ?? 'private').toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      createdAt: DateTime.parse((json['createdAt'] ?? json['created_at']).toString()),
      senderId: (json['senderId'] ?? json['sender_id'])?.toString(),
      senderName: (json['senderName'] ?? json['sender_name'])?.toString(),
      senderAvatar: (json['senderAvatar'] ?? json['sender_avatar'])?.toString(),
      message: json['message']?.toString(),
      updatedAt: json['updatedAt'] != null || json['updated_at'] != null
          ? DateTime.tryParse((json['updatedAt'] ?? json['updated_at']).toString())
          : null,
    );
  }
  
  Map<String, dynamic> toJson() => _$ChatModelToJson(this);
}
