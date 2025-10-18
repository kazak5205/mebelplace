import 'package:dio/dio.dart';
import '../models/payment_model.dart';

class PaymentRepository {
  final Dio dio;

  PaymentRepository({required this.dio});

  Future<PaymentModel> createPayment({
    required String provider,
    required String amount,
    String? orderId,
  }) async {
    final response = await dio.post('/v2/payments', data: {
      'provider': provider,
      'amount': amount,
      'order_id': orderId,
    });
    return PaymentModel.fromJson(response.data);
  }

  Future<List<PaymentModel>> getMyPayments() async {
    final response = await dio.get('/v2/payments/my');
    return (response.data as List)
        .map((json) => PaymentModel.fromJson(json))
        .toList();
  }

  Future<WalletModel> getWallet() async {
    final response = await dio.get('/v2/wallet');
    return WalletModel.fromJson(response.data);
  }

  Future<List<TransactionModel>> getTransactions() async {
    final response = await dio.get('/v2/wallet/transactions');
    return (response.data as List)
        .map((json) => TransactionModel.fromJson(json))
        .toList();
  }
}

