class PendingContentEntity {
  final String id;
  final String title;
  final String description;
  final String type;
  final DateTime createdAt;

  const PendingContentEntity({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.createdAt,
  });
}

