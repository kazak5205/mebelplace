import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  Future<Either<Failure, UserEntity>> call({
    required String emailOrPhone,
    required String password,
    String? username,
  }) {
    return repository.register(
      emailOrPhone: emailOrPhone,
      password: password,
      username: username,
    );
  }
}

