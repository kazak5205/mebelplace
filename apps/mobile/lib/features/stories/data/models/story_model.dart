import '../../domain/entities/story_entity.dart';

class StoryModel extends StoryEntity {
  const StoryModel({
    required super.id,
    required super.authorId,
    required super.authorName,
    super.authorAvatar,
    required super.mediaUrl,
    required super.mediaType,
    super.thumbnail,
    required super.createdAt,
    required super.expiresAt,
    required super.viewsCount,
    required super.isViewed,
    super.isHighlight,
    super.highlightId,
  });

  factory StoryModel.fromJson(Map<String, dynamic> json) {
    return StoryModel(
      id: json['id'].toString(),
      authorId: json['author_id'].toString(),
      authorName: json['author_name'] as String,
      authorAvatar: json['author_avatar'] as String?,
      mediaUrl: json['media_url'] as String,
      mediaType: json['media_type'] as String,
      thumbnail: json['thumbnail'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      expiresAt: DateTime.parse(json['expires_at'] as String),
      viewsCount: json['views_count'] as int? ?? 0,
      isViewed: json['is_viewed'] as bool? ?? false,
      isHighlight: json['is_highlight'] as bool? ?? false,
      highlightId: json['highlight_id'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'author_id': authorId,
      'author_name': authorName,
      'author_avatar': authorAvatar,
      'media_url': mediaUrl,
      'media_type': mediaType,
      'thumbnail': thumbnail,
      'created_at': createdAt.toIso8601String(),
      'expires_at': expiresAt.toIso8601String(),
      'views_count': viewsCount,
      'is_viewed': isViewed,
      'is_highlight': isHighlight,
      'highlight_id': highlightId,
    };
  }

  StoryEntity toEntity() {
    return StoryEntity(
      id: id,
      authorId: authorId,
      authorName: authorName,
      authorAvatar: authorAvatar,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      thumbnail: thumbnail,
      createdAt: createdAt,
      expiresAt: expiresAt,
      viewsCount: viewsCount,
      isViewed: isViewed,
      isHighlight: isHighlight,
      highlightId: highlightId,
    );
  }
}


