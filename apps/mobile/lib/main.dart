import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/providers/app_state_provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'core/theme/mebelplace_colors.dart';
import 'screens/simple_app_screen.dart';
import 'services/push_notification_service.dart';
import 'core/monitoring/sentry_service.dart';
import 'core/api/unified_api_client.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Инициализация Sentry (РЕАЛЬНАЯ интеграция)
  final sentryDsn = const String.fromEnvironment('SENTRY_DSN', defaultValue: '');
  if (sentryDsn.isNotEmpty) {
    await SentryFlutter.init(
      (options) {
        options.dsn = sentryDsn;
        options.environment = kDebugMode ? 'development' : 'production';
        options.tracesSampleRate = kDebugMode ? 1.0 : 0.2;
        options.profilesSampleRate = kDebugMode ? 1.0 : 0.1;
        options.enableAutoSessionTracking = true;
        options.enableNativeCrashHandling = true;
        options.enableAutoPerformanceTracing = true;
        options.attachScreenshot = kDebugMode;
        options.debug = kDebugMode;
        
        // Before send hook - filter sensitive data
        options.beforeSend = (event, hint) {
          // Remove sensitive headers
          if (event.request != null) {
            final request = event.request!;
            final headers = request.headers ?? {};
            headers.remove('Authorization');
            headers.remove('Cookie');
            headers.remove('X-Api-Key');
            
            event = event.copyWith(
              request: request.copyWith(headers: headers),
            );
          }
          return event;
        };
        
        // Ignore specific errors
        options.ignoreErrors = [
          'SocketException',
          'HandshakeException',
          'NetworkImageLoadException',
          'operation_canceled',
          'operation_aborted',
        ];
      },
      appRunner: () => _runApp(),
    );
  } else {
    debugPrint('Sentry DSN not provided, skipping Sentry initialization');
    _runApp();
  }
}

void _runApp() async {
  // Инициализация сервисов
  try {
    UnifiedApiClient().init();
    debugPrint('✅ OpenAPI Client initialized successfully');
  } catch (e) {
    debugPrint('❌ Error initializing OpenAPI Client: $e');
    // Capture error to Sentry if initialized
    if (const String.fromEnvironment('SENTRY_DSN', defaultValue: '').isNotEmpty) {
      Sentry.captureException(e);
    }
  }
  
  // Инициализация Firebase (опциональная)
  try {
    await Firebase.initializeApp();
    // Инициализация push-уведомлений
    await PushNotificationService().initialize();
  } catch (e) {
    debugPrint('Firebase не настроен, продолжаем без push-уведомлений: $e');
    // Capture error to Sentry if initialized
    if (const String.fromEnvironment('SENTRY_DSN', defaultValue: '').isNotEmpty) {
      Sentry.captureException(e);
    }
  }
  
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MebelPlace',
      theme: ThemeData(
        primarySwatch: Colors.orange,
        primaryColor: MebelPlaceColors.primary,
        scaffoldBackgroundColor: MebelPlaceColors.background,
        brightness: Brightness.dark,
      ),
      themeMode: ThemeMode.system,
      debugShowCheckedModeBanner: false,
      localizationsDelegates: const [
        // AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ru', ''),
        Locale('kk', ''),
        Locale('en', ''),
      ],
      locale: const Locale('ru', ''),
      home: const SimpleAppScreen(),
    );
  }
}

class AuthWrapper extends ConsumerWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(appStateProvider);
    
    if (authState.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }
    
    // Проверяем, прошел ли пользователь onboarding
    // final hasSeenOnboarding = ref.watch(hasSeenOnboardingProvider);
    // if (!hasSeenOnboarding) {
    //   return const OnboardingScreen();
    // }
    
    // Согласно ТЗ: незарегистрированные пользователи тоже видят все 5 кнопок
    // но получают попап регистрации при попытке взаимодействия
    return const SimpleAppScreen();
  }
}
