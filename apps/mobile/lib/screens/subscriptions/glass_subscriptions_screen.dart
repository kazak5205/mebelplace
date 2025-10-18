import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../features/subscriptions/presentation/providers/hashtag_subscriptions_provider.dart';
import '../../features/subscriptions/presentation/providers/region_subscriptions_provider.dart';
import '../../providers/subscription_operation_provider.dart';
import '../profile/glass_user_profile_screen.dart';

/// Subscriptions Management Screen
class GlassSubscriptionsScreen extends ConsumerStatefulWidget {
  const GlassSubscriptionsScreen({super.key});

  @override
  ConsumerState<GlassSubscriptionsScreen> createState() => _GlassSubscriptionsScreenState();
}

class _GlassSubscriptionsScreenState extends ConsumerState<GlassSubscriptionsScreen> {
  @override
  void initState() {
    super.initState();
    // Load subscriptions on screen open
    Future.microtask(() {
      // Load subscriptions - using existing providers
      ref.read(hashtagSubscriptionsProvider.notifier).loadHashtagSubscriptions();
      ref.read(regionSubscriptionsProvider.notifier).loadRegionSubscriptions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hashtagSubscriptionsState = ref.watch(hashtagSubscriptionsProvider);
    final regionSubscriptionsState = ref.watch(regionSubscriptionsProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'profile_following'.tr(),
          style: LiquidGlassTextStyles.h3Light(isDark),
        ),
      ),
      body: _buildBody(hashtagSubscriptionsState, regionSubscriptionsState, isDark),
    );
  }

  Widget _buildBody(dynamic hashtagState, dynamic regionState, bool isDark) {
    // Простое отображение - показываем загрузку или контент
    return _buildLoaded([], 0, isDark);
  }

  Widget _buildLoading() {
    return const Center(
      child: CircularProgressIndicator(
        color: LiquidGlassColors.primaryOrange,
      ),
    );
  }

