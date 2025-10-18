import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/video_repository.dart';

/// Use case для лайка видео
class LikeVideoUseCase {
  final VideoRepository repository;

  LikeVideoUseCase(this.repository);

  Future<Either<Failure, Map<String, dynamic>>> call(int videoId, bool isLiked) {
    if (isLiked) {
      return repository.likeVideo(videoId);
    } else {
      return repository.unlikeVideo(videoId);
    }
  }
}

