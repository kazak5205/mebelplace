import 'package:json_annotation/json_annotation.dart';

part 'video_model.g.dart';

@JsonSerializable()
class VideoModel {
  final String id;
  final String title;
  final String? description;
  final String videoUrl;
  final String? thumbnailUrl;
  final int? duration;
  final int fileSize;
  final String authorId;
  final String? username;
  final String? firstName;
  final String? lastName;
  final String? avatar;
  final String category;
  final List<String> tags;
  final int views;
  final int likes;
  final int likesCount;
  final int commentsCount;
  final bool isLiked;
  final bool isFeatured;
  final int? priorityOrder;
  final bool isPublic;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const VideoModel({
    required this.id,
    required this.title,
    this.description,
    required this.videoUrl,
    this.thumbnailUrl,
    this.duration,
    required this.fileSize,
    required this.authorId,
    this.username,
    this.firstName,
    this.lastName,
    this.avatar,
    required this.category,
    required this.tags,
    required this.views,
    required this.likes,
    required this.likesCount,
    required this.commentsCount,
    required this.isLiked,
    required this.isFeatured,
    this.priorityOrder,
    required this.isPublic,
    required this.isActive,
    required this.createdAt,
    this.updatedAt,
  });

  factory VideoModel.fromJson(Map<String, dynamic> json) => _$VideoModelFromJson(json);
  Map<String, dynamic> toJson() => _$VideoModelToJson(this);

  VideoModel copyWith({
    String? id,
    String? title,
    String? description,
    String? videoUrl,
    String? thumbnailUrl,
    int? duration,
    int? fileSize,
    String? authorId,
    String? username,
    String? firstName,
    String? lastName,
    String? avatar,
    String? category,
    List<String>? tags,
    int? views,
    int? likes,
    int? likesCount,
    int? commentsCount,
    bool? isLiked,
    bool? isFeatured,
    int? priorityOrder,
    bool? isPublic,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return VideoModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      videoUrl: videoUrl ?? this.videoUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      duration: duration ?? this.duration,
      fileSize: fileSize ?? this.fileSize,
      authorId: authorId ?? this.authorId,
      username: username ?? this.username,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      avatar: avatar ?? this.avatar,
      category: category ?? this.category,
      tags: tags ?? this.tags,
      views: views ?? this.views,
      likes: likes ?? this.likes,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      isLiked: isLiked ?? this.isLiked,
      isFeatured: isFeatured ?? this.isFeatured,
      priorityOrder: priorityOrder ?? this.priorityOrder,
      isPublic: isPublic ?? this.isPublic,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  String get authorDisplayName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    }
    return username ?? 'Master';
  }

  String get formattedDuration {
    if (duration == null) return '00:00';
    final minutes = duration! ~/ 60;
    final seconds = duration! % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  String get formattedFileSize {
    if (fileSize < 1024 * 1024) {
      return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    } else {
      return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
  }

  String get formattedViews {
    if (views >= 1000000) {
      return '${(views / 1000000).toStringAsFixed(1)}M';
    } else if (views >= 1000) {
      return '${(views / 1000).toStringAsFixed(1)}K';
    }
    return views.toString();
  }

  String get formattedLikes {
    if (likesCount >= 1000000) {
      return '${(likesCount / 1000000).toStringAsFixed(1)}M';
    } else if (likesCount >= 1000) {
      return '${(likesCount / 1000).toStringAsFixed(1)}K';
    }
    return likesCount.toString();
  }

  String get formattedComments {
    if (commentsCount >= 1000000) {
      return '${(commentsCount / 1000000).toStringAsFixed(1)}M';
    } else if (commentsCount >= 1000) {
      return '${(commentsCount / 1000).toStringAsFixed(1)}K';
    }
    return commentsCount.toString();
  }

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 7) {
      return '${createdAt.day} ${_getMonthName(createdAt.month)}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}д назад';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}ч назад';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}м назад';
    } else {
      return 'только что';
    }
  }

  String _getMonthName(int month) {
    const months = [
      'янв', 'фев', 'мар', 'апр', 'май', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    return months[month - 1];
  }
}
