import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../core/theme/theme_provider.dart';

class GlassSettingsScreen extends ConsumerWidget {
  const GlassSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Настройки', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(16),
            child: _SettingItem(
              icon: Icons.dark_mode_outlined,
              title: 'Тёмная тема',
              isDark: isDark,
              trailing: Switch(
                value: isDark,
                onChanged: (v) => ref.read(themeProvider.notifier).toggleTheme(),
                activeColor: LiquidGlassColors.primaryOrange,
              ),
            ),
          ),
          const SizedBox(height: 12),
          GlassPanel(padding: const EdgeInsets.all(16), child: _SettingItem(icon: Icons.language_outlined, title: 'Язык', subtitle: 'Русский', isDark: isDark)),
          const SizedBox(height: 12),
          GlassPanel(padding: const EdgeInsets.all(16), child: _SettingItem(icon: Icons.notifications_outlined, title: 'Уведомления', isDark: isDark)),
          const SizedBox(height: 12),
          GlassPanel(padding: const EdgeInsets.all(16), child: _SettingItem(icon: Icons.privacy_tip_outlined, title: 'Конфиденциальность', isDark: isDark)),
          const SizedBox(height: 12),
          GlassPanel(padding: const EdgeInsets.all(16), child: _SettingItem(icon: Icons.info_outline, title: 'О приложении', subtitle: 'v2.0.0', isDark: isDark)),
        ],
      ),
    );
  }
}

class _SettingItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool isDark;
  final Widget? trailing;

  const _SettingItem({required this.icon, required this.title, this.subtitle, required this.isDark, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: isDark ? Colors.white : Colors.black),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
              if (subtitle != null) Text(subtitle!, style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
            ],
          ),
        ),
        if (trailing != null) trailing! else Icon(Icons.arrow_forward_ios, size: 16, color: isDark ? Colors.white54 : Colors.black54),
      ],
    );
  }
}

