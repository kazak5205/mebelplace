import '../../domain/entities/user_entity.dart';

/// Состояние авторизации
sealed class AuthState {
  const AuthState();
}

/// Начальное состояние
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// Загрузка
class AuthLoading extends AuthState {
  const AuthLoading();
}

/// Авторизован
class Authenticated extends AuthState {
  final UserEntity user;

  const Authenticated(this.user);
}

/// Не авторизован
class Unauthenticated extends AuthState {
  const Unauthenticated();
}

/// Ошибка
class AuthError extends AuthState {
  final String message;

  const AuthError(this.message);
}

