// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'message_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MessageModel _$MessageModelFromJson(Map<String, dynamic> json) => MessageModel(
      id: json['id'] as String,
      chatId: json['chatId'] as String,
      senderId: json['senderId'] as String,
      content: json['content'] as String,
      type: json['type'] as String,
      filePath: json['filePath'] as String?,
      isRead: json['isRead'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      sender: json['sender'] == null
          ? null
          : UserModel.fromJson(json['sender'] as Map<String, dynamic>),
      senderName: json['senderName'] as String?,
      senderAvatar: json['senderAvatar'] as String?,
      message: json['message'] as String?,
    );

Map<String, dynamic> _$MessageModelToJson(MessageModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'chatId': instance.chatId,
      'senderId': instance.senderId,
      'content': instance.content,
      'type': instance.type,
      'filePath': instance.filePath,
      'isRead': instance.isRead,
      'createdAt': instance.createdAt.toIso8601String(),
      'sender': instance.sender,
      'senderName': instance.senderName,
      'senderAvatar': instance.senderAvatar,
      'message': instance.message,
    };
