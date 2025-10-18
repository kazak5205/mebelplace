import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/search_result_entity.dart';
import '../repositories/search_repository.dart';

/// Use case для поиска
class SearchUseCase {
  final SearchRepository repository;

  SearchUseCase(this.repository);

  Future<Either<Failure, List<SearchResultEntity>>> call({
    required String query,
    String? filter,
    String? region,
    String? sortBy,
    int limit = 20,
    int offset = 0,
  }) {
    return repository.search(
      query: query,
      filter: filter,
      region: region,
      sortBy: sortBy,
      limit: limit,
      offset: offset,
    );
  }
}

