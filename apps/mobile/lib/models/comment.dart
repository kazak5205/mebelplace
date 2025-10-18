class Comment {
  final int id;
  final int videoId;
  final int userId;
  final String userName;
  final String? userAvatar;
  final String content;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int likesCount;
  final bool isLiked;

  const Comment({
    required this.id,
    required this.videoId,
    required this.userId,
    required this.userName,
    this.userAvatar,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
    this.likesCount = 0,
    this.isLiked = false,
  });

  factory Comment.fromMap(Map<String, dynamic> map) {
    return Comment(
      id: map['id'] as int,
      videoId: map['video_id'] as int,
      userId: map['user_id'] as int,
      userName: map['user_name'] as String,
      userAvatar: map['user_avatar'] as String?,
      content: map['content'] as String,
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: DateTime.parse(map['updated_at'] as String),
      likesCount: map['likes_count'] as int? ?? 0,
      isLiked: (map['is_liked'] as int? ?? 0) == 1,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'video_id': videoId,
      'user_id': userId,
      'user_name': userName,
      'user_avatar': userAvatar,
      'content': content,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'likes_count': likesCount,
      'is_liked': isLiked ? 1 : 0,
    };
  }

  Comment copyWith({
    int? id,
    int? videoId,
    int? userId,
    String? userName,
    String? userAvatar,
    String? content,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? likesCount,
    bool? isLiked,
  }) {
    return Comment(
      id: id ?? this.id,
      videoId: videoId ?? this.videoId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userAvatar: userAvatar ?? this.userAvatar,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      likesCount: likesCount ?? this.likesCount,
      isLiked: isLiked ?? this.isLiked,
    );
  }
}

class CreateCommentRequest {
  final int videoId;
  final String content;

  const CreateCommentRequest({
    required this.videoId,
    required this.content,
  });

  Map<String, dynamic> toMap() {
    return {
      'video_id': videoId,
      'content': content,
    };
  }
}
