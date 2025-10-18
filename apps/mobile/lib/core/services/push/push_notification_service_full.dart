import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';
import 'notification_types.dart';
import 'push_payload.dart';
import 'push_batching_service.dart';

/// Full-featured push notification service with type support and deep linking
class PushNotificationServiceFull {
  static final PushNotificationServiceFull _instance = PushNotificationServiceFull._internal();
  factory PushNotificationServiceFull() => _instance;
  PushNotificationServiceFull._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  final PushBatchingService _batchingService = PushBatchingService();
  
  GoRouter? _router;
  String? _fcmToken;
  
  final StreamController<PushPayload> _notificationStreamController = 
      StreamController<PushPayload>.broadcast();
  
  Stream<PushPayload> get notificationStream => _notificationStreamController.stream;

  Future<void> initialize({required GoRouter router}) async {
    _router = router;

    // Request permissions
    await _requestPermissions();

    // Initialize local notifications
    await _initializeLocalNotifications();

    // Get FCM token
    _fcmToken = await _firebaseMessaging.getToken();
    debugPrint('FCM Token: $_fcmToken');

    // Listen to token refresh
    _firebaseMessaging.onTokenRefresh.listen((token) {
      _fcmToken = token;
      // Send to backend
      _sendTokenToBackend(token);
    });

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle background/terminated messages
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);
    
    // Check if app was opened from terminated state
    final initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleBackgroundMessage(initialMessage);
    }

    debugPrint('Push Notification Service initialized');
  }

  Future<void> _requestPermissions() async {
    final settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('Push notifications authorized');
    } else {
      debugPrint('Push notifications not authorized');
    }
  }

  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings();
    
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      settings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }

  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground message: ${message.messageId}');
    
    final payload = PushPayload.fromMap({
      'type': message.data['type'],
      'title': message.notification?.title ?? '',
      'body': message.notification?.body ?? '',
      'data': message.data,
      'image_url': message.notification?.android?.imageUrl ?? message.notification?.apple?.imageUrl,
      'timestamp': DateTime.now().toIso8601String(),
      'deep_link': message.data['deep_link'],
    });

    // Check if should batch
    if (_batchingService.shouldBatch(payload)) {
      _batchingService.addToBatch(payload);
      // Batch will be shown automatically after delay
      _batchingService.scheduleBatchDisplay(_showLocalNotification);
    } else {
      // Show immediately
      _showLocalNotification(payload);
    }

    _notificationStreamController.add(payload);
  }

  void _handleBackgroundMessage(RemoteMessage message) {
    debugPrint('Background message tapped: ${message.messageId}');
    
    final payload = PushPayload.fromMap({
      'type': message.data['type'],
      'title': message.notification?.title ?? '',
      'body': message.notification?.body ?? '',
      'data': message.data,
      'timestamp': DateTime.now().toIso8601String(),
      'deep_link': message.data['deep_link'],
    });

    _navigateToScreen(payload);
  }

  Future<void> _showLocalNotification(PushPayload payload) async {
    final androidDetails = AndroidNotificationDetails(
      'default_channel',
      'Default Channel',
      channelDescription: 'Default notification channel',
      importance: payload.type.isHighPriority ? Importance.max : Importance.high,
      priority: payload.type.isHighPriority ? Priority.max : Priority.high,
      largeIcon: payload.imageUrl != null 
          ? DrawableResourceAndroidBitmap('@mipmap/ic_launcher')
          : null,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      payload.timestamp.millisecondsSinceEpoch ~/ 1000,
      payload.title,
      payload.body,
      details,
      payload: payload.toMap().toString(),
    );
  }

  void _onNotificationTapped(NotificationResponse response) {
    if (response.payload == null) return;

    // Parse payload and navigate
    try {
      final data = response.payload!;
      // Simplified parsing - in real app parse JSON properly
      debugPrint('Notification tapped: $data');
    } catch (e) {
      debugPrint('Error parsing notification payload: $e');
    }
  }

  void _navigateToScreen(PushPayload payload) {
    if (_router == null) return;

    final deepLink = payload.generateDeepLink();
    _router!.go(deepLink);
  }

  Future<void> _sendTokenToBackend(String token) async {
    // Send FCM token to backend API
    debugPrint('Sending FCM token to backend: $token');
    // Implement API call here
  }

  String? get fcmToken => _fcmToken;

  void dispose() {
    _notificationStreamController.close();
  }
}

/// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Background message: ${message.messageId}');
}


