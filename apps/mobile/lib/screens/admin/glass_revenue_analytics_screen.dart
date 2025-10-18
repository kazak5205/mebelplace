import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

class GlassRevenueAnalyticsScreen extends ConsumerWidget {
  const GlassRevenueAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final revenueAsync = ref.watch(adminRevenueProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Выручка', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: revenueAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (data) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            GlassPanel(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text('Общая выручка', style: LiquidGlassTextStyles.bodySecondary(isDark)),
                  const SizedBox(height: 8),
                  Text('${(data['total'] as num) ~/ 1000},${((data['total'] as num) % 1000).toString().padLeft(3, '0')} ₸', style: LiquidGlassTextStyles.h1.copyWith(color: LiquidGlassColors.success, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Column(
                        children: [
                          Text('Сегодня', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                          const SizedBox(height: 4),
                          Text('${(data['today'] as num) ~/ 1000} ₸', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                        ],
                      ),
                      Column(
                        children: [
                          Text('За месяц', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                          const SizedBox(height: 4),
                          Text('${(data['month'] as num) ~/ 1000} ₸', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
