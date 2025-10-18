import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/gamification/presentation/providers/gamification_provider.dart';

class GlassUserStatsScreen extends ConsumerWidget {
  const GlassUserStatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final statsAsync = ref.watch(userStatsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, title: Text('Статистика', style: LiquidGlassTextStyles.h3Light(isDark))),
      body: statsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (stats) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            GlassPanel(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text('Ваш уровень', style: LiquidGlassTextStyles.bodySecondary(isDark)),
                  const SizedBox(height: 8),
                  Text('${stats['level']}', style: LiquidGlassTextStyles.h1.copyWith(color: LiquidGlassColors.primaryOrange, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  LinearProgressIndicator(
                    value: (stats['points'] as int) / (stats['nextLevelPoints'] as int),
                    color: LiquidGlassColors.primaryOrange,
                    backgroundColor: isDark ? Colors.white12 : Colors.black12,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'До ${stats['level']! + 1} уровня: ${stats['nextLevelPoints']! - stats['points']!} очков',
                    style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _StatCard('${stats['likesGiven']}', 'Лайков дано', isDark)),
                const SizedBox(width: 12),
                Expanded(child: _StatCard('${stats['commentsPosted']}', 'Комментов', isDark)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final bool isDark;

  const _StatCard(this.value, this.label, this.isDark);

  @override
  Widget build(BuildContext context) {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Text(value, style: LiquidGlassTextStyles.h2.copyWith(color: LiquidGlassColors.primaryOrange)),
          const SizedBox(height: 4),
          Text(label, style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
