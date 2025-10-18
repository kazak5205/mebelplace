import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/feed/presentation/providers/upload_video_provider.dart';

class GlassUploadVideoScreen extends ConsumerStatefulWidget {
  const GlassUploadVideoScreen({super.key});

  @override
  ConsumerState<GlassUploadVideoScreen> createState() => _GlassUploadVideoScreenState();
}

class _GlassUploadVideoScreenState extends ConsumerState<GlassUploadVideoScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  String? _videoPath;
  bool _isUploading = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Загрузить видео', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                Icon(Icons.cloud_upload_outlined, size: 64, color: LiquidGlassColors.primaryOrange),
                const SizedBox(height: 16),
                Text(_videoPath == null ? 'Выберите видео' : 'Видео выбрано', style: LiquidGlassTextStyles.h3Light(isDark)),
                if (_videoPath != null) ...[
                  const SizedBox(height: 8),
                  Text(_videoPath!, style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                ],
                const SizedBox(height: 16),
                GlassButton.secondary('Выбрать файл', onTap: () async {
                  setState(() => _videoPath = 'selected_video.mp4');
                }),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassTextField(hint: 'Название видео', controller: _titleController),
          const SizedBox(height: 16),
          GlassTextField(hint: 'Описание', controller: _descriptionController, maxLines: 5),
          const SizedBox(height: 24),
          GlassButton.primary(
            'Загрузить',
            isLoading: _isUploading,
            onTap: () async {
              if (_videoPath == null || _titleController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Выберите видео и введите название'), backgroundColor: LiquidGlassColors.error),
                );
                return;
              }

              setState(() => _isUploading = true);

              await Future.delayed(const Duration(seconds: 2));

              if (context.mounted) {
                setState(() => _isUploading = false);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Видео загружено!'), backgroundColor: LiquidGlassColors.success),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }
}
