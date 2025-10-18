import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../glass_feed_screen.dart';

/// Video feed tab wrapper
class GlassVideoFeedTab extends ConsumerWidget {
  const GlassVideoFeedTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const GlassFeedScreen();
  }
}

