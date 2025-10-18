import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/profile/presentation/providers/my_videos_provider.dart';
import '../../features/feed/domain/entities/video_entity.dart';

class GlassMyVideosScreen extends ConsumerStatefulWidget {
  const GlassMyVideosScreen({super.key});

  @override
  ConsumerState<GlassMyVideosScreen> createState() => _GlassMyVideosScreenState();
}

class _GlassMyVideosScreenState extends ConsumerState<GlassMyVideosScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(myVideosProvider.notifier).loadMyVideos());
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final videosAsync = ref.watch(myVideosProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Мои видео', style: LiquidGlassTextStyles.h3Light(isDark)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: LiquidGlassColors.primaryOrange),
            onPressed: () => Navigator.pushNamed(context, '/upload'),
          ),
        ],
      ),
      body: videosAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (videos) {
          if (videos.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.video_library_outlined, size: 80, color: LiquidGlassColors.primaryOrange),
                  const SizedBox(height: 16),
                  Text('Нет видео', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                  const SizedBox(height: 24),
                  GlassButton.primary('Загрузить видео', onTap: () => Navigator.pushNamed(context, '/upload')),
                ],
              ),
            );
          }

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.75,
            ),
            itemCount: videos.length,
            itemBuilder: (context, index) {
              final video = videos[index] as VideoEntity;
              return GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/video/${video.id}', arguments: video),
                child: GlassPanel(
                  padding: EdgeInsets.zero,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Container(color: isDark ? Colors.white12 : Colors.black12),
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                              colors: [Colors.black.withValues(alpha: 0.7), Colors.transparent],
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(video.title, style: const TextStyle(color: Colors.white, fontSize: 14)),
                              Text('${video.viewsCount} просмотров', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
