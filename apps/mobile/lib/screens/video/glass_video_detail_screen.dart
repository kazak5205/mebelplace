import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:ui';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/feed/domain/entities/video_entity.dart';
import '../../features/feed/presentation/providers/video_feed_provider.dart';

class GlassVideoDetailScreen extends ConsumerWidget {
  final VideoEntity video;

  const GlassVideoDetailScreen({super.key, required this.video});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Video background
          SizedBox.expand(
            child: CachedNetworkImage(
              imageUrl: video.thumbnailUrl ?? '',
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(color: Colors.black),
              errorWidget: (context, url, error) => Container(color: Colors.black, child: const Icon(Icons.video_library_outlined, size: 64, color: Colors.white54)),
            ),
          ),

          // Top gradient
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.black.withValues(alpha: 0.7), Colors.transparent],
                ),
              ),
            ),
          ),

          // Bottom panel
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: GlassPanel(
              padding: const EdgeInsets.all(20),
              borderRadius: 24,
              margin: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(video.title, style: LiquidGlassTextStyles.h2.copyWith(color: Colors.white)),
                  const SizedBox(height: 8),
                  if (video.description != null)
                    Text(video.description!, style: LiquidGlassTextStyles.bodySmall.copyWith(color: Colors.white70), maxLines: 3),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      GlassIconButton(icon: video.isLiked ? Icons.favorite_outlined : Icons.favorite_border, count: '${video.likesCount}', onTap: () => ref.read(videoFeedProvider.notifier).toggleLike(video.id.toString())),
                      GlassIconButton(icon: Icons.comment_outlined, count: '${video.commentsCount}', onTap: () => Navigator.pushNamed(context, '/video/${video.id}/comments')),
                      GlassIconButton(icon: Icons.share_outlined, count: '${video.sharesCount}', onTap: () {}),
                      GlassIconButton(icon: video.isFavorite ? Icons.bookmark_outlined : Icons.bookmark_border, onTap: () => ref.read(videoFeedProvider.notifier).toggleFavorite(video.id.toString())),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Back button
          Positioned(
            top: 50,
            left: 16,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

