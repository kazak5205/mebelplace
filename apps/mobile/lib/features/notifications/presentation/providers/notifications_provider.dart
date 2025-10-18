import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final notificationsDioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// Notifications Provider - REAL API!
final notificationsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dioClient = ref.watch(notificationsDioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.notifications);
    return (response.data['notifications'] as List?)?.cast<Map<String, dynamic>>() ?? [];
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load notifications: ${e.toString()}');
  }
});

/// Notifications Settings Provider - REAL API!
final notificationsSettingsProvider = StateNotifierProvider<NotificationsSettingsNotifier, Map<String, bool>>((ref) {
  return NotificationsSettingsNotifier(ref.watch(notificationsDioClientProvider));
});

class NotificationsSettingsNotifier extends StateNotifier<Map<String, bool>> {
  final DioClient _dioClient;

  NotificationsSettingsNotifier(this._dioClient) : super({
    'newRequests': true,
    'newProposals': true,
    'messages': true,
    'likesComments': false,
  }) {
    _load();
  }

  Future<void> _load() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.notificationSettings);
      state = response.data['settings'] ?? state;
    } catch (e) {
      // Use default
    }
  }

  Future<void> toggle(String key) async {
    state = {...state, key: !(state[key] ?? false)};
    
    try {
      await _dioClient.post(
        ApiEndpoints.notificationSettings,
        data: state,
      );
    } catch (e) {
      // Ignore error
    }
  }
}
