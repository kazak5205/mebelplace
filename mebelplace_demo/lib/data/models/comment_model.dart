class CommentModel {
  final String id;
  final String videoId;
  final String userId;
  final String content;
  final int likesCount;
  final bool isLiked;
  final DateTime createdAt;
  final DateTime? updatedAt;
  
  // User info
  final String? username;
  final String? avatar;
  final String? firstName;
  final String? lastName;

  const CommentModel({
    required this.id,
    required this.videoId,
    required this.userId,
    required this.content,
    required this.likesCount,
    required this.isLiked,
    required this.createdAt,
    this.updatedAt,
    this.username,
    this.avatar,
    this.firstName,
    this.lastName,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    // Парсим user данные если они в отдельном объекте
    final user = json['user'];
    
    return CommentModel(
      id: json['id'].toString(),
      videoId: (json['videoId'] ?? json['video_id'] ?? '').toString(),
      userId: (json['userId'] ?? json['user_id'] ?? '').toString(),
      content: (json['content'] ?? '').toString(),
      likesCount: int.tryParse((json['likesCount'] ?? json['likes_count'] ?? 0).toString()) ?? 0,
      isLiked: json['isLiked'] ?? json['is_liked'] ?? false,
      createdAt: DateTime.parse((json['createdAt'] ?? json['created_at']).toString()),
      updatedAt: json['updatedAt'] != null || json['updated_at'] != null
          ? DateTime.parse((json['updatedAt'] ?? json['updated_at']).toString())
          : null,
      username: (user?['username'] ?? json['username'])?.toString(),
      avatar: (user?['avatar'] ?? json['avatar'])?.toString(),
      firstName: (user?['firstName'] ?? user?['first_name'] ?? json['firstName'] ?? json['first_name'])?.toString(),
      lastName: (user?['lastName'] ?? user?['last_name'] ?? json['lastName'] ?? json['last_name'])?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'video_id': videoId,
      'user_id': userId,
      'content': content,
      'likes_count': likesCount,
      'is_liked': isLiked,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'username': username,
      'avatar': avatar,
      'first_name': firstName,
      'last_name': lastName,
    };
  }

  String get displayName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    }
    return username ?? 'Аноним';
  }

  String get formattedTime {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 365) {
      return '${(difference.inDays / 365).floor()} г. назад';
    } else if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()} мес. назад';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} дн. назад';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} ч. назад';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} мин. назад';
    } else {
      return 'Только что';
    }
  }
}

