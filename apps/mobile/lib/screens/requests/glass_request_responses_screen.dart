import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/requests/presentation/providers/proposals_provider.dart';

class GlassRequestResponsesScreen extends ConsumerStatefulWidget {
  final String requestId;

  const GlassRequestResponsesScreen({super.key, required this.requestId});

  @override
  ConsumerState<GlassRequestResponsesScreen> createState() => _GlassRequestResponsesScreenState();
}

class _GlassRequestResponsesScreenState extends ConsumerState<GlassRequestResponsesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(proposalsProvider.notifier).loadProposals(widget.requestId));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final proposalsAsync = ref.watch(proposalsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Отклики', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: proposalsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (proposals) {
          if (proposals.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inbox_outlined, size: 80, color: LiquidGlassColors.primaryOrange),
                  const SizedBox(height: 16),
                  Text('Нет откликов', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: proposals.length,
            itemBuilder: (context, index) {
              final proposal = proposals[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GlassPanel(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: LiquidGlassColors.primaryOrange,
                            child: Text(proposal.masterName[0], style: const TextStyle(color: Colors.white)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(proposal.masterName, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black, fontWeight: FontWeight.w600)),
                                Text('Рейтинг ${proposal.masterRating?.toStringAsFixed(1) ?? "N/A"}', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text('Цена: ${proposal.price} ₸', style: LiquidGlassTextStyles.h3.copyWith(color: LiquidGlassColors.primaryOrange)),
                      Text('Срок: ${proposal.estimatedDays} дней', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                      if (proposal.message != null) ...[
                        const SizedBox(height: 8),
                        Text(proposal.message!, style: LiquidGlassTextStyles.bodySmall.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                      ],
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: GlassButton.secondary('Отклонить', onTap: () {})),
                          const SizedBox(width: 12),
                          Expanded(child: GlassButton.primary('Принять', onTap: () async {
                            await ref.read(proposalsProvider.notifier).acceptProposal(proposal.id);
                            if (context.mounted) {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Предложение принято!'), backgroundColor: LiquidGlassColors.success),
                              );
                            }
                          })),
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
    );
  }
}
