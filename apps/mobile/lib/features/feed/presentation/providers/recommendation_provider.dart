import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../domain/entities/video_entity.dart';
import '../../data/models/video_model.dart';
import '../../../../core/config/api_config.dart';

/// Recommendation algorithm state
sealed class RecommendationState {}

class RecommendationInitial extends RecommendationState {}

class RecommendationLoading extends RecommendationState {}

class RecommendationLoaded extends RecommendationState {
  final List<VideoEntity> forYouVideos;
  final List<VideoEntity> trendingVideos;
  final bool hasMore;

  RecommendationLoaded({
    required this.forYouVideos,
    required this.trendingVideos,
    this.hasMore = true,
  });

  RecommendationLoaded copyWith({
    List<VideoEntity>? forYouVideos,
    List<VideoEntity>? trendingVideos,
    bool? hasMore,
  }) {
    return RecommendationLoaded(
      forYouVideos: forYouVideos ?? this.forYouVideos,
      trendingVideos: trendingVideos ?? this.trendingVideos,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

class RecommendationError extends RecommendationState {
  final String message;
  RecommendationError(this.message);
}

/// Recommendation provider with collaborative filtering
class RecommendationNotifier extends StateNotifier<RecommendationState> {
  final _storage = const FlutterSecureStorage();
  int _currentPage = 0;
  static const int _pageSize = 20;

  RecommendationNotifier() : super(RecommendationInitial());

  /// Load personalized "For You" feed
  Future<void> loadForYouFeed({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 0;
      state = RecommendationLoading();
    }

    try {
      final token = await _storage.read(key: 'auth_token');
      
      // Build query parameters
      final queryParams = {
        'page': _currentPage.toString(),
        'limit': _pageSize.toString(),
        'algorithm': 'collaborative_filtering',
      };

      final uri = Uri.parse('${ApiConfig.baseUrl}/api/v2/recommendations/for-you')
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
        final List<dynamic> videosData = data['videos'] ?? [];
        final List<dynamic> trendingData = data['trending'] ?? [];

        final forYouVideos = videosData
            .map((v) => VideoModel.fromJson(v).toEntity())
            .toList();

        final trendingVideos = trendingData
            .map((v) => VideoModel.fromJson(v).toEntity())
            .toList();

        final hasMore = data['has_more'] as bool? ?? false;

        if (state is RecommendationLoaded && !refresh) {
          final current = state as RecommendationLoaded;
          state = current.copyWith(
            forYouVideos: [...current.forYouVideos, ...forYouVideos],
            hasMore: hasMore,
          );
        } else {
          state = RecommendationLoaded(
            forYouVideos: forYouVideos,
            trendingVideos: trendingVideos,
            hasMore: hasMore,
          );
        }

        _currentPage++;
      } else {
        state = RecommendationError('Failed to load recommendations: ${response.statusCode}');
      }
    } catch (e) {
      state = RecommendationError('Error loading recommendations: $e');
    }
  }

  /// Track user interaction for algorithm improvement
  Future<void> trackInteraction(
    String videoId,
    String interactionType, {
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/recommendations/track'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'video_id': videoId,
          'interaction_type': interactionType, // 'view', 'like', 'comment', 'share', 'skip'
          'timestamp': DateTime.now().toIso8601String(),
          'metadata': metadata ?? {},
        }),
      );
    } catch (e) {
      // Silently fail - don't interrupt user experience
    }
  }

  /// Get similar videos based on a video
  Future<List<VideoEntity>> getSimilarVideos(String videoId) async {
    try {
      final token = await _storage.read(key: 'auth_token');

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/recommendations/similar/$videoId'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> videosData = data['videos'] ?? [];
        
        return videosData
            .map((v) => VideoModel.fromJson(v).toEntity())
            .toList();
      }
    } catch (e) {
      // Return empty list on error
    }
    
    return [];
  }

  /// Load more videos
  Future<void> loadMore() async {
    if (state is! RecommendationLoaded) return;
    
    final current = state as RecommendationLoaded;
    if (!current.hasMore) return;

    await loadForYouFeed(refresh: false);
  }

  /// Refresh feed
  Future<void> refresh() async {
    await loadForYouFeed(refresh: true);
  }
}

final recommendationProvider = StateNotifierProvider<RecommendationNotifier, RecommendationState>((ref) {
  return RecommendationNotifier();
});


