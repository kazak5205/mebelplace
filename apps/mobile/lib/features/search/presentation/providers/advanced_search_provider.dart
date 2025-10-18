import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import '../../../feed/domain/entities/video_entity.dart';
import '../../../feed/data/models/video_model.dart';
import '../../../../core/config/api_config.dart';

/// Search suggestions state
sealed class SearchSuggestionsState {}

class SearchSuggestionsInitial extends SearchSuggestionsState {}

class SearchSuggestionsLoading extends SearchSuggestionsState {}

class SearchSuggestionsLoaded extends SearchSuggestionsState {
  final List<String> suggestions;
  final List<String> recentSearches;

  SearchSuggestionsLoaded({
    required this.suggestions,
    required this.recentSearches,
  });
}

class SearchSuggestionsError extends SearchSuggestionsState {
  final String message;
  SearchSuggestionsError(this.message);
}

/// Advanced search filters
class SearchFilters {
  final String? region;
  final String? category;
  final int? minRating;
  final int? maxPrice;
  final int? minPrice;
  final bool? onlineOnly;
  final String? sortBy; // 'relevance', 'date', 'rating', 'price'

  const SearchFilters({
    this.region,
    this.category,
    this.minRating,
    this.maxPrice,
    this.minPrice,
    this.onlineOnly,
    this.sortBy,
  });

  SearchFilters copyWith({
    String? region,
    String? category,
    int? minRating,
    int? maxPrice,
    int? minPrice,
    bool? onlineOnly,
    String? sortBy,
  }) {
    return SearchFilters(
      region: region ?? this.region,
      category: category ?? this.category,
      minRating: minRating ?? this.minRating,
      maxPrice: maxPrice ?? this.maxPrice,
      minPrice: minPrice ?? this.minPrice,
      onlineOnly: onlineOnly ?? this.onlineOnly,
      sortBy: sortBy ?? this.sortBy,
    );
  }

  Map<String, String> toQueryParams() {
    final params = <String, String>{};
    if (region != null) params['region'] = region!;
    if (category != null) params['category'] = category!;
    if (minRating != null) params['min_rating'] = minRating.toString();
    if (maxPrice != null) params['max_price'] = maxPrice.toString();
    if (minPrice != null) params['min_price'] = minPrice.toString();
    if (onlineOnly != null) params['online_only'] = onlineOnly.toString();
    if (sortBy != null) params['sort_by'] = sortBy!;
    return params;
  }
}

/// Search results state
sealed class AdvancedSearchState {}

class AdvancedSearchInitial extends AdvancedSearchState {}

class AdvancedSearchLoading extends AdvancedSearchState {}

class AdvancedSearchLoaded extends AdvancedSearchState {
  final List<VideoEntity> videos;
  final List<MasterSearchResult> masters;
  final SearchFilters activeFilters;
  final bool hasMore;

  AdvancedSearchLoaded({
    required this.videos,
    required this.masters,
    required this.activeFilters,
    this.hasMore = false,
  });

