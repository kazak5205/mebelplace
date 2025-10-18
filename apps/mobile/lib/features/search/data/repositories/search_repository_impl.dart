import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/exceptions.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/repositories/search_repository.dart';
import '../sources/search_remote_data_source.dart';
import '../sources/search_local_data_source.dart';

class SearchRepositoryImpl implements SearchRepository {
  final SearchRemoteDataSource remoteDataSource;
  final SearchLocalDataSource localDataSource;

  SearchRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, List<SearchResultEntity>>> search({
    required String query,
    String? filter,
    String? region,
    String? sortBy,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      // Добавляем в историю
      await localDataSource.addToHistory(query);
      
      // Ищем на сервере
      final models = await remoteDataSource.search(
        query: query,
        filter: filter,
        region: region,
        sortBy: sortBy,
        limit: limit,
        offset: offset,
      );

      // Конвертируем в entities
      final entities = List<SearchResultEntity>.from(
        models.map((model) => model.toEntity())
      );

      return Right(entities);
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<String>>> getSuggestions(String query) async {
    try {
      final suggestions = await remoteDataSource.getSuggestions(query);
      return Right(suggestions);
    } catch (e) {
      // Не критично, возвращаем пустой список
      return const Right([]);
    }
  }

  @override
  Future<Either<Failure, List<String>>> getSearchHistory() async {
    try {
      final history = await localDataSource.getSearchHistory();
      return Right(history);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> addToHistory(String query) async {
    try {
      await localDataSource.addToHistory(query);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> clearHistory() async {
    try {
      await localDataSource.clearHistory();
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> removeFromHistory(String query) async {
    try {
      await localDataSource.removeFromHistory(query);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }
}

