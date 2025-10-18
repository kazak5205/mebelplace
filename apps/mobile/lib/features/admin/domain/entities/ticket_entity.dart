class TicketEntity {
  final String id;
  final String subject;
  final String status;
  final DateTime createdAt;

  const TicketEntity({
    required this.id,
    required this.subject,
    required this.status,
    required this.createdAt,
  });
}

