# 🏗️ СТРУКТУРА FLUTTER ПРОЕКТА MEBELPLACE

## 📁 АРХИТЕКТУРА ПРОЕКТА

```
mebelplace_flutter/
├── 📱 android/                    # Android специфичные файлы
│   ├── app/
│   │   ├── build.gradle
│   │   ├── proguard-rules.pro
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── kotlin/
│   │       └── res/
│   └── gradle/
├── 🍎 ios/                        # iOS специфичные файлы
│   ├── Runner/
│   │   ├── Info.plist
│   │   ├── AppDelegate.swift
│   │   └── Assets.xcassets/
│   └── Runner.xcodeproj/
├── 🖥️ linux/                      # Linux desktop файлы
├── 🖥️ macos/                      # macOS desktop файлы
├── 🖥️ web/                        # Web файлы
│   └── index.html
├── 🖥️ windows/                    # Windows desktop файлы
├── 📦 lib/                        # Основной код приложения
│   ├── 🎯 main.dart               # Точка входа
│   ├── 📱 app/                    # Конфигурация приложения
│   │   ├── app.dart
│   │   ├── app_config.dart
│   │   └── app_router.dart
│   ├── 🎨 core/                   # Основные компоненты
│   │   ├── 🎨 design_system/      # Glass UI дизайн система
│   │   │   ├── colors.dart
│   │   │   ├── typography.dart
│   │   │   ├── spacing.dart
│   │   │   ├── animations.dart
│   │   │   └── glass_effects.dart
│   │   ├── 🌐 constants/          # Константы приложения
│   │   │   ├── api_constants.dart
│   │   │   ├── app_constants.dart
│   │   │   └── storage_keys.dart
│   │   ├── 🛠️ utils/              # Утилиты
│   │   │   ├── validators.dart
│   │   │   ├── formatters.dart
│   │   │   ├── date_utils.dart
│   │   │   └── extensions.dart
│   │   ├── 🚨 exceptions/         # Обработка ошибок
│   │   │   ├── app_exceptions.dart
│   │   │   └── error_handler.dart
│   │   └── 🔧 services/           # Базовые сервисы
│   │       ├── api_service.dart
│   │       ├── storage_service.dart
│   │       ├── notification_service.dart
│   │       └── analytics_service.dart
│   ├── 📊 data/                   # Слой данных
│   │   ├── 📡 api/                # API клиенты
│   │   │   ├── auth_api.dart
│   │   │   ├── video_api.dart
│   │   │   ├── chat_api.dart
│   │   │   ├── request_api.dart
│   │   │   └── webrtc_api.dart
│   │   ├── 🗄️ models/             # Модели данных
│   │   │   ├── user_model.dart
│   │   │   ├── video_model.dart
│   │   │   ├── chat_model.dart
│   │   │   ├── request_model.dart
│   │   │   └── notification_model.dart
│   │   ├── 🏪 repositories/       # Репозитории
│   │   │   ├── auth_repository.dart
│   │   │   ├── video_repository.dart
│   │   │   ├── chat_repository.dart
│   │   │   └── request_repository.dart
│   │   └── 📦 providers/          # Data providers
│   │       ├── local_provider.dart
│   │       └── remote_provider.dart
│   ├── 🧠 domain/                 # Бизнес логика
│   │   ├── 📋 entities/           # Сущности
│   │   │   ├── user_entity.dart
│   │   │   ├── video_entity.dart
│   │   │   ├── chat_entity.dart
│   │   │   └── request_entity.dart
│   │   ├── 🔄 usecases/           # Случаи использования
│   │   │   ├── auth/
│   │   │   │   ├── login_usecase.dart
│   │   │   │   ├── register_usecase.dart
│   │   │   │   └── logout_usecase.dart
│   │   │   ├── video/
│   │   │   │   ├── get_videos_usecase.dart
│   │   │   │   ├── upload_video_usecase.dart
│   │   │   │   └── like_video_usecase.dart
│   │   │   ├── chat/
│   │   │   │   ├── send_message_usecase.dart
│   │   │   │   ├── get_messages_usecase.dart
│   │   │   │   └── start_call_usecase.dart
│   │   │   └── request/
│   │   │       ├── create_request_usecase.dart
│   │   │       ├── get_requests_usecase.dart
│   │   │       └── create_proposal_usecase.dart
│   │   └── 📝 repositories/       # Интерфейсы репозиториев
│   │       ├── auth_repository_interface.dart
│   │       ├── video_repository_interface.dart
│   │       ├── chat_repository_interface.dart
│   │       └── request_repository_interface.dart
│   ├── 🎮 presentation/           # UI слой
│   │   ├── 🔄 providers/          # State management
│   │   │   ├── auth_provider.dart
│   │   │   ├── video_provider.dart
│   │   │   ├── chat_provider.dart
│   │   │   ├── request_provider.dart
│   │   │   └── theme_provider.dart
│   │   ├── 🎨 widgets/            # Переиспользуемые виджеты
│   │   │   ├── 🪟 glass/          # Glass UI компоненты
│   │   │   │   ├── glass_card.dart
│   │   │   │   ├── glass_button.dart
│   │   │   │   ├── glass_input.dart
│   │   │   │   ├── glass_modal.dart
│   │   │   │   ├── glass_navigation.dart
│   │   │   │   ├── glass_sidebar.dart
│   │   │   │   ├── glass_toast.dart
│   │   │   │   ├── glass_form.dart
│   │   │   │   ├── glass_feedback.dart
│   │   │   │   ├── glass_tabs.dart
│   │   │   │   ├── glass_dropdown.dart
│   │   │   │   ├── glass_tooltip.dart
│   │   │   │   ├── glass_progress.dart
│   │   │   │   ├── glass_spinner.dart
│   │   │   │   ├── glass_badge.dart
│   │   │   │   ├── glass_avatar.dart
│   │   │   │   ├── glass_divider.dart
│   │   │   │   ├── glass_accordion.dart
│   │   │   │   ├── glass_slider.dart
│   │   │   │   ├── glass_switch.dart
│   │   │   │   ├── glass_video_card.dart
│   │   │   │   ├── glass_chat_bubble.dart
│   │   │   │   ├── glass_search_bar.dart
│   │   │   │   ├── glass_filter_panel.dart
│   │   │   │   ├── glass_user_card.dart
│   │   │   │   ├── glass_request_card.dart
│   │   │   │   ├── glass_notification_item.dart
│   │   │   │   ├── glass_progress_bar.dart
│   │   │   │   ├── glass_video_player.dart
│   │   │   │   ├── glass_image_gallery.dart
│   │   │   │   ├── glass_data_table.dart
│   │   │   │   ├── glass_calendar.dart
│   │   │   │   ├── glass_timeline.dart
│   │   │   │   ├── glass_stepper.dart
│   │   │   │   ├── glass_breadcrumb.dart
│   │   │   │   ├── glass_pagination.dart
│   │   │   │   ├── glass_rating.dart
│   │   │   │   ├── glass_tag.dart
│   │   │   │   ├── glass_carousel.dart
│   │   │   │   ├── glass_skeleton.dart
│   │   │   │   ├── glass_feedback_form.dart
│   │   │   │   ├── glass_achievement_badge.dart
│   │   │   │   ├── glass_voice_input.dart
│   │   │   │   ├── glass_drag_drop.dart
│   │   │   │   ├── glass_infinite_scroll.dart
│   │   │   │   ├── glass_context_menu.dart
│   │   │   │   ├── glass_tour_guide.dart
│   │   │   │   ├── glass_heatmap.dart
│   │   │   │   └── glass_offline_screen.dart
│   │   │   ├── 🎬 video/          # Видео компоненты
│   │   │   │   ├── video_player.dart
│   │   │   │   ├── hls_player.dart
│   │   │   │   ├── video_controls.dart
│   │   │   │   ├── video_thumbnail.dart
│   │   │   │   ├── video_upload_progress.dart
│   │   │   │   └── video_quality_selector.dart
│   │   │   ├── 💬 chat/           # Чат компоненты
│   │   │   │   ├── chat_bubble.dart
│   │   │   │   ├── chat_input.dart
│   │   │   │   ├── chat_list.dart
│   │   │   │   ├── message_bubble.dart
│   │   │   │   ├── voice_message_player.dart
│   │   │   │   └── chat_emoji_picker.dart
│   │   │   ├── 🔍 search/         # Поиск компоненты
│   │   │   │   ├── search_bar.dart
│   │   │   │   ├── search_results.dart
│   │   │   │   ├── search_filters.dart
│   │   │   │   └── search_history.dart
│   │   │   ├── 🛒 request/        # Заявки компоненты
│   │   │   │   ├── request_card.dart
│   │   │   │   ├── request_form.dart
│   │   │   │   ├── proposal_card.dart
│   │   │   │   └── request_filters.dart
│   │   │   ├── 🎯 common/         # Общие компоненты
│   │   │   │   ├── loading_indicator.dart
│   │   │   │   ├── error_widget.dart
│   │   │   │   ├── empty_state.dart
│   │   │   │   ├── pull_to_refresh.dart
│   │   │   │   ├── infinite_scroll.dart
│   │   │   │   └── network_indicator.dart
│   │   │   └── 🎨 animations/     # Анимации
│   │   │       ├── fade_animation.dart
│   │   │       ├── slide_animation.dart
│   │   │       ├── scale_animation.dart
│   │   │       ├── rotation_animation.dart
│   │   │       ├── particle_animation.dart
│   │   │       └── shimmer_animation.dart
│   │   ├── 📱 pages/              # Страницы приложения
│   │   │   ├── 🏠 main/           # Основные страницы
│   │   │   │   ├── feed_page.dart
│   │   │   │   ├── search_page.dart
│   │   │   │   ├── profile_page.dart
│   │   │   │   ├── video_detail_page.dart
│   │   │   │   ├── chat_page.dart
│   │   │   │   ├── requests_page.dart
│   │   │   │   ├── upload_page.dart
│   │   │   │   └── settings_page.dart
│   │   │   ├── 🔐 auth/           # Аутентификация
│   │   │   │   ├── login_page.dart
│   │   │   │   ├── register_page.dart
│   │   │   │   ├── forgot_password_page.dart
│   │   │   │   └── verify_email_page.dart
│   │   │   ├── 👤 profile/        # Профиль
│   │   │   │   ├── edit_profile_page.dart
│   │   │   │   ├── my_videos_page.dart
│   │   │   │   ├── my_channel_page.dart
│   │   │   │   ├── my_requests_page.dart
│   │   │   │   ├── my_proposals_page.dart
│   │   │   │   └── achievements_page.dart
│   │   │   ├── 💬 chat/           # Чаты
│   │   │   │   ├── chats_list_page.dart
│   │   │   │   ├── chat_detail_page.dart
│   │   │   │   ├── create_chat_page.dart
│   │   │   │   ├── group_chat_page.dart
│   │   │   │   └── voice_room_page.dart
│   │   │   ├── 🛒 request/        # Заявки
│   │   │   │   ├── create_request_page.dart
│   │   │   │   ├── request_detail_page.dart
│   │   │   │   ├── create_proposal_page.dart
│   │   │   │   └── proposal_detail_page.dart
│   │   │   ├── 🎬 video/          # Видео
│   │   │   │   ├── video_upload_page.dart
│   │   │   │   ├── video_edit_page.dart
│   │   │   │   ├── video_analytics_page.dart
│   │   │   │   └── video_comments_page.dart
│   │   │   ├── 🔍 search/         # Поиск
│   │   │   │   ├── search_results_page.dart
│   │   │   │   ├── search_filters_page.dart
│   │   │   │   └── search_history_page.dart
│   │   │   ├── 🔔 notifications/  # Уведомления
│   │   │   │   ├── notifications_page.dart
│   │   │   │   ├── notification_settings_page.dart
│   │   │   │   └── notification_detail_page.dart
│   │   │   ├── 💳 payments/       # Платежи
│   │   │   │   ├── wallet_page.dart
│   │   │   │   ├── payment_methods_page.dart
│   │   │   │   ├── invoices_page.dart
│   │   │   │   └── transactions_page.dart
│   │   │   ├── 🛍️ orders/         # Заказы
│   │   │   │   ├── my_orders_page.dart
│   │   │   │   ├── order_detail_page.dart
│   │   │   │   └── order_tracking_page.dart
│   │   │   ├── 📚 catalog/        # Каталог
│   │   │   │   ├── catalog_page.dart
│   │   │   │   └── projects_catalog_page.dart
│   │   │   ├── 🎨 ar_3d/          # AR/3D
│   │   │   │   ├── configurator_page.dart
│   │   │   │   └── interior_configurator_page.dart
│   │   │   ├── 🤖 ai/             # AI
│   │   │   │   └── ai_assistant_page.dart
│   │   │   ├── 🎬 channels/       # Каналы
│   │   │   │   ├── user_channel_page.dart
│   │   │   │   └── messenger_channel_page.dart
│   │   │   ├── 🆘 support/        # Поддержка
│   │   │   │   └── support_page.dart
│   │   │   ├── 📱 onboarding/     # Онбординг
│   │   │   │   ├── onboarding_page.dart
│   │   │   │   ├── welcome_page.dart
│   │   │   │   ├── get_started_page.dart
│   │   │   │   └── features_page.dart
│   │   │   ├── 🎭 design/         # Дизайн
│   │   │   │   └── design_ideas_page.dart
│   │   │   ├── 👥 users/          # Пользователи
│   │   │   │   └── user_page.dart
│   │   │   ├── 🔄 loading/        # Загрузка
│   │   │   │   └── loading_page.dart
│   │   │   ├── ❌ errors/         # Ошибки
│   │   │   │   └── error_page.dart
│   │   │   ├── 🎬 demo/           # Демо
│   │   │   │   └── animations_demo_page.dart
│   │   │   ├── 🎯 splash/         # Splash
│   │   │   │   └── splash_page.dart
│   │   │   └── 📊 subscriptions/  # Подписки
│   │   │       └── subscriptions_page.dart
│   │   └── 🎨 themes/             # Темы
│   │       ├── app_theme.dart
│   │       ├── light_theme.dart
│   │       ├── dark_theme.dart
│   │       └── glass_theme.dart
│   └── 🔧 features/               # Функциональные модули
│       ├── 🎬 video_streaming/    # Видео стриминг
│       │   ├── hls_service.dart
│       │   ├── video_cache_service.dart
│       │   └── thumbnail_service.dart
│       ├── 💬 real_time_chat/     # Реальное время чат
│       │   ├── websocket_service.dart
│       │   ├── message_service.dart
│       │   └── typing_indicator.dart
│       ├── 📞 webrtc_calls/       # WebRTC звонки
│       │   ├── webrtc_service.dart
│       │   ├── call_service.dart
│       │   └── voice_room_service.dart
│       ├── 📍 geolocation/        # Геолокация
│       │   ├── location_service.dart
│       │   └── map_service.dart
│       ├── 🔔 push_notifications/ # Push уведомления
│       │   ├── notification_service.dart
│       │   └── local_notifications.dart
│       ├── 📷 camera/             # Камера
│       │   ├── camera_service.dart
│       │   └── image_picker_service.dart
│       ├── 🎨 ar_features/        # AR функции
│       │   ├── ar_service.dart
│       │   └── model_loader_service.dart
│       ├── 🎮 gamification/       # Геймификация
│       │   ├── achievement_service.dart
│       │   ├── points_service.dart
│       │   └── leaderboard_service.dart
│       ├── 🔍 search/             # Поиск
│       │   ├── search_service.dart
│       │   └── voice_search_service.dart
│       ├── 📊 analytics/          # Аналитика
│       │   ├── analytics_service.dart
│       │   └── crash_reporting_service.dart
│       └── 🔒 security/           # Безопасность
│           ├── biometric_service.dart
│           ├── encryption_service.dart
│           └── secure_storage_service.dart
├── 🧪 test/                       # Unit тесты
│   ├── unit/
│   │   ├── widgets/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── integration/
│   │   ├── app_test.dart
│   │   ├── auth_test.dart
│   │   ├── video_test.dart
│   │   ├── chat_test.dart
│   │   └── webrtc_test.dart
│   └── performance/
│       ├── glass_ui_performance_test.dart
│       ├── video_performance_test.dart
│       └── memory_performance_test.dart
├── 📋 pubspec.yaml                # Зависимости
├── 📋 pubspec.lock                # Блокировка версий
├── 📋 analysis_options.yaml       # Настройки анализатора
├── 📋 README.md                   # Документация
└── 📋 .gitignore                  # Git ignore
```

