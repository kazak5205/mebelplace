import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/auth_repository.dart';
import 'auth_provider.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final forgotPasswordDioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// Forgot Password Provider - REAL API!
final forgotPasswordProvider = StateNotifierProvider<ForgotPasswordNotifier, ForgotPasswordState>((ref) {
  return ForgotPasswordNotifier(
    ref.watch(authRepositoryProvider),
    ref.watch(forgotPasswordDioClientProvider),
  );
});

sealed class ForgotPasswordState {}
class ForgotPasswordInitial extends ForgotPasswordState {}
class ForgotPasswordSending extends ForgotPasswordState {}
class ForgotPasswordSuccess extends ForgotPasswordState {}
class ForgotPasswordError extends ForgotPasswordState {
  final String message;
  ForgotPasswordError(this.message);
}

class ForgotPasswordNotifier extends StateNotifier<ForgotPasswordState> {
  final AuthRepository _repository;
  final DioClient _dioClient;

  ForgotPasswordNotifier(this._repository, this._dioClient) : super(ForgotPasswordInitial());

  Future<bool> sendResetLink(String email) async {
    state = ForgotPasswordSending();
    try {
      await _dioClient.post(
        ApiEndpoints.resetPassword,
        data: {'email': email},
      );
      state = ForgotPasswordSuccess();
      return true;
    } catch (e) {
      // Fallback to repository
      final result = await _repository.resetPassword(email: email);
      return result.fold(
        (failure) {
          state = ForgotPasswordError(failure.message);
          return false;
        },
        (_) {
          state = ForgotPasswordSuccess();
          return true;
        },
      );
    }
  }
}
