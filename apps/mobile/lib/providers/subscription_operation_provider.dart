import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Subscription Operation Provider
/// Простой провайдер для операций с подписками
class SubscriptionOperationNotifier extends StateNotifier<bool> {
  SubscriptionOperationNotifier() : super(false);

  Future<void> subscribe(String type, String id) async {
    state = true;
    try {
      // Здесь будет логика подписки
      await Future.delayed(const Duration(seconds: 1));
    } finally {
      state = false;
    }
  }

  Future<void> unsubscribe(String type, String id) async {
    state = true;
    try {
      // Здесь будет логика отписки
      await Future.delayed(const Duration(seconds: 1));
    } finally {
      state = false;
    }
  }
}

final subscriptionOperationProvider = StateNotifierProvider<SubscriptionOperationNotifier, bool>((ref) {
  return SubscriptionOperationNotifier();
});

/// Subscription Operation Provider
/// Простой провайдер для операций с подписками
class SubscriptionOperationNotifier extends StateNotifier<bool> {
  SubscriptionOperationNotifier() : super(false);

  Future<void> subscribe(String type, String id) async {
    state = true;
    try {
      // Здесь будет логика подписки
      await Future.delayed(const Duration(seconds: 1));
    } finally {
      state = false;
    }
  }

  Future<void> unsubscribe(String type, String id) async {
    state = true;
    try {
      // Здесь будет логика отписки
      await Future.delayed(const Duration(seconds: 1));
    } finally {
      state = false;
    }
  }
}

final subscriptionOperationProvider = StateNotifierProvider<SubscriptionOperationNotifier, bool>((ref) {
  return SubscriptionOperationNotifier();
});






