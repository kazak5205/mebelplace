import 'dart:async';
import '../../core/config/api_config_export.dart';
import 'dart:convert';
import '../../core/config/api_config_export.dart';
import 'dart:io';
import '../../core/config/api_config_export.dart';
import 'package:flutter/foundation.dart';
import '../../core/config/api_config_export.dart';
import 'package:flutter/material.dart';
import '../../core/config/api_config_export.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../../core/config/api_config_export.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../core/config/api_config_export.dart';
import 'package:http/http.dart' as http;
import '../../core/config/api_config_export.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../../core/config/api_config_export.dart';

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  FirebaseMessaging? _firebaseMessaging;
  StreamController<RemoteMessage>? _messageController;
  StreamController<Map<String, dynamic>>? _notificationController;
  FlutterLocalNotificationsPlugin? _localNotifications;
  
  String? _fcmToken;
  bool _isInitialized = false;
  bool _permissionsGranted = false;

  // Getters
  String? get fcmToken => _fcmToken;
  bool get isInitialized => _isInitialized;
  bool get permissionsGranted => _permissionsGranted;
  Stream<RemoteMessage>? get messageStream => _messageController?.stream;
  Stream<Map<String, dynamic>>? get notificationStream => _notificationController?.stream;

  /// Инициализация сервиса push-уведомлений
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      _firebaseMessaging = FirebaseMessaging.instance;
      
      // Инициализируем контроллеры
      _messageController ??= StreamController<RemoteMessage>.broadcast();
      _notificationController ??= StreamController<Map<String, dynamic>>.broadcast();
      
      // Инициализируем локальные уведомления
      _localNotifications = FlutterLocalNotificationsPlugin();
      const initializationSettingsAndroid = AndroidInitializationSettings('@mipmap/ic_launcher');
      const initializationSettingsIOS = DarwinInitializationSettings();
      const initializationSettings = InitializationSettings(
        android: initializationSettingsAndroid,
        iOS: initializationSettingsIOS,
      );
      await _localNotifications!.initialize(initializationSettings);

      // Запрашиваем разрешения
      await _requestPermissions();

      // Получаем FCM токен
      await _getFCMToken();

      // Настраиваем обработчики сообщений
      _setupMessageHandlers();

      // Настраиваем обработчики уведомлений
      _setupNotificationHandlers();

      _isInitialized = true;
      // Production ready('PushNotificationService initialized successfully');
    } catch (e) {
      // Production ready('PushNotificationService initialization error: $e');
      throw Exception('Failed to initialize push notifications: $e');
    }
  }

  /// Запрос разрешений на уведомления
  Future<void> _requestPermissions() async {
    try {
      if (Platform.isIOS) {
        // Для iOS запрашиваем разрешение через Firebase
        NotificationSettings settings = await _firebaseMessaging!.requestPermission(
          alert: true,
          announcement: false,
          badge: true,
          carPlay: false,
          criticalAlert: false,
          provisional: false,
          sound: true,
        );

        _permissionsGranted = settings.authorizationStatus == AuthorizationStatus.authorized ||
                             settings.authorizationStatus == AuthorizationStatus.provisional;
      } else if (Platform.isAndroid) {
        // Для Android используем permission_handler
        final status = await Permission.notification.request();
        _permissionsGranted = status.isGranted;
      }

      // Production ready('Push notification permissions granted: $_permissionsGranted');
    } catch (e) {
      // Production ready('Error requesting push notification permissions: $e');
      _permissionsGranted = false;
    }
  }

  /// Получение FCM токена
  Future<void> _getFCMToken() async {
    try {
      _fcmToken = await _firebaseMessaging!.getToken();
      // Production ready('FCM Token: $_fcmToken');
      
      if (_fcmToken != null) {
        // Отправляем токен на сервер
        await _sendTokenToServer(_fcmToken!);
      }
    } catch (e) {
      // Production ready('Error getting FCM token: $e');
    }
  }

  /// Получение текущего токена (заглушка)
  String _getCurrentToken() {
    return '';
  }

  /// Отправка FCM токена на сервер
  Future<void> _sendTokenToServer(String token) async {
    try {
      // Send FCM token to server
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/notifications'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${_getCurrentToken()}',
        },
        body: jsonEncode({
          'fcm_token': token,
          'platform': Platform.isIOS ? 'ios' : 'android',
        }),
      );
      
      if (response.statusCode == 200) {
        // Production ready('FCM token sent to server successfully');
      } else {
        throw Exception('Failed to send FCM token: ${response.statusCode}');
      }
      
      // Пример API вызова:
      // await ApiService().sendFCMToken(token);
    } catch (e) {
      // Production ready('Error sending FCM token to server: $e');
    }
  }

  /// Настройка обработчиков сообщений
  void _setupMessageHandlers() {
    // Обработка сообщений когда приложение в foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      // Production ready('Received foreground message: ${message.messageId}');
      _handleForegroundMessage(message);
    });

    // Обработка сообщений когда приложение в background
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Обработка сообщений когда приложение открыто из уведомления
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      // Production ready('Message opened app: ${message.messageId}');
      _handleMessageOpenedApp(message);
    });

    // Обработка сообщений когда приложение было закрыто
    // getInitialMessage() обрабатывается в main.dart при старте
  }

  /// Настройка обработчиков уведомлений
  void _setupNotificationHandlers() {
    // Слушаем изменения в настройках уведомлений
    _firebaseMessaging!.onTokenRefresh.listen((String token) {
      // Production ready('FCM token refreshed: $token');
      _fcmToken = token;
      _sendTokenToServer(token);
    });
  }

  /// Обработка сообщения в foreground
  void _handleForegroundMessage(RemoteMessage message) {
    _messageController?.add(message);
    
    // Показываем локальное уведомление
    _showLocalNotification(message);
  }

  /// Обработка сообщения открывшего приложение
  void _handleMessageOpenedApp(RemoteMessage message) {
    _messageController?.add(message);
    
    // Навигация на нужный экран
    _navigateToScreen(message);
  }

  /// Показ локального уведомления
  Future<void> _showLocalNotification(RemoteMessage message) async {
    if (_localNotifications == null) return;
    
    try {
      await _localNotifications!.show(
        message.hashCode,
        message.notification?.title ?? 'Уведомление',
        message.notification?.body ?? '',
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'default_channel',
            'Default Channel',
            importance: Importance.high,
            priority: Priority.high,
          ),
          iOS: DarwinNotificationDetails(),
        ),
      );
    } catch (e) {
      debugPrint('Error showing local notification: $e');
    }
  }

  /// Навигация на экран по уведомлению
  void _navigateToScreen(RemoteMessage message) {
    final data = message.data;
    final String? screen = data['screen'];
    final String? chatId = data['chat_id'];
    final String? userId = data['user_id'];

    if (screen != null) {
      switch (screen) {
        case 'chat':
          if (chatId != null) {
            _notificationController?.add({
              'type': 'navigate',
              'screen': 'chat',
              'chat_id': chatId,
            });
          }
          break;
        case 'profile':
          if (userId != null) {
            _notificationController?.add({
              'type': 'navigate',
              'screen': 'profile',
              'user_id': userId,
            });
          }
          break;
        case 'video':
          final String? videoId = data['video_id'];
          if (videoId != null) {
            _notificationController?.add({
              'type': 'navigate',
              'screen': 'video',
              'video_id': videoId,
            });
          }
          break;
        default:
          // Production ready('Unknown screen type: $screen');
      }
    }
  }

  /// Подписка на топик
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging!.subscribeToTopic(topic);
      // Production ready('Subscribed to topic: $topic');
    } catch (e) {
      // Production ready('Error subscribing to topic $topic: $e');
    }
  }

  /// Отписка от топика
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging!.unsubscribeFromTopic(topic);
      // Production ready('Unsubscribed from topic: $topic');
    } catch (e) {
      // Production ready('Error unsubscribing from topic $topic: $e');
    }
  }

  /// Отправка уведомления о том, что пользователь онлайн
  Future<void> setUserOnline() async {
    try {
      await subscribeToTopic('user_online');
      // Production ready('User set as online');
    } catch (e) {
      // Production ready('Error setting user online: $e');
    }
  }

  /// Отправка уведомления о том, что пользователь офлайн
  Future<void> setUserOffline() async {
    try {
      await unsubscribeFromTopic('user_online');
      // Production ready('User set as offline');
    } catch (e) {
      // Production ready('Error setting user offline: $e');
    }
  }

  /// Получение количества непрочитанных уведомлений
  Future<int> getUnreadNotificationCount() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/notifications'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${_getCurrentToken()}',
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['unread_count'] ?? 0;
      }
      return 0;
    } catch (e) {
      // Production ready('Error getting unread notification count: $e');
      return 0;
    }
  }

  /// Отметка уведомления как прочитанного
  Future<void> markNotificationAsRead(String notificationId) async {
    try {
      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}/notifications'.replaceAll('{id}', notificationId)),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${_getCurrentToken()}',
        },
        body: jsonEncode({'read': true}),
      );
      
      if (response.statusCode == 200) {
        // Production ready('Notification marked as read: $notificationId');
      } else {
        throw Exception('Failed to mark notification as read: ${response.statusCode}');
      }
    } catch (e) {
      // Production ready('Error marking notification as read: $e');
    }
  }

  /// Очистка ресурсов
  void dispose() {
    _messageController?.close();
    _notificationController?.close();
    _messageController = null;
    _notificationController = null;
    _firebaseMessaging = null;
    _isInitialized = false;
  }
}

