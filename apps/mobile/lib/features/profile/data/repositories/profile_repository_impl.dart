import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/exceptions.dart';
import '../../../auth/domain/entities/user_entity.dart';
import '../../domain/repositories/profile_repository.dart';
import '../sources/profile_remote_data_source.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileRemoteDataSource remoteDataSource;

  ProfileRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, UserEntity>> getProfile() async {
    try {
      final model = await remoteDataSource.getProfile();
      return Right(model.toEntity());
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> updateProfile({
    String? name,
    String? phone,
    String? avatar,
    String? bio,
  }) async {
    try {
      final model = await remoteDataSource.updateProfile(
        name: name,
        phone: phone,
        avatar: avatar,
        bio: bio,
      );
      return Right(model.toEntity());
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, String>> uploadAvatar(String filePath) async {
    try {
      final url = await remoteDataSource.uploadAvatar(filePath);
      return Right(url);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }
}

