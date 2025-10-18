import "dart:async";
import 'package:flutter/material.dart';
import '../services/offline_sync_service_real.dart';
import '../../core/theme/app_theme.dart';

/// Индикатор offline режима в UI
class OfflineIndicator extends StatefulWidget {
  const OfflineIndicator({super.key});

  @override
  State<OfflineIndicator> createState() => _OfflineIndicatorState();
}

class _OfflineIndicatorState extends State<OfflineIndicator> 
    with SingleTickerProviderStateMixin {
  final OfflineSyncService _offlineService = OfflineSyncService();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  bool _isOnline = true;
  int _pendingActions = 0;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: AppTheme.animationNormal,
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _init();
  }

  Future<void> _init() async {
    // Слушаем статус сети
    _offlineService.onlineStatus?.listen((isOnline) {
      if (mounted) {
        setState(() {
          _isOnline = isOnline;
        });
        
        if (!isOnline) {
          _animationController.forward();
        } else {
          _animationController.reverse();
        }
      }
    });

    // Обновляем счётчик pending actions каждые 5 секунд
    Timer.periodic(const Duration(seconds: 5), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      _updatePendingCount();
    });
  }

  Future<void> _updatePendingCount() async {
    final count = await _offlineService.getPendingCount();
    if (mounted) {
      setState(() {
        _pendingActions = count;
      });
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Показываем только если offline
    if (_isOnline && _pendingActions == 0) {
      return const SizedBox.shrink();
    }

    return FadeTransition(
      opacity: _fadeAnimation,
      child: Container(
        margin: const EdgeInsets.all(16.0),
        padding: const EdgeInsets.symmetric(
          horizontal: 24.0,
          vertical: 16.0,
        ),
        decoration: BoxDecoration(
          color: _isOnline 
              ? AppTheme.info.withValues(alpha: 0.9)
              : AppTheme.warning.withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(12.0),
          boxShadow: AppTheme.shadowMD,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _isOnline ? Icons.cloud_upload : Icons.cloud_off,
              color: Colors.white,
              size: AppTheme.iconSizeM,
            ),
            const SizedBox(width: 16.0),
            Expanded(
              child: Text(
                _isOnline
                    ? 'Синхронизация... ($_pendingActions действий)'
                    : 'Вы offline. Действия будут синхронизированы позже.',
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Offline mode badge для карточек
class OfflineBadge extends StatelessWidget {
  final bool isOfflineAction;

  const OfflineBadge({super.key, this.isOfflineAction = false});

  @override
  Widget build(BuildContext context) {
    if (!isOfflineAction) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8.0,
        vertical: AppTheme.spacingXS,
      ),
      decoration: BoxDecoration(
        color: AppTheme.warning,
        borderRadius: BorderRadius.circular(AppTheme.radiusS),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.cloud_off,
            size: 12,
            color: Colors.white,
          ),
          const SizedBox(width: 4),
          Text(
            'Offline',
            style: AppTheme.labelSmall.copyWith(
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

