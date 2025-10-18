import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

/// Glass Pending Content Screen - контент на модерации
class GlassPendingContentScreen extends ConsumerWidget {
  const GlassPendingContentScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final pendingAsync = ref.watch(adminPendingContentProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('На модерации', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: pendingAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (items) => ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GlassPanel(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.title, style: LiquidGlassTextStyles.h3Light(isDark)),
                  const SizedBox(height: 8),
                  Text(item.description, style: LiquidGlassTextStyles.bodySecondary(isDark)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: GlassButton.secondary('Отклонить', onTap: () => ref.read(adminPendingContentProvider.notifier).reject(int.parse(item.id)))),
                      const SizedBox(width: 12),
                      Expanded(child: GlassButton.primary('Одобрить', onTap: () => ref.read(adminPendingContentProvider.notifier).approve(int.parse(item.id)))),
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

