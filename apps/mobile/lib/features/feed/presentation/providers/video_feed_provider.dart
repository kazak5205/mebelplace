import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../domain/entities/video_entity.dart';
import '../../domain/repositories/video_repository.dart';
import '../../data/models/video_model.dart';

// Repository provider
final videoRepositoryProvider = Provider<VideoRepository>((ref) {
  return getIt<VideoRepository>();
});

// Video feed state
sealed class VideoFeedState {
  // Common getters for backward compatibility
  bool get isLoading => this is VideoFeedLoading;
  String? get error => this is VideoFeedError ? (this as VideoFeedError).message : null;
  List get videos => this is VideoFeedLoaded ? (this as VideoFeedLoaded).videos : [];
}
class VideoFeedInitial extends VideoFeedState {}
class VideoFeedLoading extends VideoFeedState {}
class VideoFeedLoaded extends VideoFeedState {
  final List videos;
  final bool hasMore;
  VideoFeedLoaded(this.videos, {this.hasMore = true});
}
class VideoFeedError extends VideoFeedState {
  final String message;
  VideoFeedError(this.message);
}

// Video Feed Notifier
class VideoFeedNotifier extends StateNotifier<VideoFeedState> {
  final VideoRepository _repository;
  int _currentPage = 0;
  static const int _pageSize = 20;

  VideoFeedNotifier(this._repository) : super(VideoFeedInitial()) {
    loadFeed();
  }

  Future<void> loadFeed({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 0;
      state = VideoFeedLoading();
    }

    try {
      final result = await _repository.getVideoFeed(
        page: _currentPage + 1,
        limit: _pageSize,
      );
      
      result.fold(
        (failure) => state = VideoFeedError(failure.message),
        (response) {
          final videos = (response['videos'] as List)
              .map((json) => VideoModel.fromJson(json as Map<String, dynamic>).toEntity())
              .toList();
          _currentPage++;
          state = VideoFeedLoaded(videos, hasMore: videos.length >= _pageSize);
        },
      );
    } catch (e) {
      state = VideoFeedError('Failed to load feed: $e');
    }
  }

  Future<void> loadMore() async {
    if (state is! VideoFeedLoaded) return;
    final currentState = state as VideoFeedLoaded;
    if (!currentState.hasMore) return;

    try {
      final result = await _repository.getVideoFeed(
        page: _currentPage + 1,
        limit: _pageSize,
      );
      
      result.fold(
        (failure) {}, // Игнорируем ошибки при подгрузке
        (response) {
          final newVideos = (response['videos'] as List)
              .map((json) => VideoModel.fromJson(json as Map<String, dynamic>).toEntity())
              .toList();
          _currentPage++;
          final allVideos = [...currentState.videos, ...newVideos];
          state = VideoFeedLoaded(allVideos, hasMore: newVideos.length >= _pageSize);
        },
      );
    } catch (e) {
      // Игнорируем ошибки при loadMore
    }
  }

  Future<void> loadSubscriptionVideos() async {
    state = VideoFeedLoading();

    state = VideoFeedLoaded([], hasMore: false);
  }

  Future<void> getFavoriteVideos(String userId) async {
    state = VideoFeedLoading();
    
    state = VideoFeedLoaded([], hasMore: false);
  }

  Future<void> toggleLike(String videoId) async {
    if (state is VideoFeedLoaded) {
      final currentState = state as VideoFeedLoaded;
      final videos = List.from(currentState.videos);
      
      // Находим видео
      final index = videos.indexWhere((v) => v.id == videoId);
      if (index == -1) return;
      
      final video = videos[index] as VideoEntity;
      final isLiked = video.isLiked ?? false;
      
      // Оптимистичное обновление UI
      final updatedVideo = video.copyWith(
        isLiked: !isLiked,
        likesCount: isLiked ? video.likesCount - 1 : video.likesCount + 1,
      );
      
      videos[index] = updatedVideo;
      state = VideoFeedLoaded(videos, hasMore: currentState.hasMore);
      
      // API вызов
      try {
        if (isLiked) {
          await _repository.unlikeVideo(int.parse(videoId));
        } else {
          await _repository.likeVideo(int.parse(videoId));
        }
      } catch (e) {
        // Откатываем при ошибке
        videos[index] = video;
        state = VideoFeedLoaded(videos, hasMore: currentState.hasMore);
      }
    }
  }

  Future<void> toggleFavorite(String videoId) async {
    if (state is VideoFeedLoaded) {
      final currentState = state as VideoFeedLoaded;
      final videos = List.from(currentState.videos);
      
      final index = videos.indexWhere((v) => v.id == videoId);
      if (index == -1) return;
      
      final video = videos[index] as VideoEntity;
      final isFavorite = video.isFavorite;
      
      final updatedVideo = video.copyWith(
        isFavorite: !isFavorite,
      );
      
      videos[index] = updatedVideo;
      state = VideoFeedLoaded(videos, hasMore: currentState.hasMore);
      
      try {
        if (isFavorite) {
          await _repository.unfavoriteVideo(int.parse(videoId));
        } else {
          await _repository.favoriteVideo(int.parse(videoId));
        }
      } catch (e) {
        videos[index] = video;
        state = VideoFeedLoaded(videos, hasMore: currentState.hasMore);
      }
    }
  }

  Future<void> likeVideo(String videoId) async {
    await toggleLike(videoId);
  }

  Future<void> favoriteVideo(String videoId) async {
    await toggleFavorite(videoId);
  }

  /// Пожаловаться на видео (Google Play UGC requirement!)
  Future<bool> reportVideo(String videoId, String reason) async {
    try {
      final result = await _repository.reportVideo(int.parse(videoId), reason);
      return result.fold(
        (failure) => false,
        (_) => true,
      );
    } catch (e) {
      return false;
    }
  }
}

// Provider
final videoFeedProvider = StateNotifierProvider<VideoFeedNotifier, VideoFeedState>((ref) {
  return VideoFeedNotifier(ref.watch(videoRepositoryProvider));
});
