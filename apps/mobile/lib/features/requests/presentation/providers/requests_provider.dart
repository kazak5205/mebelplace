import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/request_entity.dart';
import '../../domain/repositories/request_repository.dart';
import '../../../../core/di/injection.dart';

/// State для заявок
class RequestsState {
  final List<RequestEntity> requests;
  final bool isLoading;
  final String? error;

  const RequestsState({
    required this.requests,
    required this.isLoading,
    this.error,
  });

  const RequestsState.initial()
      : requests = const [],
        isLoading = false,
        error = null;

  RequestsState copyWith({
    List<RequestEntity>? requests,
    bool? isLoading,
    String? error,
  }) {
    return RequestsState(
      requests: requests ?? this.requests,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Notifier для управления заявками
class RequestsNotifier extends StateNotifier<RequestsState> {
  final RequestRepository _repository;

  RequestsNotifier(this._repository) : super(const RequestsState.initial());

  /// Загрузить список заявок
  Future<void> loadRequests({RequestStatus? status}) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getRequests(
      status: status,
      limit: 50,
      offset: 0,
    );

    result.fold(
      (failure) => state = state.copyWith(
        isLoading: false,
        error: failure.message,
      ),
      (requests) => state = state.copyWith(
        isLoading: false,
        requests: requests,
        error: null,
      ),
    );
  }

  /// Создать новую заявку
  Future<bool> createRequest({
    required String title,
    required String description,
    required List<String> photos,
    required String region,
    double? budget,
    DateTime? deadline,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.createRequest(
      title: title,
      description: description,
      photos: photos,
      region: region,
      budget: budget,
      deadline: deadline,
    );

    return result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
        return false;
      },
      (request) {
        // Добавляем новую заявку в список
        final updatedRequests = [request, ...state.requests];
        state = state.copyWith(
          isLoading: false,
          requests: updatedRequests,
          error: null,
        );
        return true;
      },
    );
  }

  /// Откликнуться на заявку (для мастеров)
  Future<bool> respondToRequest({
    required String requestId,
    required double price,
    required int estimatedDays,
    required String message,
  }) async {
    final result = await _repository.respondToRequest(
      requestId: requestId,
      price: price,
      estimatedDays: estimatedDays,
      message: message,
    );

    return result.fold(
      (failure) {
        state = state.copyWith(error: failure.message);
        return false;
      },
      (_) => true,
    );
  }

  /// Принять отклик на заявку (для клиентов)
  Future<bool> acceptProposal({
    required String requestId,
    required String proposalId,
  }) async {
    final result = await _repository.acceptProposal(
      requestId: requestId,
      proposalId: proposalId,
    );

    return result.fold(
      (failure) {
        state = state.copyWith(error: failure.message);
        return false;
      },
      (_) {
        // Обновляем список заявок после принятия
        loadRequests();
        return true;
      },
    );
  }
}

/// Provider для RequestsNotifier
final requestsProvider = StateNotifierProvider<RequestsNotifier, RequestsState>((ref) {
  final repository = getIt<RequestRepository>();
  return RequestsNotifier(repository);
});
