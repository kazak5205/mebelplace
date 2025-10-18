import 'package:dio/dio.dart';
import '../models/order_model.dart';

class OrderRepository {
  final Dio dio;

  OrderRepository({required this.dio});

  Future<List<OrderModel>> getMyOrders() async {
    final response = await dio.get('/v2/orders/my');
    return (response.data as List)
        .map((json) => OrderModel.fromJson(json))
        .toList();
  }

  Future<OrderModel> getOrder(String id) async {
    final response = await dio.get('/v2/orders/$id');
    return OrderModel.fromJson(response.data);
  }

  // User actions
  Future<Map<String, dynamic>> payOrder(String id) async {
    final response = await dio.post('/v2/orders/$id/pay');
    return response.data;
  }

  Future<Map<String, dynamic>> approveOrder(String id) async {
    final response = await dio.post('/v2/orders/$id/approve');
    return response.data;
  }

  Future<Map<String, dynamic>> cancelOrder(String id) async {
    final response = await dio.post('/v2/orders/$id/cancel');
    return response.data;
  }

  // Master actions
  Future<OrderModel> acceptOrder(String id) async {
    final response = await dio.post('/v2/orders/$id/accept');
    return OrderModel.fromJson(response.data);
  }

  Future<OrderModel> startWork(String id) async {
    final response = await dio.post('/v2/orders/$id/start');
    return OrderModel.fromJson(response.data);
  }

  Future<Map<String, dynamic>> completeOrder(String id) async {
    final response = await dio.post('/v2/orders/$id/complete');
    return response.data;
  }

  // Both
  Future<Map<String, dynamic>> openDispute(String id) async {
    final response = await dio.post('/v2/orders/$id/dispute');
    return response.data;
  }
}

