import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/requests/presentation/providers/requests_provider.dart';

class GlassRequestDetailsScreen extends ConsumerStatefulWidget {
  final String requestId;

  const GlassRequestDetailsScreen({super.key, required this.requestId});

  @override
  ConsumerState<GlassRequestDetailsScreen> createState() => _GlassRequestDetailsScreenState();
}

class _GlassRequestDetailsScreenState extends ConsumerState<GlassRequestDetailsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(requestsProvider.notifier).loadRequests());
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final requestsState = ref.watch(requestsProvider);
    
    // Find request by ID
    final request = requestsState.requests.cast().firstWhere(
      (r) => r.id == widget.requestId,
      orElse: () => null,
    );

    if (requestsState.isLoading) {
      return Scaffold(
        backgroundColor: isDark ? Colors.black : Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text('Заявка', style: LiquidGlassTextStyles.h3Light(isDark)),
        ),
        body: const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
      );
    }

    if (request == null) {
      return Scaffold(
        backgroundColor: isDark ? Colors.black : Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text('Заявка', style: LiquidGlassTextStyles.h3Light(isDark)),
        ),
        body: const Center(child: Text('Заявка не найдена', style: TextStyle(color: Colors.red))),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Заявка #${request.id}', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(request.title, style: LiquidGlassTextStyles.h2Light(context)),
                const SizedBox(height: 8),
                Text(request.description ?? 'Без описания', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Icon(Icons.location_on_outlined, size: 16, color: isDark ? Colors.white70 : Colors.black54),
                    const SizedBox(width: 4),
                    Text(request.region ?? 'Не указан', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                    const SizedBox(width: 16),
                    Icon(Icons.access_time, size: 16, color: isDark ? Colors.white70 : Colors.black54),
                    const SizedBox(width: 4),
                    Text(
                      '${request.createdAt.difference(DateTime.now()).inDays.abs()} дней назад',
                      style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getStatusColor(request.status ?? 'active').withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _getStatusText(request.status ?? 'active'),
                    style: TextStyle(color: _getStatusColor(request.status ?? 'active'), fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassButton.primary(
            'Посмотреть отклики (${request.proposalsCount ?? 0})',
            onTap: () => Navigator.pushNamed(context, '/requests/${request.id}/responses'),
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
        return 'В обработке';
      case 'completed':
        return 'Завершена';
      default:
        return status;
    }
  }
}
