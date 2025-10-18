import '../../domain/entities/video_entity.dart';
import '../../../auth/domain/entities/public_user_entity.dart';

/// VideoModel соответствует mobile-api.yaml Video schema
class VideoModel {
  final int id;
  final int userId;
  final String title;
  final String? description;
  final String path;
  final String? thumbnailPath;
  final int sizeBytes;
  final List<String> hashtags;
  final int viewsCount;
  final int likesCount;
  final int commentsCount;
  final int sharesCount;
  final double? productPrice;
  final String? productDescription;
  final bool isProduct;
  final bool isAd;
  final DateTime createdAt;
  final PublicUser author;

  VideoModel({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    required this.path,
    this.thumbnailPath,
    required this.sizeBytes,
    required this.hashtags,
    required this.viewsCount,
    required this.likesCount,
    required this.commentsCount,
    required this.sharesCount,
    this.productPrice,
    this.productDescription,
    required this.isProduct,
    required this.isAd,
    required this.createdAt,
    required this.author,
  });

  factory VideoModel.fromJson(Map<String, dynamic> json) {
    return VideoModel(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      path: json['path'] as String,
      thumbnailPath: json['thumbnail_path'] as String?,
      sizeBytes: json['size_bytes'] as int,
      hashtags: List<String>.from(json['hashtags'] ?? []),
      viewsCount: json['views_count'] as int,
      likesCount: json['likes_count'] as int,
      commentsCount: json['comments_count'] as int,
      sharesCount: json['shares_count'] as int,
      productPrice: (json['product_price'] as num?)?.toDouble(),
      productDescription: json['product_description'] as String?,
      isProduct: json['is_product'] as bool? ?? false,
      isAd: json['is_ad'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      author: PublicUser.fromJson(json['author'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'description': description,
      'path': path,
      'thumbnail_path': thumbnailPath,
      'size_bytes': sizeBytes,
      'hashtags': hashtags,
      'views_count': viewsCount,
      'likes_count': likesCount,
      'comments_count': commentsCount,
      'shares_count': sharesCount,
      'product_price': productPrice,
      'product_description': productDescription,
      'is_product': isProduct,
      'is_ad': isAd,
      'created_at': createdAt.toIso8601String(),
      'author': author.toJson(),
    };
  }

  /// Преобразование в domain entity
  VideoEntity toEntity() {
    return VideoEntity(
      id: id,
      userId: userId,
      title: title,
      description: description,
      path: path,
      thumbnailPath: thumbnailPath,
      sizeBytes: sizeBytes,
      hashtags: hashtags,
      viewsCount: viewsCount,
      likesCount: likesCount,
      commentsCount: commentsCount,
      sharesCount: sharesCount,
      productPrice: productPrice,
      productDescription: productDescription,
      isProduct: isProduct,
      isAd: isAd,
      createdAt: createdAt,
      author: author,
    );
  }

  /// Обновление счетчиков лайков (используется после like/unlike)
  VideoModel copyWithLikes({
    int? likesCount,
    bool? isLiked,
  }) {
    return VideoModel(
      id: id,
      userId: userId,
      title: title,
      description: description,
      path: path,
      thumbnailPath: thumbnailPath,
      sizeBytes: sizeBytes,
      hashtags: hashtags,
      viewsCount: viewsCount,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount,
      sharesCount: sharesCount,
      productPrice: productPrice,
      productDescription: productDescription,
      isProduct: isProduct,
      isAd: isAd,
      createdAt: createdAt,
      author: author,
    );
  }

  /// Обновление счетчиков просмотров
  VideoModel copyWithViews(int viewsCount) {
    return VideoModel(
      id: id,
      userId: userId,
      title: title,
      description: description,
      path: path,
      thumbnailPath: thumbnailPath,
      sizeBytes: sizeBytes,
      hashtags: hashtags,
      viewsCount: viewsCount,
      likesCount: likesCount,
      commentsCount: commentsCount,
      sharesCount: sharesCount,
      productPrice: productPrice,
      productDescription: productDescription,
      isProduct: isProduct,
      isAd: isAd,
      createdAt: createdAt,
      author: author,
    );
  }
}