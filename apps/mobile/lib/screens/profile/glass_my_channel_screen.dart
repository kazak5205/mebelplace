import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'glass_channel_page.dart';

class GlassMyChannelScreen extends ConsumerWidget {
  const GlassMyChannelScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const GlassChannelPage(channelId: 'my_channel');
  }
}

