import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassChannelPage extends ConsumerWidget {
  final String channelId;

  const GlassChannelPage({super.key, required this.channelId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: Colors.transparent,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Container(color: isDark ? Colors.white12 : Colors.black12),
                  Positioned(
                    bottom: 20,
                    left: 20,
                    right: 20,
                    child: GlassPanel(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          CircleAvatar(radius: 30, backgroundColor: LiquidGlassColors.primaryOrange, child: const Text('M', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w600))),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('Мастер Иванов', style: LiquidGlassTextStyles.h3.copyWith(color: Colors.white)),
                                Text('1.2K подписчиков', style: LiquidGlassTextStyles.caption.copyWith(color: Colors.white70)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.75,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) => GlassPanel(
                  padding: EdgeInsets.zero,
                  child: Container(color: isDark ? Colors.white12 : Colors.black12, child: Center(child: Text('Video $index', style: const TextStyle(color: Colors.white)))),
                ),
                childCount: 20,
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: GlassButton.primary('Подписаться', onTap: () {}),
    );
  }
}

