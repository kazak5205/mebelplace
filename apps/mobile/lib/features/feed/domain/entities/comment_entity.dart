import 'package:equatable/equatable.dart';
import '../../../auth/domain/entities/public_user_entity.dart';

/// Domain Entity для комментария
/// Соответствует backend API Comment schema v2.4.0
class CommentEntity extends Equatable {
  final int id;
  final int userId;
  final int videoId;
  final String text;
  final int? parentId;
  final int likesCount;
  final DateTime createdAt;
  final PublicUser author;
  final List<CommentEntity> replies;

  const CommentEntity({
    required this.id,
    required this.userId,
    required this.videoId,
    required this.text,
    this.parentId,
    required this.likesCount,
    required this.createdAt,
    required this.author,
    this.replies = const [],
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        videoId,
        text,
        parentId,
        likesCount,
        createdAt,
        author,
        replies,
      ];

  CommentEntity copyWith({
    int? id,
    int? userId,
    int? videoId,
    String? text,
    int? parentId,
    int? likesCount,
    DateTime? createdAt,
    PublicUser? author,
    List<CommentEntity>? replies,
  }) {
    return CommentEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      videoId: videoId ?? this.videoId,
      text: text ?? this.text,
      parentId: parentId ?? this.parentId,
      likesCount: likesCount ?? this.likesCount,
      createdAt: createdAt ?? this.createdAt,
      author: author ?? this.author,
      replies: replies ?? this.replies,
    );
  }

  /// Проверка, является ли комментарий ответом
  bool get isReply => parentId != null;

  /// Получение общего количества лайков (включая ответы)
  int get totalLikes {
    return likesCount + replies.fold(0, (sum, reply) => sum + reply.totalLikes);
  }

  /// Получение общего количества ответов (включая вложенные)
  int get totalReplies {
    return replies.length + replies.fold(0, (sum, reply) => sum + reply.totalReplies);
  }
}