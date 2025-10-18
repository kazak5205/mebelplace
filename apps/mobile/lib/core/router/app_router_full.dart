import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/providers/auth_provider_export.dart';
import '../../features/auth/presentation/providers/auth_state.dart';
import '../../presentation/pages/main_page.dart';
import '../../features/feed/domain/entities/video_entity.dart';

// Liquid Glass screens - Auth
import '../../screens/auth/glass_login_screen.dart';
import '../../screens/auth/glass_register_screen.dart';
import '../../screens/auth/glass_forgot_password_screen.dart';
import '../../screens/auth/glass_sms_verification_screen.dart';

// Liquid Glass screens - Main tabs
import '../../screens/glass_feed_screen.dart';
import '../../screens/glass_search_screen.dart';
import '../../screens/glass_chat_screen.dart';
import '../../screens/glass_request_screen.dart';
import '../../screens/glass_profile_screen.dart';

// Liquid Glass screens - Video
import '../../screens/video/glass_video_detail_screen.dart';
import '../../screens/video/glass_comments_screen.dart';
import '../../screens/video/glass_upload_video_screen.dart';

// Liquid Glass screens - Requests
import '../../screens/requests/glass_request_details_screen.dart';
import '../../screens/requests/glass_create_proposal_screen.dart';
import '../../screens/requests/glass_request_responses_screen.dart';

// Liquid Glass screens - Orders
import '../../screens/orders/glass_my_orders_screen.dart';

// Liquid Glass screens - Admin
import '../../screens/admin/glass_admin_panel_screen.dart';

// Liquid Glass screens - Chats
import '../../screens/chats/glass_chats_list_screen.dart';

// Liquid Glass screens - Profile
import '../../screens/profile/glass_edit_profile_screen.dart';

/// Полная конфигурация go_router с Liquid Glass экранами
final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isAuthenticated = authState is Authenticated;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');

      // Если не авторизован и пытается зайти не на auth - редирект на login
      if (!isAuthenticated && !isAuthRoute) {
        return '/auth/login';
      }

      // Если авторизован и на странице auth - редирект на main
      if (isAuthenticated && isAuthRoute) {
        return '/';
      }

      return null;
    },
    routes: [
      // Main shell with bottom navigation (uses MainPage which already has glass screens)
      ShellRoute(
        builder: (context, state, child) => const MainPage(),
        routes: [
          GoRoute(
            path: '/',
            redirect: (context, state) => '/feed',
          ),
          GoRoute(
            path: '/feed',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: GlassFeedScreen(),
            ),
          ),
          GoRoute(
            path: '/search',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: GlassSearchScreen(),
            ),
          ),
          GoRoute(
            path: '/requests',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: GlassRequestScreen(),
            ),
          ),
          GoRoute(
            path: '/chats',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: GlassChatsListScreen(),
            ),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: GlassProfileScreen(),
            ),
          ),
        ],
      ),

      // Auth routes - Glass
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const GlassLoginScreen(),
      ),
      GoRoute(
        path: '/auth/register',
        builder: (context, state) => const GlassRegisterScreen(),
      ),
      GoRoute(
        path: '/auth/forgot',
        builder: (context, state) => const GlassForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/auth/sms',
        builder: (context, state) {
          final phone = state.uri.queryParameters['phone'] ?? '';
          return GlassSmsVerificationScreen(phone: phone);
        },
      ),

      // Video routes - Glass
      GoRoute(
        path: '/video/:id',
        builder: (context, state) {
          final video = state.extra as VideoEntity?;
          
          if (video != null) {
            return GlassVideoDetailScreen(video: video);
          }
          
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        },
      ),
      GoRoute(
        path: '/video/:id/comments',
        builder: (context, state) {
          final videoId = state.pathParameters['id']!;
          return GlassCommentsScreen(videoId: videoId);
        },
      ),
      GoRoute(
        path: '/upload',
        builder: (context, state) => const GlassUploadVideoScreen(),
      ),

      // Request routes - Glass
      GoRoute(
        path: '/requests/create',
        builder: (context, state) => const GlassRequestScreen(),
      ),
      GoRoute(
        path: '/requests/:id',
        builder: (context, state) {
          final requestId = state.pathParameters['id']!;
          return GlassRequestDetailsScreen(requestId: requestId);
        },
      ),
      GoRoute(
        path: '/requests/:id/respond',
        builder: (context, state) {
          final requestId = state.pathParameters['id']!;
          return GlassCreateProposalScreen(requestId: requestId);
        },
      ),
      GoRoute(
        path: '/requests/:id/responses',
        builder: (context, state) {
          final requestId = state.pathParameters['id']!;
          return GlassRequestResponsesScreen(requestId: requestId);
        },
      ),

      // Master/Orders - Glass
      GoRoute(
        path: '/master/orders',
        builder: (context, state) => const GlassMyOrdersScreen(),
      ),
      GoRoute(
        path: '/orders',
        builder: (context, state) => const GlassMyOrdersScreen(),
      ),

      // Admin moderation - Glass
      GoRoute(
        path: '/admin/moderation',
        builder: (context, state) => const GlassAdminPanelScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const GlassAdminPanelScreen(),
      ),

      // Chat routes - Glass
      GoRoute(
        path: '/chat/:id',
        builder: (context, state) {
          final chatId = state.pathParameters['id']!;
          final chatName = state.uri.queryParameters['name'] ?? 'Чат';
          return GlassChatScreen(
            chatId: chatId,
            chatName: chatName,
          );
        },
      ),
      GoRoute(
        path: '/glass/chat/:id',
        builder: (context, state) {
          final chatId = state.pathParameters['id']!;
          final chatName = state.uri.queryParameters['name'] ?? 'Чат';
          return GlassChatScreen(
            chatId: chatId,
            chatName: chatName,
          );
        },
      ),

      // Profile routes - Glass
      GoRoute(
        path: '/profile/edit',
        builder: (context, state) => const GlassEditProfileScreen(),
      ),

      // Glass-specific routes
      GoRoute(
        path: '/glass/request',
        builder: (context, state) => const GlassRequestScreen(),
      ),
    ],
  );
});
