import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/comment_entity.dart';

abstract class CommentRepository {
  Future<Either<Failure, List<CommentEntity>>> getComments(int videoId);
  Future<Either<Failure, CommentEntity>> postComment(int videoId, String text);
  Future<Either<Failure, void>> likeComment(int commentId);
}

