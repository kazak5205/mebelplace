import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/notifications/presentation/providers/notifications_provider.dart';

class GlassNotificationsSettingsScreen extends ConsumerWidget {
  const GlassNotificationsSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final settings = ref.watch(notificationsSettingsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, title: Text('Настройки уведомлений', style: LiquidGlassTextStyles.h3Light(isDark))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(16),
            child: _SettingSwitch('Новые заявки', settings['newRequests'] ?? true, isDark, () => ref.read(notificationsSettingsProvider.notifier).toggle('newRequests')),
          ),
          const SizedBox(height: 12),
          GlassPanel(padding: const EdgeInsets.all(16), child: _SettingSwitch('Новые отклики', settings['newProposals'] ?? true, isDark, () => ref.read(notificationsSettingsProvider.notifier).toggle('newProposals'))),
          const SizedBox(height: 12),
          GlassPanel(padding: const EdgeInsets.all(16), child: _SettingSwitch('Сообщения', settings['messages'] ?? true, isDark, () => ref.read(notificationsSettingsProvider.notifier).toggle('messages'))),
          const SizedBox(height: 12),
          GlassPanel(padding: const EdgeInsets.all(16), child: _SettingSwitch('Лайки и комментарии', settings['likesComments'] ?? false, isDark, () => ref.read(notificationsSettingsProvider.notifier).toggle('likesComments'))),
        ],
      ),
    );
  }
}

class _SettingSwitch extends StatelessWidget {
  final String title;
  final bool value;
  final bool isDark;
  final VoidCallback onChanged;

  const _SettingSwitch(this.title, this.value, this.isDark, this.onChanged);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(title, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black))),
        Switch(value: value, onChanged: (v) => onChanged(), activeColor: LiquidGlassColors.primaryOrange),
      ],
    );
  }
}
