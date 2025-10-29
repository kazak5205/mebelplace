import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/socket_service.dart';
import '../../data/models/message_model.dart';

// Socket Provider - управляет WebSocket подключением
final socketServiceProvider = Provider<SocketService>((ref) {
  final socket = SocketService();
  
  // Отключаем socket при dispose
  ref.onDispose(() {
    socket.disconnect();
  });
  
  return socket;
});

// Provider для статуса подключения
final socketConnectionProvider = StateNotifierProvider<SocketConnectionNotifier, bool>((ref) {
  return SocketConnectionNotifier(ref.watch(socketServiceProvider));
});

class SocketConnectionNotifier extends StateNotifier<bool> {
  final SocketService _socketService;
  
  SocketConnectionNotifier(this._socketService) : super(false) {
    _initializeSocket();
  }
  
  void _initializeSocket() {
    _socketService.onConnected = () {
      state = true;
    };
    
    _socketService.onDisconnected = () {
      state = false;
    };
  }
  
  Future<void> connect() async {
    await _socketService.connect();
  }
  
  void disconnect() {
    _socketService.disconnect();
  }
}

// Stream provider для новых сообщений
class NewMessageNotifier extends StateNotifier<MessageModel?> {
  final SocketService _socketService;
  
  NewMessageNotifier(this._socketService) : super(null) {
    _socketService.onNewMessage = (message) {
      state = message;
    };
  }
}

final newMessageProvider = StateNotifierProvider<NewMessageNotifier, MessageModel?>((ref) {
  return NewMessageNotifier(ref.watch(socketServiceProvider));
});

