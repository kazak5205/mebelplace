import 'package:dio/dio.dart';
import '../models/request_model.dart';

class RequestRepository {
  final Dio dio;

  RequestRepository({required this.dio});

  Future<RequestModel> createRequest(CreateRequestDTO dto) async {
    final response = await dio.post('/v2/requests', data: dto.toJson());
    return RequestModel.fromJson(response.data);
  }

  Future<List<RequestModel>> getMyRequests() async {
    final response = await dio.get('/v2/requests/my');
    return (response.data as List)
        .map((json) => RequestModel.fromJson(json))
        .toList();
  }

  Future<RequestModel> getRequest(String id) async {
    final response = await dio.get('/v2/requests/$id');
    return RequestModel.fromJson(response.data);
  }

  Future<RequestModel> updateRequest(String id, Map<String, dynamic> data) async {
    final response = await dio.put('/v2/requests/$id', data: data);
    return RequestModel.fromJson(response.data);
  }

  Future<RequestModel> closeRequest(String id) async {
    final response = await dio.post('/v2/requests/$id/close');
    return RequestModel.fromJson(response.data);
  }

  // Master operations
  Future<List<RequestModel>> getRequestsByRegion(String region, {String status = 'pending'}) async {
    final response = await dio.get('/v2/requests/region/$region', queryParameters: {'status': status});
    return (response.data as List)
        .map((json) => RequestModel.fromJson(json))
        .toList();
  }

  Future<ProposalModel> createProposal(String requestId, CreateProposalDTO dto) async {
    final response = await dio.post('/v2/requests/$requestId/proposals', data: dto.toJson());
    return ProposalModel.fromJson(response.data);
  }

  Future<List<ProposalModel>> getProposals(String requestId) async {
    final response = await dio.get('/v2/requests/$requestId/proposals');
    return (response.data as List)
        .map((json) => ProposalModel.fromJson(json))
        .toList();
  }

  Future<Map<String, dynamic>> acceptProposal(String proposalId) async {
    final response = await dio.post('/v2/proposals/$proposalId/accept');
    return response.data;
  }

  Future<void> rejectProposal(String proposalId) async {
    await dio.post('/v2/proposals/$proposalId/reject');
  }
}