  AdvancedSearchLoaded copyWith({
    List<VideoEntity>? videos,
    List<MasterSearchResult>? masters,
    SearchFilters? activeFilters,
    bool? hasMore,
  }) {
    return AdvancedSearchLoaded(
      videos: videos ?? this.videos,
      masters: masters ?? this.masters,
      activeFilters: activeFilters ?? this.activeFilters,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

class AdvancedSearchError extends AdvancedSearchState {
  final String message;
  AdvancedSearchError(this.message);
}

class MasterSearchResult {
  final String id;
  final String name;
  final String? avatar;
  final double rating;
  final int subscribersCount;
  final String? region;
  final bool isOnline;

  MasterSearchResult({
    required this.id,
    required this.name,
    this.avatar,
    required this.rating,
    required this.subscribersCount,
    this.region,
    required this.isOnline,
  });

  factory MasterSearchResult.fromJson(Map<String, dynamic> json) {
    return MasterSearchResult(
      id: json['id'].toString(),
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      subscribersCount: json['subscribers_count'] as int? ?? 0,
      region: json['region'] as String?,
      isOnline: json['is_online'] as bool? ?? false,
    );
  }
}

/// Suggestions provider
class SearchSuggestionsNotifier extends StateNotifier<SearchSuggestionsState> {
  final _storage = const FlutterSecureStorage();
  Timer? _debounceTimer;

  SearchSuggestionsNotifier() : super(SearchSuggestionsInitial());

  /// Get autocomplete suggestions with debounce
  void getSuggestions(String query) {
    _debounceTimer?.cancel();
    
    if (query.isEmpty) {
      _loadRecentSearches();
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _fetchSuggestions(query);
    });
  }

  Future<void> _fetchSuggestions(String query) async {
    state = SearchSuggestionsLoading();

    try {
      final token = await _storage.read(key: 'auth_token');

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/search/suggestions?q=$query'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<String> suggestions = (data['suggestions'] as List<dynamic>)
            .map((s) => s.toString())
            .toList();

        final recentSearches = await _getRecentSearches();

        state = SearchSuggestionsLoaded(
          suggestions: suggestions,
          recentSearches: recentSearches,
        );
      }
    } catch (e) {
      state = SearchSuggestionsError('Error loading suggestions: $e');
    }
  }

  Future<void> _loadRecentSearches() async {
    final recentSearches = await _getRecentSearches();
    state = SearchSuggestionsLoaded(
      suggestions: [],
      recentSearches: recentSearches,
    );
  }

  Future<List<String>> _getRecentSearches() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return [];

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/search/history'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['history'] as List<dynamic>)
            .map((s) => s.toString())
            .take(5)
            .toList();
      }
    } catch (e) {
      // Return empty on error
    }
    return [];
  }

  Future<void> addToHistory(String query) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/search/history'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'query': query}),
      );
    } catch (e) {
      // Silently fail
    }
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}

/// Advanced search provider
class AdvancedSearchNotifier extends StateNotifier<AdvancedSearchState> {
  final _storage = const FlutterSecureStorage();
  SearchFilters _currentFilters = const SearchFilters();

  AdvancedSearchNotifier() : super(AdvancedSearchInitial());

  Future<void> search(String query, {SearchFilters? filters}) async {
    state = AdvancedSearchLoading();
    _currentFilters = filters ?? const SearchFilters();

    try {
      final token = await _storage.read(key: 'auth_token');

      final queryParams = {
        'q': query,
        ..._currentFilters.toQueryParams(),
      };

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/v2/search')
          .replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        final List<VideoEntity> videos = (data['videos'] as List<dynamic>? ?? [])
            .map((v) => VideoModel.fromJson(v).toEntity())
            .toList();

        final List<MasterSearchResult> masters = (data['masters'] as List<dynamic>? ?? [])
            .map((m) => MasterSearchResult.fromJson(m))
            .toList();

        state = AdvancedSearchLoaded(
          videos: videos,
          masters: masters,
          activeFilters: _currentFilters,
          hasMore: data['has_more'] as bool? ?? false,
        );
      } else {
        state = AdvancedSearchError('Search failed: ${response.statusCode}');
      }
    } catch (e) {
      state = AdvancedSearchError('Error searching: $e');
    }
  }

  void updateFilters(SearchFilters filters) {
    _currentFilters = filters;
  }

  void clearFilters() {
    _currentFilters = const SearchFilters();
  }
}

final searchSuggestionsProvider = StateNotifierProvider<SearchSuggestionsNotifier, SearchSuggestionsState>((ref) {
  return SearchSuggestionsNotifier();
});

final advancedSearchProvider = StateNotifierProvider<AdvancedSearchNotifier, AdvancedSearchState>((ref) {
  return AdvancedSearchNotifier();
});


