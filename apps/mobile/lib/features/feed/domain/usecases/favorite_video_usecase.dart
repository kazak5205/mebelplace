import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/video_repository.dart';

/// Use case для добавления в избранное
class FavoriteVideoUseCase {
  final VideoRepository repository;

  FavoriteVideoUseCase(this.repository);

  Future<Either<Failure, void>> call(int videoId, bool isFavorite) {
    if (isFavorite) {
      return repository.favoriteVideo(videoId);
    } else {
      return repository.unfavoriteVideo(videoId);
    }
  }
}

