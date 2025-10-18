import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../models/video_model.dart';
import '../../../../core/constants/api_endpoints.dart';

/// Remote data source для видео
/// Соответствует backend API v2.4.0
abstract class VideoRemoteDataSource {
  /// Получить ленту видео с пагинацией
  Future<Map<String, dynamic>> getVideoFeed({
    int page = 1,
    int limit = 20,
    int? userId,
  });
  
  /// Получить видео по ID
  Future<VideoModel> getVideoById(int id);
  
  /// Лайкнуть видео (возвращает обновленное количество лайков)
  Future<Map<String, dynamic>> likeVideo(int id);
  
  /// Убрать лайк (возвращает обновленное количество лайков)
  Future<Map<String, dynamic>> unlikeVideo(int id);
  
  /// Добавить в избранное
  Future<void> favoriteVideo(int id);
  
  /// Убрать из избранного
  Future<void> unfavoriteVideo(int id);
  
  /// Отметить просмотр
  Future<void> viewVideo(int id, int duration);
  
  /// Подписаться на автора
  Future<void> followAuthor(int authorId);
  
  /// Отписаться от автора
  Future<void> unfollowAuthor(int authorId);
  
  /// Пожаловаться на видео
  Future<void> reportVideo(int videoId, String reason);
  
  /// Получить избранные видео
  Future<List<VideoModel>> getFavoriteVideos();
  
  /// Получить мои видео
  Future<List<VideoModel>> getMyVideos();
}

class VideoRemoteDataSourceImpl implements VideoRemoteDataSource {
  final DioClient dioClient;

  VideoRemoteDataSourceImpl(this.dioClient);

  @override
  Future<Map<String, dynamic>> getVideoFeed({
    int page = 1,
    int limit = 20,
    int? userId,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };
      
      if (userId != null) {
        queryParams['user_id'] = userId;
      }

      final response = await dioClient.get(
        ApiEndpoints.videosFeed,
        queryParameters: queryParams,
      );

      // Backend возвращает структуру: { videos: [], pagination: {} }
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to load video feed: ${e.message}');
    }
  }

  @override
  Future<VideoModel> getVideoById(int id) async {
    try {
      final response = await dioClient.get(
        ApiEndpoints.withId(ApiEndpoints.videoDetail, id.toString()),
      );

      return VideoModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Failed to load video: ${e.message}');
    }
  }

  @override
  Future<Map<String, dynamic>> likeVideo(int id) async {
    try {
      final response = await dioClient.post(
        ApiEndpoints.withId(ApiEndpoints.videoLike, id.toString()),
      );

      // Backend возвращает: { likes_count: int, is_liked: bool }
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to like video: ${e.message}');
    }
  }

  @override
  Future<Map<String, dynamic>> unlikeVideo(int id) async {
    try {
      final response = await dioClient.post(
        ApiEndpoints.withId(ApiEndpoints.videoUnlike, id.toString()),
      );

      // Backend возвращает: { likes_count: int, is_liked: bool }
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to unlike video: ${e.message}');
    }
  }

  @override
  Future<void> favoriteVideo(int id) async {
    try {
      await dioClient.post(
        ApiEndpoints.withId(ApiEndpoints.videoFavorite, id.toString()),
      );
    } on DioException catch (e) {
      throw Exception('Failed to favorite video: ${e.message}');
    }
  }

  @override
  Future<void> unfavoriteVideo(int id) async {
    try {
      await dioClient.post(
        ApiEndpoints.withId(ApiEndpoints.videoUnfavorite, id.toString()),
      );
    } on DioException catch (e) {
      throw Exception('Failed to unfavorite video: ${e.message}');
    }
  }

  @override
  Future<void> viewVideo(int id, int duration) async {
    try {
      await dioClient.post(
        ApiEndpoints.withId(ApiEndpoints.videoViews, id.toString()),
        data: {'duration': duration},
      );
    } on DioException catch (e) {
      throw Exception('Failed to record view: ${e.message}');
    }
  }

  @override
  Future<void> followAuthor(int authorId) async {
    try {
      await dioClient.post(
        ApiEndpoints.withId(ApiEndpoints.channelSubscribe, authorId.toString()),
      );
    } on DioException catch (e) {
      throw Exception('Failed to follow author: ${e.message}');
    }
  }

  @override
  Future<void> unfollowAuthor(int authorId) async {
    try {
      await dioClient.post(
        ApiEndpoints.withId(ApiEndpoints.channelUnsubscribe, authorId.toString()),
      );
    } on DioException catch (e) {
      throw Exception('Failed to unfollow author: ${e.message}');
    }
  }

  @override
  Future<void> reportVideo(int videoId, String reason) async {
    try {
      await dioClient.post(
        ApiEndpoints.withId(ApiEndpoints.videoReport, videoId.toString()),
        data: {
          'reason': reason,
        },
      );
    } on DioException catch (e) {
      throw Exception('Failed to report video: ${e.message}');
    }
  }
  
  @override
  Future<List<VideoModel>> getFavoriteVideos() async {
    try {
      final response = await dioClient.get(ApiEndpoints.profileFavorites);
      final List<dynamic> data = response.data['videos'] ?? [];
      return data.map((json) => VideoModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw Exception('Failed to get favorites: ${e.message}');
    }
  }
  
  @override
  Future<List<VideoModel>> getMyVideos() async {
    try {
      final response = await dioClient.get(ApiEndpoints.profileVideos);
      final List<dynamic> data = response.data['videos'] ?? [];
      return data.map((json) => VideoModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw Exception('Failed to get my videos: ${e.message}');
    }
  }
}

