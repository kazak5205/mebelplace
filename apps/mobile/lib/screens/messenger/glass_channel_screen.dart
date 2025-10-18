import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_message_bubble.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassChannelScreen extends ConsumerWidget {
  final String channelId;

  const GlassChannelScreen({super.key, required this.channelId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            CircleAvatar(radius: 16, backgroundColor: LiquidGlassColors.primaryOrange, child: const Text('C', style: TextStyle(color: Colors.white))),
            const SizedBox(width: 12),
            Text('Канал новостей', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
          ],
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 10,
        itemBuilder: (context, index) => const GlassMessageBubble(text: 'Сообщение в канале', isMine: false, time: '12:00'),
      ),
    );
  }
}

