import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/feed/presentation/providers/favorites_provider.dart';
import '../../features/feed/domain/entities/video_entity.dart';

class GlassFavoritesScreen extends ConsumerStatefulWidget {
  const GlassFavoritesScreen({super.key});

  @override
  ConsumerState<GlassFavoritesScreen> createState() => _GlassFavoritesScreenState();
}

class _GlassFavoritesScreenState extends ConsumerState<GlassFavoritesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(favoritesProvider.notifier).loadFavorites());
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final favoritesState = ref.watch(favoritesProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Избранное', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: favoritesState.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (videos) {
          if (videos.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.bookmark_border_outlined, size: 80, color: LiquidGlassColors.primaryOrange),
                  const SizedBox(height: 16),
                  Text('Нет избранных видео', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
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
                              colors: [Colors.black.withValues(alpha: 0.8), Colors.transparent],
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(video.title, style: const TextStyle(color: Colors.white, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
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
