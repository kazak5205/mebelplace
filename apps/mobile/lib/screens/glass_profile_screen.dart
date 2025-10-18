import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/widgets/glass/glass_panel.dart';
import '../core/widgets/glass/glass_button.dart';
import '../core/theme/liquid_glass_colors.dart';
import '../core/theme/liquid_glass_text_styles.dart';
import '../features/auth/presentation/providers/auth_provider_export.dart';
import '../features/auth/presentation/providers/auth_state.dart';
import '../features/profile/presentation/providers/profile_provider.dart';
import '../core/theme/theme_provider.dart';

/// Glass Profile Screen
class GlassProfileScreen extends ConsumerWidget {
  const GlassProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authState = ref.watch(authProvider);
    final profileState = ref.watch(profileProvider);

    // Get user data
    final userName = authState is Authenticated 
        ? authState.user.username 
        : 'Guest';
    final userEmail = authState is Authenticated 
        ? authState.user.email 
        : '';

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Header с аватаром
                GlassPanel(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: LiquidGlassColors.primaryOrange,
                        child: Text(
                          userName.substring(0, 1).toUpperCase(),
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        userName,
                        style: LiquidGlassTextStyles.h2Light(context),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        userEmail,
                        style: LiquidGlassTextStyles.bodySecondary(isDark),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _StatColumn('42', 'Видео', isDark),
                          _StatColumn('1.2K', 'Подписчики', isDark),
                          _StatColumn('156', 'Подписки', isDark),
                        ],
                      ),
                      const SizedBox(height: 24),
                      GlassButton.primary(
                        'Редактировать профиль',
                        icon: const Icon(Icons.edit_outlined, size: 20, color: Colors.white),
                        onTap: () {},
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Мои видео
                GlassPanel(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.video_library_outlined,
                          color: LiquidGlassColors.primaryOrange,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          'Мои видео',
                          style: LiquidGlassTextStyles.body.copyWith(
                            color: isDark ? Colors.white : Colors.black,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 16,
                        color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Избранное
                GlassPanel(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.bookmark_outlined,
                          color: LiquidGlassColors.primaryOrange,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          'Избранное',
                          style: LiquidGlassTextStyles.body.copyWith(
                            color: isDark ? Colors.white : Colors.black,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 16,
                        color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Заказы
                GlassPanel(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.shopping_bag_outlined,
                          color: LiquidGlassColors.primaryOrange,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          'Мои заказы',
                          style: LiquidGlassTextStyles.body.copyWith(
                            color: isDark ? Colors.white : Colors.black,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 16,
                        color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Настройки
                GlassPanel(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Настройки',
                        style: LiquidGlassTextStyles.h3Light(isDark),
                      ),
                      const SizedBox(height: 16),
                      _SettingsItem(
                        icon: Icons.dark_mode_outlined,
                        title: 'Тёмная тема',
                        isDark: isDark,
                        trailing: Switch(
                          value: isDark,
                          onChanged: (value) {
                            ref.read(themeProvider.notifier).toggleTheme();
                          },
                          activeColor: LiquidGlassColors.primaryOrange,
                        ),
                      ),
                      const Divider(height: 32),
                      _SettingsItem(
                        icon: Icons.language_outlined,
                        title: 'Язык',
                        subtitle: 'Русский',
                        isDark: isDark,
                      ),
                      const Divider(height: 32),
                      _SettingsItem(
                        icon: Icons.notifications_outlined,
                        title: 'Уведомления',
                        isDark: isDark,
                      ),
                      const Divider(height: 32),
                      _SettingsItem(
                        icon: Icons.help_outline,
                        title: 'Поддержка',
                        isDark: isDark,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Выход
                GlassButton.secondary(
                  'Выйти',
                  icon: const Icon(Icons.logout_outlined, size: 20),
                  onTap: () async {
                    await ref.read(authProvider.notifier).logout();
                  },
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatColumn extends StatelessWidget {
  final String value;
  final String label;
  final bool isDark;

  const _StatColumn(this.value, this.label, this.isDark);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: LiquidGlassTextStyles.h2.copyWith(
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: LiquidGlassTextStyles.caption.copyWith(
            color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
          ),
        ),
      ],
    );
  }
}

class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool isDark;
  final Widget? trailing;

  const _SettingsItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.isDark,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          color: isDark ? Colors.white : Colors.black,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: LiquidGlassTextStyles.body.copyWith(
                  color: isDark ? Colors.white : Colors.black,
                ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(
                  subtitle!,
                  style: LiquidGlassTextStyles.caption.copyWith(
                    color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ],
          ),
        ),
        if (trailing != null)
          trailing!
        else
          Icon(
            Icons.arrow_forward_ios,
            size: 16,
            color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
          ),
      ],
    );
  }
}
