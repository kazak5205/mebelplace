import '../../domain/entities/comment_entity.dart';
import '../../../auth/domain/entities/public_user_entity.dart';

/// CommentModel соответствует backend API Comment schema v2.4.0
class CommentModel {
  final int id;
  final int userId;
  final int videoId;
  final String text;
  final int? parentId;
  final int likesCount;
  final DateTime createdAt;
  final PublicUser author;
  final List<CommentModel>? replies;

  CommentModel({
    required this.id,
    required this.userId,
    required this.videoId,
    required this.text,
    this.parentId,
    required this.likesCount,
    required this.createdAt,
    required this.author,
    this.replies,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      videoId: json['video_id'] as int,
      text: json['text'] as String,
      parentId: json['parent_id'] as int?,
      likesCount: json['likes_count'] as int,
      createdAt: DateTime.parse(json['created_at'] as String),
      author: PublicUser.fromJson(json['author'] as Map<String, dynamic>),
      replies: json['replies'] != null
          ? (json['replies'] as List)
              .map((reply) => CommentModel.fromJson(reply as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'video_id': videoId,
      'text': text,
      'parent_id': parentId,
      'likes_count': likesCount,
      'created_at': createdAt.toIso8601String(),
      'author': author.toJson(),
      'replies': replies?.map((reply) => reply.toJson()).toList(),
    };
  }

  /// Преобразование в domain entity
  CommentEntity toEntity() {
    return CommentEntity(
      id: id,
      userId: userId,
      videoId: videoId,
      text: text,
      parentId: parentId,
      likesCount: likesCount,
      createdAt: createdAt,
      author: author,
      replies: replies?.map((reply) => reply.toEntity()).toList() ?? [],
    );
  }

  /// Обновление счетчика лайков
  CommentModel copyWithLikes(int likesCount) {
    return CommentModel(
      id: id,
      userId: userId,
      videoId: videoId,
      text: text,
      parentId: parentId,
      likesCount: likesCount,
      createdAt: createdAt,
      author: author,
      replies: replies,
    );
  }
}