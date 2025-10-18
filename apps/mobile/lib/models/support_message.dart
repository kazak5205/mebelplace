/// Модель сообщения в поддержку
class SupportMessage {
  final String id;
  final String userId;
  final String subject;
  final String message;
  final SupportMessageStatus status;
  final DateTime createdAt;
  final DateTime? resolvedAt;

  SupportMessage({
    required this.id,
    required this.userId,
    required this.subject,
    required this.message,
    required this.status,
    required this.createdAt,
    this.resolvedAt,
  });

  factory SupportMessage.fromMap(Map<String, dynamic> map) {
    return SupportMessage(
      id: map['id'].toString(),
      userId: map['user_id'].toString(),
      subject: map['subject'] ?? '',
      message: map['message'] ?? '',
      status: SupportMessageStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => SupportMessageStatus.pending,
      ),
      createdAt: DateTime.parse(map['created_at']),
      resolvedAt: map['resolved_at'] != null ? DateTime.parse(map['resolved_at']) : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'subject': subject,
      'message': message,
      'status': status.name,
      'created_at': createdAt.toIso8601String(),
      'resolved_at': resolvedAt?.toIso8601String(),
    };
  }
}

enum SupportMessageStatus {
  pending,
  inProgress,
  resolved,
  closed,
}


