import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../domain/entities/region_subscription_entity.dart';
import '../../../../core/config/api_config.dart';

sealed class RegionSubscriptionsState {}
class RegionSubscriptionsInitial extends RegionSubscriptionsState {}
class RegionSubscriptionsLoading extends RegionSubscriptionsState {}
class RegionSubscriptionsLoaded extends RegionSubscriptionsState {
  final List<RegionSubscriptionEntity> subscriptions;
  RegionSubscriptionsLoaded(this.subscriptions);
}
class RegionSubscriptionsError extends RegionSubscriptionsState {
  final String message;
  RegionSubscriptionsError(this.message);
}

class RegionSubscriptionsNotifier extends StateNotifier<RegionSubscriptionsState> {
  final _storage = const FlutterSecureStorage();

  RegionSubscriptionsNotifier() : super(RegionSubscriptionsInitial());

  Future<void> loadRegionSubscriptions() async {
    state = RegionSubscriptionsLoading();
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) {
        state = RegionSubscriptionsError('Not authenticated');
        return;
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/subscriptions/regions'),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> items = data['subscriptions'] ?? [];
        final subscriptions = items.map((item) => RegionSubscriptionEntity(
          id: item['id']?.toString() ?? '',
          userId: item['user_id']?.toString() ?? '',
          region: item['region'] as String,
          enabled: item['enabled'] as bool? ?? true,
          createdAt: DateTime.parse(item['created_at'] as String),
        )).toList();
        state = RegionSubscriptionsLoaded(subscriptions);
      } else {
        state = RegionSubscriptionsError('Failed to load');
      }
    } catch (e) {
      state = RegionSubscriptionsError(e.toString());
    }
  }

  Future<void> subscribe(String region) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/subscriptions/regions/${Uri.encodeComponent(region)}'),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
      );
      await loadRegionSubscriptions();
    } catch (e) {
      state = RegionSubscriptionsError(e.toString());
    }
  }

  Future<void> unsubscribe(String region) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      await http.delete(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/subscriptions/regions/${Uri.encodeComponent(region)}'),
        headers: {'Authorization': 'Bearer $token'},
      );
      await loadRegionSubscriptions();
    } catch (e) {
      state = RegionSubscriptionsError(e.toString());
    }
  }
}

final regionSubscriptionsProvider = 
    StateNotifierProvider<RegionSubscriptionsNotifier, RegionSubscriptionsState>((ref) {
  return RegionSubscriptionsNotifier();
});


