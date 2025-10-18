import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassUserChannelScreen extends ConsumerWidget {
  final String userId;

  const GlassUserChannelScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            backgroundColor: Colors.transparent,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [LiquidGlassColors.primaryOrange.withValues(alpha: 0.3), isDark ? Colors.black : Colors.white],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 20,
                    left: 20,
                    right: 20,
                    child: GlassPanel(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          CircleAvatar(radius: 40, backgroundColor: LiquidGlassColors.primaryOrange, child: Text('M', style: const TextStyle(fontSize: 32, color: Colors.white))),
                          const SizedBox(height: 12),
                          Text('Канал мастера', style: LiquidGlassTextStyles.h3.copyWith(color: Colors.white)),
                          Text('1.2K подписчиков', style: LiquidGlassTextStyles.caption.copyWith(color: Colors.white70)),
                          const SizedBox(height: 16),
                          GlassButton.primary('Подписаться', onTap: () {}),
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
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.75),
              delegate: SliverChildBuilderDelegate((context, index) => GlassPanel(padding: EdgeInsets.zero, child: Container(color: isDark ? Colors.white12 : Colors.black12)), childCount: 20),
            ),
          ),
        ],
      ),
    );
  }
}

