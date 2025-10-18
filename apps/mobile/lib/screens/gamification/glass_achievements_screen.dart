import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/gamification/presentation/providers/gamification_provider.dart';

class GlassAchievementsScreen extends ConsumerWidget {
  const GlassAchievementsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final achievementsAsync = ref.watch(achievementsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Достижения', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: achievementsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (achievements) => GridView.count(
          crossAxisCount: 2,
          padding: const EdgeInsets.all(16),
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          children: achievements.map((ach) {
            final unlocked = ach['unlocked'] as bool;
            return GlassPanel(
              padding: const EdgeInsets.all(16),
              color: unlocked ? LiquidGlassColors.primaryOrange.withValues(alpha: 0.1) : null,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.military_tech_outlined,
                    size: 48,
                    color: unlocked ? LiquidGlassColors.primaryOrange : (isDark ? Colors.white38 : Colors.black38),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    ach['title'],
                    style: LiquidGlassTextStyles.bodySmall.copyWith(
                      color: unlocked ? (isDark ? Colors.white : Colors.black) : (isDark ? Colors.white38 : Colors.black38),
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (unlocked) ...[
                    const SizedBox(height: 4),
                    Text('+${ach['points']} очков', style: TextStyle(color: LiquidGlassColors.primaryOrange, fontSize: 12)),
                  ],
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
