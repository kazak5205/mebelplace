import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../models/message_model.dart';
import 'local_storage.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  final LocalStorage _localStorage = LocalStorage();
  
  // Callbacks для обработки событий
  Function(MessageModel)? onNewMessage;
  Function(String chatId)? onTyping;
  Function()? onConnected;
  Function()? onDisconnected;

  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    if (_socket?.connected ?? false) {
      print('🔌 Socket already connected');
      return;
    }

    final token = await _localStorage.getToken();
    if (token == null) {
      print('❌ Cannot connect socket: no auth token');
      return;
    }

    try {
      print('🔌 Connecting to Socket.IO server...');
      
      _socket = IO.io('https://mebelplace.com.kz', <String, dynamic>{
        'transports': ['websocket'],
        'autoConnect': true,
        'auth': {'token': token},
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax': 5000,
        'reconnectionAttempts': 5,
      });

      _socket!.onConnect((_) {
        print('✅ Socket connected!');
        onConnected?.call();
      });

      _socket!.onDisconnect((_) {
        print('🔌 Socket disconnected');
        onDisconnected?.call();
      });

      _socket!.onConnectError((error) {
        print('❌ Socket connection error: $error');
      });

      _socket!.onError((error) {
        print('❌ Socket error: $error');
      });

      // Слушаем новые сообщения
      _socket!.on('new_message', (data) {
        print('📨 New message received: $data');
        try {
          final message = MessageModel.fromJson(data as Map<String, dynamic>);
          onNewMessage?.call(message);
        } catch (e) {
          print('❌ Error parsing message: $e');
        }
      });

      // Слушаем событие "пишет..."
      _socket!.on('typing', (data) {
        print('✍️ User is typing in chat: $data');
        if (data is Map && data['chatId'] != null) {
          onTyping?.call(data['chatId'].toString());
        }
      });

      // Слушаем событие "сообщение прочитано"
      _socket!.on('message_read', (data) {
        print('👁️ Message read: $data');
      });

      _socket!.connect();
      
    } catch (e) {
      print('❌ Failed to connect socket: $e');
    }
  }

  void disconnect() {
    if (_socket != null) {
      print('🔌 Disconnecting socket...');
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
    }
  }

  // Присоединиться к конкретному чату
  void joinChat(String chatId) {
    if (_socket?.connected ?? false) {
      print('🚪 Joining chat: $chatId');
      _socket!.emit('join_chat', {'chatId': chatId});
    }
  }

  // Покинуть чат
  void leaveChat(String chatId) {
    if (_socket?.connected ?? false) {
      print('🚪 Leaving chat: $chatId');
      _socket!.emit('leave_chat', {'chatId': chatId});
    }
  }

  // Отправить сообщение через WebSocket
  void sendMessage(String chatId, String content) {
    if (_socket?.connected ?? false) {
      print('📤 Sending message via socket: $content');
      _socket!.emit('send_message', {
        'chatId': chatId,
        'content': content,
      });
    }
  }

  // Отправить событие "пишет..."
  void sendTyping(String chatId) {
    if (_socket?.connected ?? false) {
      _socket!.emit('typing', {'chatId': chatId});
    }
  }

  // Пометить сообщения как прочитанные
  void markAsRead(String chatId, List<String> messageIds) {
    if (_socket?.connected ?? false) {
      _socket!.emit('mark_read', {
        'chatId': chatId,
        'messageIds': messageIds,
      });
    }
  }
}

