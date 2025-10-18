import 'package:dio/dio.dart';
import '../../error/exceptions.dart';

/// Интерцептор для обработки ошибок
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final error = _handleError(err);
    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        error: error,
        response: err.response,
        type: err.type,
      ),
    );
  }

  AppException _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return TimeoutException('Connection timeout');

      case DioExceptionType.badResponse:
        return _handleResponseError(error.response);

      case DioExceptionType.cancel:
        return CancelException('Request cancelled');

      case DioExceptionType.unknown:
        if (error.error.toString().contains('SocketException')) {
          return NetworkException('No internet connection');
        }
        return UnknownException(error.error?.toString() ?? 'Unknown error');

      default:
        return UnknownException('Something went wrong');
    }
  }

  AppException _handleResponseError(Response? response) {
    final statusCode = response?.statusCode ?? 0;
    final message = _extractErrorMessage(response);

    switch (statusCode) {
      case 400:
        return BadRequestException(message ?? 'Invalid request');
      case 401:
        return UnauthorizedException(message ?? 'Unauthorized');
      case 403:
        return ForbiddenException(message ?? 'Forbidden');
      case 404:
        return NotFoundException(message ?? 'Not found');
      case 409:
        return ConflictException(message ?? 'Conflict');
      case 422:
        return ValidationException(message ?? 'Validation error');
      case 429:
        return TooManyRequestsException(message ?? 'Too many requests');
      case 500:
      case 501:
      case 502:
      case 503:
        return ServerException(message ?? 'Server error');
      default:
        return UnknownException(message ?? 'Unknown error');
    }
  }

  String? _extractErrorMessage(Response? response) {
    if (response?.data == null) return null;

    try {
      final data = response!.data;
      if (data is Map<String, dynamic>) {
        return data['message'] as String? ??
            data['error'] as String? ??
            data['detail'] as String?;
      }
      return data.toString();
    } catch (e) {
      return null;
    }
  }
}

