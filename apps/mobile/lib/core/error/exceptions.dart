/// Базовый класс для всех исключений приложения
abstract class AppException implements Exception {
  final String message;
  final int? code;

  AppException(this.message, [this.code]);

  @override
  String toString() => message;
}

/// Сетевые исключения
class NetworkException extends AppException {
  NetworkException(super.message);
}

class TimeoutException extends AppException {
  TimeoutException(super.message);
}

class CancelException extends AppException {
  CancelException(super.message);
}

/// HTTP исключения
class BadRequestException extends AppException {
  BadRequestException(String message) : super(message, 400);
}

class UnauthorizedException extends AppException {
  UnauthorizedException(String message) : super(message, 401);
}

class ForbiddenException extends AppException {
  ForbiddenException(String message) : super(message, 403);
}

class NotFoundException extends AppException {
  NotFoundException(String message) : super(message, 404);
}

class ConflictException extends AppException {
  ConflictException(String message) : super(message, 409);
}

class ValidationException extends AppException {
  final Map<String, dynamic>? errors;
  
  ValidationException(String message, [this.errors]) : super(message, 422);
}

class TooManyRequestsException extends AppException {
  TooManyRequestsException(String message) : super(message, 429);
}

class ServerException extends AppException {
  ServerException(String message) : super(message, 500);
}

class UnknownException extends AppException {
  UnknownException(super.message);
}

/// Локальные исключения
class CacheException extends AppException {
  CacheException(super.message);
}

class DatabaseException extends AppException {
  DatabaseException(super.message);
}

class ParseException extends AppException {
  ParseException(super.message);
}

