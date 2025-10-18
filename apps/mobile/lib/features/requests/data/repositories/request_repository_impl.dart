import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/exceptions.dart';
import '../../domain/entities/request_entity.dart';
import '../../domain/repositories/request_repository.dart';
import '../sources/request_remote_data_source.dart';

class RequestRepositoryImpl implements RequestRepository {
  final RequestRemoteDataSource remoteDataSource;

  RequestRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<RequestEntity>>> getRequests({
    RequestStatus? status,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final models = await remoteDataSource.getRequests(
        status: status,
        limit: limit,
        offset: offset,
      );
      
      final entities = List<RequestEntity>.from(
        models.map((m) => m.toEntity())
      );
      return Right(entities);
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, RequestEntity>> getRequestById(String id) async {
    try {
      final model = await remoteDataSource.getRequestById(id);
      return Right(model.toEntity());
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, RequestEntity>> createRequest({
    required String title,
    required String description,
    required List<String> photos,
    required String region,
    double? budget,
    DateTime? deadline,
  }) async {
    try {
      final model = await remoteDataSource.createRequest(
        title: title,
        description: description,
        photos: photos,
        region: region,
        budget: budget,
        deadline: deadline,
      );
      return Right(model.toEntity());
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> respondToRequest({
    required String requestId,
    required double price,
    required int estimatedDays,
    required String message,
  }) async {
    try {
      await remoteDataSource.respondToRequest(
        requestId: requestId,
        price: price,
        estimatedDays: estimatedDays,
        message: message,
      );
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> acceptProposal({
    required String requestId,
    required String proposalId,
  }) async {
    try {
      await remoteDataSource.acceptProposal(
        requestId: requestId,
        proposalId: proposalId,
      );
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> cancelRequest(String id) async {
    try {
      await remoteDataSource.cancelRequest(id);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> completeRequest(String id) async {
    try {
      await remoteDataSource.completeRequest(id);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, List<dynamic>>> getProposals(String requestId) async {
    try {
      final proposals = await remoteDataSource.getProposals(requestId);
      return Right(proposals);
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }
}

