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

  factory MessageModel.fromJson(Map<String, dynamic> json) =>
      _$MessageModelFromJson(json);

  Map<String, dynamic> toJson() => _$MessageModelToJson(this);
}
