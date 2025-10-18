import 'package:hive/hive.dart';
import '../../../../core/constants/app_constants.dart';
import '../models/video_model.dart';

/// Local data source для видео (Hive cache)
abstract class VideoLocalDataSource {
  /// Получить кэшированные видео
  Future<List<VideoModel>> getCachedVideos();
  
  /// Кэшировать видео
  Future<void> cacheVideos(List<VideoModel> videos);
  
  /// Получить кэшированное видео по ID
  Future<VideoModel?> getCachedVideoById(int id);
  
  /// Кэшировать одно видео
  Future<void> cacheVideo(VideoModel video);
  
  /// Очистить кэш
  Future<void> clearCache();
  
  /// Обновить статус лайка
  Future<void> updateLikeStatus(String videoId, bool isLiked);
  
  /// Обновить статус избранного
  Future<void> updateFavoriteStatus(String videoId, bool isFavorite);
}

class VideoLocalDataSourceImpl implements VideoLocalDataSource {
  static const String _feedKey = 'video_feed';
  static const String _videosPrefix = 'video_';

  Future<Box> get _box async {
    return await Hive.openBox(AppConstants.videoCacheBox);
  }

  @override
  Future<List<VideoModel>> getCachedVideos() async {
    try {
      final box = await _box;
      final cached = box.get(_feedKey);
      
      if (cached == null) {
        return [];
      }

      if (cached is List) {
        return cached
            .map((json) => VideoModel.fromJson(Map<String, dynamic>.from(json as Map)))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  @override
  Future<void> cacheVideos(List<VideoModel> videos) async {
    try {
      final box = await _box;
      final jsonList = videos.map((v) => v.toJson()).toList();
      await box.put(_feedKey, jsonList);

      // Также кэшируем каждое видео отдельно для быстрого доступа по ID
      for (final video in videos) {
        await box.put('$_videosPrefix${video.id}', video.toJson());
      }
    } catch (e) {
      // Игнорируем ошибки кэширования
    }
  }

  @override
  Future<VideoModel?> getCachedVideoById(int id) async {
    try {
      final box = await _box;
      final cached = box.get('$_videosPrefix$id');
      
      if (cached == null) {
        return null;
      }

      return VideoModel.fromJson(Map<String, dynamic>.from(cached as Map));
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> cacheVideo(VideoModel video) async {
    try {
      final box = await _box;
      await box.put('$_videosPrefix${video.id}', video.toJson());
    } catch (e) {
      // Игнорируем ошибки кэширования
    }
  }

  @override
  Future<void> clearCache() async {
    try {
      final box = await _box;
      await box.clear();
    } catch (e) {
      // Игнорируем ошибки очистки
    }
  }

  @override
  Future<void> updateLikeStatus(String videoId, bool isLiked) async {
    try {
      final box = await _box;
      final key = '$_videosPrefix$videoId';
      final cached = box.get(key);
      
      if (cached != null) {
        final json = Map<String, dynamic>.from(cached as Map);
        json['is_liked'] = isLiked;
        
        // Обновляем счетчик лайков
        final currentLikes = json['likes_count'] as int? ?? 0;
        json['likes_count'] = isLiked ? currentLikes + 1 : currentLikes - 1;
        
        await box.put(key, json);
      }

      // Также обновляем в ленте
      await _updateInFeed(videoId, (json) {
        json['is_liked'] = isLiked;
        final currentLikes = json['likes_count'] as int? ?? 0;
        json['likes_count'] = isLiked ? currentLikes + 1 : currentLikes - 1;
      });
    } catch (e) {
      // Игнорируем ошибки обновления
    }
  }

  @override
  Future<void> updateFavoriteStatus(String videoId, bool isFavorite) async {
    try {
      final box = await _box;
      final key = '$_videosPrefix$videoId';
      final cached = box.get(key);
      
      if (cached != null) {
        final json = Map<String, dynamic>.from(cached as Map);
        json['is_favorite'] = isFavorite;
        await box.put(key, json);
      }

      // Также обновляем в ленте
      await _updateInFeed(videoId, (json) {
        json['is_favorite'] = isFavorite;
      });
    } catch (e) {
      // Игнорируем ошибки обновления
    }
  }

  Future<void> _updateInFeed(
    String videoId,
    void Function(Map<String, dynamic>) updater,
  ) async {
    try {
      final box = await _box;
      final cached = box.get(_feedKey);
      
      if (cached is List) {
        final videos = List.from(cached);
        for (var i = 0; i < videos.length; i++) {
          final json = Map<String, dynamic>.from(videos[i] as Map);
          if (json['id'] == videoId) {
            updater(json);
            videos[i] = json;
            await box.put(_feedKey, videos);
            break;
          }
        }
      }
    } catch (e) {
      // Игнорируем ошибки обновления
    }
  }
}

