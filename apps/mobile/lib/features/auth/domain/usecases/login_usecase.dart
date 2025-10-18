import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  Future<Either<Failure, UserEntity>> call({
    required String emailOrPhone,
    required String password,
  }) {
    return repository.login(
      emailOrPhone: emailOrPhone,
      password: password,
    );
  }
}

