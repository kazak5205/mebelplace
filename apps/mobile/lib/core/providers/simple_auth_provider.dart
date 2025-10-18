import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/simple_auth_service.dart';

/// Простое состояние аутентификации
class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final Map<String, dynamic>? user;
  final String? error;

  const AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    Map<String, dynamic>? user,
    String? error,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      error: error,
    );
  }
}

/// Простой провайдер аутентификации
class SimpleAuthNotifier extends StateNotifier<AuthState> {
  final SimpleAuthService _authService = SimpleAuthService();

  SimpleAuthNotifier() : super(const AuthState()) {
    _checkAuthStatus();
  }

  /// Проверка статуса авторизации
  Future<void> _checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    
    final isLoggedIn = await _authService.isLoggedIn();
    if (isLoggedIn) {
      final user = await _authService.getCurrentUser();
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: user != null,
        user: user,
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        user: null,
      );
    }
  }

  /// Регистрация
  Future<void> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await _authService.register(
      name: name,
      email: email,
      password: password,
      phone: phone,
    );

    if (result != null && result['user'] != null) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: result['user'],
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        error: 'Ошибка регистрации',
      );
    }
  }

  /// Вход
  Future<void> login({
    required String emailOrPhone,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await _authService.login(
      emailOrPhone: emailOrPhone,
      password: password,
    );

    if (result != null && result['user'] != null) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: result['user'],
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        error: 'Неверные учетные данные',
      );
    }
  }

  /// Выход
  Future<void> logout() async {
    await _authService.logout();
    state = state.copyWith(
      isAuthenticated: false,
      user: null,
      error: null,
    );
  }

  /// Очистка ошибки
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Провайдер для SimpleAuthNotifier
final simpleAuthProvider = StateNotifierProvider<SimpleAuthNotifier, AuthState>((ref) {
  return SimpleAuthNotifier();
});

/// Провайдер для SimpleAuthService
final simpleAuthServiceProvider = Provider<SimpleAuthService>((ref) {
  return SimpleAuthService();
});
