import '../../domain/entities/video_entity.dart';

/// Состояние ленты видео
sealed class VideoFeedState {
  const VideoFeedState();
}

/// Начальное состояние
class VideoFeedInitial extends VideoFeedState {
  const VideoFeedInitial();
}

/// Загрузка
class VideoFeedLoading extends VideoFeedState {
  const VideoFeedLoading();
}

/// Загружено
class VideoFeedLoaded extends VideoFeedState {
  final List<VideoEntity> videos;
  final bool hasMore;

  const VideoFeedLoaded(this.videos, {this.hasMore = true});
}

/// Ошибка
class VideoFeedError extends VideoFeedState {
  final String message;

  const VideoFeedError(this.message);
}

