import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider_export.dart';
import '../../../auth/presentation/providers/auth_state.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;


sealed class WebSocketState {}
class WebSocketDisconnected extends WebSocketState {}
class WebSocketConnecting extends WebSocketState {}
class WebSocketConnected extends WebSocketState {}
class WebSocketError extends WebSocketState {
  final String message;
  WebSocketError(this.message);
}

/// WebSocket provider for real-time chat updates - Riverpod 2.x migration
class ChatWebSocketNotifier extends StateNotifier<WebSocketState> {
  io.Socket? _socket;
  
  ChatWebSocketNotifier() : super(WebSocketDisconnected());

  void connect(String token) {
    state = WebSocketConnecting();

    try {
      _socket = io.io('http://localhost:8080', <String, dynamic>{
        'transports': ['websocket'],
        'auth': {'token': token},
      });

      _socket?.on('connect', (_) {
        state = WebSocketConnected();
      });

      _socket?.on('disconnect', (_) {
        state = WebSocketDisconnected();
      });

      _socket?.on('message', _handleMessage);

      _socket?.on('error', (error) {
        state = WebSocketError(error.toString());
      });

      _socket?.connect();
    } catch (e) {
      state = WebSocketError(e.toString());
    }
  }

  void _handleMessage(dynamic message) {
    try {
      final data = json.decode(message as String);
      final type = data['type'] as String?;

      if (type == 'message') {
        // Новое сообщение
        final chatId = data['chat_id'] as String?;
        if (chatId != null) {
          // ref.invalidate(messagesProvider(chatId));
        }
      } else if (type == 'typing') {
        // Пользователь печатает
      } else if (type == 'read') {
        // Сообщения прочитаны
        final chatId = data['chat_id'] as String?;
        if (chatId != null) {
          // ref.invalidate(messagesProvider(chatId));
        }
      }
    } catch (e) {
      // Ignore invalid messages
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    state = WebSocketDisconnected();
  }

  void sendMessage({
    required String chatId,
    required String text,
  }) {
    if (state is! WebSocketConnected) return;

    final message = {
      'type': 'message',
      'chat_id': chatId,
      'text': text,
      'timestamp': DateTime.now().toIso8601String(),
    };

    _socket?.emit('message', message);
  }

  void sendTypingIndicator({
    required String chatId,
    required bool isTyping,
  }) {
    if (state is! WebSocketConnected) return;

    final message = {
      'type': 'typing',
      'chat_id': chatId,
      'is_typing': isTyping,
    };

    _socket?.emit('typing', message);
  }

  void markAsRead({
    required String chatId,
    required List<String> messageIds,
  }) {
    if (state is! WebSocketConnected) return;

    final message = {
      'type': 'read',
      'chat_id': chatId,
      'message_ids': messageIds,
    };

    _socket?.emit('read', message);
  }
}

// Main export - Riverpod 2.x style
final chatWebSocketProvider = StateNotifierProvider<ChatWebSocketNotifier, WebSocketState>((ref) {
  return ChatWebSocketNotifier();
});
