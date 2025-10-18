import 'package:equatable/equatable.dart';

/// Базовый класс для Failure (используется в Clean Architecture)
abstract class Failure extends Equatable {
  final String message;
  final int? code;

  const Failure(this.message, [this.code]);

  @override
  List<Object?> get props => [message, code];

  @override
  String toString() => message;
}

/// Сетевые ошибки
class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class TimeoutFailure extends Failure {
  const TimeoutFailure(super.message);
}

/// HTTP ошибки
class BadRequestFailure extends Failure {
  const BadRequestFailure(String message) : super(message, 400);
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure(String message) : super(message, 401);
}

class ForbiddenFailure extends Failure {
  const ForbiddenFailure(String message) : super(message, 403);
}

class NotFoundFailure extends Failure {
  const NotFoundFailure(String message) : super(message, 404);
}

class ValidationFailure extends Failure {
  final Map<String, dynamic>? errors;
  
  const ValidationFailure(String message, [this.errors]) : super(message, 422);
  
  @override
  List<Object?> get props => [message, code, errors];
}

class ServerFailure extends Failure {
  const ServerFailure(String message) : super(message, 500);
}

class UnknownFailure extends Failure {
  const UnknownFailure(super.message);
}

/// Локальные ошибки
class CacheFailure extends Failure {
  const CacheFailure(super.message);
}

class DatabaseFailure extends Failure {
  const DatabaseFailure(super.message);
}

class ParseFailure extends Failure {
  const ParseFailure(super.message);
}

class ConflictFailure extends Failure {
  const ConflictFailure(String message) : super(message, 409);
}

