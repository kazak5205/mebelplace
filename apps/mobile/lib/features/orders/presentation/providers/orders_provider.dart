import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final orderDioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// Orders Provider - REAL API!
final ordersProvider = StateNotifierProvider<OrdersNotifier, AsyncValue<List<OrderEntity>>>((ref) {
  return OrdersNotifier(ref.watch(orderDioClientProvider));
});

class OrdersNotifier extends StateNotifier<AsyncValue<List<OrderEntity>>> {
  final DioClient _dioClient;

  OrdersNotifier(this._dioClient) : super(const AsyncValue.loading()) {
    loadOrders();
  }

  Future<void> loadOrders() async {
    state = const AsyncValue.loading();
    try {
      final response = await _dioClient.get(ApiEndpoints.orders);
      final orders = (response.data['orders'] as List?)?.map((order) => OrderEntity(
        id: order['id'],
        productName: order['productName'],
        masterName: order['masterName'],
        status: order['status'],
        totalPrice: order['totalPrice'],
        createdAt: DateTime.parse(order['createdAt']),
      )).toList() ?? [];
      
      state = AsyncValue.data(orders);
    } catch (e, st) {
      // Handle error properly instead of fallback to mock
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> cancelOrder(String orderId) async {
    try {
      await _dioClient.post(ApiEndpoints.withId(ApiEndpoints.orderCancel, orderId));
      await loadOrders(); // Reload
    } catch (e) {
      // Handle error
    }
  }
}