## 📦 ЗАВИСИМОСТИ (pubspec.yaml)

```yaml
name: mebelplace
description: MebelPlace - Cross-platform furniture marketplace with video streaming, chat, and AR features
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.16.0"

dependencies:
  flutter:
    sdk: flutter

  # 🎨 UI & Design
  cupertino_icons: ^1.0.6
  flutter_screenutil: ^5.9.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  lottie: ^2.7.0
  
  # 🎬 Video & Media
  video_player: ^2.8.1
  chewie: ^1.7.4
  flutter_hls: ^1.0.5
  image_picker: ^1.0.4
  camera: ^0.10.5+5
  photo_view: ^0.14.0
  
  # 💬 Real-time Communication
  web_socket_channel: ^2.4.0
  socket_io_client: ^2.0.3+1
  flutter_webrtc: ^0.9.48
  
  # 🌐 Network & API
  http: ^1.1.0
  dio: ^5.3.2
  retrofit: ^4.0.3
  json_annotation: ^4.8.1
  
  # 🗄️ State Management & Data
  provider: ^6.1.1
  riverpod: ^2.4.9
  flutter_riverpod: ^2.4.9
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  
  # 🔐 Authentication & Security
  local_auth: ^2.1.6
  crypto: ^3.0.3
  jwt_decoder: ^2.0.1
  
  # 📍 Location & Maps
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  google_maps_flutter: ^2.5.0
  
  # 🔔 Notifications
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0
  
  # 🎨 AR & 3D
  arcore_flutter_plugin: ^0.0.9
  arkit_plugin: ^0.11.0
  
  # 🎮 Gamification
  flutter_launcher_icons: ^0.13.1
  badges: ^3.1.2
  
  # 🔍 Search & Analytics
  algolia: ^3.1.1
  firebase_analytics: ^10.7.4
  sentry_flutter: ^7.14.0
  
  # 📊 Charts & Visualization
  fl_chart: ^0.66.0
  syncfusion_flutter_charts: ^23.2.7
  
  # 🎵 Audio
  audioplayers: ^5.2.1
  record: ^5.0.4
  
  # 📱 Platform Specific
  url_launcher: ^6.2.1
  share_plus: ^7.2.1
  package_info_plus: ^4.2.0
  device_info_plus: ^9.1.1
  connectivity_plus: ^5.0.2
  
  # 🛠️ Utilities
  intl: ^0.18.1
  uuid: ^4.2.1
  equatable: ^2.0.5
  dartz: ^0.10.1
  get_it: ^7.6.4
  injectable: ^2.3.2
  
  # 🎨 Animations
  flutter_staggered_animations: ^1.1.1
  lottie: ^2.7.0
  
  # 📱 PWA & Web
  flutter_web_plugins:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # 🧪 Testing
  integration_test:
    sdk: flutter
  mockito: ^5.4.4
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
  retrofit_generator: ^8.0.6
  hive_generator: ^2.0.1
  injectable_generator: ^2.4.1
  
  # 🔍 Code Quality
  flutter_lints: ^3.0.1
  very_good_analysis: ^5.1.0
  
  # 📦 Build Tools
  flutter_launcher_icons: ^0.13.1
  flutter_native_splash: ^2.3.7

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
    - assets/animations/
    - assets/fonts/
    - assets/audio/
    - assets/videos/
    - assets/models/
  
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Medium.ttf
          weight: 500
        - asset: assets/fonts/Inter-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
```

