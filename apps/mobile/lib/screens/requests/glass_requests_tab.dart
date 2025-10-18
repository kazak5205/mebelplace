import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_chip.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/requests/presentation/providers/requests_provider.dart';
import '../../features/requests/domain/entities/request_entity.dart';

class GlassRequestsTab extends ConsumerStatefulWidget {
  const GlassRequestsTab({super.key});

  @override
  ConsumerState<GlassRequestsTab> createState() => _GlassRequestsTabState();
}

class _GlassRequestsTabState extends ConsumerState<GlassRequestsTab> {
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(requestsProvider.notifier).loadRequests());
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final requestsState = ref.watch(requestsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
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
                GlassChip(label: 'Активные', isActive: _filter == 'active', onTap: () => setState(() => _filter = 'active')),
                const SizedBox(width: 8),
                GlassChip(label: 'Завершённые', isActive: _filter == 'completed', onTap: () => setState(() => _filter = 'completed')),
              ],
            ),
          ),
          Expanded(
            child: requestsState.isLoading 
              ? const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange))
              : requestsState.error != null
                ? Center(child: Text('Ошибка: ${requestsState.error}', style: const TextStyle(color: Colors.red)))
                : () {
                  final requests = requestsState.requests;
                  final filtered = _filter == 'all' 
                    ? requests 
                    : requests.where((r) => r.status == _filter).toList();

                  if (filtered.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.work_outline, size: 80, color: LiquidGlassColors.primaryOrange),
                          const SizedBox(height: 16),
                          Text('Нет заявок', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                        ],
                      ),
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final request = filtered[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: GestureDetector(
                          onTap: () => Navigator.pushNamed(context, '/requests/${request.id}'),
                          child: GlassPanel(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(request.title, style: LiquidGlassTextStyles.h3Light(isDark)),
                                const SizedBox(height: 8),
                                Text(request.description ?? 'Без описания', style: LiquidGlassTextStyles.bodySecondary(isDark), maxLines: 2, overflow: TextOverflow.ellipsis),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: LiquidGlassColors.success.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text('${request.proposalsCount ?? 0} откликов', style: TextStyle(color: LiquidGlassColors.success, fontSize: 12)),
                                    ),
                                    const Spacer(),
                                    Text(request.region ?? 'Не указан', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  );
                }(),
          ),
        ],
      ),
      floatingActionButton: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Material(
          color: LiquidGlassColors.primaryOrange,
          child: InkWell(
            onTap: () => Navigator.pushNamed(context, '/glass/request'),
            child: Container(
              padding: const EdgeInsets.all(16),
              child: const Icon(Icons.add, color: Colors.white, size: 28),
            ),
          ),
        ),
      ),
    );
  }
}
