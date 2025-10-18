import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/request_entity.dart';

abstract class RequestRepository {
  Future<Either<Failure, List<RequestEntity>>> getRequests({
    RequestStatus? status,
    int limit = 20,
    int offset = 0,
  });
  
  Future<Either<Failure, RequestEntity>> getRequestById(String id);
  
  Future<Either<Failure, RequestEntity>> createRequest({
    required String title,
    required String description,
    required List<String> photos,
    required String region,
    double? budget,
    DateTime? deadline,
  });
  
  Future<Either<Failure, void>> respondToRequest({
    required String requestId,
    required double price,
    required int estimatedDays,
    required String message,
  });
  
  Future<Either<Failure, void>> acceptProposal({
    required String requestId,
    required String proposalId,
  });
  
  Future<Either<Failure, void>> cancelRequest(String id);
  
  Future<Either<Failure, void>> completeRequest(String id);
  
  /// Получить предложения для заявки
  Future<Either<Failure, List<dynamic>>> getProposals(String requestId);
}

