import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_chip.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/orders/presentation/providers/orders_provider.dart';
import '../../features/orders/domain/entities/order_entity.dart';

class GlassMyOrdersScreen extends ConsumerStatefulWidget {
  const GlassMyOrdersScreen({super.key});

  @override
  ConsumerState<GlassMyOrdersScreen> createState() => _GlassMyOrdersScreenState();
}

class _GlassMyOrdersScreenState extends ConsumerState<GlassMyOrdersScreen> {
  String _filter = 'all';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final ordersAsync = ref.watch(ordersProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Мои заказы', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 60,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.all(16),
              children: [
                GlassChip(label: 'Все', isActive: _filter == 'all', onTap: () => setState(() => _filter = 'all')),
                const SizedBox(width: 8),
                GlassChip(label: 'В работе', isActive: _filter == 'active', onTap: () => setState(() => _filter = 'active')),
                const SizedBox(width: 8),
                GlassChip(label: 'Завершённые', isActive: _filter == 'completed', onTap: () => setState(() => _filter = 'completed')),
              ],
            ),
          ),
          Expanded(
            child: ordersAsync.when(
              loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
              error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
              data: (orders) {
                final filtered = _filter == 'all'
                  ? orders
                  : orders.where((o) => o.status == _filter).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.shopping_bag_outlined, size: 80, color: LiquidGlassColors.primaryOrange),
                        const SizedBox(height: 16),
                        Text('Нет заказов', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final order = filtered[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GlassPanel(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Заказ #${order.id}', style: LiquidGlassTextStyles.h3.copyWith(color: LiquidGlassColors.primaryOrange)),
                            const SizedBox(height: 8),
                            Text(order.productName ?? 'Без названия', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                            const SizedBox(height: 4),
                            Text('Мастер: ${order.masterName ?? "Не указан"}', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(order.status).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(_getStatusText(order.status), style: TextStyle(color: _getStatusColor(order.status), fontSize: 12)),
                                ),
                                const Spacer(),
                                Text('${order.totalPrice} ₸', style: LiquidGlassTextStyles.body.copyWith(color: LiquidGlassColors.success, fontWeight: FontWeight.w600)),
                              ],
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

  Color _getStatusColor(String status) {
    switch (status) {
      case 'active':
        return LiquidGlassColors.warning;
      case 'completed':
        return LiquidGlassColors.success;
      default:
        return LiquidGlassColors.info;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'active':
        return 'В работе';
      case 'completed':
        return 'Завершён';
      default:
        return status;
    }
  }
}
