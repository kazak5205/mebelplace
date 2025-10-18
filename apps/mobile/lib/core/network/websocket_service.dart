import 'package:flutter/foundation.dart';

import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

/// WebSocket service для real-time обновлений
class WebSocketService {
  io.Socket? _socket;
  final FlutterSecureStorage _secureStorage;
  final Map<String, List<Function(dynamic)>> _listeners = {};
  bool _isConnected = false;
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;

  WebSocketService(this._secureStorage);

  bool get isConnected => _isConnected;

  /// Подключиться к WebSocket
  Future<void> connect() async {
    if (_isConnected) return;

    final token = await _secureStorage.read(key: AppConstants.accessTokenKey);
    
    if (token == null) {
      throw Exception('No auth token found');
    }

    _socket = io.io(
      AppConstants.wsBaseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _setupSocketListeners();
    _socket!.connect();
  }

  void _setupSocketListeners() {
    _socket!.onConnect((_) {
      debugPrint('WebSocket connected');
      _isConnected = true;
      _reconnectAttempts = 0;
      _reconnectTimer?.cancel();
    });

    _socket!.onDisconnect((_) {
      debugPrint('WebSocket disconnected');
      _isConnected = false;
      _attemptReconnect();
    });

    _socket!.onError((error) {
      debugPrint('WebSocket error: $error');
    });

    // Generic message handler
    _socket!.on('message', (data) {
      _notifyListeners('message', data);
    });
  }

  void _attemptReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      debugPrint('Max reconnect attempts reached');
      return;
    }

    _reconnectAttempts++;
    final delay = Duration(seconds: _reconnectAttempts * 2);

    _reconnectTimer = Timer(delay, () {
      debugPrint('Attempting to reconnect... (attempt $_reconnectAttempts)');
      connect();
    });
  }

  /// Подписаться на канал
  void subscribe(String channel) {
    _socket?.emit('subscribe', {'channel': channel});
  }

  /// Отписаться от канала
  void unsubscribe(String channel) {
    _socket?.emit('unsubscribe', {'channel': channel});
  }

  /// Отправить событие
  void emit(String event, dynamic data) {
    if (!_isConnected) {
      debugPrint('Cannot emit: socket not connected');
      return;
    }
    _socket?.emit(event, data);
  }

  /// Слушать событие
  void on(String event, Function(dynamic) callback) {
    if (!_listeners.containsKey(event)) {
      _listeners[event] = [];
      
      // Подписываемся на событие от сервера
      _socket?.on(event, (data) {
        _notifyListeners(event, data);
      });
    }

    _listeners[event]!.add(callback);
  }

  /// Отписаться от события
  void off(String event, [Function(dynamic)? callback]) {
    if (callback == null) {
      _listeners.remove(event);
      _socket?.off(event);
    } else {
      _listeners[event]?.remove(callback);
      
      if (_listeners[event]?.isEmpty ?? false) {
        _listeners.remove(event);
        _socket?.off(event);
      }
    }
  }

  void _notifyListeners(String event, dynamic data) {
    final callbacks = _listeners[event];
    if (callbacks != null) {
      for (final callback in callbacks) {
        callback(data);
      }
    }
  }

  /// Отключиться
  void disconnect() {
    _reconnectTimer?.cancel();
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
    _listeners.clear();
  }

  void dispose() {
    disconnect();
  }
}

/// Singleton instance
class WebSocketManager {
  static WebSocketService? _instance;

  static WebSocketService getInstance(FlutterSecureStorage storage) {
    _instance ??= WebSocketService(storage);
    return _instance!;
  }

  static void dispose() {
    _instance?.dispose();
    _instance = null;
  }
}

