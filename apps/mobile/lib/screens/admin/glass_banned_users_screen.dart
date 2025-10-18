import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

class GlassBannedUsersScreen extends ConsumerWidget {
  const GlassBannedUsersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bannedAsync = ref.watch(adminBannedUsersProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Заблокированные', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: bannedAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (users) => ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: users.length,
          itemBuilder: (context, index) {
            final user = users[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: GlassPanel(
                padding: const EdgeInsets.all(16),
                color: LiquidGlassColors.error.withValues(alpha: 0.05),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(backgroundColor: LiquidGlassColors.error, child: Text(user.username[0], style: const TextStyle(color: Colors.white))),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(user.username, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                              Text('Причина: ${'Banned' ?? "Не указана"}', style: LiquidGlassTextStyles.caption.copyWith(color: LiquidGlassColors.error)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    GlassButton.secondary('Разблокировать', onTap: () {}),
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
