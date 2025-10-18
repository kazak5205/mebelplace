class OrderModel {
  final String id;
  final String requestId;
  final String proposalId;
  final String userId;
  final String masterId;
  final String price;
  final DateTime deadline;
  final String status;
  final String description;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;

  OrderModel({
    required this.id,
    required this.requestId,
    required this.proposalId,
    required this.userId,
    required this.masterId,
    required this.price,
    required this.deadline,
    required this.status,
    required this.description,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'],
      requestId: json['request_id'],
      proposalId: json['proposal_id'],
      userId: json['user_id'],
      masterId: json['master_id'],
      price: json['price'].toString(),
      deadline: DateTime.parse(json['deadline']),
      status: json['status'],
      description: json['description'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      completedAt: json['completed_at'] != null ? DateTime.parse(json['completed_at']) : null,
    );
  }

  double get priceAsDouble => double.tryParse(price) ?? 0;

  bool get isEscrowLocked {
    return ['paid', 'accepted', 'in_progress', 'review', 'dispute'].contains(status);
  }

  bool get isFinalized {
    return ['completed', 'cancelled'].contains(status);
  }

  // User actions
  bool get canBePaid => status == 'pending';
  bool get canBeApproved => status == 'review';
  bool get canBeCancelled => ['pending', 'paid'].contains(status);
  bool get canOpenDispute => ['review', 'in_progress'].contains(status);

  // Master actions
  bool get canBeAccepted => status == 'paid';
  bool get canBeStarted => status == 'accepted';
  bool get canBeCompleted => status == 'in_progress';
}

