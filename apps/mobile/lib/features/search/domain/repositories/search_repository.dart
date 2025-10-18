import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/search_result_entity.dart';

/// Repository interface для поиска
abstract class SearchRepository {
  /// Поиск
  Future<Either<Failure, List<SearchResultEntity>>> search({
    required String query,
    String? filter,
    String? region,
    String? sortBy,
    int limit = 20,
    int offset = 0,
  });
  
  /// Получить подсказки
  Future<Either<Failure, List<String>>> getSuggestions(String query);
  
  /// Получить историю поиска
  Future<Either<Failure, List<String>>> getSearchHistory();
  
  /// Добавить в историю
  Future<Either<Failure, void>> addToHistory(String query);
  
  /// Очистить историю
  Future<Either<Failure, void>> clearHistory();
  
  /// Удалить из истории
  Future<Either<Failure, void>> removeFromHistory(String query);
}

