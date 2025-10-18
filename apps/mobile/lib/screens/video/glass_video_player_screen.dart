import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/feed/domain/entities/video_entity.dart';
import 'glass_video_detail_screen.dart';

/// Обертка над video detail для совместимости
class GlassVideoPlayerScreen extends ConsumerWidget {
  final VideoEntity video;

  const GlassVideoPlayerScreen({super.key, required this.video});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GlassVideoDetailScreen(video: video);
  }
}

