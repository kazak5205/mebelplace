import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/exceptions.dart';
import '../../domain/entities/comment_entity.dart';
import '../../domain/repositories/comment_repository.dart';
import '../sources/comment_remote_data_source.dart';
import '../models/comment_model.dart';

class CommentRepositoryImpl implements CommentRepository {
  final CommentRemoteDataSource remoteDataSource;

  CommentRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<CommentEntity>>> getComments(int videoId) async {
    try {
      final response = await remoteDataSource.getComments(videoId);
      final comments = (response['comments'] as List)
          .map((json) => CommentModel.fromJson(json as Map<String, dynamic>))
          .toList();
      return Right(comments.map((m) => m.toEntity()).toList());
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, CommentEntity>> postComment(
    int videoId,
    String text,
  ) async {
    try {
      final model = await remoteDataSource.postComment(videoId, text);
      return Right(model.toEntity());
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> likeComment(int commentId) async {
    try {
      await remoteDataSource.likeComment(commentId);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }
}

