import 'package:equatable/equatable.dart';

/// Domain Entity для результата поиска
class SearchResultEntity extends Equatable {
  final String id;
  final SearchResultType type;
  final String title;
  final String? subtitle;
  final String? imageUrl;
  final int? count; // для хэштегов - количество видео
  final DateTime? createdAt;

  const SearchResultEntity({
    required this.id,
    required this.type,
    required this.title,
    this.subtitle,
    this.imageUrl,
    this.count,
    this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        type,
        title,
        subtitle,
        imageUrl,
        count,
        createdAt,
      ];
}

/// Тип результата поиска
enum SearchResultType {
  video,
  user,
  hashtag,
  channel,
}

