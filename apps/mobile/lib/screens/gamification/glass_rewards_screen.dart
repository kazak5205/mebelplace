import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassRewardsScreen extends ConsumerWidget {
  const GlassRewardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, title: Text('Награды', style: LiquidGlassTextStyles.h3Light(isDark))),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 8,
        itemBuilder: (context, index) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: GlassPanel(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.2), shape: BoxShape.circle),
                  child: const Icon(Icons.card_giftcard, color: LiquidGlassColors.primaryOrange, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Награда $index', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                      Text('За достижение', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                    ],
                  ),
                ),
                Text('+${(index + 1) * 50}', style: LiquidGlassTextStyles.h3.copyWith(color: LiquidGlassColors.primaryOrange)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

