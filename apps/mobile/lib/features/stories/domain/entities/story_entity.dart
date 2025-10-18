import 'package:equatable/equatable.dart';

class StoryEntity extends Equatable {
  final String id;
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final String mediaUrl;
  final String mediaType; // 'image' or 'video'
  final String? thumbnail;
  final DateTime createdAt;
  final DateTime expiresAt;
  final int viewsCount;
  final bool isViewed;
  final bool isHighlight;
  final String? highlightId;

  const StoryEntity({
    required this.id,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    required this.mediaUrl,
    required this.mediaType,
    this.thumbnail,
    required this.createdAt,
    required this.expiresAt,
    required this.viewsCount,
    required this.isViewed,
    this.isHighlight = false,
    this.highlightId,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  
  Duration get timeRemaining => expiresAt.difference(DateTime.now());

  @override
  List<Object?> get props => [
        id,
        authorId,
        authorName,
        authorAvatar,
        mediaUrl,
        mediaType,
        thumbnail,
        createdAt,
        expiresAt,
        viewsCount,
        isViewed,
        isHighlight,
        highlightId,
      ];

  StoryEntity copyWith({
    String? id,
    String? authorId,
    String? authorName,
    String? authorAvatar,
    String? mediaUrl,
    String? mediaType,
    String? thumbnail,
    DateTime? createdAt,
    DateTime? expiresAt,
    int? viewsCount,
    bool? isViewed,
    bool? isHighlight,
    String? highlightId,
  }) {
    return StoryEntity(
      id: id ?? this.id,
      authorId: authorId ?? this.authorId,
      authorName: authorName ?? this.authorName,
      authorAvatar: authorAvatar ?? this.authorAvatar,
      mediaUrl: mediaUrl ?? this.mediaUrl,
      mediaType: mediaType ?? this.mediaType,
      thumbnail: thumbnail ?? this.thumbnail,
      createdAt: createdAt ?? this.createdAt,
      expiresAt: expiresAt ?? this.expiresAt,
      viewsCount: viewsCount ?? this.viewsCount,
      isViewed: isViewed ?? this.isViewed,
      isHighlight: isHighlight ?? this.isHighlight,
      highlightId: highlightId ?? this.highlightId,
    );
  }
}

/// Story Group (stories from one author)
class StoryGroup extends Equatable {
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final List<StoryEntity> stories;
  final bool hasUnviewed;

  const StoryGroup({
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    required this.stories,
    required this.hasUnviewed,
  });

  @override
  List<Object?> get props => [
        authorId,
        authorName,
        authorAvatar,
        stories,
        hasUnviewed,
      ];
}


