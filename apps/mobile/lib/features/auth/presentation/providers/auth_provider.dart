import 'package:flutter_riverpod/flutter_riverpod.dart';
// Rolled back to Riverpod 2.x - no annotations needed
import '../../../../core/di/injection.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import 'auth_state.dart';

// part 'auth_provider.g.dart'; // Not needed in Riverpod 2.x

// Providers для DI
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return getIt<AuthRepository>();
});

final loginUseCaseProvider = Provider<LoginUseCase>((ref) {
  return LoginUseCase(ref.watch(authRepositoryProvider));
});

final registerUseCaseProvider = Provider<RegisterUseCase>((ref) {
  return RegisterUseCase(ref.watch(authRepositoryProvider));
});

final logoutUseCaseProvider = Provider<LogoutUseCase>((ref) {
  return LogoutUseCase(ref.watch(authRepositoryProvider));
});

// Main auth provider - Riverpod 2.x: StateNotifier
class AuthNotifier extends StateNotifier<AuthState> {
  late final LoginUseCase _loginUseCase;
  late final RegisterUseCase _registerUseCase;
  late final LogoutUseCase _logoutUseCase;
  late final AuthRepository _repository;

  AuthNotifier({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required LogoutUseCase logoutUseCase,
    required AuthRepository repository,
  })  : _loginUseCase = loginUseCase,
        _registerUseCase = registerUseCase,
        _logoutUseCase = logoutUseCase,
        _repository = repository,
        super(const AuthInitial()) {
    _checkAuthStatus();
  }

  /// Проверить статус авторизации при старте
  Future<void> _checkAuthStatus() async {
    state = const AuthLoading();

    final isLoggedInResult = await _repository.isLoggedIn();

    await isLoggedInResult.fold(
      (failure) async => state = const Unauthenticated(),
      (isLoggedIn) async {
        if (!isLoggedIn) {
          state = const Unauthenticated();
          return;
        }

        // Получаем данные пользователя
        final userResult = await _repository.getCurrentUser();
        userResult.fold(
          (failure) => state = const Unauthenticated(),
          (user) => state = Authenticated(user),
        );
      },
    );
  }

  /// Вход
  Future<void> login({
    required String emailOrPhone,
    required String password,
  }) async {
    state = const AuthLoading();

    final result = await _loginUseCase(
      emailOrPhone: emailOrPhone,
      password: password,
    );

    result.fold(
      (failure) => state = AuthError(failure.message),
      (user) => state = Authenticated(user),
    );
  }

  /// Регистрация
  Future<void> register({
    required String emailOrPhone,
    required String password,
    String? username,
  }) async {
    state = const AuthLoading();

    final result = await _registerUseCase(
      emailOrPhone: emailOrPhone,
      password: password,
      username: username,
    );

    result.fold(
      (failure) => state = AuthError(failure.message),
      (user) => state = Authenticated(user),
    );
  }

  /// Выход
  Future<void> logout() async {
    await _logoutUseCase();
    state = const Unauthenticated();
  }

  /// Очистить ошибку
  void clearError() {
    if (state is AuthError) {
      state = const Unauthenticated();
    }
  }

  /// Сброс пароля
  Future<void> resetPassword({required String email}) async {
    state = const AuthLoading();
    await Future.delayed(const Duration(seconds: 1));
    state = const Unauthenticated();
  }

  /// Вход через Google
  Future<void> signInWithGoogle() async {
    state = const AuthLoading();
    try {
      // TODO: Implement Google Sign In with google_sign_in package
      // For now, show error that it's not implemented
      state = const AuthError('Google Sign In not implemented yet. Please use email/password login.');
    } catch (e) {
      state = AuthError('Google Sign In failed: $e');
    }
  }

  /// Вход через Apple
  Future<void> signInWithApple() async {
    state = const AuthLoading();
    try {
      // TODO: Implement Apple Sign In with sign_in_with_apple package
      // For now, show error that it's not implemented
      state = const AuthError('Apple Sign In not implemented yet. Please use email/password login.');
    } catch (e) {
      state = AuthError('Apple Sign In failed: $e');
    }
  }
}

