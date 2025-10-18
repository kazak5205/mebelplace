class Request {
  final int id;
  final String title;
  final String description;
  final String? imageUrl;
  final String region;
  final String status; // pending, in_progress, completed, cancelled
  final int userId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<RequestResponse> responses;
  final double? budget;
  final DateTime? deadline;

  Request({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl,
    required this.region,
    required this.status,
    required this.userId,
    required this.createdAt,
    required this.updatedAt,
    this.responses = const [],
    this.budget,
    this.deadline,
  });

  // Геттеры для совместимости со старым кодом
  String get regionName => region;
  List<String> get photos => imageUrl != null ? [imageUrl!] : [];

  factory Request.fromJson(Map<String, dynamic> json) {
    return Request(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['image_url'],
      region: json['region'] ?? '',
      status: json['status'] ?? 'pending',
      userId: json['user_id'] ?? 0,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
      responses: (json['responses'] as List<dynamic>?)
          ?.map((r) => RequestResponse.fromJson(r))
          .toList() ?? [],
      budget: json['budget']?.toDouble(),
      deadline: json['deadline'] != null 
          ? DateTime.tryParse(json['deadline'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'image_url': imageUrl,
      'region': region,
      'status': status,
      'user_id': userId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'responses': responses.map((r) => r.toJson()).toList(),
      'budget': budget,
      'deadline': deadline?.toIso8601String(),
    };
  }

  Request copyWith({
    int? id,
    String? title,
    String? description,
    String? imageUrl,
    String? region,
    String? status,
    int? userId,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<RequestResponse>? responses,
    double? budget,
    DateTime? deadline,
  }) {
    return Request(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      region: region ?? this.region,
      status: status ?? this.status,
      userId: userId ?? this.userId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      responses: responses ?? this.responses,
      budget: budget ?? this.budget,
      deadline: deadline ?? this.deadline,
    );
  }
}

class RequestResponse {
  final int id;
  final int requestId;
  final int masterId;
  final String masterName;
  final String masterUsername;
  final String message;
  final double proposedPrice;
  final DateTime proposedDeadline;
  final DateTime createdAt;
  final bool isAccepted;

  RequestResponse({
    required this.id,
    required this.requestId,
    required this.masterId,
    required this.masterName,
    required this.masterUsername,
    required this.message,
    required this.proposedPrice,
    required this.proposedDeadline,
    required this.createdAt,
    this.isAccepted = false,
  });

  // Геттер для совместимости со старым кодом
  double get price => proposedPrice;

  factory RequestResponse.fromJson(Map<String, dynamic> json) {
    return RequestResponse(
      id: json['id'] ?? 0,
      requestId: json['request_id'] ?? 0,
      masterId: json['master_id'] ?? 0,
      masterName: json['master_name'] ?? '',
      masterUsername: json['master_username'] ?? '',
      message: json['message'] ?? '',
      proposedPrice: json['proposed_price']?.toDouble() ?? 0.0,
      proposedDeadline: DateTime.tryParse(json['proposed_deadline'] ?? '') ?? DateTime.now(),
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      isAccepted: json['is_accepted'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'request_id': requestId,
      'master_id': masterId,
      'master_name': masterName,
      'master_username': masterUsername,
      'message': message,
      'proposed_price': proposedPrice,
      'proposed_deadline': proposedDeadline.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'is_accepted': isAccepted,
    };
  }

  RequestResponse copyWith({
    int? id,
    int? requestId,
    int? masterId,
    String? masterName,
    String? masterUsername,
    String? message,
    double? proposedPrice,
    DateTime? proposedDeadline,
    DateTime? createdAt,
    bool? isAccepted,
  }) {
    return RequestResponse(
      id: id ?? this.id,
      requestId: requestId ?? this.requestId,
      masterId: masterId ?? this.masterId,
      masterName: masterName ?? this.masterName,
      masterUsername: masterUsername ?? this.masterUsername,
      message: message ?? this.message,
      proposedPrice: proposedPrice ?? this.proposedPrice,
      proposedDeadline: proposedDeadline ?? this.proposedDeadline,
      createdAt: createdAt ?? this.createdAt,
      isAccepted: isAccepted ?? this.isAccepted,
    );
  }
}