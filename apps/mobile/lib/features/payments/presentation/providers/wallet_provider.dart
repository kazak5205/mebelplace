import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/config/api_config.dart';

sealed class WalletState {}

class WalletInitial extends WalletState {}

class WalletLoading extends WalletState {}

class WalletLoaded extends WalletState {
  final double balance;
  final List<WalletTransaction> transactions;

  WalletLoaded({required this.balance, required this.transactions});
}

class WalletError extends WalletState {
  final String message;
  WalletError(this.message);
}

class WalletTransaction {
  final String id;
  final String type; // deposit, withdraw, payment, refund
  final double amount;
  final String status;
  final DateTime createdAt;
  final String? description;

  WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.status,
    required this.createdAt,
    this.description,
  });
}

class WalletNotifier extends StateNotifier<WalletState> {
  final _storage = const FlutterSecureStorage();

  WalletNotifier() : super(WalletInitial());

  Future<void> loadWallet() async {
    state = WalletLoading();

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) throw Exception('Not authenticated');

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/wallet'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        state = WalletLoaded(
          balance: (data['balance'] as num).toDouble(),
          transactions: (data['transactions'] as List<dynamic>? ?? [])
              .map((t) => WalletTransaction(
                    id: t['id'].toString(),
                    type: t['type'] as String,
                    amount: (t['amount'] as num).toDouble(),
                    status: t['status'] as String,
                    createdAt: DateTime.parse(t['created_at'] as String),
                    description: t['description'] as String?,
                  ))
              .toList(),
        );
      } else {
        throw Exception('Failed to load wallet');
      }
    } catch (e) {
      state = WalletError('Error: $e');
    }
  }

  Future<bool> deposit(double amount, String method) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return false;

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/wallet/deposit'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'amount': amount,
          'method': method, // kaspi, card, etc
        }),
      );

      if (response.statusCode == 200) {
        await loadWallet();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> withdraw(double amount, String cardNumber) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return false;

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/wallet/withdraw'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'amount': amount,
          'card_number': cardNumber,
        }),
      );

      if (response.statusCode == 200) {
        await loadWallet();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

final walletProvider = StateNotifierProvider<WalletNotifier, WalletState>((ref) {
  return WalletNotifier();
});


