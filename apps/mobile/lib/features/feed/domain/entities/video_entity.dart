import 'package:equatable/equatable.dart';
import '../../../auth/domain/entities/public_user_entity.dart';

/// Domain Entity для видео
/// Соответствует mobile-api.yaml Video schema
class VideoEntity extends Equatable {
  final int id;
  final int userId;
  final String title;
  final String? description;
  final String path; // videoUrl -> path
  final String? thumbnailPath; // thumbnail_path из API
  final String? thumbnailUrl; // Legacy support для UI
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
  final bool isLiked; // Для UI состояния (не в API)
  final bool isFavorite; // Для UI состояния (не в API)
  final bool isFollowing; // Для UI состояния (не в API)
  final DateTime createdAt;
  final PublicUser author; // Полная информация об авторе

  const VideoEntity({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    required this.path,
    this.thumbnailPath,
    this.thumbnailUrl,
    required this.sizeBytes,
    required this.hashtags,
    required this.viewsCount,
    required this.likesCount,
    required this.commentsCount,
    required this.sharesCount,
    this.productPrice,
    this.productDescription,
    this.isProduct = false,
    this.isAd = false,
    this.isLiked = false,
    this.isFavorite = false,
    this.isFollowing = false,
    required this.createdAt,
    required this.author,
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        title,
        description,
        path,
        thumbnailPath,
        thumbnailUrl,
        sizeBytes,
        hashtags,
        viewsCount,
        likesCount,
        commentsCount,
        sharesCount,
        productPrice,
        productDescription,
        isProduct,
        isAd,
        isLiked,
        isFavorite,
        isFollowing,
        createdAt,
        author,
      ];

  VideoEntity copyWith({
    int? id,
    int? userId,
    String? title,
    String? description,
    String? path,
    String? thumbnailPath,
    String? thumbnailUrl,
    int? sizeBytes,
    List<String>? hashtags,
    int? viewsCount,
    int? likesCount,
    int? commentsCount,
    int? sharesCount,
    double? productPrice,
    String? productDescription,
    bool? isProduct,
    bool? isAd,
    bool? isLiked,
    bool? isFavorite,
    bool? isFollowing,
    DateTime? createdAt,
    PublicUser? author,
  }) {
    return VideoEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      description: description ?? this.description,
      path: path ?? this.path,
      thumbnailPath: thumbnailPath ?? this.thumbnailPath,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      sizeBytes: sizeBytes ?? this.sizeBytes,
      hashtags: hashtags ?? this.hashtags,
      viewsCount: viewsCount ?? this.viewsCount,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      sharesCount: sharesCount ?? this.sharesCount,
      productPrice: productPrice ?? this.productPrice,
      productDescription: productDescription ?? this.productDescription,
      isProduct: isProduct ?? this.isProduct,
      isAd: isAd ?? this.isAd,
      isLiked: isLiked ?? this.isLiked,
      isFavorite: isFavorite ?? this.isFavorite,
      isFollowing: isFollowing ?? this.isFollowing,
      createdAt: createdAt ?? this.createdAt,
      author: author ?? this.author,
    );
  }
}

