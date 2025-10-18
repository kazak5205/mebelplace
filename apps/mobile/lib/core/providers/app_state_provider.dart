import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/foundation.dart';
import '../api/unified_api_client.dart';

/// Упрощенное состояние приложения
class AppState {
  final bool isLoading;
  final bool isAuthenticated;
  final Map<String, dynamic>? user;
  final String? error;
  final List<dynamic> videos;
  final List<dynamic> chats;
  final List<dynamic> notifications;

  const AppState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.error,
    this.videos = const [],
    this.chats = const [],
    this.notifications = const [],
  });

  AppState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    Map<String, dynamic>? user,
    String? error,
    List<dynamic>? videos,
    List<dynamic>? chats,
    List<dynamic>? notifications,
  }) {
    return AppState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      error: error,
      videos: videos ?? this.videos,
      chats: chats ?? this.chats,
      notifications: notifications ?? this.notifications,
    );
  }
}

/// Провайдер состояния приложения
final appStateProvider = StateNotifierProvider<AppStateNotifier, AppState>((ref) {
  return AppStateNotifier();
});

class AppStateNotifier extends StateNotifier<AppState> {
  final _apiClient = UnifiedApiClient();

  AppStateNotifier() : super(const AppState()) {
    _checkAuthStatus();
  }

  /// Проверка статуса авторизации
  Future<void> _checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    try {
      // Сначала проверяем доступность API
      final isApiHealthy = await _apiClient.healthCheck();
      if (!isApiHealthy) {
        state = state.copyWith(isLoading: false, error: 'API недоступен');
        debugPrint('API health check failed');
        return;
      }
      
      final isAuth = await _apiClient.isAuthenticated();
      if (isAuth) {
        final user = await _apiClient.getCurrentUser();
        state = state.copyWith(
          isAuthenticated: true,
          user: user,
          isLoading: false,
        );
        debugPrint('User is authenticated: ${user?['email']}');
      } else {
        state = state.copyWith(isAuthenticated: false, isLoading: false);
        debugPrint('User is not authenticated');
      }
    } catch (e) {
      debugPrint('Error checking auth status: $e');
      state = state.copyWith(isAuthenticated: false, isLoading: false, error: 'Ошибка проверки авторизации: $e');
    }
  }

  /// Регистрация
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final result = await _apiClient.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
      );
      
      if (result != null) {
        final user = await _apiClient.getCurrentUser();
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: user,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Ошибка регистрации',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Вход
  Future<bool> login({
    required String emailOrPhone,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final result = await _apiClient.login(
        emailOrPhone: emailOrPhone,
        password: password,
      );
      
      if (result != null) {
        final user = await _apiClient.getCurrentUser();
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: user,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Ошибка входа',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Выход
  Future<void> logout() async {
    await _apiClient.logout();
    state = state.copyWith(
      isAuthenticated: false,
      user: null,
      videos: [],
      chats: [],
      notifications: [],
    );
  }

  /// Загрузка видео ленты
  Future<void> loadVideoFeed() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final videos = await _apiClient.getVideoFeed();
      state = state.copyWith(
        isLoading: false,
        videos: videos ?? [],
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Загрузка чатов
  Future<void> loadChats() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final chats = await _apiClient.getChats();
      state = state.copyWith(
        isLoading: false,
        chats: chats ?? [],
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Загрузка уведомлений
  Future<void> loadNotifications() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final notifications = await _apiClient.getNotifications();
      state = state.copyWith(
        isLoading: false,
        notifications: notifications ?? [],
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Лайк видео
  Future<void> likeVideo(String videoId) async {
    try {
      await _apiClient.likeVideo(videoId);
      // Обновляем локальное состояние
      final updatedVideos = List<dynamic>.from(state.videos);
      final videoIndex = updatedVideos.indexWhere((v) => v['id'] == videoId);
      if (videoIndex != -1) {
        updatedVideos[videoIndex]['is_liked'] = true;
        updatedVideos[videoIndex]['likes_count'] = 
            (updatedVideos[videoIndex]['likes_count'] ?? 0) + 1;
      }
      state = state.copyWith(videos: updatedVideos);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Убрать лайк с видео
  Future<void> unlikeVideo(String videoId) async {
    try {
      await _apiClient.unlikeVideo(videoId);
      // Обновляем локальное состояние
      final updatedVideos = List<dynamic>.from(state.videos);
      final videoIndex = updatedVideos.indexWhere((v) => v['id'] == videoId);
      if (videoIndex != -1) {
        updatedVideos[videoIndex]['is_liked'] = false;
        updatedVideos[videoIndex]['likes_count'] = 
            (updatedVideos[videoIndex]['likes_count'] ?? 1) - 1;
      }
      state = state.copyWith(videos: updatedVideos);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Очистка ошибки
  void clearError() {
    state = state.copyWith(error: null);
  }
}
