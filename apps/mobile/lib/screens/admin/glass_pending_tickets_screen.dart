import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

class GlassPendingTicketsScreen extends ConsumerWidget {
  const GlassPendingTicketsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final ticketsAsync = ref.watch(adminTicketsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Открытые тикеты', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ticketsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (tickets) {
          final openTickets = tickets.where((t) => t.status == 'open').toList();
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: openTickets.length,
            itemBuilder: (context, index) {
              final ticket = openTickets[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GlassPanel(
                  padding: const EdgeInsets.all(16),
                  color: LiquidGlassColors.warning.withValues(alpha: 0.05),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text('#${ticket.id}', style: LiquidGlassTextStyles.h3.copyWith(color: LiquidGlassColors.primaryOrange)),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: LiquidGlassColors.warning.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text('Открыт', style: TextStyle(color: LiquidGlassColors.warning, fontSize: 12, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(ticket.subject, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                      const SizedBox(height: 12),
                      GlassButton.primary('Обработать', onTap: () {}),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
