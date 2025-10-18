class ProposalEntity {
  final String id;
  final String requestId;
  final String masterId;
  final String masterName;
  final double? masterRating;
  final int price;
  final int estimatedDays;
  final String? message;
  final String status;
  final DateTime createdAt;

  const ProposalEntity({
    required this.id,
    required this.requestId,
    required this.masterId,
    required this.masterName,
    this.masterRating,
    required this.price,
    required this.estimatedDays,
    this.message,
    required this.status,
    required this.createdAt,
  });
}

