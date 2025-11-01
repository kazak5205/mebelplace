import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/app_providers.dart';
import '../../widgets/tiktok_video_player.dart';
import '../../widgets/loading_widget.dart';

class VideoDetailPage extends ConsumerStatefulWidget {
  final String videoId;

  const VideoDetailPage({
    super.key,
    required this.videoId,
  });

  @override
  ConsumerState<VideoDetailPage> createState() => _VideoDetailPageState();
}

class _VideoDetailPageState extends ConsumerState<VideoDetailPage> {
  @override
  void initState() {
    super.initState();
    // Загружаем видео если нужно
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final videoState = ref.read(videoProvider);
      if (videoState.videos.isEmpty) {
        ref.read(videoProvider.notifier).loadVideos();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final videoState = ref.watch(videoProvider);
    final videos = videoState.videos;
    
    // Находим индекс видео
    final videoIndex = videos.indexWhere((v) => v.id == widget.videoId);
    
    if (videoState.isLoading && videos.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.dark,
        body: const Center(child: LoadingWidget()),
      );
    }
    
    if (videoIndex == -1) {
      return Scaffold(
        backgroundColor: AppColors.dark,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        body: Center(
          child: Text(
            'Видео не найдено',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
            ),
          ),
        ),
      );
    }
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: TikTokVideoPlayer(
        videos: videos,
        initialIndex: videoIndex,
        mutedByDefault: true, // ✅ Звук по умолчанию выключен
      ),
    );
  }
}