## 🎯 ОСНОВНЫЕ ФАЙЛЫ

### main.dart
```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'app/app.dart';
import 'app/app_config.dart';
import 'presentation/providers/theme_provider.dart';
import 'core/services/analytics_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize Sentry for error tracking
  await SentryFlutter.init(
    (options) {
      options.dsn = AppConfig.sentryDsn;
      options.tracesSampleRate = 1.0;
    },
    appRunner: () => runApp(const MebelPlaceApp()),
  );
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  runApp(const MebelPlaceApp());
}

class MebelPlaceApp extends StatelessWidget {
  const MebelPlaceApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        // Add other providers here
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return ScreenUtilInit(
            designSize: const Size(375, 812), // iPhone 13 Pro design size
            minTextAdapt: true,
            splitScreenMode: true,
            builder: (context, child) {
              return MaterialApp(
                title: 'MebelPlace',
                debugShowCheckedModeBanner: false,
                theme: themeProvider.lightTheme,
                darkTheme: themeProvider.darkTheme,
                themeMode: themeProvider.themeMode,
                home: const SplashPage(),
                onGenerateRoute: AppRouter.generateRoute,
                builder: (context, widget) {
                  return MediaQuery(
                    data: MediaQuery.of(context).copyWith(textScaleFactor: 1.0),
                    child: widget!,
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
```

