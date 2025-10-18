import '../../../../core/network/dio_client.dart';
import '../../../auth/data/models/user_model.dart';
import '../../../../core/constants/api_endpoints.dart';

abstract class ProfileRemoteDataSource {
  Future<UserModel> getProfile();
  Future<UserModel> updateProfile({
    String? name,
    String? phone,
    String? avatar,
    String? bio,
  });
  Future<String> uploadAvatar(String filePath);
}

class ProfileRemoteDataSourceImpl implements ProfileRemoteDataSource {
  final DioClient dioClient;

  ProfileRemoteDataSourceImpl(this.dioClient);

  @override
  Future<UserModel> getProfile() async {
    final response = await dioClient.get(ApiEndpoints.profile);
    return UserModel.fromJson(response.data);
  }

  @override
  Future<UserModel> updateProfile({
    String? name,
    String? phone,
    String? avatar,
    String? bio,
  }) async {
    final response = await dioClient.put(
      ApiEndpoints.profileUpdate,
      data: {
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
        if (avatar != null) 'avatar': avatar,
        if (bio != null) 'bio': bio,
      },
    );

    return UserModel.fromJson(response.data);
  }

  @override
  Future<String> uploadAvatar(String filePath) async {
    final response = await dioClient.uploadFile(
      ApiEndpoints.profileAvatar,
      filePath,
      fileKey: 'avatar',
    );

    return response.data['url'] as String;
  }
}

