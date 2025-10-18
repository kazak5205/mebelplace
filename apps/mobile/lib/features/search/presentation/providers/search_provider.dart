import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/repositories/search_repository.dart';
import '../../domain/usecases/search_usecase.dart';
import '../../../../core/di/injection.dart';

/// State для поиска
class SearchState {
  final List<SearchResultEntity> results;
  final List<String> suggestions;
  final bool isLoading;
  final String? error;
  final String lastQuery;

  const SearchState({
    required this.results,
    required this.suggestions,
    required this.isLoading,
    this.error,
    required this.lastQuery,
  });

  const SearchState.initial()
      : results = const [],
        suggestions = const [],
        isLoading = false,
        error = null,
        lastQuery = '';

  SearchState copyWith({
    List<SearchResultEntity>? results,
    List<String>? suggestions,
    bool? isLoading,
    String? error,
    String? lastQuery,
  }) {
    return SearchState(
      results: results ?? this.results,
      suggestions: suggestions ?? this.suggestions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      lastQuery: lastQuery ?? this.lastQuery,
    );
  }
}

/// Notifier для управления поиском
class SearchNotifier extends StateNotifier<SearchState> {
  final SearchUseCase _searchUseCase;
  final SearchRepository _repository;

  SearchNotifier(this._searchUseCase, this._repository) 
      : super(const SearchState.initial());

  /// Выполнить поиск
  Future<void> search({
    required String query,
    String? filter,
    String? region,
    String? sortBy,
  }) async {
    if (query.trim().isEmpty) {
      state = const SearchState.initial();
      return;
    }

    state = state.copyWith(isLoading: true, error: null, lastQuery: query);

    final result = await _searchUseCase(
      query: query,
      filter: filter,
      region: region,
      sortBy: sortBy,
    );

    result.fold(
      (failure) => state = state.copyWith(
        isLoading: false,
        error: failure.message,
      ),
      (results) => state = state.copyWith(
        isLoading: false,
        results: results,
        error: null,
      ),
    );
  }

  /// Получить подсказки для автодополнения
  Future<void> loadSuggestions(String query) async {
    if (query.trim().isEmpty) {
      state = state.copyWith(suggestions: []);
      return;
    }

    final result = await _repository.getSuggestions(query);

    result.fold(
      (failure) => {}, // Игнорируем ошибки для suggestions
      (suggestions) => state = state.copyWith(suggestions: suggestions),
    );
  }

  /// Очистить результаты
  void clear() {
    state = const SearchState.initial();
  }

  /// Загрузить больше результатов (пагинация)
  Future<void> loadMore() async {
  }

  /// Очистить историю поиска
  Future<void> clearHistory() async {
  }

  /// Удалить запрос из истории
  Future<void> removeFromHistory(String query) async {
  }
}

/// Provider для SearchNotifier
final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  final searchUseCase = getIt<SearchUseCase>();
  final repository = getIt<SearchRepository>();
  return SearchNotifier(searchUseCase, repository);
});
