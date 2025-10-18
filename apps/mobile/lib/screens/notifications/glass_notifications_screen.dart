import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/notifications/presentation/providers/notifications_provider.dart';

class GlassNotificationsScreen extends ConsumerWidget {
  const GlassNotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final notificationsAsync = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, title: Text('Уведомления', style: LiquidGlassTextStyles.h3Light(isDark))),
      body: notificationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (notifications) => ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: notifications.length,
          itemBuilder: (context, index) {
            final notif = notifications[index];
            final isRead = notif['isRead'] as bool;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: GlassPanel(
                padding: const EdgeInsets.all(16),
                color: !isRead ? LiquidGlassColors.primaryOrange.withValues(alpha: 0.05) : null,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.2), shape: BoxShape.circle),
                      child: const Icon(Icons.notifications_outlined, color: LiquidGlassColors.primaryOrange, size: 20),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(notif['title'], style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                          Text(
                            _formatTime(notif['time'] as DateTime),
                            style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54),
                          ),
                        ],
                      ),
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

  String _formatTime(DateTime time) {
    final diff = DateTime.now().difference(time);
    if (diff.inDays > 0) return '${diff.inDays} дней назад';
    if (diff.inHours > 0) return '${diff.inHours} часов назад';
    if (diff.inMinutes > 0) return '${diff.inMinutes} минут назад';
    return 'только что';
  }
}
