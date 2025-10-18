import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../auth/domain/entities/user_entity.dart';

abstract class ProfileRepository {
  Future<Either<Failure, UserEntity>> getProfile();
  Future<Either<Failure, UserEntity>> updateProfile({
    String? name,
    String? phone,
    String? avatar,
    String? bio,
  });
  Future<Either<Failure, String>> uploadAvatar(String filePath);
}

