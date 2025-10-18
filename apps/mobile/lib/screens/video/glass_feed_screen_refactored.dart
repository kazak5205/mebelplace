import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_screen_base.dart';
import '../../core/widgets/glass/glass_custom_widgets.dart';
import '../../core/theme/liquid_glass_colors.dart';
import '../../core/theme/liquid_glass_text_styles.dart';
import '../../features/feed/presentation/providers/video_feed_provider.dart';

class GlassFeedScreenRefactored extends ConsumerStatefulWidget {
  const GlassFeedScreenRefactored({super.key});

  @override
  ConsumerState<GlassFeedScreenRefactored> createState() => _GlassFeedScreenRefactoredState();
}

class _GlassFeedScreenRefactoredState extends ConsumerState<GlassFeedScreenRefactored> {
  @override
  void initState() {
    super.initState();
    // Загружаем видео при инициализации
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(videoFeedProvider.notifier).loadFeed();
    });
  }

  @override
  Widget build(BuildContext context) {
    final feedState = ref.watch(videoFeedProvider);
    
    return GlassScreenBase(
      title: 'Лента',
      backgroundColor: LiquidGlassColors.backgroundDark,
      showAppBar: true,
      child: _buildFeedContent(feedState),
    );
  }
  
  Widget _buildFeedContent(VideoFeedState state) {
    if (state is VideoFeedLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }
    
    if (state is VideoFeedError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: LiquidGlassColors.errorRed,
            ),
            const SizedBox(height: 16),
            Text(
              'Ошибка загрузки',
              style: LiquidGlassTextStyles.heading2,
            ),
            const SizedBox(height: 8),
            Text(
              state.message,
              style: LiquidGlassTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(videoFeedProvider.notifier).loadFeed(refresh: true),
              child: const Text('Повторить'),
            ),
          ],
        ),
      );
    }
    
    if (state is VideoFeedLoaded) {
      if (state.videos.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.video_library_outlined,
                size: 64,
                color: LiquidGlassColors.primary,
              ),
              const SizedBox(height: 16),
              Text(
                'Нет видео',
                style: LiquidGlassTextStyles.heading2,
              ),
              const SizedBox(height: 8),
              Text(
                'Пока что нет видео для отображения',
                style: LiquidGlassTextStyles.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.read(videoFeedProvider.notifier).loadFeed(refresh: true),
                child: const Text('Обновить'),
              ),
            ],
          ),
        );
      }
      
      return RefreshIndicator(
        onRefresh: () => ref.read(videoFeedProvider.notifier).loadFeed(refresh: true),
        child: ListView.builder(
          itemCount: state.videos.length,
          itemBuilder: (context, index) {
            final video = state.videos[index];
            return _buildVideoCard(video);
          },
        ),
      );
    }
    
    return const Center(
      child: CircularProgressIndicator(),
    );
  }
  
  Widget _buildVideoCard(dynamic video) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: LiquidGlassColors.darkGlass,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: LiquidGlassColors.darkGlassBorder,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Видео превью (заглушка)
          Container(
            height: 200,
            decoration: BoxDecoration(
              color: Colors.grey[800],
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Icon(
                Icons.play_circle_outline,
                size: 64,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 12),
          
          // Заголовок
          Text(
            video.title ?? 'Без названия',
            style: LiquidGlassTextStyles.heading3,
          ),
          const SizedBox(height: 8),
          
          // Описание
          if (video.description != null)
            Text(
              video.description,
              style: LiquidGlassTextStyles.bodyMedium,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          
          const SizedBox(height: 12),
          
          // Информация о видео
          Row(
            children: [
              Icon(
                Icons.visibility,
                size: 16,
                color: LiquidGlassColors.primary,
              ),
              const SizedBox(width: 4),
              Text(
                '${video.views ?? 0} просмотров',
                style: LiquidGlassTextStyles.bodySmall,
              ),
              const Spacer(),
              Icon(
                Icons.favorite,
                size: 16,
                color: LiquidGlassColors.primary,
              ),
              const SizedBox(width: 4),
              Text(
                '${video.likes ?? 0}',
                style: LiquidGlassTextStyles.bodySmall,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
