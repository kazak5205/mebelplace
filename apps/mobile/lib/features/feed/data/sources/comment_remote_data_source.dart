import '../../../../core/network/dio_client.dart';
import '../models/comment_model.dart';
import '../../../../core/constants/api_endpoints.dart';

abstract class CommentRemoteDataSource {
  Future<Map<String, dynamic>> getComments(int videoId, {int page = 1, int limit = 20});
  Future<CommentModel> postComment(int videoId, String text, {int? parentId});
  Future<void> likeComment(int commentId);
}

class CommentRemoteDataSourceImpl implements CommentRemoteDataSource {
  final DioClient dioClient;

  CommentRemoteDataSourceImpl(this.dioClient);

  @override
  Future<Map<String, dynamic>> getComments(int videoId, {int page = 1, int limit = 20}) async {
    final response = await dioClient.get(
      ApiEndpoints.withId(ApiEndpoints.videosComments, videoId.toString()),
      queryParameters: {
        'page': page,
        'limit': limit,
      },
    );

    // Backend возвращает структуру: { comments: [], pagination: {} }
    return response.data as Map<String, dynamic>;
  }

  @override
  Future<CommentModel> postComment(int videoId, String text, {int? parentId}) async {
    final data = <String, dynamic>{
      'text': text,
    };
    
    if (parentId != null) {
      data['parent_id'] = parentId;
    }

    final response = await dioClient.post(
      ApiEndpoints.withId(ApiEndpoints.videosComments, videoId.toString()),
      data: data,
    );

    return CommentModel.fromJson(response.data);
  }

  @override
  Future<void> likeComment(int commentId) async {
    await dioClient.post(
      ApiEndpoints.withId(ApiEndpoints.videoComment, commentId.toString()),
    );
  }
}

