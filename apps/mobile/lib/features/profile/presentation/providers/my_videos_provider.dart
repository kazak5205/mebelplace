import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../feed/domain/entities/video_entity.dart';
import '../../../feed/domain/repositories/video_repository.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final myVideosDioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// My Videos Provider - REAL API!
final myVideosProvider = StateNotifierProvider<MyVideosNotifier, AsyncValue<List<VideoEntity>>>((ref) {
  return MyVideosNotifier(
    getIt<VideoRepository>(),
    ref.watch(myVideosDioClientProvider),
  );
});

class MyVideosNotifier extends StateNotifier<AsyncValue<List<VideoEntity>>> {
  final VideoRepository _repository;
  final DioClient _dioClient;

  MyVideosNotifier(this._repository, this._dioClient) : super(const AsyncValue.loading());

  Future<void> loadMyVideos() async {
    state = const AsyncValue.loading();
    try {
      final response = await _dioClient.get(ApiEndpoints.profileVideos);
      // Try using repository (it should call API)
      final result = await _repository.getMyVideos();
      result.fold(
        (failure) => state = AsyncValue.error(failure.message, StackTrace.current),
        (videos) => state = AsyncValue.data(videos),
      );
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> deleteVideo(String videoId) async {
    try {
      await _dioClient.delete(ApiEndpoints.withId(ApiEndpoints.videoDetail, videoId));
      await loadMyVideos(); // Reload
    } catch (e) {
      // Handle error
    }
  }
}