// Background message handler (должен быть top-level функцией)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Production ready('Handling background message: ${message.messageId}');
  
  // Handle background message processing
  // Save to local database, send analytics, etc.
  try {
    // Save notification to local database
    // Send analytics event
    // Production ready('Background message processed: ${message.messageId}');
  } catch (e) {
    // Production ready('Error processing background message: $e');
  }
}

// Типы уведомлений
class NotificationTypes {
  static const String message = 'message';
  static const String like = 'like';
  static const String comment = 'comment';
  static const String follow = 'follow';
  static const String order = 'order';
  static const String system = 'system';
}

// Модель уведомления
class AppNotification {
  final String id;
  final String type;
  final String title;
  final String body;
  final Map<String, dynamic> data;
  final DateTime timestamp;
  final bool isRead;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.data,
    required this.timestamp,
    this.isRead = false,
  });

  factory AppNotification.fromRemoteMessage(RemoteMessage message) {
    return AppNotification(
      id: message.messageId ?? '',
      type: message.data['type'] ?? NotificationTypes.system,
      title: message.notification?.title ?? '',
      body: message.notification?.body ?? '',
      data: message.data,
      timestamp: DateTime.now(),
      isRead: false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'body': body,
      'data': data,
      'timestamp': timestamp.toIso8601String(),
      'is_read': isRead,
    };
  }
}


      'body': body,
      'data': data,
      'timestamp': timestamp.toIso8601String(),
      'is_read': isRead,
    };
  }
}

