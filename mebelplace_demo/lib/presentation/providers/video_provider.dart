import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/video_model.dart';
import '../../data/repositories/app_repositories.dart';
import 'repository_providers.dart';

// Video Provider
final videoProvider = StateNotifierProvider<VideoNotifier, VideoState>((ref) {
  final videoRepository = ref.watch(videoRepositoryProvider);
  return VideoNotifier(videoRepository);
});

class VideoNotifier extends StateNotifier<VideoState> {
  final VideoRepository _videoRepository;

  VideoNotifier(this._videoRepository) : super(VideoState.initial());

  Future<void> loadVideos() async {
    state = state.copyWith(isLoading: true);
    try {
      final videos = await _videoRepository.getVideos();
      state = state.copyWith(
        videos: videos,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> likeVideo(String videoId) async {
    try {
      await _videoRepository.likeVideo(videoId);
      // Update local state
      final updatedVideos = state.videos.map((video) {
        if (video.id == videoId) {
          return video.copyWith(
            isLiked: !video.isLiked,
            likesCount: video.isLiked ? video.likesCount - 1 : video.likesCount + 1,
          );
        }
        return video;
      }).toList();
      
      state = state.copyWith(videos: updatedVideos);
    } catch (e) {
      // Handle error
    }
  }

  Future<void> recordView(String videoId) async {
    try {
      await _videoRepository.recordView(videoId);
    } catch (e) {
      // Handle error silently
    }
  }
}

class VideoState {
  final List<VideoModel> videos;
  final bool isLoading;
  final String? error;

  VideoState({
    required this.videos,
    required this.isLoading,
    this.error,
  });

  factory VideoState.initial() {
    return VideoState(
      videos: [],
      isLoading: false,
      error: null,
    );
  }

  VideoState copyWith({
    List<VideoModel>? videos,
    bool? isLoading,
    String? error,
  }) {
    return VideoState(
      videos: videos ?? this.videos,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}
