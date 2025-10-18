import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/video_entity.dart';
import '../repositories/video_repository.dart';

/// Use case для получения ленты видео
class GetVideoFeedUseCase {
  final VideoRepository repository;

  GetVideoFeedUseCase(this.repository);

  Future<Either<Failure, Map<String, dynamic>>> call({
    int page = 1,
    int limit = 20,
    int? userId,
  }) {
    return repository.getVideoFeed(page: page, limit: limit, userId: userId);
  }
}

