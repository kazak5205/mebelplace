import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/widgets/glass/glass_video_card.dart';
import '../core/theme/liquid_glass_colors.dart';
import '../features/feed/presentation/providers/video_feed_provider.dart';
import '../features/feed/domain/entities/video_entity.dart';
import '../features/feed/domain/repositories/video_repository.dart';
import '../core/di/injection.dart';

final videoRepositoryProvider = Provider((ref) => getIt<VideoRepository>());

/// Новый Feed Screen с Liquid Glass дизайном
class GlassFeedScreen extends ConsumerStatefulWidget {
  const GlassFeedScreen({super.key});

  @override
  ConsumerState<GlassFeedScreen> createState() => _GlassFeedScreenState();
}

class _GlassFeedScreenState extends ConsumerState<GlassFeedScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    // Load feed
    Future.microtask(() => ref.read(videoFeedProvider.notifier).loadFeed());
  }

  @override
  Widget build(BuildContext context) {
    final feedState = ref.watch(videoFeedProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: _buildBody(feedState),
    );
  }

  Widget _buildBody(VideoFeedState feedState) {
    if (feedState is VideoFeedInitial || feedState is VideoFeedLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: Color(0xFFFF6600),
        ),
      );
    }

    if (feedState is VideoFeedError) {
      return Center(
        child: Text(
          feedState.message,
          style: const TextStyle(color: Colors.white),
        ),
      );
    }

    if (feedState is VideoFeedLoaded) {
      final videos = feedState.videos;
      final hasMore = feedState.hasMore;

      if (videos.isEmpty) {
        return const Center(
          child: Text(
            'Нет видео',
            style: TextStyle(color: Colors.white),
          ),
        );
      }

      return PageView.builder(
            controller: _pageController,
            scrollDirection: Axis.vertical,
            onPageChanged: (index) {
              setState(() => _currentIndex = index);
              
              // Load more
              if (index == videos.length - 2 && hasMore) {
                ref.read(videoFeedProvider.notifier).loadMore();
              }
            },
            itemCount: videos.length,
            itemBuilder: (context, index) {
              final video = videos[index] as VideoEntity;
              
              return GlassVideoCard(
                video: video,
                onTap: () {
                  // Navigate to video detail
                  Navigator.pushNamed(
                    context,
                    '/video/${video.id}',
                    arguments: video,
                  );
                },
                onLike: () {
                  ref.read(videoFeedProvider.notifier).toggleLike(video.id.toString());
                },
                onComment: () {
                  // Open comments
                  Navigator.pushNamed(
                    context,
                    '/video/${video.id}/comments',
                  );
                },
                onShare: () {
                  // Share video
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Поделиться видео'),
                      duration: Duration(seconds: 1),
                    ),
                  );
                },
                onFavorite: () {
                  ref.read(videoFeedProvider.notifier).toggleFavorite(video.id.toString());
                },
                onOrder: video.id != null ? () {
                  // Open order dialog
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Заказать товар'),
                      content: Text('Заказать ${video.title ?? "товар"} за ${video.productPrice ?? 0}₸?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Отмена'),
                        ),
                        TextButton(
                          onPressed: () async {
                            Navigator.pop(context);
                            // Create order
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Заказ создан! Мастер свяжется с вами.'),
                                backgroundColor: LiquidGlassColors.success,
                              ),
                            );
                          },
                          child: const Text('Заказать'),
                        ),
                      ],
                    ),
                  );
                } : null,
                onSubscribe: () async {
                  // Subscribe to author via API
                  try {
                    await ref.read(videoRepositoryProvider).followAuthor(video.author.id);
                    
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Подписка на ${video.author.username}'),
                          backgroundColor: LiquidGlassColors.success,
                        ),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Ошибка подписки'),
                          backgroundColor: LiquidGlassColors.error,
                        ),
                      );
                    }
                  }
                },
              );
            },
          );
        }

    return const SizedBox.shrink();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }
}
