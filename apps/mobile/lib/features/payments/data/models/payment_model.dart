class PaymentModel {
  final String id;
  final String userId;
  final String? orderId;
  final String provider; // kaspi, paybox, wallet
  final String amount;
  final String currency;
  final String status; // pending, processing, completed, failed, refunded
  final String? providerPaymentId;
  final String? paymentUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;

  PaymentModel({
    required this.id,
    required this.userId,
    this.orderId,
    required this.provider,
    required this.amount,
    required this.currency,
    required this.status,
    this.providerPaymentId,
    this.paymentUrl,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'],
      userId: json['user_id'],
      orderId: json['order_id'],
      provider: json['provider'],
      amount: json['amount'].toString(),
      currency: json['currency'],
      status: json['status'],
      providerPaymentId: json['provider_payment_id'],
      paymentUrl: json['payment_url'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      completedAt: json['completed_at'] != null ? DateTime.parse(json['completed_at']) : null,
    );
  }

  double get amountAsDouble => double.tryParse(amount) ?? 0;
}

class WalletModel {
  final String id;
  final String userId;
  final String balance;
  final String escrowBalance;
  final String currency;
  final DateTime createdAt;
  final DateTime updatedAt;

  WalletModel({
    required this.id,
    required this.userId,
    required this.balance,
    required this.escrowBalance,
    required this.currency,
    required this.createdAt,
    required this.updatedAt,
  });

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      id: json['id'],
      userId: json['user_id'],
      balance: json['balance'].toString(),
      escrowBalance: json['escrow_balance'].toString(),
      currency: json['currency'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  double get balanceAsDouble => double.tryParse(balance) ?? 0;
  double get escrowBalanceAsDouble => double.tryParse(escrowBalance) ?? 0;
  double get totalBalance => balanceAsDouble + escrowBalanceAsDouble;
}

class TransactionModel {
  final String id;
  final String walletId;
  final String type; // deposit, withdraw, escrow_lock, escrow_release, escrow_refund
  final String amount;
  final String? orderId;
  final String? paymentId;
  final DateTime createdAt;

  TransactionModel({
    required this.id,
    required this.walletId,
    required this.type,
    required this.amount,
    this.orderId,
    this.paymentId,
    required this.createdAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'],
      walletId: json['wallet_id'],
      type: json['type'],
      amount: json['amount'].toString(),
      orderId: json['order_id'],
      paymentId: json['payment_id'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  double get amountAsDouble => double.tryParse(amount) ?? 0;
}

