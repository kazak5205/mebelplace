/// Модель участника чата
class ChatParticipant {
  final int userId;
  final String? username;
  final String? firstName;
  final String? lastName;
  final String? avatar;
  final bool isActive;
  final String? role;
  final String? name;

  ChatParticipant({
    required this.userId,
    this.username,
    this.firstName,
    this.lastName,
    this.avatar,
    this.isActive = false,
    this.role,
    this.name,
  });

  factory ChatParticipant.fromJson(Map<String, dynamic> json) {
    return ChatParticipant(
      userId: int.parse((json['user_id'] ?? json['userId']).toString()),
      username: json['username']?.toString(),
      firstName: json['first_name'] ?? json['firstName'],
      lastName: json['last_name'] ?? json['lastName'],
      avatar: json['avatar']?.toString(),
      isActive: json['is_active'] ?? json['isActive'] ?? false,
      role: json['role']?.toString(),
      name: json['name']?.toString(),
    );
  }

  String get displayName {
    if (name != null && name!.isNotEmpty) return name!;
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    }
    return username ?? 'Пользователь';
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'username': username,
      'first_name': firstName,
      'last_name': lastName,
      'avatar': avatar,
      'is_active': isActive,
      'role': role,
      'name': name,
    };
  }
}

class ChatModel {
  final String id;
  final String type;
  final String? name;
  final String? description;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? lastMessage;
  final DateTime? lastMessageTime;
  final int unreadCount;
  final List<ChatParticipant> participants;
  
  // Текущий пользователь (передаётся извне для определения otherUser)
  final int? currentUserId;

  const ChatModel({
    required this.id,
    required this.type,
    this.name,
    this.description,
    required this.createdAt,
    this.updatedAt,
    this.lastMessage,
    this.lastMessageTime,
    this.unreadCount = 0,
    this.participants = const [],
    this.currentUserId,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json, {int? currentUserId}) {
    // Парсим participants
    final List<ChatParticipant> participantsList = [];
    if (json['participants'] != null && json['participants'] is List) {
      for (var p in json['participants']) {
        participantsList.add(ChatParticipant.fromJson(p));
      }
    }

    return ChatModel(
      id: json['id'].toString(),
      type: (json['type'] ?? 'private').toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      createdAt: DateTime.parse((json['created_at'] ?? json['createdAt']).toString()),
      updatedAt: json['updated_at'] != null || json['updatedAt'] != null
          ? DateTime.tryParse((json['updated_at'] ?? json['updatedAt']).toString())
          : null,
      lastMessage: json['last_message'] ?? json['lastMessage'],
      lastMessageTime: json['last_message_time'] != null || json['lastMessageTime'] != null
          ? DateTime.tryParse((json['last_message_time'] ?? json['lastMessageTime']).toString())
          : null,
      unreadCount: int.tryParse((json['unread_count'] ?? json['unreadCount'] ?? 0).toString()) ?? 0,
      participants: participantsList,
      currentUserId: currentUserId,
    );
  }

  /// Получить другого участника (не текущего пользователя)
  ChatParticipant? get otherUser {
    if (participants.isEmpty) return null;
    if (currentUserId == null) return participants.first;
    
    return participants.firstWhere(
      (p) => p.userId != currentUserId,
      orElse: () => participants.first,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'name': name,
      'description': description,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'last_message': lastMessage,
      'last_message_time': lastMessageTime?.toIso8601String(),
      'unread_count': unreadCount,
      'participants': participants.map((p) => p.toJson()).toList(),
    };
  }
}
