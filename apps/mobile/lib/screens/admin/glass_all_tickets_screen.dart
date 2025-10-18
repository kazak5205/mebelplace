import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_chip.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

class GlassAllTicketsScreen extends ConsumerStatefulWidget {
  const GlassAllTicketsScreen({super.key});

  @override
  ConsumerState<GlassAllTicketsScreen> createState() => _GlassAllTicketsScreenState();
}

class _GlassAllTicketsScreenState extends ConsumerState<GlassAllTicketsScreen> {
  String _status = 'all';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final ticketsAsync = ref.watch(adminTicketsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Тикеты поддержки', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                GlassChip(label: 'Все', isActive: _status == 'all', onTap: () => setState(() => _status = 'all')),
                const SizedBox(width: 8),
                GlassChip(label: 'Открытые', isActive: _status == 'open', onTap: () => setState(() => _status = 'open')),
                const SizedBox(width: 8),
                GlassChip(label: 'Закрытые', isActive: _status == 'closed', onTap: () => setState(() => _status = 'closed')),
              ],
            ),
          ),
          Expanded(
            child: ticketsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
              error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
              data: (tickets) {
                final filtered = _status == 'all' ? tickets : tickets.where((t) => t.status == _status).toList();
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final ticket = filtered[index];
                    final isClosed = ticket.status == 'closed';
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GlassPanel(
                        padding: const EdgeInsets.all(16),
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
                                    color: isClosed ? LiquidGlassColors.success.withValues(alpha: 0.2) : LiquidGlassColors.warning.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    isClosed ? 'Закрыт' : 'Открыт',
                                    style: LiquidGlassTextStyles.caption.copyWith(
                                      color: isClosed ? LiquidGlassColors.success : LiquidGlassColors.warning,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(ticket.subject, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                            const SizedBox(height: 4),
                            Text(
                              '${ticket.createdAt.difference(DateTime.now()).inDays.abs()} дней назад',
                              style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white54 : Colors.black54),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
