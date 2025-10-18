class SupportTicket {
  final int id;
  final String title;
  final String description;
  final String status;
  final int userId;
  final DateTime createdAt;

  SupportTicket({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.userId,
    required this.createdAt,
  });

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    return SupportTicket(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      status: json['status'],
      userId: json['user_id'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class SupportMessage {
  final int id;
  final int ticketId;
  final String message;
  final bool isAdmin;
  final DateTime createdAt;

  SupportMessage({
    required this.id,
    required this.ticketId,
    required this.message,
    required this.isAdmin,
    required this.createdAt,
  });

  factory SupportMessage.fromJson(Map<String, dynamic> json) {
    return SupportMessage(
      id: json['id'],
      ticketId: json['ticket_id'],
      message: json['message'],
      isAdmin: json['is_admin'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class CreateTicketRequest {
  final String title;
  final String description;

  CreateTicketRequest({
    required this.title,
    required this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
    };
  }
}

class CreateSupportMessageRequest {
  final int ticketId;
  final String message;

  CreateSupportMessageRequest({
    required this.ticketId,
    required this.message,
  });

  Map<String, dynamic> toJson() {
    return {
      'ticket_id': ticketId,
      'message': message,
    };
  }
}


