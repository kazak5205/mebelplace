class OrderEntity {
  final String id;
  final String? productName;
  final String? masterName;
  final String status;
  final int totalPrice;
  final DateTime createdAt;

  const OrderEntity({
    required this.id,
    this.productName,
    this.masterName,
    required this.status,
    required this.totalPrice,
    required this.createdAt,
  });
}

