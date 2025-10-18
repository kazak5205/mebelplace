import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

/// Glass Reported Content Screen - жалобы на контент
class GlassReportedContentScreen extends ConsumerWidget {
  const GlassReportedContentScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final reportsAsync = ref.watch(adminReportedContentProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Жалобы', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: reportsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (reports) => ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: reports.length,
          itemBuilder: (context, index) {
            final report = reports[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: GlassPanel(
                padding: const EdgeInsets.all(16),
                borderRadius: 16,
                color: LiquidGlassColors.error.withValues(alpha: 0.05),
                borderColor: LiquidGlassColors.error.withValues(alpha: 0.3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.flag_outlined, color: LiquidGlassColors.error, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text('Жалоба #${report.id}', style: LiquidGlassTextStyles.h3.copyWith(color: LiquidGlassColors.error)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text('Причина: ${report.reason}', style: LiquidGlassTextStyles.bodySecondary(isDark)),
                    const SizedBox(height: 8),
                    Text('${report.contentType}: "${report.contentTitle}"', style: LiquidGlassTextStyles.bodySmall.copyWith(color: isDark ? Colors.white : Colors.black)),
                    const SizedBox(height: 8),
                    Text('От: ${report.reporterName}', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(child: GlassButton.secondary('Отклонить жалобу', onTap: () {})),
                        const SizedBox(width: 8),
                        Expanded(child: GlassButton.primary('Удалить контент', onTap: () {})),
                      ],
                    ),
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
