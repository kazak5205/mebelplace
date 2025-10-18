import '../../domain/entities/search_result_entity.dart';

/// Состояние поиска
sealed class SearchState {
  const SearchState();
}

/// Начальное состояние
class SearchInitial extends SearchState {
  const SearchInitial();
}

/// Загрузка
class SearchLoading extends SearchState {
  const SearchLoading();
}

/// Результаты загружены
class SearchLoaded extends SearchState {
  final List<SearchResultEntity> results;
  final String query;
  final bool hasMore;

  const SearchLoaded({
    required this.results,
    required this.query,
    this.hasMore = true,
  });
}

/// Пустые результаты
class SearchEmpty extends SearchState {
  final String query;

  const SearchEmpty(this.query);
}

/// Ошибка
class SearchError extends SearchState {
  final String message;

  const SearchError(this.message);
}

