import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Service to store and retrieve pending actions for guests
/// When guest tries to perform action, we save it and redirect after login
class PendingActionService {
  static const String _key = 'pending_action';

  static Future<void> savePendingAction({
    required String actionType,
    Map<String, dynamic>? data,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    
    final action = {
      'type': actionType,
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
    };
    
    await prefs.setString(_key, json.encode(action));
  }

  static Future<Map<String, dynamic>?> getPendingAction() async {
    final prefs = await SharedPreferences.getInstance();
    final actionStr = prefs.getString(_key);
    
    if (actionStr == null) return null;
    
    try {
      return json.decode(actionStr) as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }

  static Future<void> clearPendingAction() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }

  static Future<void> executePendingAction(Map<String, dynamic> action) async {
    // Execute the saved action based on type
    final type = action['type'] as String?;
    
    switch (type) {
      case 'like_video':
        // Will be handled by video provider
        break;
      case 'add_comment':
        // Will be handled by comment provider
        break;
      case 'create_request':
        // Will be handled by request provider
        break;
      default:
        break;
    }
    
    await clearPendingAction();
  }
}

