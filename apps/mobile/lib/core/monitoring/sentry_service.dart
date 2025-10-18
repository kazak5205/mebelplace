import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:device_info_plus/device_info_plus.dart';

/// Реальный Sentry service без моков
/// Полная интеграция с error tracking и performance monitoring
class SentryService {
  static final SentryService _instance = SentryService._internal();
  factory SentryService() => _instance;
  SentryService._internal();

  bool _initialized = false;

  /// Инициализация Sentry с полной конфигурацией
  Future<void> init({
    required String dsn,
    String? environment,
    bool enableAutoSessionTracking = true,
    bool enableNativeCrashHandling = true,
    bool enableAutoPerformanceTracing = true,
  }) async {
    if (_initialized) return;

    try {
      // Получаем информацию о приложении
      final packageInfo = await PackageInfo.fromPlatform();
      final deviceInfo = await _getDeviceInfo();

      await SentryFlutter.init(
        (options) {
          options.dsn = dsn;
          
          // Environment
          options.environment = environment ?? (kDebugMode ? 'development' : 'production');
          
          // Release version
          options.release = '${packageInfo.appName}@${packageInfo.version}+${packageInfo.buildNumber}';
          
          // Performance monitoring
          options.tracesSampleRate = kDebugMode ? 1.0 : 0.2; // 100% dev, 20% prod
          options.profilesSampleRate = kDebugMode ? 1.0 : 0.1; // 100% dev, 10% prod
          
          // Enable automatic instrumentation
          options.enableAutoSessionTracking = enableAutoSessionTracking;
          options.enableNativeCrashHandling = enableNativeCrashHandling;
          options.enableAutoPerformanceTracing = enableAutoPerformanceTracing;
          
          // Max breadcrumbs
          options.maxBreadcrumbs = 100;
          
          // Attach screenshots on errors (only in debug)
          options.attachScreenshot = kDebugMode;
          options.screenshotQuality = SentryScreenshotQuality.low;
          
          // Attach view hierarchy
          options.attachViewHierarchy = kDebugMode;
          
          // Debug mode
          options.debug = kDebugMode;
          
          // Before send - filter sensitive data
          options.beforeSend = (event, hint) {
            // Remove sensitive data from request
            if (event.request != null) {
              final request = event.request!;
              
              // Remove auth headers - create new map without sensitive headers
              final headers = Map<String, String>.from(request.headers);
              headers.remove('Authorization');
              headers.remove('Cookie');
              headers.remove('X-Api-Key');
              headers.remove('X-Auth-Token');
              
              // Create new event with filtered request
              event = event.copyWith(
                request: SentryRequest.fromUri(
                  uri: request.url != null ? Uri.parse(request.url!) : Uri(),
                  method: request.method,
                  headers: headers,
                  data: request.data,
                ),
              );
            }
            
            // Add device context (Contexts() is always initialized in Sentry 9.x)
            event.contexts.device = SentryDevice(
              name: deviceInfo['name'] as String?,
              model: deviceInfo['model'] as String?,
              manufacturer: deviceInfo['manufacturer'] as String?,
              brand: deviceInfo['brand'] as String?,
              family: deviceInfo['family'] as String?,
              modelId: deviceInfo['modelId'] as String?,
              orientation: SentryOrientation.portrait,
              screenDensity: deviceInfo['screenDensity'] as double?,
              screenWidthPixels: deviceInfo['screenWidth'] as int?,
              screenHeightPixels: deviceInfo['screenHeight'] as int?,
              online: deviceInfo['online'] as bool?,
              charging: deviceInfo['charging'] as bool?,
              memorySize: deviceInfo['memorySize'] as int?,
              freeMemory: deviceInfo['freeMemory'] as int?,
              batteryLevel: deviceInfo['batteryLevel'] as double?,
            );
            
            event.contexts.app = SentryApp(
              name: packageInfo.appName,
              version: packageInfo.version,
              build: packageInfo.buildNumber,
            );
            
            return event;
          };
          
          // Before breadcrumb - filter sensitive data
          options.beforeBreadcrumb = (breadcrumb, hint) {
            if (breadcrumb == null) return null;
            
            // Filter sensitive data
            if (breadcrumb.data != null && breadcrumb.data!.isNotEmpty) {
              final data = Map<String, dynamic>.from(breadcrumb.data!);
              final sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'authorization'];
              
              bool modified = false;
              for (final key in sensitiveKeys) {
                if (data.containsKey(key)) {
                  data[key] = '[REDACTED]';
                  modified = true;
                }
              }
              
              if (modified) {
                // Create new breadcrumb with filtered data
                return Breadcrumb(
                  message: breadcrumb.message,
                  category: breadcrumb.category,
                  level: breadcrumb.level,
                  type: breadcrumb.type,
                  data: data,
                  timestamp: breadcrumb.timestamp,
                );
              }
            }
            
            return breadcrumb;
          };
          
          // Ignore specific errors
          options.ignoreErrors = [
            // Network errors (temporary)
            'SocketException',
            'HandshakeException',
            'NetworkImageLoadException',
            
            // Cancelled operations
            'operation_canceled',
            'operation_aborted',
            
            // Platform-specific false positives
            'PlatformException',
            'MissingPluginException',
          ];
        },
        appRunner: () {}, // Will be called from main
      );

      _initialized = true;
      
      // Set global tags after initialization
      Sentry.configureScope((scope) {
        scope.setTag('component', 'mobile-app');
        scope.setTag('platform', deviceInfo['platform']?.toString() ?? 'unknown');
        scope.setTag('device_model', deviceInfo['model']?.toString() ?? 'unknown');
      });
      
      // Add breadcrumb for successful init
      Sentry.addBreadcrumb(
        Breadcrumb(
          message: 'Sentry initialized successfully',
          category: 'init',
          level: SentryLevel.info,
          data: {
            'environment': environment ?? 'unknown',
            'release': '${packageInfo.version}+${packageInfo.buildNumber}',
          },
        ),
      );
      
    } catch (e) {
      debugPrint('Failed to initialize Sentry: $e');
    }
  }

  /// Получить информацию об устройстве (реальные данные)
  Future<Map<String, dynamic>> _getDeviceInfo() async {
    final deviceInfoPlugin = DeviceInfoPlugin();
    final Map<String, dynamic> deviceData = {};

    try {
      if (defaultTargetPlatform == TargetPlatform.android) {
        final androidInfo = await deviceInfoPlugin.androidInfo;
        deviceData['platform'] = 'android';
        deviceData['name'] = androidInfo.model;
        deviceData['model'] = androidInfo.model;
        deviceData['manufacturer'] = androidInfo.manufacturer;
        deviceData['brand'] = androidInfo.brand;
        deviceData['family'] = 'Android';
        deviceData['modelId'] = androidInfo.id;
        deviceData['online'] = true;
        // Note: totalMemory is not available in all Android versions
        // Use systemFeatures instead for device capability detection
      } else if (defaultTargetPlatform == TargetPlatform.iOS) {
        final iosInfo = await deviceInfoPlugin.iosInfo;
        deviceData['platform'] = 'ios';
        deviceData['name'] = iosInfo.name;
        deviceData['model'] = iosInfo.model;
        deviceData['manufacturer'] = 'Apple';
        deviceData['brand'] = 'Apple';
        deviceData['family'] = 'iOS';
        deviceData['modelId'] = iosInfo.identifierForVendor;
        deviceData['online'] = true;
      }
    } catch (e) {
      debugPrint('Error getting device info: $e');
    }

    return deviceData;
  }

  /// Set user information
  void setUser({
    required String id,
    String? email,
    String? username,
    Map<String, dynamic>? extra,
  }) {
    Sentry.configureScope(
      (scope) => scope.setUser(
        SentryUser(
          id: id,
          email: email,
          username: username,
          data: extra,
        ),
      ),
    );
  }

  /// Clear user (on logout)
  void clearUser() {
    Sentry.configureScope((scope) => scope.setUser(null));
  }

  /// Capture exception with context
  Future<SentryId> captureException(
    dynamic exception, {
    dynamic stackTrace,
    Hint? hint,
    Map<String, dynamic>? tags,
    Map<String, dynamic>? extra,
    SentryLevel? level,
  }) async {
    return await Sentry.captureException(
      exception,
      stackTrace: stackTrace,
      hint: hint,
      withScope: (scope) {
        if (tags != null) {
          tags.forEach((key, value) => scope.setTag(key, value.toString()));
        }
        if (extra != null) {
          // Use contexts instead of deprecated setExtra
          for (final entry in extra.entries) {
            scope.setContexts(entry.key, entry.value);
          }
        }
        if (level != null) {
          scope.level = level;
        }
      },
    );
  }

  /// Capture message
  Future<SentryId> captureMessage(
    String message, {
    SentryLevel? level,
    Map<String, dynamic>? tags,
    Map<String, dynamic>? extra,
  }) async {
    return await Sentry.captureMessage(
      message,
      level: level ?? SentryLevel.info,
      withScope: (scope) {
        if (tags != null) {
          tags.forEach((key, value) => scope.setTag(key, value.toString()));
        }
        if (extra != null) {
          // Use contexts instead of deprecated setExtra
          for (final entry in extra.entries) {
            scope.setContexts(entry.key, entry.value);
          }
        }
      },
    );
  }

  /// Add breadcrumb
  void addBreadcrumb({
    required String message,
    String? category,
    SentryLevel? level,
    Map<String, dynamic>? data,
  }) {
    Sentry.addBreadcrumb(
      Breadcrumb(
        message: message,
        category: category ?? 'custom',
        level: level ?? SentryLevel.info,
        data: data,
        timestamp: DateTime.now().toUtc(),
      ),
    );
  }

  /// Track API request
  Future<T> trackAPIRequest<T>({
    required String endpoint,
    required Future<T> Function() request,
  }) async {
    final transaction = Sentry.startTransaction(
      'API $endpoint',
      'http.client',
      bindToScope: true,
    );

    addBreadcrumb(
      message: 'API request to $endpoint',
      category: 'api',
      level: SentryLevel.info,
    );

    try {
      final result = await request();
      transaction.status = const SpanStatus.ok();
      
      addBreadcrumb(
        message: 'API request to $endpoint succeeded',
        category: 'api',
        level: SentryLevel.info,
      );
      
      return result;
    } catch (error, stackTrace) {
      transaction.status = const SpanStatus.internalError();
      transaction.throwable = error;
      
      addBreadcrumb(
        message: 'API request to $endpoint failed',
        category: 'api',
        level: SentryLevel.error,
        data: {'error': error.toString()},
      );
      
      await captureException(
        error,
        stackTrace: stackTrace,
        tags: {
          'api_endpoint': endpoint,
          'error_type': 'api_error',
        },
      );
      
      rethrow;
    } finally {
      await transaction.finish();
    }
  }

  /// Track navigation
  void trackNavigation(String from, String to) {
    addBreadcrumb(
      message: 'Navigated from $from to $to',
      category: 'navigation',
      level: SentryLevel.info,
      data: {
        'from': from,
        'to': to,
      },
    );
  }

  /// Track user action
  void trackUserAction(String action, {Map<String, dynamic>? data}) {
    addBreadcrumb(
      message: action,
      category: 'user',
      level: SentryLevel.info,
      data: data,
    );
  }

  /// Set tag
  void setTag(String key, String value) {
    Sentry.configureScope((scope) => scope.setTag(key, value));
  }

  /// Set context
  void setContext(String key, Map<String, dynamic> context) {
    Sentry.configureScope((scope) => scope.setContexts(key, context));
  }

  /// Close Sentry (flush events)
  Future<void> close() async {
    if (_initialized) {
      await Sentry.close();
      _initialized = false;
    }
  }
}

