import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/exceptions.dart';
import '../../domain/entities/video_entity.dart';
import '../../domain/repositories/video_repository.dart';
import '../sources/video_remote_data_source.dart';
import '../sources/video_local_data_source.dart';
import '../models/video_model.dart';

class VideoRepositoryImpl implements VideoRepository {
  final VideoRemoteDataSource remoteDataSource;
  final VideoLocalDataSource localDataSource;

  VideoRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, Map<String, dynamic>>> getVideoFeed({
    int page = 1,
    int limit = 20,
    int? userId,
  }) async {
    try {
      // Пытаемся загрузить с сервера
      final response = await remoteDataSource.getVideoFeed(
        page: page,
        limit: limit,
        userId: userId,
      );

      // Backend возвращает: { videos: [], pagination: {} }
      final videos = (response['videos'] as List)
          .map((json) => VideoModel.fromJson(json as Map<String, dynamic>))
          .toList();

      // Кэшируем локально
      await localDataSource.cacheVideos(videos);

      return Right(response);
    } on NetworkException catch (e) {
      // При ошибке сети пытаемся загрузить из кэша
      try {
        final cachedModels = await localDataSource.getCachedVideos();
        if (cachedModels.isEmpty) {
          return Left(NetworkFailure(e.message));
        }
        
        // Создаем response структуру из кэша
        final response = {
          'videos': cachedModels.map((model) => model.toJson()).toList(),
          'pagination': {
            'page': page,
            'limit': limit,
            'total': cachedModels.length,
            'pages': 1,
            'has_next': false,
            'has_prev': false,
          }
        };
        
        return Right(response);
      } catch (_) {
        return Left(NetworkFailure(e.message));
      }
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, VideoEntity>> getVideoById(int id) async {
    try {
      // Сначала проверяем кэш
      final cachedModel = await localDataSource.getCachedVideoById(id);
      
      // Загружаем с сервера
      final model = await remoteDataSource.getVideoById(id);
      
      // Кэшируем
      await localDataSource.cacheVideo(model);
      
      return Right(model.toEntity());
    } on NotFoundException catch (e) {
      // Если не найдено на сервере, проверяем кэш
      try {
        final cachedModel = await localDataSource.getCachedVideoById(id);
        if (cachedModel != null) {
          return Right(cachedModel.toEntity());
        }
      } catch (_) {}
      return Left(NotFoundFailure(e.message));
    } on NetworkException catch (e) {
      // При ошибке сети возвращаем из кэша
      try {
        final cachedModel = await localDataSource.getCachedVideoById(id);
        if (cachedModel != null) {
          return Right(cachedModel.toEntity());
        }
      } catch (_) {}
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> likeVideo(int id) async {
    try {
      // Отправляем на сервер
      final response = await remoteDataSource.likeVideo(id);
      
          // Обновляем кэш с новыми данными
          await localDataSource.updateLikeStatus(id.toString(), true);
      
      return Right(response);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> unlikeVideo(int id) async {
    try {
      // Отправляем на сервер
      final response = await remoteDataSource.unlikeVideo(id);
      
          // Обновляем кэш с новыми данными
          await localDataSource.updateLikeStatus(id.toString(), false);
      
      return Right(response);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> favoriteVideo(int id) async {
    try {
      // Оптимистичное обновление кэша
      await localDataSource.updateFavoriteStatus(id.toString(), true);
      
      // Отправляем на сервер
      await remoteDataSource.favoriteVideo(id);
      
      return const Right(null);
    } catch (e) {
      // Откатываем изменения в кэше
      await localDataSource.updateFavoriteStatus(id.toString(), false);
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> unfavoriteVideo(int id) async {
    try {
      // Оптимистичное обновление кэша
      await localDataSource.updateFavoriteStatus(id.toString(), false);
      
      // Отправляем на сервер
      await remoteDataSource.unfavoriteVideo(id);
      
      return const Right(null);
    } catch (e) {
      // Откатываем изменения в кэше
      await localDataSource.updateFavoriteStatus(id.toString(), true);
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> viewVideo(int id, int duration) async {
    try {
      await remoteDataSource.viewVideo(id, duration);
      return const Right(null);
    } catch (e) {
      // Не критично, просто логируем
      return const Right(null);
    }
  }

  @override
  Future<Either<Failure, void>> followAuthor(int authorId) async {
    try {
      await remoteDataSource.followAuthor(authorId);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> unfollowAuthor(int authorId) async {
    try {
      await remoteDataSource.unfollowAuthor(authorId);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> reportVideo(int videoId, String reason) async {
    try {
      await remoteDataSource.reportVideo(videoId, reason);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, List<VideoEntity>>> getFavoriteVideos() async {
    try {
      final models = await remoteDataSource.getFavoriteVideos();
      final entities = models.map((model) => model.toEntity()).toList();
      return Right(entities);
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, List<VideoEntity>>> getMyVideos() async {
    try {
      final models = await remoteDataSource.getMyVideos();
      final entities = models.map((model) => model.toEntity()).toList();
      return Right(entities);
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }
}

