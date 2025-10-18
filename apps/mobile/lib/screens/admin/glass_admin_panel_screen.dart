import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

/// Glass Admin Panel - главная панель админа
class GlassAdminPanelScreen extends ConsumerWidget {
  const GlassAdminPanelScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final statsAsync = ref.watch(adminStatsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Панель администратора',
          style: LiquidGlassTextStyles.h3Light(isDark),
        ),
      ),
      body: statsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (stats) => GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        children: [
          _AdminCard(
            icon: Icons.pending_outlined,
            title: 'На модерации',
            count: '${stats.pendingContentCount}',
            color: LiquidGlassColors.warning,
            onTap: () => Navigator.pushNamed(context, '/admin/pending'),
            isDark: isDark,
          ),
          _AdminCard(
            icon: Icons.flag_outlined,
            title: 'Жалобы',
            count: '${stats.reportedContentCount}',
            color: LiquidGlassColors.error,
            onTap: () => Navigator.pushNamed(context, '/admin/reported'),
            isDark: isDark,
          ),
          _AdminCard(
            icon: Icons.people_outlined,
            title: 'Пользователи',
            count: '${stats.totalUsers}',
            color: LiquidGlassColors.info,
            onTap: () => Navigator.pushNamed(context, '/admin/users'),
            isDark: isDark,
          ),
          _AdminCard(
            icon: Icons.block_outlined,
            title: 'Забанены',
            count: '${stats.bannedUsers}',
            color: LiquidGlassColors.error,
            onTap: () => Navigator.pushNamed(context, '/admin/banned'),
            isDark: isDark,
          ),
          _AdminCard(
            icon: Icons.support_agent_outlined,
            title: 'Тикеты',
            count: '${stats.pendingTickets}',
            color: LiquidGlassColors.primaryOrange,
            onTap: () => Navigator.pushNamed(context, '/admin/tickets'),
            isDark: isDark,
          ),
          _AdminCard(
            icon: Icons.ad_units_outlined,
            title: 'Реклама',
            count: '${stats.activeAds}',
            color: LiquidGlassColors.success,
            onTap: () => Navigator.pushNamed(context, '/admin/ads'),
            isDark: isDark,
          ),
          _AdminCard(
            icon: Icons.analytics_outlined,
            title: 'Аналитика видео',
            count: '',
            color: LiquidGlassColors.info,
            onTap: () => Navigator.pushNamed(context, '/admin/video-analytics'),
            isDark: isDark,
          ),
          _AdminCard(
            icon: Icons.people_alt_outlined,
            title: 'Аналитика юзеров',
            count: '',
            color: LiquidGlassColors.info,
            onTap: () => Navigator.pushNamed(context, '/admin/user-analytics'),
            isDark: isDark,
          ),
          _AdminCard(
            icon: Icons.shopping_bag_outlined,
            title: 'Заказы',
            count: '156',
            color: LiquidGlassColors.success,
            onTap: () => Navigator.pushNamed(context, '/admin/order-analytics'),
            isDark: isDark,
          ),
          _AdminCard(
            icon: Icons.attach_money_outlined,
            title: 'Выручка',
            count: '2.5M₸',
            color: LiquidGlassColors.success,
            onTap: () => Navigator.pushNamed(context, '/admin/revenue'),
            isDark: isDark,
          ),
        ],
      ),
      ),
    );
  }
}

class _AdminCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String count;
  final Color color;
  final VoidCallback onTap;
  final bool isDark;

  const _AdminCard({
    required this.icon,
    required this.title,
    required this.count,
    required this.color,
    required this.onTap,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: GlassPanel(
        padding: const EdgeInsets.all(20),
        borderRadius: 20,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: LiquidGlassTextStyles.bodySmall.copyWith(
                color: isDark ? Colors.white : Colors.black,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
            ),
            if (count.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                count,
                style: LiquidGlassTextStyles.h3.copyWith(
                  color: color,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

