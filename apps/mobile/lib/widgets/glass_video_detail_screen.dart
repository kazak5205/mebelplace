import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../screens/video/glass_video_detail_screen.dart';
import '../features/feed/domain/entities/video_entity.dart';

/// Wrapper for compatibility
class GlassVideoDetailWidget extends ConsumerWidget {
  final VideoEntity video;

  const GlassVideoDetailWidget({super.key, required this.video});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GlassVideoDetailScreen(video: video);
  }
}