### app_config.dart
```dart
class AppConfig {
  // API Configuration
  static const String baseUrl = 'https://mebelplace.com.kz/api/v2';
  static const String wsUrl = 'wss://mebelplace.com.kz/ws';
  static const String webrtcUrl = 'https://mebelplace.com.kz/webrtc';
  
  // App Configuration
  static const String appName = 'MebelPlace';
  static const String appVersion = '1.0.0';
  static const String buildNumber = '1';
  
  // Feature Flags
  static const bool enableAR = true;
  static const bool enableWebRTC = true;
  static const bool enablePushNotifications = true;
  static const bool enableAnalytics = true;
  
  // Security
  static const String sentryDsn = 'YOUR_SENTRY_DSN';
  static const String encryptionKey = 'YOUR_ENCRYPTION_KEY';
  
  // Rate Limiting
  static const int apiRateLimit = 1000;
  static const int hlsRateLimit = 100;
  static const int webrtcRateLimit = 10;
  
  // Cache Configuration
  static const Duration cacheExpiration = Duration(hours: 24);
  static const int maxCacheSize = 100 * 1024 * 1024; // 100MB
  
  // Video Configuration
  static const List<String> supportedVideoFormats = ['mp4', 'mov', 'avi'];
  static const int maxVideoSize = 500 * 1024 * 1024; // 500MB
  static const List<String> videoQualities = ['360p', '720p', '1080p'];
  
  // Image Configuration
  static const List<String> supportedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  static const int maxImageSize = 10 * 1024 * 1024; // 10MB
}
```

Эта структура обеспечивает:

✅ **Модульность** - четкое разделение ответственности  
✅ **Масштабируемость** - легко добавлять новые функции  
✅ **Тестируемость** - структура удобна для тестирования  
✅ **Поддерживаемость** - понятная организация кода  
✅ **Производительность** - оптимизированная архитектура  
✅ **Безопасность** - изолированные компоненты  
✅ **Кроссплатформенность** - единая кодовая база для всех платформ
