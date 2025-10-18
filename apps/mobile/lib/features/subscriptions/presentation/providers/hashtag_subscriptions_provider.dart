import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../domain/entities/hashtag_subscription_entity.dart';
import '../../data/models/hashtag_subscription_model.dart';
import '../../../../core/config/api_config.dart';

sealed class HashtagSubscriptionsState {}

class HashtagSubscriptionsInitial extends HashtagSubscriptionsState {}
class HashtagSubscriptionsLoading extends HashtagSubscriptionsState {}
class HashtagSubscriptionsLoaded extends HashtagSubscriptionsState {
  final List<HashtagSubscriptionEntity> subscriptions;
  HashtagSubscriptionsLoaded(this.subscriptions);
}
class HashtagSubscriptionsError extends HashtagSubscriptionsState {
  final String message;
  HashtagSubscriptionsError(this.message);
}

class HashtagSubscriptionsNotifier extends StateNotifier<HashtagSubscriptionsState> {
  final _storage = const FlutterSecureStorage();

  HashtagSubscriptionsNotifier() : super(HashtagSubscriptionsInitial());

  Future<void> loadHashtagSubscriptions() async {
    state = HashtagSubscriptionsLoading();

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) {
        state = HashtagSubscriptionsError('Not authenticated');
        return;
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/subscriptions/hashtags'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> items = data['subscriptions'] ?? [];
        
        final subscriptions = items
            .map((item) => HashtagSubscriptionModel.fromJson(item).toEntity())
            .toList();

        state = HashtagSubscriptionsLoaded(subscriptions);
      } else {
        state = HashtagSubscriptionsError('Failed to load subscriptions');
      }
    } catch (e) {
      state = HashtagSubscriptionsError(e.toString());
    }
  }

  Future<void> subscribe(String hashtag) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/subscriptions/hashtags/${Uri.encodeComponent(hashtag)}'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        await loadHashtagSubscriptions();
      }
    } catch (e) {
      state = HashtagSubscriptionsError(e.toString());
    }
  }

  Future<void> unsubscribe(String hashtag) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      final response = await http.delete(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/subscriptions/hashtags/${Uri.encodeComponent(hashtag)}'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        await loadHashtagSubscriptions();
      }
    } catch (e) {
      state = HashtagSubscriptionsError(e.toString());
    }
  }

  Future<void> updateNotificationLevel(
    String hashtag,
    SubscriptionNotificationLevel level,
  ) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/subscriptions/hashtags/${Uri.encodeComponent(hashtag)}'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'notification_level': level.name,
        }),
      );

      if (response.statusCode == 200) {
        await loadHashtagSubscriptions();
      }
    } catch (e) {
      state = HashtagSubscriptionsError(e.toString());
    }
  }

  bool isSubscribed(String hashtag) {
    if (state is HashtagSubscriptionsLoaded) {
      final loaded = state as HashtagSubscriptionsLoaded;
      return loaded.subscriptions.any((s) => s.hashtag == hashtag);
    }
    return false;
  }
}

final hashtagSubscriptionsProvider = 
    StateNotifierProvider<HashtagSubscriptionsNotifier, HashtagSubscriptionsState>((ref) {
  return HashtagSubscriptionsNotifier();
});


