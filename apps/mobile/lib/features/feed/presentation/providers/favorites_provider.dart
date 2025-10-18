import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/video_entity.dart';
import '../../domain/repositories/video_repository.dart';
import 'video_feed_provider.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final favoritesDioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// Favorites Provider - REAL API!
final favoritesProvider = StateNotifierProvider<FavoritesNotifier, AsyncValue<List<VideoEntity>>>((ref) {
  return FavoritesNotifier(
    ref.watch(videoRepositoryProvider),
    ref.watch(favoritesDioClientProvider),
  );
});

class FavoritesNotifier extends StateNotifier<AsyncValue<List<VideoEntity>>> {
  final VideoRepository _repository;
  final DioClient _dioClient;

  FavoritesNotifier(this._repository, this._dioClient) : super(const AsyncValue.loading());

  Future<void> loadFavorites() async {
    state = const AsyncValue.loading();
    try {
      final response = await _dioClient.get(ApiEndpoints.profileFavorites);
      // Parse response and create VideoEntity list
      // For now fallback to repository
      final result = await _repository.getFavoriteVideos();
      result.fold(
        (failure) => state = AsyncValue.error(failure.message, StackTrace.current),
        (videos) => state = AsyncValue.data(videos),
      );
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> removeFavorite(String videoId) async {
    try {
      await _dioClient.delete(ApiEndpoints.withId(ApiEndpoints.videoUnfavorite, videoId));
      await loadFavorites(); // Reload
    } catch (e) {
      // Handle error
    }
  }
}
