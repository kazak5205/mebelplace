import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/exceptions.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../sources/auth_remote_data_source.dart';
import '../sources/auth_local_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, UserEntity>> login({
    required String emailOrPhone,
    required String password,
  }) async {
    try {
      // Login через API
      final tokens = await remoteDataSource.login(
        emailOrPhone: emailOrPhone,
        password: password,
      );

      // Сохраняем токены
      await localDataSource.saveTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );

      // Получаем данные пользователя
      final userModel = await remoteDataSource.getCurrentUser();

      // Кэшируем пользователя
      await localDataSource.saveUser(userModel);

      return Right(userModel.toEntity());
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> register({
    required String emailOrPhone,
    required String password,
    String? username,
  }) async {
    try {
      // Register через API
      final tokens = await remoteDataSource.register(
        emailOrPhone: emailOrPhone,
        password: password,
        username: username,
      );

      // Сохраняем токены
      await localDataSource.saveTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );

      // Получаем данные пользователя
      final userModel = await remoteDataSource.getCurrentUser();

      // Кэшируем пользователя
      await localDataSource.saveUser(userModel);

      return Right(userModel.toEntity());
    } on ValidationException catch (e) {
      return Left(ValidationFailure(e.message, e.errors));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      // Logout на сервере
      await remoteDataSource.logout();

      // Удаляем локальные данные
      await localDataSource.deleteTokens();
      await localDataSource.deleteUser();

      return const Right(null);
    } catch (e) {
      // Даже при ошибке удаляем локальные данные
      await localDataSource.deleteTokens();
      await localDataSource.deleteUser();
      return const Right(null);
    }
  }

  @override
  Future<Either<Failure, UserEntity>> getCurrentUser() async {
    try {
      // Сначала пытаемся получить из кэша
      final cachedUser = await localDataSource.getCachedUser();
      if (cachedUser != null) {
        // Асинхронно обновляем с сервера
        _updateUserInBackground();
        return Right(cachedUser.toEntity());
      }

      // Если кэша нет, получаем с сервера
      final userModel = await remoteDataSource.getCurrentUser();
      await localDataSource.saveUser(userModel);

      return Right(userModel.toEntity());
    } on UnauthorizedException catch (e) {
      await localDataSource.deleteTokens();
      await localDataSource.deleteUser();
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      // При ошибке сети возвращаем из кэша
      final cachedUser = await localDataSource.getCachedUser();
      if (cachedUser != null) {
        return Right(cachedUser.toEntity());
      }
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  Future<void> _updateUserInBackground() async {
    try {
      final userModel = await remoteDataSource.getCurrentUser();
      await localDataSource.saveUser(userModel);
    } catch (e) {
      // Игнорируем ошибки фонового обновления
    }
  }

  @override
  Future<Either<Failure, bool>> isLoggedIn() async {
    try {
      final isLogged = await localDataSource.isLoggedIn();
      return Right(isLogged);
    } catch (e) {
      return const Right(false);
    }
  }

  @override
  Future<Either<Failure, void>> verifySms({
    required String phone,
    required String code,
  }) async {
    try {
      await remoteDataSource.verifySms(phone: phone, code: code);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> verifyEmail({
    required String email,
    required String code,
  }) async {
    try {
      await remoteDataSource.verifyEmail(email: email, code: code);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> resetPassword({required String email}) async {
    try {
      await remoteDataSource.resetPassword(email: email);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    try {
      await remoteDataSource.changePassword(
        oldPassword: oldPassword,
        newPassword: newPassword,
      );
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }
}