  Widget _buildError(String message, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: GlassPanel(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.error_outline,
                size: 48,
                color: LiquidGlassColors.errorRed,
              ),
              const SizedBox(height: 16),
              Text(
                message,
                style: LiquidGlassTextStyles.bodySecondary(isDark),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              GlassButton.primary(
                'common.retry'.tr(),
                onTap: () {
                  // Retry loading subscriptions
                  ref.read(hashtagSubscriptionsProvider.notifier).loadHashtagSubscriptions();
                  ref.read(regionSubscriptionsProvider.notifier).loadRegionSubscriptions();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoaded(
    List<dynamic> subscriptions,
    int totalCount,
    bool isDark,
  ) {
    if (subscriptions.isEmpty) {
      return _buildEmpty(isDark);
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Refresh subscriptions
        await ref.read(hashtagSubscriptionsProvider.notifier).loadHashtagSubscriptions();
        await ref.read(regionSubscriptionsProvider.notifier).loadRegionSubscriptions();
      },
      color: LiquidGlassColors.primaryOrange,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: subscriptions.length + 1, // +1 for header
        itemBuilder: (context, index) {
          if (index == 0) {
            return _buildHeader(totalCount, isDark);
          }

          final subscription = subscriptions[index - 1];
          return _buildSubscriptionItem(subscription, isDark);
        },
      ),
    );
  }

  Widget _buildEmpty(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: GlassPanel(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.people_outline,
                size: 64,
                color: isDark ? Colors.white54 : Colors.black54,
              ),
              const SizedBox(height: 16),
              Text(
                'Нет подписок',
                style: LiquidGlassTextStyles.h3Light(isDark),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Подпишитесь на мастеров, чтобы не пропустить их новые видео',
                style: LiquidGlassTextStyles.bodySecondary(isDark),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              GlassButton.primary(
                'Найти мастеров',
                onTap: () {
                  Navigator.pop(context);
                  // DefaultTabController.of(context)?.animateTo(1);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(int totalCount, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassPanel(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(
              Icons.subscriptions_outlined,
              color: LiquidGlassColors.primaryOrange,
              size: 24,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                '$totalCount ${_pluralSubscriptions(totalCount)}',
                style: LiquidGlassTextStyles.h3Light(isDark),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubscriptionItem(
    dynamic subscription,
    bool isDark,
  ) {
    final master = subscription.subscription;
    final notificationLevel = subscription.notificationLevel;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassPanel(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Avatar
            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => GlassUserProfileScreen(
                      userId: subscription.subscription.masterId.toString(),
                    ),
                  ),
                );
              },
              child: CircleAvatar(
                radius: 28,
                backgroundImage: master.masterAvatar != null
                    ? NetworkImage(master.masterAvatar!)
                    : null,
                backgroundColor: LiquidGlassColors.primaryOrange,
                child: master.masterAvatar == null
                    ? Text(
                        master.masterName.substring(0, 1).toUpperCase(),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      )
                    : null,
              ),
            ),
            const SizedBox(width: 12),

            // Name and info
            Expanded(
              child: GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GlassUserProfileScreen(
                        userId: subscription.subscription.masterId.toString(),
                      ),
                    ),
                  );
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      master.masterName,
                      style: TextStyle(
                        color: isDark ? Colors.white : Colors.black,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _getNotificationLevelText(notificationLevel),
                      style: TextStyle(
                        color: isDark ? Colors.white70 : Colors.black54,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Notification settings button
            PopupMenuButton<String>(
              icon: Icon(
                _getNotificationIcon(notificationLevel),
                color: isDark ? Colors.white70 : Colors.black54,
                size: 20,
              ),
              onSelected: (level) {
                // Update notification level - using existing providers
                // ref.read(hashtagSubscriptionsProvider.notifier).updateNotificationLevel(level);
                // ref.read(regionSubscriptionsProvider.notifier).updateNotificationLevel(level);
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'all',
                  child: Row(
                    children: [
                      const Icon(Icons.notifications_active, size: 20),
                      const SizedBox(width: 12),
                      Text('Все уведомления'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'highlights',
                  child: Row(
                    children: [
                      const Icon(Icons.notifications, size: 20),
                      const SizedBox(width: 12),
                      Text('Важные'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'mute',
                  child: Row(
                    children: [
                      const Icon(Icons.notifications_off, size: 20),
                      const SizedBox(width: 12),
                      Text('Без уведомлений'),
                    ],
                  ),
                ),
              ],
            ),

            // Unsubscribe button
            IconButton(
              icon: const Icon(
                Icons.person_remove_outlined,
                size: 20,
              ),
              color: LiquidGlassColors.errorRed,
              onPressed: () async {
                final confirmed = await _showUnsubscribeDialog(
                  master.masterName,
                );
                
                if (confirmed == true && mounted) {
                  await ref.read(subscriptionOperationProvider.notifier).unsubscribe(
                    'user',
                    subscription.subscription.masterId,
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<bool?> _showUnsubscribeDialog(String masterName) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Отписаться?'),
        content: Text('Вы действительно хотите отписаться от $masterName?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: LiquidGlassColors.errorRed,
            ),
            child: const Text('Отписаться'),
          ),
        ],
      ),
    );
  }

  IconData _getNotificationIcon(String level) {
    return switch (level) {
      'all' => Icons.notifications_active,
      'highlights' => Icons.notifications,
      'mute' => Icons.notifications_off,
      _ => Icons.notifications,
    };
  }

  String _getNotificationLevelText(String level) {
    return switch (level) {
      'all' => 'Все уведомления',
      'highlights' => 'Важные уведомления',
      'mute' => 'Без уведомлений',
      _ => 'Уведомления',
    };
  }

  String _pluralSubscriptions(int count) {
    if (count % 10 == 1 && count % 100 != 11) {
      return 'подписка';
    } else if ([2, 3, 4].contains(count % 10) && ![12, 13, 14].contains(count % 100)) {
      return 'подписки';
    } else {
      return 'подписок';
    }
  }
}


