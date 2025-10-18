import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/gamification/presentation/providers/gamification_provider.dart';

class GlassLeaderboardScreen extends ConsumerWidget {
  const GlassLeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final leaderboardAsync = ref.watch(leaderboardProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            const Icon(Icons.emoji_events_outlined, color: LiquidGlassColors.primaryOrange),
            const SizedBox(width: 8),
            Text('Лидеры', style: LiquidGlassTextStyles.h3Light(isDark)),
          ],
        ),
      ),
      body: leaderboardAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (leaders) => ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: leaders.length,
          itemBuilder: (context, index) {
            final leader = leaders[index];
            final rank = leader['rank'] as int;
            final colors = [LiquidGlassColors.primaryOrange, LiquidGlassColors.primaryOrangeLight, const Color(0xFFCD7F32)];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: GlassPanel(
                padding: const EdgeInsets.all(16),
                color: rank <= 3 ? colors[rank - 1].withValues(alpha: 0.1) : null,
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: rank <= 3 ? colors[rank - 1] : (isDark ? Colors.white12 : Colors.black12),
                        shape: BoxShape.circle,
                      ),
                      child: Center(child: Text('$rank', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 18))),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(leader['name'], style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                          Text('${leader['points']} очков', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                        ],
                      ),
                    ),
                    if (rank <= 3) Icon(Icons.emoji_events_outlined, color: colors[rank - 1], size: 24),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
