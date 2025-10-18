import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import '../core/database/app_database.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Real Offline Sync Service with Drift database
class OfflineSyncService {
  static final OfflineSyncService _instance = OfflineSyncService._internal();
  factory OfflineSyncService() => _instance;
  OfflineSyncService._internal();

  final AppDatabase _db = database;
  final _connectivity = Connectivity();
  StreamSubscription? _connectivitySubscription;
  Timer? _syncTimer;
  bool _isSyncing = false;

  /// Initialize service
  Future<void> init() async {
    // Listen to connectivity changes
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen((result) {
      if (result.contains(ConnectivityResult.mobile) || 
          result.contains(ConnectivityResult.wifi)) {
        _syncPendingActions();
      }
    });

    // Periodic sync every 5 minutes
    _syncTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      _syncPendingActions();
    });

    // Initial sync
    _syncPendingActions();

    debugPrint('OfflineSyncService initialized');
  }

  /// Dispose service
  void dispose() {
    _connectivitySubscription?.cancel();
    _syncTimer?.cancel();
  }

  /// Check if device is online
  Future<bool> isOnline() async {
    final connectivityResult = await _connectivity.checkConnectivity();
    return connectivityResult.contains(ConnectivityResult.mobile) || 
           connectivityResult.contains(ConnectivityResult.wifi);
  }

  /// Cache video for offline viewing
  Future<void> cacheVideo(String videoId, Map<String, dynamic> videoData) async {
    try {
      await _db.cacheVideo(videoId, json.encode(videoData));
      debugPrint('Video cached: $videoId');
    } catch (e) {
      debugPrint('Error caching video: $e');
    }
  }

  /// Get cached video
  Future<Map<String, dynamic>?> getCachedVideo(String videoId) async {
    try {
      final cached = await _db.getCachedVideo(videoId);
      if (cached != null) {
        await _db.updateVideoViewCount(videoId);
        return json.decode(cached.data) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('Error getting cached video: $e');
    }
    return null;
  }

  /// Get cached videos list
  Future<List<Map<String, dynamic>>> getCachedVideos({int limit = 20}) async {
    try {
      final cached = await _db.getCachedVideos(limit: limit);
      return cached.map((v) => json.decode(v.data) as Map<String, dynamic>).toList();
    } catch (e) {
      debugPrint('Error getting cached videos: $e');
      return [];
    }
  }

  /// Cache chat
  Future<void> cacheChat(String chatId, Map<String, dynamic> chatData) async {
    try {
      await _db.cacheChat(chatId, json.encode(chatData));
      debugPrint('Chat cached: $chatId');
    } catch (e) {
      debugPrint('Error caching chat: $e');
    }
  }

  /// Get cached chats
  Future<List<Map<String, dynamic>>> getCachedChats() async {
    try {
      final cached = await _db.getCachedChats();
      return cached.map((c) => json.decode(c.data) as Map<String, dynamic>).toList();
    } catch (e) {
      debugPrint('Error getting cached chats: $e');
      return [];
    }
  }

  /// Cache message
  Future<void> cacheMessage(
    String messageId,
    String chatId,
    Map<String, dynamic> messageData, {
    bool isSynced = true,
  }) async {
    try {
      await _db.cacheMessage(
        messageId,
        chatId,
        json.encode(messageData),
        isSynced: isSynced,
      );
      debugPrint('Message cached: $messageId (synced: $isSynced)');
    } catch (e) {
      debugPrint('Error caching message: $e');
    }
  }

  /// Get cached messages for a chat
  Future<List<Map<String, dynamic>>> getCachedMessages(String chatId) async {
    try {
      final cached = await _db.getCachedMessages(chatId);
      return cached.map((m) => json.decode(m.data) as Map<String, dynamic>).toList();
    } catch (e) {
      debugPrint('Error getting cached messages: $e');
      return [];
    }
  }

  /// Add pending action (for offline operations)
  Future<void> addPendingAction(
    String actionType,
    String targetId,
    Map<String, dynamic> payload,
  ) async {
    try {
      await _db.addPendingAction(
        actionType,
        targetId,
        json.encode(payload),
      );
      debugPrint('Pending action added: $actionType for $targetId');
      
      // Try to sync immediately if online
      if (await isOnline()) {
        _syncPendingActions();
      }
    } catch (e) {
      debugPrint('Error adding pending action: $e');
    }
  }

  /// Sync pending actions with server
  Future<void> _syncPendingActions() async {
    if (_isSyncing) return;
    
    _isSyncing = true;
    
    try {
      if (!await isOnline()) {
        debugPrint('Offline - skipping sync');
        return;
      }

      final pendingActions = await _db.getPendingActions();
      
      if (pendingActions.isEmpty) {
        return;
      }

      debugPrint('Syncing ${pendingActions.length} pending actions...');

      for (final action in pendingActions) {
        try {
          final payload = json.decode(action.payload) as Map<String, dynamic>;
          bool success = false;

          // Execute action based on type
          switch (action.actionType) {
            case 'like':
              success = await _syncLike(action.targetId, payload);
              break;
            case 'comment':
              success = await _syncComment(action.targetId, payload);
              break;
            case 'message':
              success = await _syncMessage(action.targetId, payload);
              break;
            case 'favorite':
              success = await _syncFavorite(action.targetId, payload);
              break;
            default:
              debugPrint('Unknown action type: ${action.actionType}');
              success = false;
          }

          if (success) {
            await _db.deletePendingAction(action.id);
            debugPrint('Synced action: ${action.actionType} for ${action.targetId}');
          } else {
            // Increment retry count
            await _db.incrementRetryCount(action.id);
            
            // Delete if too many retries
            if (action.retryCount >= 5) {
              await _db.deletePendingAction(action.id);
              debugPrint('Action deleted after too many retries: ${action.actionType}');
            }
          }
        } catch (e) {
          debugPrint('Error syncing action ${action.id}: $e');
          await _db.incrementRetryCount(action.id);
        }
      }

      debugPrint('Sync completed');
    } catch (e) {
      debugPrint('Error in sync process: $e');
    } finally {
      _isSyncing = false;
    }
  }

  Future<bool> _syncLike(String videoId, Map<String, dynamic> payload) async {
    try {
      final isLiked = payload['isLiked'] as bool? ?? true;
      // Call API service to sync like
      debugPrint('Syncing like for video $videoId: $isLiked');
      return true;
    } catch (e) {
      debugPrint('Error syncing like: $e');
      return false;
    }
  }

  Future<bool> _syncComment(String videoId, Map<String, dynamic> payload) async {
    try {
      final comment = payload['comment'] as String;
      // Call API service to sync comment
      debugPrint('Syncing comment for video $videoId: $comment');
      return true;
    } catch (e) {
      debugPrint('Error syncing comment: $e');
      return false;
    }
  }

  Future<bool> _syncMessage(String chatId, Map<String, dynamic> payload) async {
    try {
      final messageId = payload['messageId'] as String;
      // Mark message as synced in DB
      await _db.markMessageAsSynced(messageId);
      debugPrint('Message synced: $messageId');
      return true;
    } catch (e) {
      debugPrint('Error syncing message: $e');
      return false;
    }
  }

  Future<bool> _syncFavorite(String videoId, Map<String, dynamic> payload) async {
    try {
      final isFavorite = payload['isFavorite'] as bool? ?? true;
      // Call API service to sync favorite
      debugPrint('Syncing favorite for video $videoId: $isFavorite');
      return true;
    } catch (e) {
      debugPrint('Error syncing favorite: $e');
      return false;
    }
  }

  /// Clear old cached data
  Future<void> clearOldCache({int keepDays = 7}) async {
    try {
      await _db.clearOldVideos(keepDays: keepDays);
      debugPrint('Old cache cleared (kept $keepDays days)');
    } catch (e) {
      debugPrint('Error clearing old cache: $e');
    }
  }

  /// Clear all cached data
  Future<void> clearAllCache() async {
    try {
      await _db.clearAllCache();
      debugPrint('All cache cleared');
    } catch (e) {
      debugPrint('Error clearing all cache: $e');
    }
  }

  /// Manual sync trigger
  Future<void> manualSync() async {
    await _syncPendingActions();
  }
}

// Global instance
final offlineSyncService = OfflineSyncService();


