import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/admin_stats_entity.dart';
import '../../domain/entities/pending_content_entity.dart';
import '../../domain/entities/reported_content_entity.dart';
import '../../../auth/domain/entities/user_entity.dart';
import '../../domain/entities/ticket_entity.dart';
import '../../domain/entities/ad_entity.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final dioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// Admin Stats Provider - REAL API!
final adminStatsProvider = FutureProvider<AdminStatsEntity>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminStats);
    return AdminStatsEntity(
      pendingContentCount: response.data['pendingContentCount'] ?? 0,
      reportedContentCount: response.data['reportedContentCount'] ?? 0,
      totalUsers: response.data['totalUsers'] ?? 0,
      bannedUsers: response.data['bannedUsers'] ?? 0,
      pendingTickets: response.data['pendingTickets'] ?? 0,
      activeAds: response.data['activeAds'] ?? 0,
    );
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load admin stats: ${e.toString()}');
  }
});

/// Pending Content Provider - REAL API!
final adminPendingContentProvider = StateNotifierProvider<AdminPendingContentNotifier, AsyncValue<List<PendingContentEntity>>>((ref) {
  return AdminPendingContentNotifier(ref.watch(dioClientProvider));
});

class AdminPendingContentNotifier extends StateNotifier<AsyncValue<List<PendingContentEntity>>> {
  final DioClient _dioClient;

  AdminPendingContentNotifier(this._dioClient) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _dioClient.get(ApiEndpoints.adminPending);
      final items = (response.data['items'] as List?)?.map((item) => PendingContentEntity(
        id: item['id'],
        title: item['title'],
        description: item['description'],
        type: item['type'],
        createdAt: DateTime.parse(item['createdAt']),
      )).toList() ?? [];
      
      state = AsyncValue.data(items);
    } catch (e, st) {
      // Handle error properly instead of fallback to mock
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> approve(int id) async {
    try {
      await _dioClient.post(ApiEndpoints.withId(ApiEndpoints.adminPendingApprove, id.toString()));
    } catch (e) {
      // Ignore error
    }
    final current = state.value ?? [];
    state = AsyncValue.data(current.where((item) => item.id != id).toList());
  }

  Future<void> reject(int id) async {
    try {
      await _dioClient.post(ApiEndpoints.withId(ApiEndpoints.adminPendingReject, id.toString()));
    } catch (e) {
      // Ignore error
    }
    final current = state.value ?? [];
    state = AsyncValue.data(current.where((item) => item.id != id).toList());
  }
}

/// Reported Content Provider - REAL API!
final adminReportedContentProvider = FutureProvider<List<ReportedContentEntity>>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminReports);
    return (response.data['items'] as List?)?.map((item) => ReportedContentEntity(
      id: item['id'],
      contentId: item['contentId'],
      contentType: item['contentType'],
      contentTitle: item['contentTitle'],
      reason: item['reason'],
      reporterName: item['reporterName'],
      createdAt: DateTime.parse(item['createdAt']),
    )).toList() ?? [];
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load reported content: ${e.toString()}');
  }
});

/// Users Provider - REAL API!
final adminUsersProvider = FutureProvider<List<UserEntity>>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminUsers);
    return (response.data['users'] as List?)?.map((user) => UserEntity(
      id: user['id'],
      username: user['username'],
      email: user['email'],
      role: UserRole.values.firstWhere(
        (e) => e.toString().split('.').last == user['role'],
        orElse: () => UserRole.buyer,
      ),
      createdAt: DateTime.parse(user['created_at']),
      updatedAt: DateTime.parse(user['updated_at']),
    )).toList() ?? [];
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load users: ${e.toString()}');
  }
});

/// Banned Users Provider - REAL API!
final adminBannedUsersProvider = FutureProvider<List<UserEntity>>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminUsersBanned);
    return (response.data['users'] as List?)?.map((user) => UserEntity(
      id: user['id'],
      username: user['username'],
      email: user['email'],
      role: UserRole.values.firstWhere(
        (e) => e.toString().split('.').last == user['role'],
        orElse: () => UserRole.buyer,
      ),
      createdAt: DateTime.parse(user['created_at']),
      updatedAt: DateTime.parse(user['updated_at']),
    )).toList() ?? [];
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load banned users: ${e.toString()}');
  }
});

/// Tickets Provider - REAL API!
final adminTicketsProvider = FutureProvider<List<TicketEntity>>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminTickets);
    return (response.data['tickets'] as List?)?.map((ticket) => TicketEntity(
      id: ticket['id'],
      subject: ticket['subject'],
      status: ticket['status'],
      createdAt: DateTime.parse(ticket['createdAt']),
    )).toList() ?? [];
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load tickets: ${e.toString()}');
  }
});

/// Ads Provider - REAL API!
final adminAdsProvider = FutureProvider<List<AdEntity>>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminAds);
    return (response.data['ads'] as List?)?.map((ad) => AdEntity(
      id: ad['id'],
      title: ad['title'],
      impressions: ad['impressions'],
      status: ad['status'],
    )).toList() ?? [];
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load ads: ${e.toString()}');
  }
});

/// Analytics Providers - REAL API with fallback!
final adminVideoAnalyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminAnalyticsVideos);
    return response.data as Map<String, dynamic>;
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load video analytics: ${e.toString()}');
  }
});

final adminUserAnalyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminAnalyticsUsers);
    return response.data as Map<String, dynamic>;
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load user analytics: ${e.toString()}');
  }
});

final adminOrderAnalyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminAnalyticsOrders);
    return response.data as Map<String, dynamic>;
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load order analytics: ${e.toString()}');
  }
});

final adminRevenueProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  
  try {
    final response = await dioClient.get(ApiEndpoints.adminAnalyticsRevenue);
    return response.data as Map<String, dynamic>;
  } catch (e) {
    // Re-throw error instead of fallback to mock
    throw Exception('Failed to load revenue analytics: ${e.toString()}');
  }
});
