import 'dart:async';
import 'package:flutter/foundation.dart';
import 'push_payload.dart';
import 'notification_types.dart';

/// Service to batch and throttle push notifications
/// Prevents spam by grouping similar notifications
class PushBatchingService {
  // Batch storage: channelId -> List<PushPayload>
  final Map<String, List<PushPayload>> _batches = {};
  
  // Throttle tracking: channelId -> lastSentTime
  final Map<String, DateTime> _lastSent = {};
  
  // Deduplication: eventId -> timestamp
  final Map<String, DateTime> _seenEvents = {};
  
  Timer? _batchTimer;
  
  static const Duration throttleWindow = Duration(minutes: 10);
  static const Duration batchDelay = Duration(seconds: 5);
  static const int maxBatchSize = 5;
  
  /// Check if notification should be batched
  bool shouldBatch(PushPayload payload) {
    // High priority notifications are never batched
    if (payload.type.isHighPriority) {
      return false;
    }

    // Check for duplicates
    final eventId = _generateEventId(payload);
    if (_seenEvents.containsKey(eventId)) {
      final lastSeen = _seenEvents[eventId]!;
      if (DateTime.now().difference(lastSeen) < const Duration(minutes: 1)) {
        debugPrint('Duplicate notification ignored: $eventId');
        return false; // Ignore duplicate
      }
    }
    _seenEvents[eventId] = DateTime.now();

    // Check throttling
    final channelId = _getChannelId(payload);
    if (_lastSent.containsKey(channelId)) {
      final lastSentTime = _lastSent[channelId]!;
      if (DateTime.now().difference(lastSentTime) < throttleWindow) {
        debugPrint('Notification throttled for channel: $channelId');
        return true; // Should batch
      }
    }

    return false;
  }

  /// Add notification to batch
  void addToBatch(PushPayload payload) {
    final channelId = _getChannelId(payload);
    
    _batches.putIfAbsent(channelId, () => []);
    _batches[channelId]!.add(payload);
    
    debugPrint('Added to batch for channel $channelId: ${_batches[channelId]!.length} items');
    
    // If batch is full, flush immediately
    if (_batches[channelId]!.length >= maxBatchSize) {
      _flushBatch(channelId);
    }
  }

  /// Schedule batch display after delay
  void scheduleBatchDisplay(Function(PushPayload) displayCallback) {
    _batchTimer?.cancel();
    
    _batchTimer = Timer(batchDelay, () {
      for (final channelId in _batches.keys) {
        final batch = _batches[channelId]!;
        if (batch.isNotEmpty) {
          final groupedPayload = _createGroupedPayload(channelId, batch);
          displayCallback(groupedPayload);
          _flushBatch(channelId);
        }
      }
    });
  }

  /// Create a grouped notification from batch
  PushPayload _createGroupedPayload(String channelId, List<PushPayload> batch) {
    if (batch.length == 1) {
      return batch.first;
    }

    final type = batch.first.type;
    String title;
    String body;

    switch (type) {
      case NotificationType.videoPublished:
        title = 'Новые видео';
        body = 'Опубликовано ${batch.length} новых видео';
        break;
      case NotificationType.storyPublished:
        title = 'Новые истории';
        body = '${batch.length} новых историй от ваших подписок';
        break;
      default:
        title = 'Новые уведомления';
        body = '${batch.length} новых уведомлений';
    }

    return PushPayload(
      type: type,
      title: title,
      body: body,
      data: {
        'batched': true,
        'count': batch.length,
        'items': batch.map((p) => p.data).toList(),
      },
      timestamp: DateTime.now(),
    );
  }

  void _flushBatch(String channelId) {
    _batches.remove(channelId);
    _lastSent[channelId] = DateTime.now();
    debugPrint('Batch flushed for channel: $channelId');
  }

  String _getChannelId(PushPayload payload) {
    // Extract channel ID from payload data
    return payload.data['channel_id']?.toString() ?? 
           payload.data['user_id']?.toString() ?? 
           'default';
  }

  String _generateEventId(PushPayload payload) {
    return '${payload.type.key}_${payload.data['video_id'] ?? payload.data['stream_id'] ?? payload.data['chat_id'] ?? DateTime.now().millisecondsSinceEpoch}';
  }

  /// Cleanup old entries
  void cleanup() {
    final now = DateTime.now();
    
    // Remove old seen events (older than 1 hour)
    _seenEvents.removeWhere((_, time) => now.difference(time) > const Duration(hours: 1));
    
    // Remove old throttle entries (older than throttle window)
    _lastSent.removeWhere((_, time) => now.difference(time) > throttleWindow);
  }

  void dispose() {
    _batchTimer?.cancel();
    _batches.clear();
    _lastSent.clear();
    _seenEvents.clear();
  }
}


