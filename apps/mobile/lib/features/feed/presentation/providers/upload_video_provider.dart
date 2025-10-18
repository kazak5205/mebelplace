import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/video_repository.dart';
import 'video_feed_provider.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final uploadDioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// Upload Video Provider - REAL API!
final uploadVideoProvider = StateNotifierProvider<UploadVideoNotifier, UploadVideoState>((ref) {
  return UploadVideoNotifier(
    ref.watch(videoRepositoryProvider),
    ref.watch(uploadDioClientProvider),
  );
});

sealed class UploadVideoState {}
class UploadVideoInitial extends UploadVideoState {}
class UploadVideoUploading extends UploadVideoState {
  final double progress;
  UploadVideoUploading(this.progress);
}
class UploadVideoSuccess extends UploadVideoState {}
class UploadVideoError extends UploadVideoState {
  final String message;
  UploadVideoError(this.message);
}

class UploadVideoNotifier extends StateNotifier<UploadVideoState> {
  final VideoRepository _repository;
  final DioClient _dioClient;

  UploadVideoNotifier(this._repository, this._dioClient) : super(UploadVideoInitial());

  Future<void> uploadVideo({
    required String videoPath,
    required String title,
    required String description,
    List<String>? hashtags,
  }) async {
    state = UploadVideoUploading(0.0);

    try {
      // Upload video file with progress tracking
      await _dioClient.uploadFile(
        ApiEndpoints.videosUpload,
        videoPath,
        fileKey: 'video',
        data: {
          'title': title,
          'description': description,
          if (hashtags != null) 'hashtags': hashtags,
        },
      );
      
      state = UploadVideoSuccess();
    } catch (e) {
      state = UploadVideoError(e.toString());
    }
  }
}
