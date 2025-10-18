import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final gamificationDioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// Leaderboard Provider - REAL API!
final leaderboardProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dioClient = ref.watch(gamificationDioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.gamificationLeaderboard);
    return (response.data['leaders'] as List?)?.cast<Map<String, dynamic>>() ?? [];
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load leaderboard: ${e.toString()}');
  }
});

/// Achievements Provider - REAL API!
final achievementsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dioClient = ref.watch(gamificationDioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.gamificationAchievements);
    return (response.data['achievements'] as List?)?.cast<Map<String, dynamic>>() ?? [];
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load achievements: ${e.toString()}');
  }
});

/// User Stats Provider - REAL API!
final userStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dioClient = ref.watch(gamificationDioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.gamificationProfile);
    return response.data as Map<String, dynamic>;
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load user stats: ${e.toString()}');
  }
});
