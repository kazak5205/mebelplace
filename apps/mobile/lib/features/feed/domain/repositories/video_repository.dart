import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/video_entity.dart';

/// Repository interface для видео
/// Соответствует backend API v2.4.0
abstract class VideoRepository {
  /// Получить ленту видео с пагинацией
  Future<Either<Failure, Map<String, dynamic>>> getVideoFeed({
    int page = 1,
    int limit = 20,
    int? userId,
  });
  
  /// Получить видео по ID
  Future<Either<Failure, VideoEntity>> getVideoById(int id);
  
  /// Лайкнуть видео (возвращает обновленное количество лайков)
  Future<Either<Failure, Map<String, dynamic>>> likeVideo(int id);
  
  /// Убрать лайк (возвращает обновленное количество лайков)
  Future<Either<Failure, Map<String, dynamic>>> unlikeVideo(int id);
  
  /// Добавить в избранное
  Future<Either<Failure, void>> favoriteVideo(int id);
  
  /// Убрать из избранного
  Future<Either<Failure, void>> unfavoriteVideo(int id);
  
  /// Отметить просмотр
  Future<Either<Failure, void>> viewVideo(int id, int duration);
  
  /// Подписаться на автора
  Future<Either<Failure, void>> followAuthor(int authorId);
  
  /// Отписаться от автора
  Future<Either<Failure, void>> unfollowAuthor(int authorId);
  
  /// Пожаловаться на видео (Google Play UGC requirement!)
  Future<Either<Failure, void>> reportVideo(int videoId, String reason);
  
  /// Получить избранные видео
  Future<Either<Failure, List<VideoEntity>>> getFavoriteVideos();
  
  /// Получить мои видео
  Future<Either<Failure, List<VideoEntity>>> getMyVideos();
}

