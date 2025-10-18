import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../../auth/domain/entities/user_entity.dart';
import '../../domain/repositories/profile_repository.dart';

// Repository provider
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return getIt<ProfileRepository>();
});

// Profile state
sealed class ProfileState {}
class ProfileInitial extends ProfileState {}
class ProfileLoading extends ProfileState {}
class ProfileLoaded extends ProfileState {
  final UserEntity user;
  ProfileLoaded(this.user);
}
class ProfileError extends ProfileState {
  final String message;
  ProfileError(this.message);
}

// Profile Notifier - Riverpod 2.x
class ProfileNotifier extends StateNotifier<ProfileState> {
  final ProfileRepository _repository;

  ProfileNotifier(this._repository) : super(ProfileInitial()) {
    loadProfile();
  }

  Future<void> loadProfile() async {
    state = ProfileLoading();
    
    final result = await _repository.getProfile();
    
    result.fold(
      (failure) => state = ProfileError(failure.message),
      (user) => state = ProfileLoaded(user),
    );
  }

  Future<void> updateProfile({
    String? username,
    String? email,
    String? phone,
  }) async {
    state = ProfileLoading();
    
    final result = await _repository.updateProfile(
      name: username,
      phone: phone,
    );
    
    result.fold(
      (failure) => state = ProfileError(failure.message),
      (user) => state = ProfileLoaded(user),
    );
  }
}

// Provider
final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier(ref.watch(profileRepositoryProvider));
});
