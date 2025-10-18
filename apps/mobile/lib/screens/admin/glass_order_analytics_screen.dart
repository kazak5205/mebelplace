import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

class GlassOrderAnalyticsScreen extends ConsumerWidget {
  const GlassOrderAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final analyticsAsync = ref.watch(adminOrderAnalyticsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Аналитика заказов', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: analyticsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (data) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                Expanded(child: _StatCard('${data['totalOrders']}', 'Заказов', Icons.shopping_bag_outlined, isDark)),
                const SizedBox(width: 12),
                Expanded(child: _StatCard('${data['completed']}', 'Выполнено', Icons.done_all_outlined, isDark)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _StatCard('${data['inProgress']}', 'В работе', Icons.hourglass_empty_outlined, isDark)),
                const SizedBox(width: 12),
                Expanded(child: _StatCard('${(data['avgCheck'] as num) ~/ 1000000}.${((data['avgCheck'] as num) % 1000000) ~/ 100000}M₸', 'Средний чек', Icons.attach_money_outlined, isDark)),
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
