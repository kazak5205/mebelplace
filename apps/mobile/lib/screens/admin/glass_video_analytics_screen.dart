import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

class GlassVideoAnalyticsScreen extends ConsumerWidget {
  const GlassVideoAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final analyticsAsync = ref.watch(adminVideoAnalyticsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Аналитика видео', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: analyticsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (data) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                Expanded(child: _StatCard('${data['totalVideos']}', 'Всего видео', Icons.video_library_outlined, isDark)),
                const SizedBox(width: 12),
                Expanded(child: _StatCard('${(data['totalViews'] as num) ~/ 1000}K', 'Просмотров', Icons.visibility_outlined, isDark)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _StatCard('${(data['totalLikes'] as num) ~/ 1000}K', 'Лайков', Icons.favorite_outlined, isDark)),
                const SizedBox(width: 12),
                Expanded(child: _StatCard('${data['totalComments']}', 'Комментариев', Icons.comment_outlined, isDark)),
              ],
            ),
            const SizedBox(height: 24),
            GlassPanel(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Топ видео', style: LiquidGlassTextStyles.h3Light(isDark)),
                  const SizedBox(height: 16),
                  ...(data['topVideos'] as List<Map<String, dynamic>>).asMap().entries.map((entry) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        Text('${entry.key + 1}.', style: LiquidGlassTextStyles.h3.copyWith(color: LiquidGlassColors.primaryOrange)),
                        const SizedBox(width: 12),
                        Expanded(child: Text(entry.value['title'], style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black))),
                        Text('${entry.value['views']} 👁', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                      ],
                    ),
                  )),
                ],
              ),
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
  final IconData icon;
  final bool isDark;

  const _StatCard(this.value, this.label, this.icon, this.isDark);

  @override
  Widget build(BuildContext context) {
    return GlassPanel(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Icon(icon, size: 32, color: LiquidGlassColors.primaryOrange),
          const SizedBox(height: 12),
          Text(value, style: LiquidGlassTextStyles.h2.copyWith(color: LiquidGlassColors.primaryOrange)),
          const SizedBox(height: 4),
          Text(label, style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
