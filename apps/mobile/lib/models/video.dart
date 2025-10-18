import 'user.dart';

class Video {
  final String id;
  final String title;
  final String description;
  final String videoUrl;
  final String thumbnailUrl;
  final User author;
  final int likesCount;
  final int commentsCount;
  final int viewsCount;
  final bool isLiked;
  final bool isFavorite;
  final DateTime createdAt;

  Video({
    required this.id,
    required this.title,
    required this.description,
    required this.videoUrl,
    required this.thumbnailUrl,
    required this.author,
    this.likesCount = 0,
    this.commentsCount = 0,
    this.viewsCount = 0,
    this.isLiked = false,
    this.isFavorite = false,
    required this.createdAt,
  });

  factory Video.fromJson(Map<String, dynamic> json) {
    return Video(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      videoUrl: json['video_url'] ?? json['path'] ?? '',
      thumbnailUrl: json['thumbnail_url'] ?? json['thumbnail_path'] ?? '',
      author: json['author'] != null
          ? User.fromJson(json['author'])
          : User(
              id: json['user_id'] as int? ?? 0,
              username: json['username'] ?? '',
              email: '',
              avatarUrl: json['avatar'],
              role: 'user',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now(),
            ),
      likesCount: json['likes_count'] ?? 0,
      commentsCount: json['comments_count'] ?? 0,
      viewsCount: json['views_count'] ?? 0,
      isLiked: json['is_liked'] ?? false,
      isFavorite: json['is_favorite'] ?? false,
      createdAt: json['created_at'] != null
          ? (DateTime.tryParse(json['created_at']) ?? DateTime.now())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'video_url': videoUrl,
      'thumbnail_url': thumbnailUrl,
      'author': author.toJson(),
      'likes_count': likesCount,
      'comments_count': commentsCount,
      'views_count': viewsCount,
      'is_liked': isLiked,
      'is_favorite': isFavorite,
      'created_at': createdAt.toIso8601String(),
    };
  }

  // copyWith method
  Video copyWith({
    String? id,
    String? title,
    String? description,
    String? videoUrl,
    String? thumbnailUrl,
    User? author,
    int? likesCount,
    int? commentsCount,
    int? viewsCount,
    bool? isLiked,
    bool? isFavorite,
    DateTime? createdAt,
  }) {
    return Video(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      videoUrl: videoUrl ?? this.videoUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      author: author ?? this.author,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      viewsCount: viewsCount ?? this.viewsCount,
      isLiked: isLiked ?? this.isLiked,
      isFavorite: isFavorite ?? this.isFavorite,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  // Compatibility getters
  int get views => viewsCount;
  int get likes => likesCount;
  bool get isFavorited => isFavorite;
  double? get productPrice => null;
  List<String> get hashtags => const [];
  bool get isAd => false;
  String? get adLink => null;
  String? get thumbnail => thumbnailUrl;
  String? get thumbnailPath => thumbnailUrl;
  bool get canOrder => true;
  int get sharesCount => 0;
  int get duration => 0;
  DateTime get updatedAt => createdAt;
  User get user => author;
}

}
