import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/hashtag_subscriptions_provider.dart';
import '../../../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../domain/entities/hashtag_subscription_entity.dart';


class MyHashtagsScreen extends ConsumerStatefulWidget {
  const MyHashtagsScreen({super.key});

  @override
  ConsumerState<MyHashtagsScreen> createState() => _MyHashtagsScreenState();
}

class _MyHashtagsScreenState extends ConsumerState<MyHashtagsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(hashtagSubscriptionsProvider.notifier).loadHashtagSubscriptions());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(hashtagSubscriptionsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Мои хэштеги'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _buildBody(state, isDark),
    );
  }

  Widget _buildBody(HashtagSubscriptionsState state, bool isDark) {
    if (state is HashtagSubscriptionsLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state is HashtagSubscriptionsError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(state.message),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(hashtagSubscriptionsProvider.notifier).loadHashtagSubscriptions(),
              child: const Text('Повторить'),
            ),
          ],
        ),
      );
    }

    if (state is HashtagSubscriptionsLoaded) {
      if (state.subscriptions.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.tag, size: 64, color: Colors.grey),
              const SizedBox(height: 16),
              Text(
                'Нет подписок на хэштеги',
                style: TextStyle(fontSize: 18, color: Colors.grey),
              ),
            ],
          ),
        );
      }

      return ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: state.subscriptions.length,
        itemBuilder: (context, index) {
          final subscription = state.subscriptions[index];
          return _buildHashtagCard(subscription, isDark);
        },
      );
    }

    return const SizedBox();
  }

  Widget _buildHashtagCard(HashtagSubscriptionEntity subscription, bool isDark) {
    return GlassPanel(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Hashtag icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    LiquidGlassColors.primaryOrange.withValues(alpha: 0.3),
                    LiquidGlassColors.primaryOrange.withValues(alpha: 0.1),
                  ],
                ),
              ),
              child: Icon(Icons.tag, color: LiquidGlassColors.primaryOrange),
            ),
            
            const SizedBox(width: 16),
            
            // Hashtag info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '#${subscription.hashtag}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _getNotificationLevelText(subscription.notificationLevel),
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            
            // Actions
            PopupMenuButton<String>(
              onSelected: (value) {
                switch (value) {
                  case 'all':
                    ref.read(hashtagSubscriptionsProvider.notifier)
                        .updateNotificationLevel(subscription.hashtag, SubscriptionNotificationLevel.all);
                    break;
                  case 'highlights':
                    ref.read(hashtagSubscriptionsProvider.notifier)
                        .updateNotificationLevel(subscription.hashtag, SubscriptionNotificationLevel.highlights);
                    break;
                  case 'mute':
                    ref.read(hashtagSubscriptionsProvider.notifier)
                        .updateNotificationLevel(subscription.hashtag, SubscriptionNotificationLevel.mute);
                    break;
                  case 'unsubscribe':
                    ref.read(hashtagSubscriptionsProvider.notifier)
                        .unsubscribe(subscription.hashtag);
                    break;
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(value: 'all', child: Text('Все уведомления')),
                const PopupMenuItem(value: 'highlights', child: Text('Только важные')),
                const PopupMenuItem(value: 'mute', child: Text('Без уведомлений')),
                const PopupMenuDivider(),
                const PopupMenuItem(value: 'unsubscribe', child: Text('Отписаться')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getNotificationLevelText(SubscriptionNotificationLevel level) {
    switch (level) {
      case SubscriptionNotificationLevel.all:
        return 'Все уведомления';
      case SubscriptionNotificationLevel.highlights:
        return 'Только важные';
      case SubscriptionNotificationLevel.mute:
        return 'Без уведомлений';
    }
  }
}

