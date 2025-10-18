import '../network/dio_client.dart';
import '../../core/config/api_config_export.dart';

class UploadService {
  final DioClient dioClient;

  UploadService(this.dioClient);

  /// Upload single file to CDN
  Future<String> uploadFile(String filePath, {String? folder}) async {
    try {
      final response = await dioClient.uploadFile(
        ApiEndpoints.upload,
        filePath,
        fileKey: 'file',
        data: {
          if (folder != null) 'folder': folder,
        },
      );

      // Backend returns { "url": "https://cdn..." }
      if (response.data is Map && response.data.containsKey('url')) {
        return response.data['url'] as String;
      }

      throw Exception('Invalid upload response');
    } catch (e) {
      throw Exception('Upload failed: $e');
    }
  }

  /// Upload multiple files
  Future<List<String>> uploadFiles(List<String> filePaths, {String? folder}) async {
    try {
      final response = await dioClient.uploadFiles(
        ApiEndpoints.upload,
        filePaths,
        fileKey: 'files',
        data: {
          if (folder != null) 'folder': folder,
        },
      );

      // Backend returns { "urls": ["https://cdn...", ...] }
      if (response.data is Map && response.data.containsKey('urls')) {
        return List<String>.from(response.data['urls']);
      }

      throw Exception('Invalid upload response');
    } catch (e) {
      throw Exception('Upload failed: $e');
    }
  }

  /// Upload image with compression
  Future<String> uploadImage(String filePath) async {
    return uploadFile(filePath, folder: 'images');
  }

  /// Upload video
  Future<String> uploadVideo(String filePath) async {
    return uploadFile(filePath, folder: 'videos');
  }

  /// Upload avatar
  Future<String> uploadAvatar(String filePath) async {
    return uploadFile(filePath, folder: 'avatars');
  }

  /// Upload audio
  Future<String> uploadAudio(String filePath) async {
    return uploadFile(filePath, folder: 'audio');
  }
}

