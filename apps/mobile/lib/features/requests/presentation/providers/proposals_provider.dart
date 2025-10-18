import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/proposal_entity.dart';
import '../../domain/repositories/request_repository.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final proposalsDioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// Proposals Provider - REAL API!
final proposalsProvider = StateNotifierProvider<ProposalsNotifier, AsyncValue<List<ProposalEntity>>>((ref) {
  return ProposalsNotifier(
    getIt<RequestRepository>(),
    ref.watch(proposalsDioClientProvider),
  );
});

class ProposalsNotifier extends StateNotifier<AsyncValue<List<ProposalEntity>>> {
  final RequestRepository _repository;
  final DioClient _dioClient;

  ProposalsNotifier(this._repository, this._dioClient) : super(const AsyncValue.loading());

  Future<void> loadProposals(String requestId) async {
    state = const AsyncValue.loading();
    try {
      final response = await _dioClient.get(
        ApiEndpoints.withId(ApiEndpoints.requestProposals, requestId),
      );
      
      final proposals = (response.data['proposals'] as List?)?.map((p) => ProposalEntity(
        id: p['id'],
        requestId: requestId,
        masterId: p['masterId'],
        masterName: p['masterName'],
        masterRating: p['masterRating']?.toDouble(),
        price: p['price'],
        estimatedDays: p['estimatedDays'],
        message: p['message'],
        status: p['status'],
        createdAt: DateTime.parse(p['createdAt']),
      )).toList() ?? [];
      
      state = AsyncValue.data(proposals);
    } catch (e, st) {
      // Fallback: try repository
      final result = await _repository.getProposals(requestId);
      result.fold(
        (failure) => state = AsyncValue.error(failure.message, st),
        (proposals) => state = AsyncValue.data(proposals.cast<ProposalEntity>()),
      );
    }
  }

  Future<void> acceptProposal(String proposalId) async {
    try {
      await _dioClient.post(
        ApiEndpoints.withParams(ApiEndpoints.requestProposalAccept, {'id': 'request_id', 'proposal_id': proposalId}),
      );
    } catch (e) {
      // Ignore error
    }
  }
}
