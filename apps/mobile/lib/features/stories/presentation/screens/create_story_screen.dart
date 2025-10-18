import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:io';
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';
import '../../../../core/config/api_config.dart';

class CreateStoryScreen extends ConsumerStatefulWidget {
  const CreateStoryScreen({super.key});

  @override
  ConsumerState<CreateStoryScreen> createState() => _CreateStoryScreenState();
}

class _CreateStoryScreenState extends ConsumerState<CreateStoryScreen> {
  final _storage = const FlutterSecureStorage();
  final _picker = ImagePicker();
  
  File? _selectedFile;
  String? _mediaType;
  bool _isUploading = false;

  Future<void> _pickImage(ImageSource source) async {
    try {
      final pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 1080,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        setState(() {
          _selectedFile = File(pickedFile.path);
          _mediaType = 'image';
        });
      }
    } catch (e) {
      _showError('Ошибка выбора изображения');
    }
  }

  Future<void> _pickVideo() async {
    try {
      final pickedFile = await _picker.pickVideo(
        source: ImageSource.gallery,
        maxDuration: const Duration(seconds: 30),
      );

      if (pickedFile != null) {
        setState(() {
          _selectedFile = File(pickedFile.path);
          _mediaType = 'video';
        });
      }
    } catch (e) {
      _showError('Ошибка выбора видео');
    }
  }

  Future<void> _uploadStory() async {
    if (_selectedFile == null || _mediaType == null) return;

    setState(() => _isUploading = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) {
        _showError('Не авторизован');
        return;
      }

      // Upload file
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConfig.baseUrl}/api/v2/stories'),
      );

      request.headers['Authorization'] = 'Bearer $token';
      request.fields['media_type'] = _mediaType!;

      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          _selectedFile!.path,
        ),
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (mounted) {
          Navigator.pop(context, true); // Return true to indicate success
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('История опубликована!'),
              backgroundColor: LiquidGlassColors.success,
            ),
          );
        }
      } else {
        final errorData = json.decode(response.body);
        _showError(errorData['message'] ?? 'Ошибка загрузки');
      }
    } catch (e) {
      _showError('Ошибка: $e');
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: LiquidGlassColors.errorRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Создать историю'),
      ),
      body: _selectedFile == null
          ? _buildSelectionOptions(isDark)
          : _buildPreview(isDark),
    );
  }

  Widget _buildSelectionOptions(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.auto_stories,
              size: 80,
              color: LiquidGlassColors.primaryOrange,
            ),
            const SizedBox(height: 24),
            const Text(
              'Поделитесь моментом',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Ваша история будет видна 24 часа',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
            ),
            const SizedBox(height: 48),

            GlassPanel(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(
                      Icons.camera_alt,
                      color: LiquidGlassColors.primaryOrange,
                    ),
                    title: const Text('Сделать фото'),
                    onTap: () => _pickImage(ImageSource.camera),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(
                      Icons.photo_library,
                      color: LiquidGlassColors.primaryOrange,
                    ),
                    title: const Text('Выбрать из галереи'),
                    onTap: () => _pickImage(ImageSource.gallery),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(
                      Icons.video_library,
                      color: LiquidGlassColors.primaryOrange,
                    ),
                    title: const Text('Выбрать видео (макс 30 сек)'),
                    onTap: _pickVideo,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPreview(bool isDark) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Preview
        if (_mediaType == 'image')
          Image.file(
            _selectedFile!,
            fit: BoxFit.contain,
          )
        else if (_mediaType == 'video')
          const Center(
            child: Icon(
              Icons.play_circle_outline,
              size: 80,
              color: Colors.white,
            ),
          ),

        // Dark overlay
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withValues(alpha: 0.6),
                Colors.transparent,
                Colors.black.withValues(alpha: 0.8),
              ],
            ),
          ),
        ),

        // Bottom buttons
        Positioned(
          bottom: 40,
          left: 16,
          right: 16,
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    setState(() {
                      _selectedFile = null;
                      _mediaType = null;
                    });
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white),
                  ),
                  child: const Text('Отмена'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: _isUploading
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: LiquidGlassColors.primaryOrange,
                        ),
                      )
                    : GlassButton.primary(
                        'Опубликовать',
                        icon: const Icon(
                          Icons.send,
                          size: 20,
                          color: Colors.white,
                        ),
                        onTap: _uploadStory,
                      ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

