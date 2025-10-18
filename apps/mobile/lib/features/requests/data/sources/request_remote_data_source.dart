import '../../../../core/network/dio_client.dart';
import '../models/request_model.dart';
import '../../domain/entities/request_entity.dart';
import '../../../../core/constants/api_endpoints.dart';

abstract class RequestRemoteDataSource {
  Future<List<RequestModel>> getRequests({RequestStatus? status, int limit = 20, int offset = 0});
  Future<RequestModel> getRequestById(String id);
  Future<RequestModel> createRequest({
    required String title,
    required String description,
    required List<String> photos,
    required String region,
    double? budget,
    DateTime? deadline,
  });
  Future<void> respondToRequest({
    required String requestId,
    required double price,
    required int estimatedDays,
    required String message,
  });
  Future<void> acceptProposal({
    required String requestId,
    required String proposalId,
  });
  Future<void> cancelRequest(String id);
  Future<void> completeRequest(String id);
  Future<List<dynamic>> getProposals(String requestId);
}

class RequestRemoteDataSourceImpl implements RequestRemoteDataSource {
  final DioClient dioClient;

  RequestRemoteDataSourceImpl(this.dioClient);

  @override
  Future<List<RequestModel>> getRequests({
    RequestStatus? status,
    int limit = 20,
    int offset = 0,
  }) async {
    final response = await dioClient.get(
      ApiEndpoints.requests,
      queryParameters: {
        if (status != null) 'status': status.toString().split('.').last,
        'limit': limit,
        'offset': offset,
      },
    );

    final data = response.data;
    if (data is Map && data.containsKey('requests')) {
      return (data['requests'] as List)
          .map((json) => RequestModel.fromJson(json))
          .toList();
    } else if (data is List) {
      return data.map((json) => RequestModel.fromJson(json)).toList();
    }

    return [];
  }

  @override
  Future<RequestModel> getRequestById(String id) async {
    final response = await dioClient.get(
      ApiEndpoints.withId(ApiEndpoints.requestDetail, id),
    );
    return RequestModel.fromJson(response.data);
  }

  @override
  Future<RequestModel> createRequest({
    required String title,
    required String description,
    required List<String> photos,
    required String region,
    double? budget,
    DateTime? deadline,
  }) async {
    final response = await dioClient.post(
      ApiEndpoints.requestCreate,
      data: {
        'title': title,
        'description': description,
        'photos': photos,
        'region': region,
        if (budget != null) 'budget': budget,
        if (deadline != null) 'deadline': deadline.toIso8601String(),
      },
    );

    return RequestModel.fromJson(response.data);
  }

  @override
  Future<void> respondToRequest({
    required String requestId,
    required double price,
    required int estimatedDays,
    required String message,
  }) async {
    await dioClient.post(
      ApiEndpoints.withId(ApiEndpoints.requestProposals, requestId),
      data: {
        'price_cents': (price * 100).toInt(), // Backend expects cents
        'deadline_days': estimatedDays,
        'message': message,
      },
    );
  }

  @override
  Future<void> acceptProposal({
    required String requestId,
    required String proposalId,
  }) async {
    await dioClient.post(
      ApiEndpoints.withParams(ApiEndpoints.requestProposalAccept, {
        'id': requestId,
        'proposal_id': proposalId,
      }),
    );
  }

  @override
  Future<void> cancelRequest(String id) async {
    await dioClient.post(
      ApiEndpoints.withId(ApiEndpoints.requestCancel, id),
    );
  }

  @override
  Future<void> completeRequest(String id) async {
    await dioClient.post(
      ApiEndpoints.withId(ApiEndpoints.requestComplete, id),
    );
  }
  
  @override
  Future<List<dynamic>> getProposals(String requestId) async {
    final response = await dioClient.get(
      ApiEndpoints.withId(ApiEndpoints.requestProposals, requestId),
    );
    return response.data['proposals'] ?? [];
  }
}

