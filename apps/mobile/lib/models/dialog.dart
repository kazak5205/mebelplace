import 'package:json_annotation/json_annotation.dart';
import 'user.dart';
import 'message.dart';

@JsonSerializable()
class ChatDialog {
  final int id;
  final User user;
  final Message? lastMessage;
  final int unreadCount;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  const ChatDialog({
    required this.id,
    required this.user,
    this.lastMessage,
    required this.unreadCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ChatDialog.fromJson(Map<String, dynamic> json) {
    return ChatDialog(
      id: json['id'] as int,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      lastMessage: json['last_message'] != null 
          ? Message.fromJson(json['last_message'] as Map<String, dynamic>)
          : null,
      unreadCount: json['unread_count'] as int,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': user.toJson(),
      'last_message': lastMessage?.toJson(),
      'unread_count': unreadCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
