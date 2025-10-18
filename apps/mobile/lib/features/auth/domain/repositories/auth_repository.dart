import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> login({
    required String emailOrPhone,
    required String password,
  });
  
  Future<Either<Failure, UserEntity>> register({
    required String emailOrPhone,
    required String password,
    String? username,
  });
  
  Future<Either<Failure, void>> logout();
  
  Future<Either<Failure, UserEntity>> getCurrentUser();
  
  Future<Either<Failure, bool>> isLoggedIn();
  
  Future<Either<Failure, void>> verifySms({
    required String phone,
    required String code,
  });
  
  Future<Either<Failure, void>> verifyEmail({
    required String email,
    required String code,
  });
  
  Future<Either<Failure, void>> resetPassword({required String email});
  
  Future<Either<Failure, void>> changePassword({
    required String oldPassword,
    required String newPassword,
  });
}

